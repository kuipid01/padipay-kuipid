import { z } from "zod";

import { useFetch } from "../general";

export const useGetUserLoanApps = () => {
  const {
    data: loanApps,
    isLoading,
    error,
  } = useFetch<{
    loanApps: LoanApp[];
  }>("/api/loan-apps", { key: "user-loan-apps" });
  return { loanApps, isLoading, error };
};

const NumberPipe = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.number().min(0),
);

export const RepaymentPlanSchema = z.object({
    id:z.string(),
  name: z.string().min(1, "Plan name is required"),
  durationDays: z.coerce.number().positive(),
  interestRate: z.coerce.number().min(0),
  creditTier: z.enum(["excellent", "good", "fair", "poor", "all"]),
  earlyRepaymentAllowed: z.boolean().default(true),
  earlyRepaymentDiscount: z.coerce.number().optional(),
  gracePeriodDays: NumberPipe.default(0), // Defaults to 0 if empty
  lateFeesPercentage: NumberPipe,
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const LoanAppSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "App name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be url-friendly"),
    createdAt:z.date(),
  minLoanAmount: z.coerce.number().positive(),
  maxLoanAmount: z.coerce.number().positive(),
  allowCustomAmounts: z.boolean().default(true),
  isActive: z.boolean().default(true),
  requireCreditCheck: z.boolean().default(false),
  collectionStrategy: z
    .enum(["standard", "aggressive", "lenient"])
    .default("aggressive"),
  repaymentPlans: z
    .array(RepaymentPlanSchema)
    .min(1, "At least one repayment plan is required"),
});

export type LoanApp = z.infer<typeof LoanAppSchema>;
