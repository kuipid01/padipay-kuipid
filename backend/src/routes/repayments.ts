
import { Hono } from "hono";
import { db } from "../db";
import { repayments, loans } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

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

export default router;
