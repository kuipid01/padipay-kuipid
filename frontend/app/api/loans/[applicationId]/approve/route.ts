import { NextResponse } from "next/server";
import { db } from "@/db";
import { loanApplications, loans, repayments } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { generateRepaymentSchedule } from "@/lib/utils/loan-math";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await params;

    // 1. Fetch application
    const application = await db.query.loanApplications.findFirst({
      where: eq(loanApplications.id, applicationId),
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application already processed" }, { status: 400 });
    }

    // 2. Calculate totals
    const principal = parseFloat(application.amount.toString());
    const interestRate = parseFloat(application.interestRate.toString());
    const duration = application.durationMonths;
    const totalInterest = (principal * interestRate) / 100;
    const totalPayable = principal + totalInterest;

    // 3. Create Loan
    const [loan] = await db.insert(loans).values({
      applicationId: application.id,
      lenderId: session.id as string,
      borrowerId: application.borrowerId,
      principal: application.amount,
      interest: totalInterest.toString(),
      totalPayable: totalPayable.toString(),
      status: "ACTIVE",
    }).returning();

    // 4. Generate Repayments
    const schedule = generateRepaymentSchedule(principal, interestRate, duration, new Date());
    
    for (const item of schedule) {
      await db.insert(repayments).values({
        loanId: loan.id,
        amount: item.amount.toString(),
        dueDate: item.dueDate,
        status: "PENDING",
      });
    }

    // 5. Update Application Status
    await db.update(loanApplications).set({ status: "APPROVED" }).where(eq(loanApplications.id, applicationId));

    return NextResponse.json({ loan, repayments: schedule });
  } catch (error) {
    console.error("Approve loan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
