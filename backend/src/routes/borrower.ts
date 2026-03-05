
import { Hono } from "hono";
import { db } from "../db";
import { 
    loans, 
    repayments, 
    borrowers, 
    loanApplications, 
    bankAccounts,
    notifications,
    borrowerDocuments
} from "../db/schema";
import { eq, and, desc, sum, count, lt, inArray } from "drizzle-orm";
import { authMiddleware, borrowerAuthMiddleware } from "../middleware/auth";
import { hashPassword, comparePassword, signToken } from "../lib/auth";
import { zValidator } from "@hono/zod-validator";
import { createBankAccountSchema, bankAccountIdSchema } from "../zod-schemas/bank-accounts";
import { addDocumentSchema } from "../zod-schemas/borrower-documents";
import { uploadToCloudinary } from "../utils/upload";

const router = new Hono();

// 1. Borrower Auth - Public
router.post("/auth/login", async (c) => {
    try {
        const { identifier, passcode } = await c.req.json();

        if (!identifier || !passcode) {
            return c.json({ status: "error", message: "Identifier and passcode are required" }, 400);
        }

        const borrower = await db.query.borrowers.findFirst({
            where: (borrowers, { or, eq }) => or(
                eq(borrowers.email, identifier),
                eq(borrowers.phone, identifier),
            ),
        });

        if (!borrower || !borrower.passcodeHash) {
            return c.json({ status: "error", message: "Invalid credentials" }, 401);
        }

        const isValid = await comparePassword(passcode, borrower.passcodeHash);
        if (!isValid) {
            return c.json({ status: "error", message: "Invalid credentials" }, 401);
        }

        // Sign token with ID (for middleware), borrowerId, email, phone, and role
        const token = await signToken({
            id: borrower.id,
            borrowerId: borrower.id,
            email: borrower.email,
            phone: borrower.phone,
            role: "BORROWER",
        });

        return c.json({
            status: "success",
            message: "Login successful",
            token,
            borrower: {
                id: borrower.id,
                firstName: borrower.firstName,
                lastName: borrower.lastName,
                email: borrower.email,
                phone: borrower.phone,
            },
        });
    } catch (error: any) {
        return c.json({ status: "error", message: error.message }, 400);
    }
});

// Apply auth middleware - ensure user is a borrower for all subsequent routes
router.use("*", borrowerAuthMiddleware);

// 2. Borrower Profile/Auth - Protected
router.get("/auth/me", async (c) => {
    const user = c.get("user");
    const borrowerData = await db.query.borrowers.findFirst({
        where: eq(borrowers.id, user.id),
        with: {
            documents: true
        }
    });

    if (!borrowerData) {
        return c.json({ user: null });
    }

    const { passcodeHash: _, ...safeBorrower } = borrowerData;
    return c.json({ user: safeBorrower });
});

router.post("/auth/change-password", async (c) => {
    const user = c.get("user");
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
        return c.json({ error: "Current and new password are required" }, 400);
    }

    const borrowerDetails 
    
    = await db.query.borrowers.findFirst({
        where: eq(borrowers.id, user.id)
    });

    if (!borrowerDetails) {
        return c.json({ error: "Borrower not found" }, 404);
    }

    if (borrowerDetails.passcodeHash) {
        const isValid = await comparePassword(currentPassword, borrowerDetails.passcodeHash);
        if (!isValid) {
            return c.json({ error: "Invalid current passcode" }, 401);
        }
    }

    const newHash = await hashPassword(newPassword);

    await db.update(borrowers)
        .set({ passcodeHash: newHash, updatedAt: new Date() })
        .where(eq(borrowers.id, user.id));

    return c.json({ success: true, message: "Passcode updated successfully" });
});

