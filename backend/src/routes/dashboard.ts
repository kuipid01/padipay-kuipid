
import { Hono } from "hono";
import { db } from "../db";
import { loans, repayments } from "../db/schema";
import { desc, eq, and, sum } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

// Apply auth middleware to all dashboard routes
router.use("*", authMiddleware);

router.get("/stats", async (c) => {
    // Top Stats
    
    // Total Money Lent
    const moneyLentResult = await db.select({ value: sum(loans.principal) }).from(loans);
    const moneyLent = moneyLentResult[0]?.value || "0";

    // Expected Repayment
    const expectedRepaymentResult = await db.select({ value: sum(loans.totalPayable) }).from(loans);
    const expectedRepayment = expectedRepaymentResult[0]?.value || "0";

    // Amount Repaid
    const amountRepaidResult = await db.select({ value: sum(repayments.amount) }).from(repayments).where(eq(repayments.status, "PAID"));
    const amountRepaid = amountRepaidResult[0]?.value || "0";

    // Outstanding Balance
    const outstanding = Number(expectedRepayment) - Number(amountRepaid);

    return c.json({
        totalMoneyLent: moneyLent,
        expectedRepayment: expectedRepayment,
        amountRepaid: amountRepaid,
        outstandingBalance: outstanding.toString()
    });
});
router.get("/active-loans", async (c) => {
    // Active loans
    const activeLoans = await db.query.loans.findMany({
        where: eq(loans.status, "ACTIVE"),
        limit: 5,
        orderBy: desc(loans.startDate),
        with: {
            borrower: true
        }
    });

    return c.json(activeLoans.map(loan => ({
        id: loan.id,
        borrower: loan.borrower.firstName + " " + loan.borrower.lastName,
        amount: loan.principal,
        interest: loan.interest,
        dueDate: "2026-02-12", // Placeholder
        status: "On Track", // Placeholder logic
        amountLeft: loan.totalPayable // Simplified
    })));
});
router.get("/upcoming-payments", async (c) => {
    const upcoming = await db.query.repayments.findMany({
        where: and(eq(repayments.status, "PENDING")),
        limit: 5,
        orderBy: desc(repayments.dueDate),
        with: {
            loan: {
                with: {
                    borrower: true
                }
            }
        }
    });
    
    return c.json(upcoming.map(p => ({
        id: p.id,
        amount: p.amount,
        dueDate: p.dueDate,
        borrower: p.loan.borrower.firstName + " " + p.loan.borrower.lastName,
        method: "Auto-debit" // Placeholder
    })));
});

router.get("/recent-activity", async (c) => {
    // Mocking this by combining recent loans and repayments
    const recentLoans = await db.query.loans.findMany({
        limit: 3,
        orderBy: desc(loans.startDate),
        with: { borrower: true }
    });
    
    const recentRepayments = await db.query.repayments.findMany({
        where: eq(repayments.status, "PAID"),
        limit: 3,
        orderBy: desc(repayments.paidAt),
        with: { loan: { with: { borrower: true } } }
    });

    const activities = [
        ...recentLoans.map(l => ({
            text: `New loan for ${l.borrower.firstName} ${l.borrower.lastName}`,
            time: l.startDate,
            type: "request"
        })),
        ...recentRepayments.map(r => ({
            text: `${r.loan.borrower.firstName} ${r.loan.borrower.lastName} paid`,
            time: r.paidAt,
            type: "payment"
        }))
    ].sort((a, b) => new Date(b.time as Date).getTime() - new Date(a.time as Date).getTime()).slice(0, 5);

    return c.json(activities);
});

export default router;
