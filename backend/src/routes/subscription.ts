import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { db, users, subscriptionPayments } from "../db";
import { eq, and } from "drizzle-orm";
import { paystackService } from "../utils/paystack";
import {
  initializeSubscriptionSchema,
  verifySubscriptionPaymentSchema,
} from "../zod-schemas/subscription";
import { PLANS } from "../lib/plans";

const subscription = new Hono();

/**
 * Subscription Routes
 * 
 * - POST   /api/subscription/initialize  -> Initialize subscription payment
 * - POST   /api/subscription/verify      -> Verify subscription payment
 * - POST   /api/subscription/webhook     -> Handle Paystack webhook
 * - GET    /api/subscription/status      -> Get user's subscription status
 */

// Apply auth middleware to protected routes
subscription.use("/initialize", authMiddleware);
subscription.use("/verify", authMiddleware);
subscription.use("/status", authMiddleware);

/**
 * POST /api/subscription/initialize
 * Initialize a subscription payment with Paystack
 */
subscription.post(
  "/initialize",
  zValidator("json", initializeSubscriptionSchema),
  async (c) => {
    try {
      const user = c.get("user");
      const body = c.req.valid("json");

      // Fetch user details
      const [userRecord] = await db
        .select({
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (!userRecord) {
        return c.json({ error: "User not found" }, 404);
      }

      // Validate plan and amount
      const plan = PLANS.find((p) => p.name === body.plan);
      if (!plan) {
        return c.json({ error: "Invalid plan selected" }, 400);
      }

      // Get the correct price based on billing cycle
      const expectedAmount =
        body.billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

      // For Enterprise plan with custom pricing, allow any amount
      if (plan.name !== "Enterprise" && body.amount !== expectedAmount) {
        return c.json(
          {
            error: `Invalid amount for ${plan.name} plan. Expected ${expectedAmount}`,
          },
          400
        );
      }

      // Generate unique reference
      const reference = `SUB_${Date.now()}_${user.id.slice(0, 8)}`;

      // Use system Paystack key
      const paystackKey = process.env.PAYSTACK_SECRET_KEY;

      if (!paystackKey) {
        return c.json(
          { error: "Paystack configuration not found" },
          500
        );
      }

      // Initialize payment with Paystack
      const paystack = new (await import("../utils/paystack")).PaystackService(
        paystackKey
      );

      const paystackResponse = await paystack.initializeTransaction({
        email: userRecord.email,
        amount: body.amount * 100, // Convert to kobo
        reference,
        callbackUrl: body.callbackUrl,
        metadata: {
          userId: user.id,
          plan: body.plan,
          billingCycle: body.billingCycle,
        },
      });

      if (!paystackResponse.status) {
        return c.json(
          { error: "Failed to initialize payment" },
          500
        );
      }

      // Calculate subscription period
      const subscriptionStartDate = new Date();
      const subscriptionEndDate = new Date();
      
      if (body.billingCycle === "monthly") {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      } else {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
      }

      // Create subscription payment record
      await db.insert(subscriptionPayments).values({
        userId: user.id,
        plan: body.plan,
        billingCycle: body.billingCycle,
        amount: body.amount.toString(),
        reference,
        paystackAccessCode: paystackResponse.data.access_code,
        paystackAuthorizationUrl: paystackResponse.data.authorization_url,
        paymentStatus: "pending",
        subscriptionStartDate,
        subscriptionEndDate,
        metadata: JSON.stringify({
          plan: body.plan,
          billingCycle: body.billingCycle,
        }),
      });

      return c.json({
        success: true,
        data: {
          authorizationUrl: paystackResponse.data.authorization_url,
          accessCode: paystackResponse.data.access_code,
          reference,
        },
      });
    } catch (error) {
      console.error("Subscription initialization error:", error);
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to initialize subscription",
        },
        500
      );
    }
  }
);

/**
 * POST /api/subscription/verify
 * Verify a subscription payment
 */
