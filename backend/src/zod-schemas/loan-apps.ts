import { z } from "zod";

import { RepaymentPlanSchema } from "./repayment-plans";


export const CreateLoanAppSchema = z.object({
  name: z.string().min(2, "App name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be url-friendly"),
  minLoanAmount: z.coerce.number().positive(),
  maxLoanAmount: z.coerce.number().positive(),
  isActive:  z.boolean().default(true),
  allowCustomAmounts: z.boolean().default(true),
  requireCreditCheck: z.boolean().default(false),
  collectionStrategy: z.enum(["standard", "aggressive", "lenient"]).default("aggressive"),
  repaymentPlans: z.array(RepaymentPlanSchema).min(1, "At least one repayment plan is required"),
});


export const UpdateLoanAppSchema = CreateLoanAppSchema.partial()
export type CreateLoanAppInput = z.infer<typeof CreateLoanAppSchema>;
export type UpdateLoanAppInput = z.infer<typeof UpdateLoanAppSchema>;