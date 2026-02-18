import { db, lenderWallets, lenderFundings, walletTransactions, users } from "../../db";
import { eq, sql } from "drizzle-orm";
import { paystackService } from "../../utils/paystack";

export class LenderWalletService {
  /**
   * Get or create a wallet for a lender
   */
  async getOrCreateWallet(lenderId: string, tx: any = db) {
    let [wallet] = await tx
      .select()
      .from(lenderWallets)
      .where(eq(lenderWallets.lenderId, lenderId))
      .limit(1);

    if (!wallet) {
      [wallet] = await tx
        .insert(lenderWallets)
        .values({ lenderId })
        .returning();
    }
    return wallet;
  }

  /**
   * Initiate a funding transaction
   */
  async initiateFunding(lenderId: string, amount: number) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, lenderId),
    });

    if (!user) throw new Error("Lender not found");

    const reference = `LND_FUND_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const [funding] = await db
      .insert(lenderFundings)
      .values({
        lenderId,
        reference,
        grossAmount: amount,
        status: "initiated",
      })
      .returning();

    const paystackResponse = await paystackService.initializeTransaction({
      email: user.email,
      amount: amount,
      reference,
      callback_url: "http://localhost:3000/dashboard/wallet",
      metadata: { type: "LENDER_FUNDING", lenderId },
    });

    return {
      funding,
      authorizationUrl: paystackResponse.data.authorization_url,
    };
  }

  /**
   * Process a successful funding via Paystack webhook
   * This is the "Source of Truth" moment where funds enter the wallet
   */
  async processSuccessfulFunding(reference: string, payload: any) {
    return await db.transaction(async (tx) => {
      // 1. Find the funding record
      const [funding] = await tx
        .select()
        .from(lenderFundings)
        .where(eq(lenderFundings.reference, reference))
        .for("update") // Lock the row for safety
        .limit(1);

      if (!funding) throw new Error("Funding record not found");
      if (funding.status === "confirmed") return funding;

      const paystackFee = payload.fees || 0;
      
      // Platform fee: 2% of gross amount, capped at ₦1000 (100,000 kobo)
      const calculatedFee = Math.round(funding.grossAmount * 0.02);
      const platformFee = Math.min(calculatedFee, 100000); 

      const netAmount = funding.grossAmount - paystackFee - platformFee;

      // 2. Update funding status
      await tx
        .update(lenderFundings)
        .set({
          status: "confirmed",
          paystackFee,
          platformFee,
          netAmount,
          metadata: payload,
          confirmedAt: new Date(),
        })
        .where(eq(lenderFundings.id, funding.id));

      // 3. Credit wallet balance (the "available" balance column)
      const wallet = await this.getOrCreateWallet(funding.lenderId, tx);
      const newBalance = wallet.balance + netAmount;

      await tx
        .update(lenderWallets)
        .set({ balance: newBalance })
        .where(eq(lenderWallets.id, wallet.id));

      // 4. Record ledger entry
      await tx.insert(walletTransactions).values({
        walletId: wallet.id,
        type: "funding_credit",
        amount: netAmount,
        reference: funding.reference,
        balanceAfter: newBalance,
        metadata: { fundingId: funding.id, paystackPayload: payload },
      });

      return { ...funding, status: "confirmed", netAmount };
    });
  }

  /**
   * Get formatted wallet balances for the API
   */
  async getWalletBalances(lenderId: string) {
    const wallet = await this.getOrCreateWallet(lenderId);
    return {
      balance: wallet.balance + wallet.lockedBalance, // Total
      locked_balance: wallet.lockedBalance, // Committed
      available_balance: wallet.balance, // Available (DB balance column)
    };
  }

  /**
   * Lock funds for a loan disbursement
   * Logic: balance → locked_balance
   */
  async lockFundsForDisbursement(lenderId: string, loanId: string, amount: number) {
    return await db.transaction(async (tx) => {
      const wallet = await this.getOrCreateWallet(lenderId, tx);
      
      if (wallet.balance < amount) {
        throw new Error("Insufficient available balance in wallet");
      }

      const newBalance = wallet.balance - amount;
      const newLockedBalance = wallet.lockedBalance + amount;

      await tx
        .update(lenderWallets)
        .set({ 
          balance: newBalance, 
          lockedBalance: newLockedBalance 
        })
        .where(eq(lenderWallets.id, wallet.id));

      return { success: true };
    });
  }

  /**
   * Deduct funds permanently after successful transfer
   * Logic: locked_balance → deducted permanently
   */
  async finalizeDisbursement(lenderId: string, loanId: string, amount: number) {
    return await db.transaction(async (tx) => {
      const wallet = await this.getOrCreateWallet(lenderId, tx);
      
      const newLockedBalance = wallet.lockedBalance - amount;

      await tx
        .update(lenderWallets)
        .set({ lockedBalance: newLockedBalance })
        .where(eq(lenderWallets.id, wallet.id));

      // Ledger entry for audit
      await tx.insert(walletTransactions).values({
        walletId: wallet.id,
        type: "loan_debit",
        amount: -amount,
        reference: `LOAN_DISB_${loanId}`,
        balanceAfter: wallet.balance + newLockedBalance, // Total after deduction
        metadata: { loanId },
      });

      return { success: true };
    });
  }

  /**
   * Get transaction history for a lender
   */
  async getWalletTransactions(lenderId: string, limit = 50, offset = 0) {
    const wallet = await this.getOrCreateWallet(lenderId);

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, wallet.id))
      .orderBy(sql`${walletTransactions.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    return transactions;
  }
}

export const lenderWalletService = new LenderWalletService();
