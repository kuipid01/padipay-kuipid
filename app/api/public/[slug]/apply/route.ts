import { NextResponse } from "next/server";
import { db } from "@/db";
import { borrowers, loanApplications, loanApps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { fullName, email, phone, amount, durationMonths } = await req.json();

    // 1. Fetch the loan app
    const loanApp = await db.query.loanApps.findFirst({
      where: eq(loanApps.slug, slug),
    });

    if (!loanApp || !loanApp.isActive) {
      return NextResponse.json({ error: "Loan app not found or inactive" }, { status: 404 });
    }

    // 2. Create or find borrower
    let borrower = await db.query.borrowers.findFirst({
      where: eq(borrowers.email, email),
    });

    if (!borrower) {
      const [newBorrower] = await db.insert(borrowers).values({
        fullName,
        email,
        phone,
      }).returning();
      borrower = newBorrower;
    }

    // 3. Create Loan Application
    const [application] = await db.insert(loanApplications).values({
      loanAppId: loanApp.id,
      borrowerId: borrower.id,
      amount: amount.toString(),
      durationMonths: parseInt(durationMonths),
      interestRate: loanApp.defaultInterestRate,
      status: "PENDING",
    }).returning();

    // 4. Initialize Paystack Transaction for Card Authorization
    // We charge a small fee (e.g., 100 NGN) to authorize the card, or the system could be configured differently.
    // For this demo, let's charge 100 NGN.
    const paystackSession = await initializeTransaction(email, 100, {
      applicationId: application.id,
      borrowerId: borrower.id,
      type: "CARD_AUTHORIZATION",
    });

    if (!paystackSession.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
    }

    return NextResponse.json({
      application,
      authorizationUrl: paystackSession.data.authorization_url,
      reference: paystackSession.data.reference,
    });
  } catch (error) {
    console.error("Public apply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
