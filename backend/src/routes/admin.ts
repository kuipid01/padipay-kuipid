import { Hono } from "hono";
import { db } from "../db";
import {
  users,
  borrowers,
  loanApplications,
  loanApps,
  loans,
  repayments,
  lenderWallets,
  repaymentPlans,
  transferRecipients,
  settlements,
  settlementTypeEnum,
  settlementStatusEnum,
} from "../db/schema";
import { paystackService } from "../utils/paystack";
import {
  eq,
  sql,
  count,
  sum,
  desc,
  and,
  or,
  ilike,
  inArray,
  isNull,
  lt,
} from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = new Hono();

// ─── Guard: must be authenticated + ADMIN role ────────────────────────────────

//TODO :IMPLEMENT LATER
// router.use("*", authMiddleware);
// router.use("*", requireRole("ADMIN"));

// ─── Helper: map DB plan names → frontend plan labels ────────────────────────
function mapPlan(plan: string | null): "Starter" | "Growth" | "Enterprise" {
  if (plan === "Pro") return "Growth";
  if (plan === "Enterprise") return "Enterprise";
  return "Starter"; // Basic → Starter
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/overview
// ─────────────────────────────────────────────────────────────────────────────
router.get("/overview", async (c) => {
  try {
    // Total loan applications
    const [{ totalRequests }] = await db
      .select({ totalRequests: count() })
      .from(loanApplications);

    // Total borrowers
    const [{ totalBorrowers }] = await db
      .select({ totalBorrowers: count() })
      .from(borrowers);

    // Active lenders (LENDER role, not disabled, not deleted)
    const [{ activeLenders }] = await db
      .select({ activeLenders: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "LENDER"),
          isNull(users.disabledAt),
          isNull(users.deletedAt)
        )
      );

    // Total disbursed (sum of all funded loan principals) in Naira
    // loans.principal is stored as decimal; convert kobo → NGN if needed (stored as NGN here)
    const [{ totalDisbursedNGN }] = await db
      .select({ totalDisbursedNGN: sum(loans.principal) })
      .from(loans);

    // Pending loan applications
    const [{ pendingRequests }] = await db
      .select({ pendingRequests: count() })
      .from(loanApplications)
      .where(eq(loanApplications.status, "PENDING"));

    // Pending KYC lenders: lenders whose emailVerified = false (proxy for KYC)
    const [{ pendingKycLenders }] = await db
      .select({ pendingKycLenders: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "LENDER"),
          eq(users.emailVerified, false),
          isNull(users.deletedAt)
        )
      );

    // Overdue repayments: PENDING repayments whose dueDate < now
    const [{ overdueRepayments }] = await db
      .select({ overdueRepayments: count() })
      .from(repayments)
      .where(
        and(
          eq(repayments.status, "PENDING"),
          lt(repayments.dueDate, new Date())
        )
      );

    return c.json({
      totalRequests: Number(totalRequests ?? 0),
      totalBorrowers: Number(totalBorrowers ?? 0),
      activeLenders: Number(activeLenders ?? 0),
      totalDisbursedNGN: Number(totalDisbursedNGN ?? 0),
      pendingRequests: Number(pendingRequests ?? 0),
      pendingKycLenders: Number(pendingKycLenders ?? 0),
      overdueRepayments: Number(overdueRepayments ?? 0),
    });
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return c.json({ error: "Failed to fetch admin overview" }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/requests
// Query: status, search, limit, offset
// ─────────────────────────────────────────────────────────────────────────────
router.get("/requests", async (c) => {
  try {
    const { status, search, limit = "20", offset = "0" } = c.req.query();

    const limitN = Math.min(Math.max(Number(limit), 1), 100);
    const offsetN = Math.max(Number(offset), 0);

    // Build WHERE conditions
    const conditions: ReturnType<typeof eq>[] = [];

    if (status && ["PENDING", "APPROVED", "FUNDED", "REJECTED"].includes(status)) {
      conditions.push(
        eq(loanApplications.status, status as "PENDING" | "APPROVED" | "FUNDED" | "REJECTED")
      );
    }

    // Fetch with relations
    const rows = await db.query.loanApplications.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: limitN,
      offset: offsetN,
      orderBy: desc(loanApplications.createdAt),
      with: {
        borrower: true,
        loanApp: {
          with: { owner: true },
        },
        repaymentPlan: true,
      },
    });

    // Apply search filter in-memory (on borrower name/email or lender businessName)
    const lowerSearch = search?.toLowerCase();
    const filtered = lowerSearch
      ? rows.filter((r) => {
        const borrowerName = `${r.borrower?.firstName ?? ""} ${r.borrower?.lastName ?? ""}`.toLowerCase();
        const borrowerEmail = (r.borrower?.email ?? "").toLowerCase();
        const lenderName = (r.loanApp?.name ?? r.loanApp?.owner?.fullName ?? "").toLowerCase();
        return (
          borrowerName.includes(lowerSearch) ||
          borrowerEmail.includes(lowerSearch) ||
          lenderName.includes(lowerSearch)
        );
      })
      : rows;

    // Count total (without pagination)
    const [{ total }] = await db
      .select({ total: count() })
      .from(loanApplications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const requests = filtered.map((r) => ({
      id: r.id,
      borrower: {
        id: r.borrower?.id ?? "",
        firstName: r.borrower?.firstName ?? "",
        lastName: r.borrower?.lastName ?? "",
        email: r.borrower?.email ?? "",
        phone: r.borrower?.phone ?? undefined,
      },
      lender: {
        id: r.loanApp?.ownerId ?? "",
        businessName: r.loanApp?.name ?? r.loanApp?.owner?.fullName ?? "Unknown",
      },
      amount: r.amount,
      durationDays: r.repaymentPlan?.durationDays ?? 0,
      interestRate: String(r.repaymentPlan?.interestRate ?? "0"),
      status: r.status as "PENDING" | "APPROVED" | "FUNDED" | "REJECTED",
      createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
    }));

    return c.json({ requests, total: Number(total ?? 0) });
  } catch (error: any) {
    console.error("Admin requests error:", error);
    return c.json({ error: "Failed to fetch admin requests" }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/borrowers
// Query: search, status, limit, offset
// ─────────────────────────────────────────────────────────────────────────────
router.get("/borrowers", async (c) => {
  try {
    const { search, status, limit = "20", offset = "0" } = c.req.query();

    const limitN = Math.min(Math.max(Number(limit), 1), 100);
    const offsetN = Math.max(Number(offset), 0);

    // Fetch all borrowers (with loans for aggregation)
    const rows = await db.query.borrowers.findMany({
      limit: limitN,
      offset: offsetN,
      orderBy: desc(borrowers.createdAt),
      with: {
        loans: true,
        applications: true,
      },
    });

    // Aggregate loan stats per borrower
    // Determine borrower status:
    //   DEFAULTED → any loan with status=DEFAULTED
    //   ACTIVE    → has at least one ACTIVE loan
    //   INACTIVE  → no active loans
    const computeStatus = (
      loanList: { status: string | null }[]
    ): "ACTIVE" | "INACTIVE" | "DEFAULTED" => {
      if (loanList.some((l) => l.status === "DEFAULTED")) return "DEFAULTED";
      if (loanList.some((l) => l.status === "ACTIVE")) return "ACTIVE";
      return "INACTIVE";
    };

    let filtered = rows.map((b) => {
      const totalLoans = b.applications?.length ?? 0;
      const totalBorrowedNGN = b.loans?.reduce(
        (acc, l) => acc + Number(l.principal ?? 0),
        0
      ) ?? 0;
      const derivedStatus = computeStatus(b.loans ?? []);
      const lastActivityAt =
        b.updatedAt?.toISOString() ?? b.createdAt?.toISOString() ?? new Date().toISOString();
      const creditScore = b.creditScore
        ? typeof b.creditScore === "number"
          ? b.creditScore
          : typeof b.creditScore === "object" && b.creditScore !== null
            ? (b.creditScore as any)?.score ?? undefined
            : undefined
        : undefined;

      return {
        id: b.id,
        firstName: b.firstName ?? "",
        lastName: b.lastName ?? "",
        email: b.email,
        phone: b.phone ?? undefined,
        state: b.state ?? undefined,
        totalLoans,
        totalBorrowedNGN,
        lastActivityAt,
        status: derivedStatus,
        creditScore,
        _status: derivedStatus, // internal for filtering
      };
    });

    // Apply status filter
    if (status && ["ACTIVE", "INACTIVE", "DEFAULTED"].includes(status)) {
      filtered = filtered.filter((b) => b._status === status);
    }

    // Apply search
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          `${b.firstName} ${b.lastName}`.toLowerCase().includes(lowerSearch) ||
          b.email.toLowerCase().includes(lowerSearch) ||
          (b.phone ?? "").includes(lowerSearch)
      );
    }

    const total = filtered.length;

    // Remove internal field before returning
    const borrowerList = filtered.map(({ _status, ...rest }) => rest);

    return c.json({ borrowers: borrowerList, total });
  } catch (error: any) {
    console.error("Admin borrowers error:", error);
    return c.json({ error: "Failed to fetch admin borrowers" }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/lenders
// Query: search, status, limit, offset
// ─────────────────────────────────────────────────────────────────────────────
router.get("/lenders", async (c) => {
  try {
    const { search, status, limit = "20", offset = "0" } = c.req.query();

    const limitN = Math.min(Math.max(Number(limit), 1), 100);
    const offsetN = Math.max(Number(offset), 0);

    // Fetch all LENDER users
    const lenderUsers = await db.query.users.findMany({
      where: and(eq(users.role, "LENDER"), isNull(users.deletedAt)),
      limit: limitN,
      offset: offsetN,
      orderBy: desc(users.createdAt),
      with: {
        loanApps: {
          with: {
            applications: true,
          },
        },
        loanPreferences: true,
      },
    });

    // Fetch wallets for lenders in bulk
    const lenderIds = lenderUsers.map((u) => u.id);

    const wallets =
      lenderIds.length > 0
        ? await db.query.lenderWallets.findMany({
          where: inArray(lenderWallets.lenderId, lenderIds),
        })
        : [];

    const walletMap = new Map(wallets.map((w) => [w.lenderId, w]));

    // Fetch funded loans to compute totalDisbursed per lender
    const fundedLoans =
      lenderIds.length > 0
        ? await db
          .select({
            lenderId: loans.lenderId,
            total: sum(loans.principal),
            borrowerCount: sql<number>`COUNT(DISTINCT ${loans.borrowerId})`,
          })
          .from(loans)
          .where(inArray(loans.lenderId, lenderIds))
          .groupBy(loans.lenderId)
        : [];

    const loanStatsMap = new Map(
      fundedLoans.map((f) => [f.lenderId, f])
    );

    // Derive lender status
    const computeLenderStatus = (
      u: typeof lenderUsers[0]
    ): "ACTIVE" | "SUSPENDED" | "PENDING_KYC" => {
      if (u.disabledAt) return "SUSPENDED";
      if (!u.emailVerified) return "PENDING_KYC";
      return "ACTIVE";
    };

    let lenderList = lenderUsers.map((u) => {
      const stats = loanStatsMap.get(u.id);
      const derivedStatus = computeLenderStatus(u);

      // Count active applications across all loan apps
      const activeApps = u.loanApps?.reduce(
        (acc, app) =>
          acc +
          (app.applications?.filter((a) => a.status === "PENDING").length ?? 0),
        0
      ) ?? 0;

      // The "business name" is the first loanApp name, or fallback to fullName
      const businessName =
        u.loanApps?.[0]?.name ?? u.fullName ?? u.email;

      return {
        id: u.id,
        businessName,
        ownerName: u.fullName ?? u.email,
        email: u.email,
        plan: mapPlan(u.plan),
        activeApps,
        totalDisbursedNGN: Number(stats?.total ?? 0),
        totalBorrowers: Number(stats?.borrowerCount ?? 0),
        status: derivedStatus,
        kycVerified: u.emailVerified ?? false,
        createdAt: u.createdAt?.toISOString() ?? new Date().toISOString(),
        _status: derivedStatus, // internal for filtering
      };
    });

    // Apply status filter
    if (status && ["ACTIVE", "SUSPENDED", "PENDING_KYC"].includes(status)) {
      lenderList = lenderList.filter((l) => l._status === status);
    }

    // Apply search
    if (search) {
      const lowerSearch = search.toLowerCase();
      lenderList = lenderList.filter(
        (l) =>
          l.businessName.toLowerCase().includes(lowerSearch) ||
          l.ownerName.toLowerCase().includes(lowerSearch) ||
          l.email.toLowerCase().includes(lowerSearch)
      );
    }

    const total = lenderList.length;

    const result = lenderList.map(({ _status, ...rest }) => rest);

    return c.json({ lenders: result, total });
  } catch (error: any) {
    console.error("Admin lenders error:", error);
    return c.json({ error: "Failed to fetch admin lenders" }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFER RECIPIENTS (Admin Override)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/borrowers/:borrowerId/transfer-recipients", async (c) => {
  try {
    const borrowerId = c.req.param("borrowerId");

    const recipients = await db.query.transferRecipients.findMany({
      where: eq(transferRecipients.borrowerId, borrowerId),
      orderBy: desc(transferRecipients.createdAt)
    });

    return c.json(recipients);
  } catch (error: any) {
    console.error("Admin transfer recipients get error:", error);
    return c.json({ error: "Failed to fetch admin transfer recipients" }, 500);
  }
});

router.post("/borrowers/:borrowerId/transfer-recipients", async (c) => {
  try {
    const borrowerId = c.req.param("borrowerId");
    const body = await c.req.json();

    const { account_number, bank_code, name, currency = "NGN", description } = body;

    if (!account_number || !bank_code || !name) {
      return c.json({ error: "account_number, bank_code, and name are required" }, 400);
    }

    const existing = await db.query.transferRecipients.findFirst({
      where: and(
        eq(transferRecipients.borrowerId, borrowerId),
        eq(transferRecipients.accountNumber, account_number),
        eq(transferRecipients.bankCode, bank_code)
      )
    });

    if (existing) {
      return c.json(existing, 200);
    }

    const response = await paystackService.createTransferRecipient({
      type: "nuban",
      name,
      account_number,
      bank_code,
      currency,
      description,
    });

    if (!response.status) {
      return c.json({ error: response.message || "Failed to create recipient" }, 400);
    }

    const data = response.data;
    const [newRecipient] = await db.insert(transferRecipients).values({
      borrowerId: borrowerId,
      recipientCode: data.recipient_code,
      accountNumber: data.details.account_number,
      bankCode: data.details.bank_code,
      accountName: data.details.account_name || name,
      bankName: data.details.bank_name,
      currency: data.currency || currency,
      type: data.type || "nuban",
      metadata: data,
    }).returning();

    return c.json(newRecipient, 201);
  } catch (error: any) {
    console.error("Admin transfer recipients post error:", error);
    return c.json({ error: error.message || "Failed to save transfer recipient" }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DISBURSEMENT (TRANSFER)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initiate a disbursement (transfer) for a loan application
 */
router.post("/requests/:id/disburse", async (c) => {
  try {
    const applicationId = c.req.param("id");
    const { recipientCode, reason } = await c.req.json();

    if (!recipientCode) {
      return c.json({ error: "recipientCode is required" }, 400);
    }

    // 1. Fetch application with details
    const app = await db.query.loanApplications.findFirst({
      where: eq(loanApplications.id, applicationId),
      with: {
        borrower: true,
        loanApp: true
      }
    });

    if (!app) {
      return c.json({ error: "Loan application not found" }, 404);
    }

    // Usually we only disburse APPROVED applications
    if (app.status !== "APPROVED" && app.status !== "PENDING") {
      return c.json({ error: `Cannot disburse application in ${app.status} status` }, 400);
    }

    // 2. Prepare transfer
    const amountInKobo = Math.round(Number(app.amount) * 100);
    const reference = `settle_${applicationId}_${Date.now()}`;

    // 3. Initiate Paystack Transfer
    const ptResponse = await paystackService.initiateTransfer({
      amount: amountInKobo,
      recipient: recipientCode,
      reference,
      reason: reason || `Loan Disbursement for ${app.borrower?.firstName} ${app.borrower?.lastName}`,
      source: "balance",
      currency: "NGN"
    });

    if (!ptResponse.status) {
      return c.json({ error: ptResponse.message || "Paystack transfer initiation failed" }, 400);
    }

    const ptData = ptResponse.data;

    // 4. Create Settlement Record
    const [settlement] = await db.insert(settlements).values({
      lenderId: app.loanApp.ownerId,
      borrowerId: app.borrower?.id,
      applicationId: app.id,
      amount: app.amount,
      type: "LOAN_DISBURSEMENT",
      paystackTransferId: String(ptData.id),
      paystackTransferCode: ptData.transfer_code,
      paystackReference: reference,
      status: ptData.status === "otp" ? "OTP_REQUIRED" : 
              ptData.status === "success" ? "SUCCESS" : "PENDING",
      reason: reason || null,
      metadata: ptData,
    }).returning();

    // 5. If immediate success, update application status
    if (ptData.status === "success") {
      await db.update(loanApplications)
        .set({ status: "FUNDED" })
        .where(eq(loanApplications.id, app.id));
    }

    return c.json({
      message: ptResponse.message,
      settlement,
      requiresOtp: ptData.status === "otp"
    });

  } catch (error: any) {
    console.error("Disbursement initiation error:", error);
    return c.json({ error: error.message || "Failed to initiate disbursement" }, 500);
  }
});

/**
 * Finalize a transfer that requires OTP
 */
router.post("/settlements/:id/finalize", async (c) => {
  try {
    const settlementId = c.req.param("id");
    const { otp } = await c.req.json();

    if (!otp) {
      return c.json({ error: "OTP is required" }, 400);
    }

    const settle = await db.query.settlements.findFirst({
      where: eq(settlements.id, settlementId)
    });

    if (!settle) {
      return c.json({ error: "Settlement record not found" }, 404);
    }

    if (settle.status !== "OTP_REQUIRED") {
      return c.json({ error: "This settlement does not require OTP or is already processed" }, 400);
    }

    if (!settle.paystackTransferCode) {
      return c.json({ error: "Paystack transfer code missing from settlement record" }, 400);
    }

    // 1. Finalize with Paystack
    const ptResponse = await paystackService.finalizeTransfer({
      transfer_code: settle.paystackTransferCode,
      otp
    });

    if (!ptResponse.status) {
      return c.json({ error: ptResponse.message || "Failed to finalize transfer" }, 400);
    }

    const ptData = ptResponse.data;

    // 2. Update Settlement Status
    const [updatedSettle] = await db.update(settlements)
      .set({
        status: ptData.status === "success" ? "SUCCESS" : "PENDING",
        metadata: { ...(settle.metadata as object), finalizeResponse: ptData },
        updatedAt: new Date(),
      })
      .where(eq(settlements.id, settle.id))
      .returning();

    // 3. Update Application Status if success
    if (ptData.status === "success" && settle.applicationId) {
      await db.update(loanApplications)
        .set({ status: "FUNDED" })
        .where(eq(loanApplications.id, settle.applicationId));
    }

    return c.json({
      message: ptResponse.message,
      settlement: updatedSettle
    });

  } catch (error: any) {
    console.error("Finalize transfer error:", error);
    return c.json({ error: error.message || "Failed to finalize transfer" }, 500);
  }
});

export default router;
