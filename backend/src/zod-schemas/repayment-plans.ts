import { z } from "zod";

const NumberPipe = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val), 
  z.coerce.number().min(0)
);

export const RepaymentPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  durationDays: z.coerce.number().positive(),
  interestRate: z.coerce.number().min(0),
  creditTier: z.enum(["excellent", "good", "fair", "poor", "all"]),
  earlyRepaymentAllowed: z.boolean().default(true),
  earlyRepaymentDiscount: z.coerce.number().optional().default(0),
  gracePeriodDays: NumberPipe.default(0),
  lateFeesPercentage: NumberPipe.default(5),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const CreateRepaymentPlanSchema = RepaymentPlanSchema;
export const UpdateRepaymentPlanSchema = RepaymentPlanSchema.partial();

export type CreateRepaymentPlanInput = z.infer<typeof CreateRepaymentPlanSchema>;
export type UpdateRepaymentPlanInput = z.infer<typeof UpdateRepaymentPlanSchema>;

export const RepaymentPlanFullSchema = RepaymentPlanSchema.extend({
  id: z.string(),
  loanAppId: z.string(),
});

export type RepaymentPlan = z.infer<typeof RepaymentPlanFullSchema>;