// 1. Dashboard Overview
// GET /api/borrower/overview
router.get("/overview", async (c) => {
  console.log("[OVERVIEW] Request received");

  const user = c.get("user");
  const borrowerId = user.id;

  console.log("[OVERVIEW] Borrower ID:", borrowerId);

  // Active Loans Count
  const activeLoansData = await db
    .select({ value: count() })
    .from(loans)
    .where(and(eq(loans.borrowerId, borrowerId), eq(loans.status, "ACTIVE")));

  const activeLoansCount = activeLoansData[0]?.value || 0;
  console.log("[OVERVIEW] Active loans raw:", activeLoansData);
  console.log("[OVERVIEW] Active loans count:", activeLoansCount);

  // Total Borrowed Amount
  const totalBorrowedResult = await db
    .select({ value: sum(loans.principal) })
    .from(loans)
    .where(eq(loans.borrowerId, borrowerId));

  const totalBorrowedAmount = Number(totalBorrowedResult[0]?.value || 0);
  console.log("[OVERVIEW] Total borrowed raw:", totalBorrowedResult);
  console.log("[OVERVIEW] Total borrowed amount:", totalBorrowedAmount);

  // Pending Payments Count
  const pendingPaymentsData = await db
    .select({ value: count() })
    .from(repayments)
    .innerJoin(loans, eq(repayments.loanId, loans.id))
    .where(
      and(
        eq(loans.borrowerId, borrowerId),
        eq(repayments.status, "PENDING")
      )
    );

  const pendingPaymentsCount = pendingPaymentsData[0]?.value || 0;
  console.log("[OVERVIEW] Pending payments raw:", pendingPaymentsData);
  console.log("[OVERVIEW] Pending payments count:", pendingPaymentsCount);

  // Overdue Count
  const now = new Date();
  console.log("[OVERVIEW] Current time:", now);

  const overdueData = await db
    .select({ value: count() })
    .from(repayments)
    .innerJoin(loans, eq(repayments.loanId, loans.id))
    .where(
      and(
        eq(loans.borrowerId, borrowerId),
        eq(repayments.status, "PENDING"),
        lt(repayments.dueDate, now)
      )
    );

  const overdueCount = overdueData[0]?.value || 0;
  console.log("[OVERVIEW] Overdue raw:", overdueData);
  console.log("[OVERVIEW] Overdue count:", overdueCount);

  const response = {
    activeLoansCount,
    totalBorrowedAmount,
    pendingPaymentsCount,
    overdueCount,
  };

  console.log("[OVERVIEW] Response payload:", response);

  return c.json(response);
});

// 2. Loan History
// GET /api/borrower/loans
router.get("/loans", async (c) => {
    const user = c.get("user");
    const borrowerId = user.id;

    // Get actual loans
    const actualLoans = await db.query.loans.findMany({
        where: eq(loans.borrowerId, borrowerId),
        with: {
            repayments: true
        },
        orderBy: desc(loans.startDate)
    });
console.log("actual loans", actualLoans)
    // Get pending/rejected applications
    
 

    return c.json(actualLoans);
});
// 2. Loan History
// GET /api/borrower/applications
router.get("/applications/:id", async (c) => {
    const id = c.req.param("id")

    // Get actual loans
    const application = await db.query.loanApplications.findFirst({
        where: eq(loanApplications.id,id ),
        with:{
            borrower:{
                with: {
                    documents: true
                }
            },
            loanApp:true,
            repaymentPlan:true
        }
    });
    if (!application) {
        return c.json({ error: "Application not found" }, 404);
    }
    
    let loan
    if(application?.loanApp){

 
     loan = await db.query.loans.findFirst({
        where: eq(loans.applicationId, application?.id),
        with: {
            repayments:{
                with:{
                    subRepayments:true
                }
            }
        }
    });
    }
    

    return c.json({application:application,loan:loan});
});
// GET /api/borrower/applications/Od   get single applicaion
router.get("/applications", async (c) => {
    const user = c.get("user");
    const borrowerId = user.id;

    // Get actual loans
    const applications = await db.query.loanApplications.findMany({
        where: eq(loanApplications.borrowerId, borrowerId),
        orderBy: desc(loanApplications.createdAt)
    });
console.log("applications", applications)
    
 

    return c.json(applications);
});

