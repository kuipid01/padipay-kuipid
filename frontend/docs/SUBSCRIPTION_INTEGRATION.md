# Subscription Integration

This document explains the subscription flow implementation.

## Overview

The subscription system allows users to subscribe to different plans (Basic, Pro, Enterprise) with monthly or annual billing cycles.

## Architecture

### Frontend Components

1. **Plans Component** (`components/landing/plans.tsx`)
   - Displays available subscription plans
   - Handles plan selection and initiates subscription
   - Shows loading states during processing
   - Redirects to payment gateway or success page

2. **Success Page** (`app/subscription/success/page.tsx`)
   - Displays subscription confirmation
   - Shows plan details and reference number
   - Redirects to dashboard

### API Routes

1. **Initialize Subscription** (`app/api/subscription/initialize/route.ts`)
   - Proxies subscription requests to backend
   - Requires authentication (Bearer token from cookies)
   - Validates request and forwards to backend

### Backend Integration

The frontend proxies requests to the backend at:
- Endpoint: `POST /api/subscription/initialize`
- Authentication: Bearer token in Authorization header
- Backend URL: Configured via `BACKEND_URL` environment variable (default: `http://localhost:3001`)

## Request/Response Flow

### 1. User Clicks "Get Started" Button

The Plans component calls `handleSubscribe()` with:
```typescript
{
  plan: "Basic" | "Pro" | "Enterprise",
  billingCycle: "monthly" | "annual",
  amount: number,
  callbackUrl: "https://yourapp.com/subscription/success"
}
```

### 2. Frontend Proxy

The Next.js API route (`/api/subscription/initialize`) forwards the request to the backend with the user's authentication token.

### 3. Backend Response

Expected response from backend:
```typescript
{
  success: boolean,
  reference?: string,           // Payment reference
  authorizationUrl?: string,    // Paystack/payment gateway URL
  paymentUrl?: string,          // Alternative payment URL
  message?: string,
  error?: string
}
```

### 4. Redirect Flow

- If `authorizationUrl` or `paymentUrl` is provided → Redirect to payment gateway
- If no payment URL → Redirect to success page (for free trials or completed payments)
- On error → Show error alert and reset loading state

### 5. Success Page

After payment completion, the payment gateway redirects to:
```
/subscription/success?plan={planName}&reference={paymentReference}
```

## Environment Variables

Required in `.env.local`:
```env
BACKEND_URL=http://localhost:3001
```

## Plan Details

### Basic Plan
- Price: ₦2,000/month or ₦20,000/year
- Features:
  - Up to 50 Loan Apps
  - Standard Dashboards
  - Card Authorization
  - Email Notifications
  - Standard Support

### Pro Plan
- Price: ₦9,900/month or ₦99,000/year
- Features:
  - Unlimited Loan Apps
  - Custom Branding
  - Advanced Analytics
  - Priority Support
  - Automated SMS Reminders
  - Fraud Detection
  - Team Management
  - Export to Excel/PDF

### Enterprise Plan
- Price: Custom
- Features:
  - White-label Solution
  - API Access
  - Dedicated Account Manager
  - Custom Verifications
- Note: Redirects to contact page instead of payment flow

## Error Handling

The system handles errors at multiple levels:
1. Network errors (fetch failures)
2. Backend errors (4xx, 5xx responses)
3. Invalid responses (non-JSON content)
4. Authentication errors (401 Unauthorized)

All errors are logged to console and displayed to users via alerts.

## Testing

To test the subscription flow:

1. Start the development server:
   ```bash
   yarn dev
   ```

2. Navigate to the pricing section
3. Click "Get Started" on any plan
4. Verify the request is sent to `/api/subscription/initialize`
5. Check that the backend receives the request with proper authentication
6. Verify redirect to payment gateway or success page

## Future Enhancements

- Add webhook handler for payment verification
- Implement subscription status checking
- Add subscription management page
- Support for plan upgrades/downgrades
- Proration calculations for plan changes
