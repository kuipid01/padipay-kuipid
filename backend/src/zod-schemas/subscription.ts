import { z } from "zod";

export const initializeSubscriptionSchema = z.object({
  plan: z.enum(["Basic", "Pro", "Enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
  amount: z.number().positive(),
  callbackUrl: z.string().url().optional(),
});

export const verifySubscriptionPaymentSchema = z.object({
  reference: z.string(),
});

export type InitializeSubscriptionInput = z.infer<typeof initializeSubscriptionSchema>;
export type VerifySubscriptionPaymentInput = z.infer<typeof verifySubscriptionPaymentSchema>;
