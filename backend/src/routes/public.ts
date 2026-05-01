
import { Hono } from "hono";
import { db } from "../db";
import { loanApps, loanApplications, borrowers, repaymentPlans, contactMessages } from "../db/schema";
import { and, eq, or } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { CreateLoanApplicationSchema } from "../zod-schemas/applications";
import { ContactFormSchema } from "../zod-schemas/contact";
import { getCreditReport, getCreditScore } from "../utils/dojah";
import { brevo } from "../lib/brevo";

const router = new Hono();

// Public routes do NO authentication check

// Contact Us Route
router.post(
  "/contact",
  zValidator("json", ContactFormSchema),
  async (c) => {
    const { fullName, email, subject, message } = c.req.valid("json");

    try {
      // 1. Save to DB
      await db.insert(contactMessages).values({
        fullName,
        email,
        subject,
        message,
      });

      // 2. Send Email Notification to Admin
      await brevo.sendContactFormEmail(fullName, email, subject, message);

      return c.json({
        success: true,
        message: "Your message has been received. We'll get back to you shortly.",
      }, 201);
    } catch (error) {
      console.error("[CONTACT_ERROR]", error);
      return c.json({
        error: "Failed to send message. Please try again later."
      }, 500);
    }
  }
);

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

    const existingApp = await preventReapplicationForSameBorrower(borrower.id);
    if (existingApp) {
      return c.json({ error: "Borrower has an existing application" }, 400);
    }

    refreshCreditScoreAndRecord(borrower.bvn!, borrower.id);
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
    postApplication(application[0].id);
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


const refreshCreditScoreAndRecord = async (bvn: string, id: string) => {
  if (!bvn || bvn.length !== 11) {
    throw new Error("Invalid BVN");
  }

  const withTimeout = (promise: Promise<any>, ms = 8000) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
      ),
    ]);

  try {
    const [reportResult, scoreResult] = await Promise.allSettled([
      withTimeout(getCreditReport(bvn)),
      withTimeout(getCreditScore(bvn)),
    ]);

    const creditReport =
      reportResult.status === "fulfilled" ? reportResult.value : null;

    const creditScore =
      scoreResult.status === "fulfilled" ? scoreResult.value : null;

    const updateData: Record<string, any> = {};

    if (creditReport) updateData.creditReport = creditReport;
    if (creditScore) updateData.creditScore = creditScore;
    console.log(creditScore, creditReport, "creditReport")
    // 🚫 Avoid empty update
    if (Object.keys(updateData).length === 0) return;

    const { eq } = await import("drizzle-orm");
    const { db, borrowers } = await import("../db");

    await db
      .update(borrowers)
      .set(updateData)
      .where(eq(borrowers.id, id));
  } catch (error) {
    console.error("[CREDIT CHECK FAILED]", error);
  }
};


async function preventReapplicationForSameBorrower(id: string) {
  const { db, loanApplications } = await import("../db");
  const { eq, and } = await import("drizzle-orm");
  const existingApplication = await db.query.loanApplications.findFirst({
    where: and(
      eq(loanApplications.borrowerId, id),
      eq(loanApplications.status, "PENDING")
    ),
  });

  return existingApplication;
}

async function postApplication(applicationId: string) {
  try {
    const { db } = await import("../db");
    const { loanApplications, lenderWallets } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const { brevo } = await import("../lib/brevo");

    const app = await db.query.loanApplications.findFirst({
      where: eq(loanApplications.id, applicationId),
      with: {
        loanApp: {
          with: {
            owner: true,
          },
        },
      },
    });

    if (!app || !app.loanApp || !app.loanApp.owner) return;

    const amountInNaira = parseFloat(app.amount);
    const amountInKobo = amountInNaira * 100;

    const wallet = await db.query.lenderWallets.findFirst({
      where: eq(lenderWallets.lenderId, app.loanApp.ownerId),
    });

    const balanceInKobo = wallet?.balance || 0;
    const lenderEmail = app.loanApp.owner.email;
    const lenderName = app.loanApp.owner.fullName || "Lender";

    if (balanceInKobo < amountInKobo) {
      await brevo.sendEmail({
        to: [{ email: lenderEmail, name: lenderName }],
        subject: "Action Required: Insufficient Wallet Balance for Loan Application",
        htmlContent: `<p>You have received a new loan application for ₦${amountInNaira.toLocaleString()}, but your wallet balance is insufficient to fund it. Please fund your wallet to proceed with this application.</p>`,
      });
      return;
    }

    const autoApprovalLimit = app.loanApp.autoApprovalLimit || 0;

    if (autoApprovalLimit >= amountInNaira) {
      await brevo.sendEmail({
        to: [{ email: "kuipid01@gmail.com", name: "Admin" }],
        subject: "Action Required: Please Disburse Auto-Approved Loan",
        htmlContent: `<p>A loan application (${app.id}) for ₦${amountInNaira.toLocaleString()} has met the auto-approval criteria. Please review and disburse the funds.</p>`,
      });
    } else {
      await brevo.sendEmail({
        to: [{ email: lenderEmail, name: lenderName }],
        subject: "New Loan Application Received",
        htmlContent: `<p>You have received a new loan application for ₦${amountInNaira.toLocaleString()}. Please log in to your dashboard to review and approve it for disbursement.</p>`,
      });
    }
  } catch (error) {
    console.error("[POST_APPLICATION_ERROR]", error);
  }
}