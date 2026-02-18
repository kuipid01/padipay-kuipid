import { Hono } from "hono";
import { lenderWalletService } from "../domain/lender-wallet/service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const router = new Hono();

/**
 * Loan auto-disbursement (internal)
 * POST /api/internal/disburse
 * 
 * Logic:
 * 1. Check lender balance ≥ loan amount
 * 2. Move funds: balance → locked_balance
 * 3. Trigger Paystack transfer (placeholder)
 * 4. On success: locked_balance → deducted permanently
 */
const disburseSchema = z.object({
  lenderId: z.string().uuid(),
  loanId: z.string().uuid(),
  amount: z.number().positive(), // kobo
});

router.post("/disburse", zValidator("json", disburseSchema), async (c) => {
  try {
    const { lenderId, loanId, amount } = c.req.valid("json");

    // 1. Check and lock funds (balance -> locked_balance)
    await lenderWalletService.lockFundsForDisbursement(lenderId, loanId, amount);

    // 2. Trigger Paystack transfer (TODO: Implement actual transfer logic here)
    // const transfer = await paystackService.initiateTransfer(...)
    
    // 3. For now, we assume success and finalize (locked_balance -> deducted)
    await lenderWalletService.finalizeDisbursement(lenderId, loanId, amount);

    return c.json({
      status: true,
      message: "Loan disbursement processed",
    });
  } catch (error: any) {
    console.error("Internal disbursement error:", error);
    return c.json({
      status: false,
      message: error.message || "Failed to process disbursement",
    }, 500);
  }
});

export default router;
