
import { Hono } from "hono";
import { db } from "../db";
import { repayments, loans, paymentMethods, subRepayments } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { paystackService } from "../utils/paystack";

const router = new Hono();

router.use("*", authMiddleware);

// List all repayments
router.get("/", async (c) => {
    // In a real app, filter by lender's loans
    // For now, fetching first 50
    const allRepayments = await db.query.repayments.findMany({
        limit: 50,
        orderBy: desc(repayments.dueDate),
        with: {
            loan: {
                with: {
                    borrower: true
                }
            }
        }
    });
    return c.json(allRepayments);
});

// Record a manual repayment
router.post("/", async (c) => {
    const { loanId, amount, date } = await c.req.json();

    // 1. Create repayment record
    const newRepayment = await db.insert(repayments).values({
        loanId,
        amount: amount.toString(),
        dueDate: new Date(date), // simplistic, usually matched against schedule
        paidAt: new Date(),
        status: "PAID"
    }).returning();

    // 2. Ideally update Loan balance here...

    return c.json(newRepayment[0], 201);
});

// Get repayments for specific loan
router.get("/loan/:loanId", async (c) => {
    const loanId = c.req.param("loanId");
    const loanRepayments = await db.query.repayments.findMany({
        where: eq(repayments.loanId, loanId),
        orderBy: desc(repayments.dueDate)
    });
    return c.json(loanRepayments);
});

// Charge a repayment (using saved card)
router.post("/:id/charge", async (c) => {
    const repaymentId = c.req.param("id");

    try {
        // 1. Fetch repayment with borrower and loan info
        const repayment = await db.query.repayments.findFirst({
            where: eq(repayments.id, repaymentId),
            with: {
                loan: {
                    with: {
                        borrower: true
                    }
                }
            }
        });

        if (!repayment) {
            return c.json({ error: "Repayment not found" }, 404);
        }

        if (repayment.status === "PAID") {
            return c.json({ error: "Repayment already paid" }, 400);
        }

        // 1.5 Calculate remaining amount (considering partial payments)
        const unitPayments = await db.query.subRepayments.findMany({
            where: eq(subRepayments.repaymentId, repaymentId),
        });

        const totalPaidForThisRepayment = unitPayments
            .filter((p) => p.status === "PAID")
            .reduce((acc, pay) => acc + Number(pay.amount), 0);

        const remainingAmount = Number(repayment.amount) - totalPaidForThisRepayment;

        if (remainingAmount <= 0) {
            return c.json({ error: "Repayment already settled through partial payments" }, 400);
        }

        // 2. Check due date - only charge if on or after due date
        const now = new Date();
        const dueDate = new Date(repayment.dueDate);
        if (now < dueDate) {
            return c.json({ error: "Cannot charge before due date" }, 400);
        }

        // 3. Find payment method for borrower
        const borrowerId = repayment.loan.borrowerId;
        // In schema.ts it is "paymentMethods"
        const method = await db.query.paymentMethods.findFirst({
            where: eq(paymentMethods.borrowerId, borrowerId)
        });

        if (!method || !method.authorizationCode) {
            return c.json({ error: "No saved payment method found for this borrower" }, 400);
        }

        console.log("HEY GOT HERE")
        // 4. Initiate charge with Paystack
        const response = await paystackService.chargeAuthorization({
            email: repayment.loan.borrower.email,
            amount: Math.round(remainingAmount * 100), // convert remaining to kobo
            authorization_code: method.authorizationCode,
            metadata: {
                type: "REPAYMENT",
                loan_id: repayment.loanId,
                repayment_id: repayment.id,
                borrower_id: borrowerId
            },
            reference: `rep_charge_${repaymentId.slice(0, 8)}_${Date.now()}`
        });

        // The webhook logic in webhooks.ts will automatically handle the status update
        // when Paystack notifies us of the successful debit.

        return c.json({
            status: true,
            message: "Charge initiated successfully",
            data: response
        });

    } catch (error: any) {
        console.error("Repayment charge error:", error);
        return c.json({
            error: error.message || "Failed to process card charge"
        }, 500);
    }
});

export default router;
