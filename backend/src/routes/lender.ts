import { Hono } from "hono";
import { authMiddleware, requireRole } from "../middleware/auth";
import { lenderWalletService } from "../domain/lender-wallet/service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { borrowerDocuments } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const router = new Hono();

// All routes here require authentication and LENDER role
router.use("*", authMiddleware);
// router.use("*", requireRole("LENDER"));

/**
 * Initiate wallet funding
 * POST /api/lender/fund
 */
const fundSchema = z.object({
  amount: z.number().positive(), // Amount in kobo
});

router.post("/fund", zValidator("json", fundSchema), async (c) => {
  try {
    const user = c.get("user");
    const { amount } = c.req.valid("json");

    const result = await lenderWalletService.initiateFunding(user.id, amount);

    return c.json({
      status: true,
      message: "Funding initiated",
      data: {
        authorization_url: result.authorizationUrl,
        reference: result.funding.reference,
      },
    });
  } catch (error: any) {
    console.error("Funding initiation error:", error);
    return c.json({
      status: false,
      message: error.message || "Failed to initiate funding",
    }, 500);
  }
});

/**
 * Get wallet balances
 * GET /api/lender/wallet
 */
router.get("/wallet", async (c) => {
  try {
    const user = c.get("user");
    const balances = await lenderWalletService.getWalletBalances(user.id);

    return c.json({
      balance: balances.balance,
      locked_balance: balances.locked_balance,
      available_balance: balances.available_balance,
    });
  } catch (error: any) {
    console.error("Wallet read error:", error);
    return c.json({
      status: false,
      message: error.message || "Failed to fetch wallet balances",
    }, 500);
  }
});

/**
 * Get wallet transactions
 * GET /api/lender/wallet/transactions
 */
router.get("/wallet/transactions", async (c) => {
  try {
    const user = c.get("user");
    const limit = Number(c.req.query("limit")) || 50;
    const offset = Number(c.req.query("offset")) || 0;

    const transactions = await lenderWalletService.getWalletTransactions(user.id, limit, offset);

    return c.json({
      status: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error("Wallet transactions read error:", error);
    return c.json({
      status: false,
      message: error.message || "Failed to fetch wallet transactions",
    }, 500);
  }
});

/**
 * Get documents for a borrower
 * GET /api/lender/borrower/:borrowerId/documents
 */
router.get("/borrower/:borrowerId/documents", async (c) => {
  try {
    console.log("we even got her")
    const borrowerId = c.req.param("borrowerId");
    
    const docs = await db.query.borrowerDocuments.findMany({
      where: eq(borrowerDocuments.borrowerId, borrowerId),
      orderBy: desc(borrowerDocuments.createdAt)
    });
console.log(docs,"docs")
    return c.json(docs);
  } catch (error: any) {
    console.error("Borrower documents read error:", error);
    return c.json({
      status: false,
      message: error.message || "Failed to fetch borrower documents",
    }, 500);
  }
});

export default router;
