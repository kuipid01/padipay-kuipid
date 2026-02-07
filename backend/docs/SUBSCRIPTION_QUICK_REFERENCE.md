# Subscription Middleware - Quick Reference

## Import Statement

```typescript
import { 
  requireActiveSubscription,
  requireFeature,
  checkLoanAppLimit,
  hasFeatureAccess,
  getMaxLoanApps 
} from "../middleware/subscription";
```

## Common Use Cases

### 1. Enforce Loan App Creation Limit (Basic: 50, Pro/Enterprise: Unlimited)

```typescript
// routes/loan-apps.ts
app.post("/", 
  authMiddleware,
  checkLoanAppLimit,  // ← Add this
  zValidator("json", CreateLoanAppSchema),
  async (c) => {
    // Create loan app
  }
);
```

### 2. Restrict Advanced Analytics to Pro+ Users

```typescript
// routes/analytics.ts
app.get("/advanced", 
  authMiddleware,
  requireFeature("advanced_analytics"),  // ← Add this
  async (c) => {
    // Return advanced analytics
  }
);
```

### 3. Restrict Custom Branding to Pro+ Users

```typescript
// routes/settings.ts
app.patch("/branding", 
  authMiddleware,
  requireFeature("custom_branding"),  // ← Add this
  async (c) => {
    // Update branding settings
  }
);
```

### 4. Restrict SMS Reminders to Pro+ Users

```typescript
// routes/notifications.ts
app.post("/sms-reminder", 
  authMiddleware,
  requireFeature("automated_sms_reminders"),  // ← Add this
  async (c) => {
    // Send SMS reminder
  }
);
```

### 5. Restrict Export Features to Pro+ Users

```typescript
// routes/export.ts
app.get("/excel", 
  authMiddleware,
  requireFeature("export_excel_pdf"),  // ← Add this
  async (c) => {
    // Export to Excel
  }
);

app.get("/pdf", 
  authMiddleware,
  requireFeature("export_excel_pdf"),  // ← Add this
  async (c) => {
    // Export to PDF
  }
);
```

### 6. Restrict API Access to Enterprise Users

```typescript
// routes/api-keys.ts
app.get("/", 
  authMiddleware,
  requireFeature("api_access"),  // ← Add this (Enterprise only)
  async (c) => {
    // List API keys
  }
);

app.post("/", 
  authMiddleware,
  requireFeature("api_access"),  // ← Add this (Enterprise only)
  async (c) => {
    // Create API key
  }
);
```

### 7. Restrict Team Management to Pro+ Users

```typescript
// routes/team.ts
app.get("/members", 
  authMiddleware,
  requireFeature("team_management"),  // ← Add this
  async (c) => {
    // List team members
  }
);

app.post("/members", 
  authMiddleware,
  requireFeature("team_management"),  // ← Add this
  async (c) => {
    // Add team member
  }
);
```

### 8. Require Any Active Subscription

```typescript
// routes/dashboard.ts
app.get("/", 
  authMiddleware,
  requireActiveSubscription,  // ← Add this
  async (c) => {
    // Show dashboard (any active plan)
  }
);
```

### 9. Conditional Logic Based on Plan

```typescript
app.get("/features", authMiddleware, async (c) => {
  const user = c.get("user");
  
  // Fetch user plan
  const [userRecord] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, user.id));
  
  return c.json({
    canExport: hasFeatureAccess(userRecord.plan, "export_excel_pdf"),
    canUseSMS: hasFeatureAccess(userRecord.plan, "automated_sms_reminders"),
    canManageTeam: hasFeatureAccess(userRecord.plan, "team_management"),
    maxLoanApps: getMaxLoanApps(userRecord.plan),
  });
});
```

## Feature List by Plan

### Basic Plan Features
- `standard_dashboards`
- `card_authorization`
- `email_notifications`
- `standard_support`

### Pro Plan Features (includes all Basic)
- `unlimited_loan_apps`
- `custom_branding`
- `advanced_analytics`
- `priority_support`
- `automated_sms_reminders`
- `fraud_detection`
- `team_management`
- `export_excel_pdf`

### Enterprise Plan Features (includes all Pro)
- `white_label_solution`
- `api_access`
- `dedicated_account_manager`
- `custom_verifications`

## Error Responses

All middleware returns these error codes:

- **401**: User not authenticated
- **403**: Subscription required, expired, or feature not available
- **404**: User not found

Example error response:
```json
{
  "error": "This feature requires a Pro plan or higher."
}
```

## Database Migration

After adding subscription fields, push the schema changes:

```bash
bun run db:push
```

## Testing Checklist

- [ ] Basic users can create up to 50 loan apps
- [ ] Pro users can create unlimited loan apps
- [ ] Basic users cannot access advanced analytics
- [ ] Pro users can access advanced analytics
- [ ] Enterprise users can access API features
- [ ] Inactive subscriptions are blocked
- [ ] Expired subscriptions are blocked
