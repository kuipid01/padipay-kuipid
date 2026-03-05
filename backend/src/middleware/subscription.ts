import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { PlanName } from "../lib/plans";

/**
 * Plan feature limits and capabilities
 */
const PLAN_LIMITS = {
  Basic: {
    maxLoanApps: 50,
    features: [
      "standard_dashboards",
      "card_authorization",
      "email_notifications",
      "standard_support",
    ],
  },
  Pro: {
    maxLoanApps: Infinity,
    features: [
      "unlimited_loan_apps",
      "custom_branding",
      "advanced_analytics",
      "priority_support",
      "automated_sms_reminders",
      "fraud_detection",
      "team_management",
      "export_excel_pdf",
    ],
  },
  Enterprise: {
    maxLoanApps: Infinity,
    features: [
      "white_label_solution",
      "api_access",
      "dedicated_account_manager",
      "custom_verifications",
      "unlimited_loan_apps",
      "custom_branding",
      "advanced_analytics",
      "priority_support",
      "automated_sms_reminders",
      "fraud_detection",
      "team_management",
      "export_excel_pdf",
    ],
  },
} as const;

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeatureAccess(plan: PlanName, feature: string): boolean {
  const planLimits = PLAN_LIMITS[plan];
  return (planLimits.features as readonly string[]).includes(feature);
}

/**
 * Get the maximum loan apps allowed for a plan
 */
export function getMaxLoanApps(plan: PlanName): number {
  return PLAN_LIMITS[plan].maxLoanApps;
}

/**
 * Middleware to check if user has an active subscription
 */
export async function requireActiveSubscription(c: Context, next: Next) {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, { message: "Authentication required" });
  }

  // Fetch user's subscription details
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
    throw new HTTPException(404, { message: "User not found" });
  }

  // Check if subscription is active
  if (userRecord.subscriptionStatus !== "active") {
    throw new HTTPException(403, {
      message: "Active subscription required. Please upgrade your plan.",
    });
  }

  // Check if subscription has expired
  if (userRecord.subscriptionEndsAt && new Date(userRecord.subscriptionEndsAt) < new Date()) {
    throw new HTTPException(403, {
      message: "Your subscription has expired. Please renew to continue.",
    });
  }

  // Attach plan info to context for use in route handlers
  c.set("userPlan", (userRecord.plan as PlanName) || "Basic");

  await next();
}

/**
 * Middleware to check if user's plan has access to a specific feature
 */
export function requireFeature(feature: string) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }

    // Fetch user's plan
    const [userRecord] = await db
      .select({
        plan: users.plan,
        subscriptionStatus: users.subscriptionStatus,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userRecord) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // Check if subscription is active
    if (userRecord.subscriptionStatus !== "active") {
      throw new HTTPException(403, {
        message: "Active subscription required to access this feature.",
      });
    }

    // Check if plan has access to the feature
    if (!hasFeatureAccess(userRecord.plan as PlanName, feature)) {
      throw new HTTPException(403, {
        message: `This feature requires a ${getRequiredPlanForFeature(feature)} plan or higher.`,
      });
    }

    await next();
  };
}

/**
 * Middleware to check if user has reached their loan app limit
 */
export async function checkLoanAppLimit(c: Context, next: Next) {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, { message: "Authentication required" });
  }

  // Fetch user's plan and current loan app count
  const [userRecord] = await db
    .select({
      plan: users.plan,
      subscriptionStatus: users.subscriptionStatus,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!userRecord) {
    throw new HTTPException(404, { message: "User not found" });
  }

  // Check if subscription is active
  if (userRecord.subscriptionStatus !== "active") {
    throw new HTTPException(403, {
      message: "Active subscription required to create loan apps.",
    });
  }

  const maxApps = getMaxLoanApps(userRecord.plan as PlanName);

  // If unlimited, skip the count check
  if (maxApps === Infinity) {
    await next();
    return;
  }

  // Count user's existing loan apps
  const { loanApps } = await import("../db/schema");
  const userLoanApps = await db
    .select()
    .from(loanApps)
    .where(eq(loanApps.ownerId, user.id));

  if (userLoanApps.length >= maxApps) {
    throw new HTTPException(403, {
      message: `You have reached the maximum number of loan apps (${maxApps}) for your ${userRecord.plan} plan. Please upgrade to create more.`,
    });
  }

  await next();
}

/**
 * Helper function to determine which plan is required for a feature
 */
function getRequiredPlanForFeature(feature: string): string {
  if (hasFeatureAccess("Basic", feature)) return "Basic";
  if (hasFeatureAccess("Pro", feature)) return "Pro";
  if (hasFeatureAccess("Enterprise", feature)) return "Enterprise";
  return "Enterprise";
}

// Extend Hono's context with plan info
declare module "hono" {
  interface ContextVariableMap {
    userPlan: PlanName;
  }
}
