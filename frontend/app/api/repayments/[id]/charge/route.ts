import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { repayments, loans, paymentMethods, borrowers } from "@/db/schema";
import { chargeRecurring } from "@/lib/paystack";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch repayment and related data
    const repayment = await db.query.repayments.findFirst({
      where: eq(repayments.id, id),
    });

    if (!repayment || repayment.status === "PAID") {
      return NextResponse.json({ error: "Repayment not found or already paid" }, { status: 404 });
    }

    const loan = await db.query.loans.findFirst({
      where: eq(loans.id, repayment.loanId),
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const borrowerData = await db.query.borrowers.findFirst({
      where: eq(borrowers.id, loan.borrowerId),
    });

    // Get the latest payment method for this borrower
    const paymentMethod = await db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.borrowerId, loan.borrowerId),
      orderBy: (paymentMethods, { desc }) => [desc(paymentMethods.id)],
    });

    if (!paymentMethod || !borrowerData) {
      return NextResponse.json({ error: "No payment method found for borrower" }, { status: 400 });
    }

    // 2. Charge using Paystack
    const result = await chargeRecurring(
      borrowerData.email,
      parseFloat(repayment.amount.toString()),
      paymentMethod.authorizationCode
    );

    if (result.status && result.data.status === "success") {
      await db.update(repayments).set({
        status: "PAID",
        paidAt: new Date(),
      }).where(eq(repayments.id, id));

      return NextResponse.json({ success: true, reference: result.data.reference });
    } else {
      await db.update(repayments).set({
        status: "FAILED",
      }).where(eq(repayments.id, id));
      
      return NextResponse.json({ error: result.message || "Payment failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("Charge repayment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
