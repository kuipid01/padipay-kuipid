import { db, users, subscriptionPayments } from "../../db";
import { eq } from "drizzle-orm";

export class SubscriptionService {
  /**
   * Update user subscription status after successful payment
   */
  async updateUserSubscriptionStatus(params: {
    userId: string;
    plan: "Basic" | "Pro" | "Enterprise";
    subscriptionEndDate: Date;
    status: "active" | "inactive" | "past_due" | "canceled";
  }) {
    try {
      await db
        .update(users)
        .set({
          plan: params.plan,
          subscriptionStatus: params.status,
          subscriptionEndsAt: params.subscriptionEndDate,
        })
        .where(eq(users.id, params.userId));

      return { success: true };
    } catch (error) {
      console.error("Error updating user subscription:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update subscription payment status
   */
  async updatePaymentStatus(params: {
    reference: string;
    status: "pending" | "success" | "failed" | "abandoned";
    paidAt?: Date;
  }) {
    try {
      await db
        .update(subscriptionPayments)
        .set({
          paymentStatus: params.status,
          paidAt: params.paidAt || null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPayments.reference, params.reference));

      return { success: true };
    } catch (error) {
      console.error("Error updating payment status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get subscription payment by reference
   */
  async getPaymentByReference(reference: string) {
    try {
      const [payment] = await db
        .select()
        .from(subscriptionPayments)
        .where(eq(subscriptionPayments.reference, reference))
        .limit(1);

      return { success: true, data: payment };
    } catch (error) {
      console.error("Error fetching payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process successful subscription payment
   * Updates both payment record and user subscription
   */
  async processSuccessfulPayment(params: {
    reference: string;
    paidAt: Date;
  }) {
    try {
      // Get payment record
      const paymentResult = await this.getPaymentByReference(params.reference);
      
      if (!paymentResult.success || !paymentResult.data) {
        return {
          success: false,
          error: "Payment record not found",
        };
      }

      const payment = paymentResult.data;

      // Update payment status
      await this.updatePaymentStatus({
        reference: params.reference,
        status: "success",
        paidAt: params.paidAt,
      });

      // Update user subscription
      await this.updateUserSubscriptionStatus({
        userId: payment.userId,
        plan: payment.plan,
        subscriptionEndDate: payment.subscriptionEndDate!,
        status: "active",
      });

      return { success: true, data: payment };
    } catch (error) {
      console.error("Error processing successful payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process failed subscription payment
   */
  async processFailedPayment(params: {
    reference: string;
  }) {
    try {
      // Update payment status to failed
      await this.updatePaymentStatus({
        reference: params.reference,
        status: "failed",
      });

      return { success: true };
    } catch (error) {
      console.error("Error processing failed payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
