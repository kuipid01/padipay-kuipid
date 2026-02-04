import { z } from "zod";

export const LoanPreferencesSchema = z.object({
  /* ===== Loan Rules ===== */
  minLoanAmount: z.number().int().min(0).optional(),
  maxLoanAmount: z.number().int().min(0).optional(),

  defaultInterestRate: z
    .string()
    .optional(), // sent as number (5, 7.5)

  gracePeriodDays: z.number().int().min(0).optional(),

  /* ===== Documents Required ===== */
  requireGovernmentId: z.boolean().optional(),
  requireProofOfAddress: z.boolean().optional(),
  requireBankStatement: z.boolean().optional(),
  requireUtilityBill: z.boolean().optional(),
  requireEmploymentLetter: z.boolean().optional(),

  /* ===== Verification Requirements ===== */
  requireBVNVerification: z.boolean().optional(),
  requirePhoneVerification: z.boolean().optional(),
  requireBankAccountValidation: z.boolean().optional(),
  requireCreditBureauCheck: z.boolean().optional(),

  /* ===== Auto Approve ===== */
  autoApproveEnabled: z.boolean().optional(),
});
