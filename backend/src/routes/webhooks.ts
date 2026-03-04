import { Hono } from "hono";
import { db } from "../db";
import { repayments, subRepayments } from "../db/schema";
import { and, eq, or } from "drizzle-orm";

const router = new Hono();

// Webhooks don't use auth middleware (protected by signature usually)

router.post("/paystack", async (c) => {
  console.log("--- 📥 Paystack Webhook Received ---");
  try {
    // Get signature from header
    const signature = c.req.header("x-paystack-signature");
    const rawBody = await c.req.text();

    if (!signature) {
      console.error("❌ Paystack webhook: No signature provided");
      return c.json({ error: "No signature provided" }, 400);
    }

    // Verify webhook signature
    const { paystackService } = await import("../utils/paystack");
    const isValid = paystackService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("❌ Paystack webhook: Invalid signature");
      return c.json({ error: "Invalid signature" }, 400);
    }

    console.log("✅ Paystack signature verified");

    const body = JSON.parse(rawBody);
    const event = body.event;

    console.log(`🔔 Paystack Event: ${event}`);

    if (event === "charge.success") {
      const { reference, status, paid_at, metadata, authorization } = body.data;

      console.log("💰 Processing charge.success:", {
        reference,
        status,
        metadata,
      });

      // Handle specific flow types from metadata
      if (
        metadata?.type === "BORROWER_ADD_CARD" ||
        metadata?.type === "CARD_INITIALIZATION"
      ) {
        console.log("💳 Handling Add Card flow:", reference);

        const borrowerEmail = metadata.borrowerEmail;
        if (!borrowerEmail) {
          console.error(
            "⚠️ No borrowerEmail found in metadata for Add Card flow",
          );
          return c.json({ error: "No borrowerEmail found in metadata" }, 400);
        }

        console.log(`🔍 Looking up borrower by email: ${borrowerEmail}`);
        const { paymentMethods, borrowers } = await import("../db/schema");
        const borrower = await db
          .select()
          .from(borrowers)
          .where(eq(borrowers.email, borrowerEmail))
          .limit(1);

        if (!borrower || borrower.length === 0) {
          console.error(`❌ Borrower not found for email: ${borrowerEmail}`);
          return c.json({ error: "Borrower not found" }, 404);
        }

        console.log(
          `✅ Borrower found: ${borrower[0].id}. Saving authorization...`,
        );
        await db.insert(paymentMethods).values({
          borrowerId: borrower[0].id,
          authorizationCode: authorization.authorization_code,
          last4: authorization.last4,
          expiry: `${authorization.exp_month}/${authorization.exp_year}`,
          provider: "PAYSTACK",
        });

        console.log(
          `✨ Card authorization successfully saved for borrower: ${borrower[0].id}`,
        );
        return c.json({
          status: "acknowledged",
          message: "Card authorization saved",
        });
      }

      // 3. Lender Funding Flow
      if (metadata?.type === "LENDER_FUNDING") {
        console.log("💰 Processing Lender Funding:", reference);
        const { lenderWalletService } =
          await import("../domain/lender-wallet/service");

        const result = await lenderWalletService.processSuccessfulFunding(
          reference,
          body.data,
        );

        console.log(
          `✨ Wallet successfully credited for lender: ${metadata.lenderId}`,
        );
        return c.json({
          status: "acknowledged",
          message: "Lender wallet credited",
          data: result,
        });
      }
     if (metadata?.type === "REPAYMENT") {
  console.log("💰 Incoming REPAYMENT payment");

  const { loan_id } = metadata;
  let amountToDistribute = Number(body.data.amount) / 100; // convert from kobo
  console.log("💵 Total amount received:", amountToDistribute);

  const allRepaymentsNotPaid = await db.query.repayments.findMany({
    where: and(
      eq(repayments.loanId, loan_id),
      or(
        eq(repayments.status, "PARTIAL"),
        eq(repayments.status, "PENDING"),
      ),
    ),
    orderBy: (repayments, { asc }) => [asc(repayments.dueDate)],
  });

  if (allRepaymentsNotPaid.length === 0) {
    console.log("❌ No unpaid repayments found");
    return c.json({ error: "No repayment found" }, 404);
  }

  console.log(
    `📄 Found ${allRepaymentsNotPaid.length} unpaid repayments`,
  );

  for (const repayment of allRepaymentsNotPaid) {
    if (amountToDistribute <= 0) {
      console.log("✅ Payment fully distributed");
      break;
    }

    console.log(`➡️ Processing repayment ${repayment.id}`);

    const unitPayments = await db.query.subRepayments.findMany({
      where: eq(subRepayments.repaymentId, repayment.id),
    });

    const totalPaid = unitPayments
      .filter((p) => p.status === "PAID")
      .reduce((acc, pay) => acc + Number(pay.amount), 0);

    const repaymentAmount = Number(repayment.amount);
    const remainingAmount = repaymentAmount - totalPaid;

    console.log({
      repaymentId: repayment.id,
      repaymentAmount,
      totalPaid,
      remainingAmount,
    });

    if (remainingAmount <= 0) {
      console.log("⚠️ Repayment already fully settled, skipping");
      continue;
    }

    const amountApplied = Math.min(remainingAmount, amountToDistribute);

    console.log(
      `💳 Applying ${amountApplied} to repayment ${repayment.id}`,
    );

    await db.insert(subRepayments).values({
      repaymentId: repayment.id,
      amount: String(amountApplied),
      status: "PAID",
      paidAt: new Date(),
    });

    amountToDistribute -= amountApplied;

    console.log(
      `📉 Remaining amount to distribute: ${amountToDistribute}`,
    );

    // Update repayment status
    if (amountApplied === remainingAmount) {
      console.log(`✅ Repayment ${repayment.id} fully PAID`);

      await db
        .update(repayments)
        .set({
          status: "PAID",
          paidAt: new Date(),
        })
        .where(eq(repayments.id, repayment.id));
    } else {
      console.log(`🟡 Repayment ${repayment.id} PARTIALLY PAID`);

      await db
        .update(repayments)
        .set({
          status: "PARTIAL",
        })
        .where(eq(repayments.id, repayment.id));
    }
  }

  if (amountToDistribute > 0) {
    //protect from this in the frontend
    console.log(
      "⚠️ Payment exceeds total outstanding repayments",
      amountToDistribute,
    );
    // Optional: store as advance / wallet balance / overpayment
  }

  console.log("🎉 Repayment distribution completed successfully");

  return c.json({
    status: "acknowledged",
    message: "Repayment processed successfully",
  });
}
    }

    // Handle other webhook events
    console.log(`❓ Unhandled Paystack event: ${event}`);
    return c.json({ status: "acknowledged" }, 200);
  } catch (error) {
    console.error("💥 Paystack webhook error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process webhook",
      },
      500,
    );
  } finally {
    console.log("--- 🔚 Paystack Webhook Processed ---");
  }
});

export default router;
