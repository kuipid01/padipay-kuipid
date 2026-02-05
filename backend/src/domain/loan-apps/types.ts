import { CreateRepaymentPlanInput } from "../../zod-schemas/repayment-plans";


export interface CreateLoanAppInput {
  ownerId: string;
  name: string;
  slug: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  allowCustomAmounts: boolean;
  requireCreditCheck: boolean;
  collectionStrategy: "standard" | "aggressive" | "lenient";
  repaymentPlans: CreateRepaymentPlanInput[];
}