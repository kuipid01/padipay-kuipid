# Subscription Middleware Documentation

## Overview

The subscription middleware system enforces plan-based access control and limits throughout the application. It ensures users can only access features and perform actions allowed by their subscription plan.

## Plans

### Basic Plan
- **Price**: ₦2,000/month or ₦20,000/year
- **Loan App Limit**: 50
- **Features**:
  - Standard Dashboards
  - Card Authorization
  - Email Notifications
  - Standard Support

### Pro Plan
- **Price**: ₦9,900/month or ₦99,000/year
- **Loan App Limit**: Unlimited
- **Features**:
  - All Basic features
  - Custom Branding
  - Advanced Analytics
  - Priority Support
  - Automated SMS Reminders
  - Fraud Detection
  - Team Management
  - Export to Excel/PDF

### Enterprise Plan
- **Price**: Custom
- **Loan App Limit**: Unlimited
- **Features**:
  - All Pro features
  - White-label Solution
  - API Access
  - Dedicated Account Manager
  - Custom Verifications

## Database Schema

The `users` table includes the following subscription-related fields:

```typescript
{
  plan: "Basic" | "Pro" | "Enterprise",           // Current plan
  subscriptionStatus: "active" | "inactive" | "past_due" | "canceled",
  subscriptionEndsAt: Date | null                  // Expiration date
}
```

## Middleware Functions

### 1. `requireActiveSubscription`

Ensures the user has an active, non-expired subscription.

**Usage:**
```typescript
import { requireActiveSubscription } from "../middleware/subscription";

// Apply to routes that require any active subscription
app.get("/protected-route", authMiddleware, requireActiveSubscription, async (c) => {
  // Route logic here
});
```

**Checks:**
- User is authenticated
- Subscription status is "active"
- Subscription has not expired

**Error Responses:**
- `401`: Authentication required
- `403`: Active subscription required or subscription expired
- `404`: User not found

---

### 2. `requireFeature(feature: string)`

Checks if the user's plan includes access to a specific feature.

**Usage:**
```typescript
import { requireFeature } from "../middleware/subscription";

// Require "advanced_analytics" feature
app.get("/analytics", 
  authMiddleware, 
  requireFeature("advanced_analytics"), 
  async (c) => {
    // Only Pro and Enterprise users can access this
  }
);
```

**Available Features:**

**Basic Plan:**
- `standard_dashboards`
- `card_authorization`
- `email_notifications`
- `standard_support`

**Pro Plan (includes all Basic features):**
- `unlimited_loan_apps`
- `custom_branding`
- `advanced_analytics`
- `priority_support`
- `automated_sms_reminders`
- `fraud_detection`
- `team_management`
- `export_excel_pdf`

**Enterprise Plan (includes all Pro features):**
- `white_label_solution`
- `api_access`
- `dedicated_account_manager`
- `custom_verifications`

**Error Responses:**
- `401`: Authentication required
- `403`: Feature not available in current plan
- `404`: User not found

---

### 3. `checkLoanAppLimit`

Enforces the maximum number of loan apps a user can create based on their plan.

**Usage:**
```typescript
import { checkLoanAppLimit } from "../middleware/subscription";

// Check limit before creating a loan app
app.post("/loan-apps", 
  authMiddleware, 
  checkLoanAppLimit, 
  async (c) => {
    // Create loan app
  }
);
```

**Limits:**
- **Basic**: 50 loan apps
- **Pro**: Unlimited
- **Enterprise**: Unlimited

**Error Responses:**
- `401`: Authentication required
- `403`: Loan app limit reached or subscription required
- `404`: User not found

---

## Helper Functions

### `hasFeatureAccess(plan: PlanName, feature: string): boolean`

Programmatically check if a plan has access to a feature.

**Usage:**
```typescript
import { hasFeatureAccess } from "../middleware/subscription";

if (hasFeatureAccess("Pro", "advanced_analytics")) {
  // Pro plan has access to advanced analytics
}
```

---

### `getMaxLoanApps(plan: PlanName): number`

Get the maximum number of loan apps allowed for a plan.

