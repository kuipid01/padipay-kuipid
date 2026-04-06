
import { Hono } from "hono";
import { db } from "../db";
import { loans, repayments } from "../db/schema";
import { desc, eq, and, sum, inArray } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

// Apply auth middleware to all dashboard routes
router.use("*", authMiddleware);

router.get("/stats", async (c) => {
    const userId = c.get("user").id;

    // Total Money Lent (scoped to this lender)
    const moneyLentResult = await db
        .select({ value: sum(loans.principal) })
        .from(loans)
        .where(eq(loans.lenderId, userId));
    const moneyLent = moneyLentResult[0]?.value || "0";

    // Expected Repayment (scoped to this lender)
    const expectedRepaymentResult = await db
        .select({ value: sum(loans.totalPayable) })
        .from(loans)
        .where(eq(loans.lenderId, userId));
    const expectedRepayment = expectedRepaymentResult[0]?.value || "0";

    // Amount Repaid — join through loans to scope to this lender
    const lenderLoanIds = await db
        .select({ id: loans.id })
        .from(loans)
        .where(eq(loans.lenderId, userId));
    const loanIds = lenderLoanIds.map((l) => l.id);

    let amountRepaid = "0";
    if (loanIds.length > 0) {
        const amountRepaidResult = await db
            .select({ value: sum(repayments.amount) })
            .from(repayments)
            .where(and(eq(repayments.status, "PAID"), inArray(repayments.loanId, loanIds)));
        amountRepaid = amountRepaidResult[0]?.value || "0";
    }

    // Outstanding Balance
    const outstanding = Number(expectedRepayment) - Number(amountRepaid);

    return c.json({
        totalMoneyLent: moneyLent,
        expectedRepayment: expectedRepayment,
        amountRepaid: amountRepaid,
        outstandingBalance: outstanding.toString(),
    });
});

router.get("/active-loans", async (c) => {
    const userId = c.get("user").id;

    const activeLoans = await db.query.loans.findMany({
        where: and(eq(loans.status, "ACTIVE"), eq(loans.lenderId, userId)),
        limit: 5,
        orderBy: desc(loans.startDate),
        with: {
            borrower: true,
        },
    });

    return c.json(
        activeLoans.map((loan) => ({
            id: loan.id,
            borrower: loan.borrower.firstName + " " + loan.borrower.lastName,
            amount: loan.principal,
            interest: loan.interest,
            dueDate: "2026-02-12", // Placeholder
            status: "On Track", // Placeholder logic
            amountLeft: loan.totalPayable, // Simplified
        }))
    );
});

router.get("/upcoming-payments", async (c) => {
    const userId = c.get("user").id;

    // Fetch only pending repayments for loans belonging to this lender
    const upcoming = await db.query.repayments.findMany({
        where: eq(repayments.status, "PENDING"),
        limit: 5,
        orderBy: desc(repayments.dueDate),
        with: {
            loan: {
                with: {
                    borrower: true,
                },
            },
        },
    });

    // Filter in-memory to ensure they belong to the logged-in lender
    const filtered = upcoming.filter((p) => p.loan.lenderId === userId);

    return c.json(
        filtered.map((p) => ({
            id: p.id,
            amount: p.amount,
            dueDate: p.dueDate,
            borrower: p.loan.borrower.firstName + " " + p.loan.borrower.lastName,
            method: "Auto-debit", // Placeholder
        }))
    );
});

router.get("/recent-activity", async (c) => {
    const userId = c.get("user").id;

    const recentLoans = await db.query.loans.findMany({
        where: eq(loans.lenderId, userId),
        limit: 3,
        orderBy: desc(loans.startDate),
        with: { borrower: true },
    });

    const recentRepayments = await db.query.repayments.findMany({
        where: eq(repayments.status, "PAID"),
        limit: 3,
        orderBy: desc(repayments.paidAt),
        with: { loan: { with: { borrower: true } } },
    });

    // Filter repayments to only those belonging to this lender
    const filteredRepayments = recentRepayments.filter(
        (r) => r.loan.lenderId === userId
    );

    const activities = [
        ...recentLoans.map((l) => ({
            text: `New loan for ${l.borrower.firstName} ${l.borrower.lastName}`,
            time: l.startDate,
            type: "request",
        })),
        ...filteredRepayments.map((r) => ({
            text: `${r.loan.borrower.firstName} ${r.loan.borrower.lastName} paid`,
            time: r.paidAt,
            type: "payment",
        })),
    ]
        .sort(
            (a, b) =>
                new Date(b.time as Date).getTime() -
                new Date(a.time as Date).getTime()
        )
        .slice(0, 5);

    return c.json(activities);
});

export default router;
