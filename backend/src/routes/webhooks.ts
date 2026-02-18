
import { Hono } from "hono";
import { db } from "../db";
import { repayments } from "../db/schema";
import { eq } from "drizzle-orm";

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
      if (metadata?.type === "BORROWER_ADD_CARD" || metadata?.type === "CARD_INITIALIZATION") {
        console.log("💳 Handling Add Card flow:", reference);
        
        const borrowerEmail = metadata.borrowerEmail
        if (!borrowerEmail) {
          console.error("⚠️ No borrowerEmail found in metadata for Add Card flow");
          return c.json({ error: "No borrowerEmail found in metadata" }, 400);
        }

        console.log(`🔍 Looking up borrower by email: ${borrowerEmail}`);
        const { paymentMethods, borrowers } = await import("../db/schema");
        const borrower = await db.select().from(borrowers).where(eq(borrowers.email, borrowerEmail)).limit(1);
        
        if (!borrower || borrower.length === 0) {
          console.error(`❌ Borrower not found for email: ${borrowerEmail}`);
          return c.json({ error: "Borrower not found" }, 404);
        }

        console.log(`✅ Borrower found: ${borrower[0].id}. Saving authorization...`);
        await db.insert(paymentMethods).values({
          borrowerId: borrower[0].id,
          authorizationCode: authorization.authorization_code,
          last4: authorization.last4,
          expiry: `${authorization.exp_month}/${authorization.exp_year}`,
          provider: "PAYSTACK"
        });

        console.log(`✨ Card authorization successfully saved for borrower: ${borrower[0].id}`);
        return c.json({
          status: "acknowledged",
          message: "Card authorization saved",
        });
      }

      // 3. Lender Funding Flow
      if (metadata?.type === "LENDER_FUNDING") {
        console.log("💰 Processing Lender Funding:", reference);
        const { lenderWalletService } = await import("../domain/lender-wallet/service");
        
        const result = await lenderWalletService.processSuccessfulFunding(reference, body.data);
        
        console.log(`✨ Wallet successfully credited for lender: ${metadata.lenderId}`);
        return c.json({
          status: "acknowledged",
          message: "Lender wallet credited",
          data: result
        });
      }

      // Determine if this is a subscription or repayment payment
      // Subscription references start with "SUB_" or type is SUBSCRIPTION
      if (reference.startsWith("SUB_") || metadata?.type === "SUBSCRIPTION") {
        // Handle subscription payment
        console.log("🔃 Processing subscription payment:", reference);

        const { subscriptionService } = await import("../domain/subscription");
        const { subscriptionPayments } = await import("../db/schema");

        // Find subscription payment
        const paymentResult = await subscriptionService.getPaymentByReference(
          reference
        );

        if (!paymentResult.success || !paymentResult.data) {
          console.error(
            `❌ Subscription payment not found for reference: ${reference}`
          );
          return c.json({ message: "Payment not found" }, 404);
        }

        const payment = paymentResult.data;
        console.log(`✅ Subscription payment found for user: ${payment.userId}`);

        // Validate metadata if present
        if (metadata) {
          if (metadata.userId && payment.userId !== metadata.userId) {
            console.error("❌ Metadata userId mismatch");
            return c.json({ error: "Metadata mismatch" }, 400);
          }
          if (metadata.plan && payment.plan !== metadata.plan) {
            console.error("❌ Metadata plan mismatch");
            return c.json({ error: "Metadata mismatch" }, 400);
          }
        }

        // Process based on status
        if (status === "success") {
          console.log(`⚙️ Activating subscription for reference: ${reference}...`);
          const result = await subscriptionService.processSuccessfulPayment({
            reference,
            paidAt: new Date(paid_at),
          });

          if (result.success) {
            console.log(
              `✨ Subscription activated for user ${payment.userId} - Plan: ${payment.plan}`
            );
            return c.json({
              status: "acknowledged",
              message: "Subscription activated",
            });
          } else {
            console.error("❌ Failed to process subscription payment:", result.error);
            return c.json({ error: result.error }, 500);
          }
        } else {
          // Handle failed subscription payment
          console.log(`📉 Marking subscription payment as failed: ${reference}`);
          const result = await subscriptionService.processFailedPayment({
            reference,
          });

          if (result.success) {
            console.log(`✅ Subscription payment marked as failed for reference ${reference}`);
            return c.json({
              status: "acknowledged",
              message: "Payment marked as failed",
            });
          } else {
            console.error("❌ Failed to update payment status:", result.error);
            return c.json({ error: result.error }, 500);
          }
        }
      } else {
        // Handle repayment payment
        const repaymentId = metadata?.repaymentId || reference;
        console.log(`💸 Processing repayment payment: ${repaymentId}`);

        // Find repayment by reference/id and mark as paid
        const [repayment] = await db
          .select()
          .from(repayments)
          .where(eq(repayments.id, repaymentId))
          .limit(1);

        if (!repayment) {
          console.error(`❌ Repayment not found for reference/id: ${repaymentId}`);
          return c.json({ message: "Repayment not found" }, 404);
        }

        console.log(`✅ Repayment record found: ${repayment.id}`);

        if (status === "success") {
          console.log(`⚙️ Marking repayment ${repaymentId} as PAID...`);
          // Update repayment status
          await db
            .update(repayments)
            .set({
              status: "PAID",
              paidAt: new Date(paid_at),
            })
            .where(eq(repayments.id, repaymentId));

          console.log(`✨ Repayment marked as paid: ${repaymentId}`);
          return c.json({
            status: "acknowledged",
            message: "Repayment marked as paid",
          });
        } else {
          // Update repayment status to failed
          console.log(`📉 Marking repayment ${repaymentId} as FAILED...`);
          await db
            .update(repayments)
            .set({
              status: "FAILED",
            })
            .where(eq(repayments.id, repaymentId));

          console.log(`❌ Repayment marked as failed: ${repaymentId}`);
          return c.json({
            status: "acknowledged",
            message: "Repayment marked as failed",
          });
        }
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
      500
    );
  } finally {
    console.log("--- 🔚 Paystack Webhook Processed ---");
  }
});

export default router;
