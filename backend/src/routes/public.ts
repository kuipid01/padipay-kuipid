
import { Hono } from "hono";
import { db } from "../db";
import { loanApps, loanApplications, borrowers } from "../db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

// Public routes do NO authentication check

// Get Loan App Details (for landing pages)
router.get("/loan-apps/:slug", async (c) => {
    const slug = c.req.param("slug");
    const loanApp = await db.query.loanApps.findFirst({
        where: eq(loanApps.slug, slug),
        with: {
            owner: {
                columns: {
                    fullName: true,
                    email: true
                }
            }
        }
    });

    if (!loanApp) {
        return c.json({ error: "Loan app not found" }, 404);
    }

    if (!loanApp.isActive) {
        return c.json({ error: "Loan app is currently inactive" }, 400);
    }

    return c.json(loanApp);
});

// Submit Application
router.post("/application", async (c) => {
    const { loanAppId, firstName, lastName, email, phone, bvn, nin, amount, durationMonths } = await c.req.json();

    // 1. Find or create borrower
    // This is simplified. In reality you'd check uniqueness on Email/Phone/BVN carefully.
    let borrower = await db.query.borrowers.findFirst({
        where: eq(borrowers.email, email)
    });

    if (!borrower) {
        const newBorrowers = await db.insert(borrowers).values({
            fullName: `${firstName} ${lastName}`,
            email,
            phone,
            bvn,
            nin
        }).returning();
        borrower = newBorrowers[0];
    }

    // 2. Create Application
    // Need to find default interest rate from loan app if not provided, or dynamic calculation
    const loanApp = await db.query.loanApps.findFirst({ where: eq(loanApps.id, loanAppId) });
    if (!loanApp) return c.json({ error: "Invalid loan app" }, 400);

    const application = await db.insert(loanApplications).values({
        loanAppId,
        borrowerId: borrower.id,
        amount: amount.toString(),
        durationMonths: Number(durationMonths) || loanApp.defaultDurationMonths,
        interestRate: loanApp.defaultInterestRate,
        status: "PENDING"
    }).returning();

    return c.json({ 
        success: true, 
        message: "Application submitted successfully",
        applicationId: application[0].id 
    }, 201);
});

export default router;