subscription.post(
  "/verify",
  zValidator("json", verifySubscriptionPaymentSchema),
  async (c) => {
    try {
      const user = c.get("user");
      const { reference } = c.req.valid("json");

      // Fetch subscription payment record
      const [payment] = await db
        .select()
        .from(subscriptionPayments)
        .where(
          and(
            eq(subscriptionPayments.reference, reference),
            eq(subscriptionPayments.userId, user.id)
          )
        )
        .limit(1);

      if (!payment) {
        return c.json({ error: "Payment record not found" }, 404);
      }

      // If already successful, return success
      if (payment.paymentStatus === "success") {
        return c.json({
          success: true,
          message: "Payment already verified",
          data: {
            plan: payment.plan,
            subscriptionEndsAt: payment.subscriptionEndDate,
          },
        });
      }

      // Fetch user's Paystack key
      const [userRecord] = await db
        .select({ paystackSecretKey: users.paystackSecretKey })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      const paystackKey =
        userRecord?.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY;

      if (!paystackKey) {
        return c.json({ error: "Paystack configuration not found" }, 500);
      }

      // Verify with Paystack
      const paystack = new (await import("../utils/paystack")).PaystackService(
        paystackKey
      );
      const verification = await paystack.verifyTransaction(reference);

      if (!verification.status || verification.data.status !== "success") {
        // Update payment status to failed
        await db
          .update(subscriptionPayments)
          .set({
            paymentStatus: "failed",
            updatedAt: new Date(),
          })
          .where(eq(subscriptionPayments.reference, reference));

        return c.json(
          {
            success: false,
            message: "Payment verification failed",
          },
          400
        );
      }

      // Update payment record
      await db
        .update(subscriptionPayments)
        .set({
          paymentStatus: "success",
          paidAt: new Date(verification.data.paid_at),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPayments.reference, reference));

      // Update user subscription
      await db
        .update(users)
        .set({
          plan: payment.plan,
          subscriptionStatus: "active",
          subscriptionEndsAt: payment.subscriptionEndDate,
        })
        .where(eq(users.id, user.id));

      return c.json({
        success: true,
        message: "Subscription activated successfully",
        data: {
          plan: payment.plan,
          subscriptionEndsAt: payment.subscriptionEndDate,
        },
      });
    } catch (error) {
      console.error("Subscription verification error:", error);
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to verify subscription",
        },
        500
      );
    }
  }
);

/**
 * POST /api/subscription/webhook
 * Handle Paystack webhook events
 */
subscription.post("/webhook", async (c) => {
  try {
    const signature = c.req.header("x-paystack-signature");
    const body = await c.req.text();

    if (!signature) {
      return c.json({ error: "No signature provided" }, 400);
    }

    // Verify webhook signature
    const isValid = paystackService.verifyWebhookSignature(body, signature);

    if (!isValid) {
      return c.json({ error: "Invalid signature" }, 400);
    }

    const event = JSON.parse(body);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference, status, paid_at, metadata } = event.data;

      // Find subscription payment
      const [payment] = await db
        .select()
        .from(subscriptionPayments)
        .where(eq(subscriptionPayments.reference, reference))
        .limit(1);

      if (!payment) {
        console.log(`Payment not found for reference: ${reference}`);
        return c.json({ message: "Payment not found" }, 404);
      }

      // Update payment status
      await db
        .update(subscriptionPayments)
        .set({
          paymentStatus: status === "success" ? "success" : "failed",
          paidAt: paid_at ? new Date(paid_at) : null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPayments.reference, reference));

      // If successful, update user subscription
      if (status === "success") {
        await db
          .update(users)
          .set({
            plan: payment.plan,
            subscriptionStatus: "active",
            subscriptionEndsAt: payment.subscriptionEndDate,
          })
          .where(eq(users.id, payment.userId));

        console.log(
          `Subscription activated for user ${payment.userId} - Plan: ${payment.plan}`
        );
      }
    }

    return c.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process webhook",
      },
      500
    );
  }
});

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */
subscription.get("/status", async (c) => {
  try {
    const user = c.get("user");

    const [userRecord] = await db
      .select({
        plan: users.plan,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionEndsAt: users.subscriptionEndsAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userRecord) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get recent payments
    const recentPayments = await db
      .select({
        id: subscriptionPayments.id,
        plan: subscriptionPayments.plan,
        billingCycle: subscriptionPayments.billingCycle,
        amount: subscriptionPayments.amount,
        paymentStatus: subscriptionPayments.paymentStatus,
        paidAt: subscriptionPayments.paidAt,
        createdAt: subscriptionPayments.createdAt,
      })
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.userId, user.id))
      .orderBy(subscriptionPayments.createdAt)
      .limit(10);

    return c.json({
      subscription: {
        plan: userRecord.plan,
        status: userRecord.subscriptionStatus,
        endsAt: userRecord.subscriptionEndsAt,
      },
      recentPayments,
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get subscription status",
      },
      500
    );
  }
});

export default subscription;
