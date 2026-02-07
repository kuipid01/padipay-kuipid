export type PlanType = "Basic" | "Pro" | "Enterprise";
export type BillingCycle = "monthly" | "annual";

export interface SubscriptionInitializeRequest {
  plan: PlanType;
  billingCycle: BillingCycle;
  amount: number;
  callbackUrl?: string;
}

export interface SubscriptionInitializeResponse {
  success: boolean;
  reference?: string;
  authorizationUrl?: string;
  paymentUrl?: string;
  message?: string;
  error?: string;
}
