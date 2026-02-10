
import { Hono } from "hono";
import { db } from "../db";
import { loanApps, loanApplications, borrowers, repaymentPlans } from "../db/schema";
import { and, eq, or } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { CreateLoanApplicationSchema } from "../zod-schemas/applications";

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

// Get Loan App Details by ID (Public)
router.get("/loan-apps/id/:id", async (c) => {
    const id = c.req.param("id");
    const { loanAppsService } = await import("../domain/loan-apps");
    const result = await loanAppsService.getPublicById(id);

    if (!result.success) {
        return c.json({ error: result.error.message }, result.error.code as any);
    }

    return c.json(result.data);
});

// Get Application Status (Public)
router.get("/application/status/:id", async (c) => {
    const id = c.req.param("id");
    const { applicationsService } = await import("../domain/applications");
    const result = await applicationsService.getPublicStatus(id);

    if (!result.success) {
        return c.json({ error: result.error.message }, result.error.code as any);
    }

    return c.json(result.data);
});

// Submit Application

router.post(
  "/application",
  zValidator("json", CreateLoanApplicationSchema),
  async (c) => {
    console.log("[POST /application] Incoming request");

    const {
      phoneNumber,
      email,
      loanAppId,        // ⚠️ this is a SLUG
      repaymentPlanId,  // ✅ UUID
      amount,
      durationMonths,
    } = c.req.valid("json");

    console.log("[INPUT]", {
      phoneNumber,
      email,
      loanAppId,
      repaymentPlanId,
      amount,
      durationMonths,
    });

    // -----------------------------
    // 1. Find borrower
    // -----------------------------
    console.log("[STEP 1] Looking up borrower");

    const borrower = await db.query.borrowers.findFirst({
      where: or(
        eq(borrowers.phone, phoneNumber),
        eq(borrowers.email, email),
      ),
    });

    if (!borrower) {
      console.error("[BLOCK] Borrower not found", { phoneNumber, email });
      return c.json({ error: "Borrower not found" }, 404);
    }

    console.log("[OK] Borrower found", { borrowerId: borrower.id });

    // -----------------------------
    // 2. Find loan app by SLUG
    // -----------------------------
    console.log("[STEP 2] Resolving loan app by slug", loanAppId);

    const loanApp = await db.query.loanApps.findFirst({
      where: eq(loanApps.slug, loanAppId),
    });

    if (!loanApp) {
      console.error("[BLOCK] Invalid loan app slug", loanAppId);
      return c.json({ error: "Invalid loan app" }, 400);
    }

    console.log("[OK] Loan app resolved", {
      loanAppId: loanApp.id,
      slug: loanApp.slug,
    });

    // -----------------------------
    // 3. Validate repayment plan (UUID + FK)
    // -----------------------------
    console.log("[STEP 3] Validating repayment plan", {
      repaymentPlanId,
      loanAppId: loanApp.id,
    });

    const repaymentPlan = await db.query.repaymentPlans.findFirst({
      where: and(
        eq(repaymentPlans.id, repaymentPlanId),   // UUID
        eq(repaymentPlans.loanAppId, loanApp.id), // UUID ✅ FIX
      ),
    });

    if (!repaymentPlan) {
      console.error("[BLOCK] Repayment plan mismatch", {
        repaymentPlanId,
        expectedLoanAppId: loanApp.id,
      });
      return c.json({ error: "Invalid repayment plan" }, 400);
    }

    console.log("[OK] Repayment plan validated", {
      repaymentPlanId: repaymentPlan.id,
    });

    // -----------------------------
    // 4. Create application
    // -----------------------------
    console.log("[STEP 4] Creating loan application");

    const application = await db
      .insert(loanApplications)
      .values({
        loanAppId: loanApp.id,
        repaymentPlanId: repaymentPlan.id,
        borrowerId: borrower.id,
        amount: amount.toString(),
        durationMonths,
        status: "PENDING",
      })
      .returning();

    console.log("[SUCCESS] Application created", {
      applicationId: application[0].id,
    });

    return c.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationId: application[0].id,
      },
      201,
    );
  },
);


export default router;
