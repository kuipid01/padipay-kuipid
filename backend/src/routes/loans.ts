
import { Hono } from "hono";
import { db } from "../db";
import { loans } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

router.use("*", authMiddleware);

// Get all loans (lender specific)
router.get("/", async (c) => {
    const user = c.get("user");
    const allLoans = await db.query.loans.findMany({
        where: eq(loans.lenderId, user.id),
        with: {
            borrower: true,
            repayments: true
        },
        orderBy: desc(loans.startDate)
    });
    return c.json(allLoans);
});

// Get loan details
router.get("/:id", async (c) => {
    const id = c.req.param("id");
    const loan = await db.query.loans.findFirst({
        where: eq(loans.id, id),
        with: {
            borrower: true,
            repayments: true
        }
    });

    if (!loan) {
        return c.json({ error: "Loan not found" }, 404);
    }
    return c.json(loan);
});

// Create a new loan manually (e.g. for existing offline loans)
router.post("/", async (c) => {
    const user = c.get("user");
    const body = await c.req.json();
    
    // In a real app, you'd validate body here with Zod
    // Expecting: borrowerId, principal, interestRate, duration, validation etc.
    
    // Simplified creation
    const newLoan = await db.insert(loans).values({
        lenderId: user.id,
        applicationId: body.applicationId, // or create one ad-hoc
        borrowerId: body.borrowerId,
        principal: body.principal,
        interest: body.interest,
        totalPayable: (Number(body.principal) * (1 + Number(body.interest)/100)).toString(),
        startDate: new Date(),
        status: "ACTIVE"
    }).returning();

    return c.json(newLoan[0], 201);
});

// Update loan status (e.g. mark as default)
router.patch("/:id/status", async (c) => {
    const id = c.req.param("id");
    const { status } = await c.req.json();

    const updated = await db.update(loans)
        .set({ status })
        .where(eq(loans.id, id))
        .returning();

    if (!updated.length) {
        return c.json({ error: "Loan not found" }, 404);
    }

    return c.json(updated[0]);
});

export default router;
