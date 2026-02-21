import { z } from "zod";

export const createBankAccountSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  bankCode: z.string().optional(),
});

export const bankAccountIdSchema = z.object({
  id: z.string().uuid("Invalid bank account ID"),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