// 4. Payout Accounts (Banks)
// GET /api/borrower/banks
router.get("/banks", async (c) => {
    const user = c.get("user");
    
    // We can fetch from bankAccounts table or borrower.bankAccounts JSON
    const accounts = await db.query.bankAccounts.findMany({
        where: eq(bankAccounts.borrowerId, user.id)
    });

    return c.json(accounts);
});

// POST /api/borrower/banks
// Replace the problematic line with proper typing
router.post("/banks", zValidator("json", createBankAccountSchema), async (c) => {
    const user = c.get("user");
    const { bankName, accountNumber, accountName, bankCode } = await c.req.json(); 
    
    const newAccount = await db.insert(bankAccounts).values({
        borrowerId: user.id,
        bankName,
        bankCode,
        accountNumber,
        accountName,
        accountNumberMasked: accountNumber.slice(-4).padStart(accountNumber.length, '*'),
        accountToken: "MANUAL",
        provider: "MANUAL",
        status: "ACTIVE"
    }).returning();

    // Also update JSON on borrower for convenience if needed
    const borrower = await db.query.borrowers.findFirst({ where: eq(borrowers.id, user.id) });
    if (borrower) {
        const currentBanks = Array.isArray(borrower.bankAccounts) ? borrower.bankAccounts : [];
        await db.update(borrowers)
            .set({ 
                bankAccounts: [...currentBanks, { 
                    bankName, 
                    accountNumber, 
                    accountName, 
                    bankCode, 
                    id: newAccount[0].id,
                    status: "ACTIVE"
                }] 
            })
            .where(eq(borrowers.id, user.id));
    }

    return c.json(newAccount[0], 201);
});
// DELETE /api/borrower/banks/:id
router.delete("/banks/:id", zValidator("param", bankAccountIdSchema), async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    const deleted = await db.delete(bankAccounts)
        .where(and(eq(bankAccounts.id, id), eq(bankAccounts.borrowerId, user.id)))
        .returning();

    if (deleted.length === 0) {
        return c.json({ error: "Bank account not found" }, 404);
    }

    // Update JSON too
    const borrower = await db.query.borrowers.findFirst({ where: eq(borrowers.id, user.id) });
    if (borrower && Array.isArray(borrower.bankAccounts)) {
        const updatedBanks = borrower.bankAccounts.filter((acc: any) => acc.id !== id);
        await db.update(borrowers)
            .set({ bankAccounts: updatedBanks })
            .where(eq(borrowers.id, user.id));
    }

    return c.json({ success: true, message: "Bank account removed" });
});

// 5. Notifications
// GET /api/borrower/notifications
router.get("/notifications", async (c) => {
    const user = c.get("user");
    
    const borrowerNotifications = await db.query.notifications.findMany({
        where: eq(notifications.borrowerId, user.id),
        orderBy: desc(notifications.sentAt),
        limit: 20
    });

    return c.json(borrowerNotifications);
});

// 6. Documents
// GET /api/borrower/documents
router.get("/documents", async (c) => {
    const user = c.get("user");
    
    const docs = await db.query.borrowerDocuments.findMany({
        where: eq(borrowerDocuments.borrowerId, user.id),
        orderBy: desc(borrowerDocuments.createdAt)
    });

    return c.json(docs);
});

// POST /api/borrower/documents
// Handles multipart/form-data with actual file upload
router.post("/documents", async (c) => {
  try {
    const user = c.get("user");

    const body = await c.req.json();

    const {
      documentType,
      url,
      publicId,
      name,
      metadata = {},
    } = body;

    if (!documentType || !url) {
      return c.json(
        { error: "documentType and url are required" },
        400
      );
    }

    const [newDoc] = await db
      .insert(borrowerDocuments)
      .values({
        borrowerId: user.id,
        name: name || "document",
        type: documentType,
        url,
        metadata,
        status: "PENDING",

      })
      .returning();

    return c.json(newDoc, 201);
  } catch (err: any) {
    console.error("Document save error:", err);

    return c.json(
      { error: err.message || "Failed to save document" },
      500
    );
  }
});


export default router;