**Usage:**
```typescript
import { getMaxLoanApps } from "../middleware/subscription";

const maxApps = getMaxLoanApps("Basic"); // Returns 50
const proApps = getMaxLoanApps("Pro");   // Returns Infinity
```

---

## Example Usage Patterns

### Pattern 1: Protect Entire Route Group

```typescript
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireActiveSubscription } from "../middleware/subscription";

const app = new Hono();

// All routes require active subscription
app.use("/*", authMiddleware, requireActiveSubscription);

app.get("/dashboard", async (c) => {
  // Only active subscribers can access
});
```

### Pattern 2: Feature-Specific Protection

```typescript
import { requireFeature } from "../middleware/subscription";

// Only Pro and Enterprise users can export
app.get("/export", 
  authMiddleware,
  requireFeature("export_excel_pdf"),
  async (c) => {
    // Export logic
  }
);

// Only Enterprise users can access API
app.get("/api-keys", 
  authMiddleware,
  requireFeature("api_access"),
  async (c) => {
    // API key management
  }
);
```

### Pattern 3: Limit Enforcement

```typescript
import { checkLoanAppLimit } from "../middleware/subscription";

// Check limit before creating
app.post("/loan-apps", 
  authMiddleware,
  checkLoanAppLimit,
  async (c) => {
    // Create loan app
  }
);
```

### Pattern 4: Conditional Logic in Route

```typescript
import { hasFeatureAccess } from "../middleware/subscription";
import { db, users } from "../db";
import { eq } from "drizzle-orm";

app.get("/settings", authMiddleware, async (c) => {
  const user = c.get("user");
  
  // Fetch user plan
  const [userRecord] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, user.id));
  
  // Conditionally show features
  const canCustomizeBranding = hasFeatureAccess(userRecord.plan, "custom_branding");
  
  return c.json({
    settings: {
      branding: canCustomizeBranding ? { /* branding options */ } : null,
    }
  });
});
```

---

## Accessing User Plan in Routes

After using `requireActiveSubscription`, the user's plan is available in the context:

```typescript
app.get("/dashboard", 
  authMiddleware,
  requireActiveSubscription,
  async (c) => {
    const userPlan = c.get("userPlan"); // "Basic" | "Pro" | "Enterprise"
    
    return c.json({
      plan: userPlan,
      features: getPlanFeatures(userPlan)
    });
  }
);
```

---

## Migration Guide

To add subscription checking to existing routes:

1. **Import the middleware:**
   ```typescript
   import { checkLoanAppLimit, requireFeature } from "../middleware/subscription";
   ```

2. **Add to route chain:**
   ```typescript
   // Before
   app.post("/loan-apps", authMiddleware, handler);
   
   // After
   app.post("/loan-apps", authMiddleware, checkLoanAppLimit, handler);
   ```

3. **Update database schema:**
   ```bash
   bun run db:push
   ```

---

## Testing

### Test Active Subscription

```bash
# Should succeed with active subscription
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/protected

# Should fail with inactive subscription (403)
```

### Test Feature Access

```bash
# Pro user accessing analytics - should succeed
curl -H "Authorization: Bearer <pro-token>" http://localhost:3000/api/analytics

# Basic user accessing analytics - should fail (403)
curl -H "Authorization: Bearer <basic-token>" http://localhost:3000/api/analytics
```

### Test Loan App Limit

```bash
# Create 51st loan app as Basic user - should fail (403)
curl -X POST -H "Authorization: Bearer <basic-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "App 51"}' \
  http://localhost:3000/api/loan-apps
```

---

## Error Handling

All subscription middleware returns consistent error responses:

```typescript
{
  "error": "Active subscription required. Please upgrade your plan."
}
```

Common error messages:
- `"Authentication required"` (401)
- `"Active subscription required. Please upgrade your plan."` (403)
- `"Your subscription has expired. Please renew to continue."` (403)
- `"This feature requires a Pro plan or higher."` (403)
- `"You have reached the maximum number of loan apps (50) for your Basic plan."` (403)
- `"User not found"` (404)
