
import { Hono } from "hono";
import { db } from "../db";
import { repayments } from "../db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

// Webhooks don't use auth middleware (protected by signature usually)

router.post("/paystack", async (c) => {
  try {
    // Get signature from header
    const signature = c.req.header("x-paystack-signature");
    const rawBody = await c.req.text();

    if (!signature) {
      console.error("Paystack webhook: No signature provided");
      return c.json({ error: "No signature provided" }, 400);
    }

    // Verify webhook signature
    const { paystackService } = await import("../utils/paystack");
    const isValid = paystackService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("Paystack webhook: Invalid signature");
      return c.json({ error: "Invalid signature" }, 400);
    }

    const body = JSON.parse(rawBody);
    const event = body.event;

    console.log("Paystack webhook event:", event);

    if (event === "charge.success") {
      const { reference, status, paid_at, metadata } = body.data;

      console.log("Processing charge.success:", {
        reference,
        status,
        metadata,
      });

      // Determine if this is a subscription or repayment payment
      // Subscription references start with "SUB_"
      if (reference.startsWith("SUB_")) {
        // Handle subscription payment
        console.log("Processing subscription payment:", reference);

        const { subscriptionService } = await import("../domain/subscription");
        const { subscriptionPayments } = await import("../db/schema");

        // Find subscription payment
        const paymentResult = await subscriptionService.getPaymentByReference(
          reference
        );

        if (!paymentResult.success || !paymentResult.data) {
          console.log(
            `Subscription payment not found for reference: ${reference}`
          );
          return c.json({ message: "Payment not found" }, 404);
        }

        const payment = paymentResult.data;

        // Validate metadata if present
        if (metadata) {
          if (metadata.userId && payment.userId !== metadata.userId) {
            console.error("Metadata userId mismatch");
            return c.json({ error: "Metadata mismatch" }, 400);
          }
          if (metadata.plan && payment.plan !== metadata.plan) {
            console.error("Metadata plan mismatch");
            return c.json({ error: "Metadata mismatch" }, 400);
          }
        }

        // Process based on status
        if (status === "success") {
          const result = await subscriptionService.processSuccessfulPayment({
            reference,
            paidAt: new Date(paid_at),
          });

          if (result.success) {
            console.log(
              `Subscription activated for user ${payment.userId} - Plan: ${payment.plan}`
            );
            return c.json({
              status: "acknowledged",
              message: "Subscription activated",
            });
          } else {
            console.error("Failed to process subscription payment:", result.error);
            return c.json({ error: result.error }, 500);
          }
        } else {
          // Handle failed subscription payment
          const result = await subscriptionService.processFailedPayment({
            reference,
          });

          if (result.success) {
            console.log(`Subscription payment failed for reference ${reference}`);
            return c.json({
              status: "acknowledged",
              message: "Payment marked as failed",
            });
          } else {
            console.error("Failed to update payment status:", result.error);
            return c.json({ error: result.error }, 500);
          }
        }
      } else {
        // Handle repayment payment
        console.log("Processing repayment payment:", reference);

        // Find repayment by reference and mark as paid
        const [repayment] = await db
          .select()
          .from(repayments)
          .where(eq(repayments.id, reference))
          .limit(1);

        if (!repayment) {
          console.log(`Repayment not found for reference: ${reference}`);
          return c.json({ message: "Repayment not found" }, 404);
        }

        if (status === "success") {
          // Update repayment status
          await db
            .update(repayments)
            .set({
              status: "PAID",
              paidAt: new Date(paid_at),
            })
            .where(eq(repayments.id, reference));

          console.log(`Repayment marked as paid: ${reference}`);
          return c.json({
            status: "acknowledged",
            message: "Repayment marked as paid",
          });
        } else {
          // Update repayment status to failed
          await db
            .update(repayments)
            .set({
              status: "FAILED",
            })
            .where(eq(repayments.id, reference));

          console.log(`Repayment marked as failed: ${reference}`);
          return c.json({
            status: "acknowledged",
            message: "Repayment marked as failed",
          });
        }
      }
    }

    // Handle other webhook events
    console.log(`Unhandled Paystack event: ${event}`);
    return c.json({ status: "acknowledged" }, 200);
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process webhook",
      },
      500
    );
  }
});

export default router;
