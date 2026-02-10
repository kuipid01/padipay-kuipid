import { z } from "zod";

export const UpdateApplicationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const NewApplicationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  // lga: z.string().min(1, "LGA is required"),

  employmentType: z.string().min(1, "Employment type is required"),
  wagesRange: z.string().min(1, "Wages range is required"),

  nextOfKinName: z.string().min(1, "Next of kin name is required"),
  nextOfKinPhone: z
    .string()
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),

  amount: z.number().positive("Amount must be greater than 0"),
  planId: z.string().min(1, "Plan is required"),
});

export const BorrowSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "LGA is required"),

  employmentType: z.string().min(1, "Employment type is required"),
  wagesRange: z.string().min(1, "Wages range is required"),

  nextOfKinName: z.string().min(1, "Next of kin name is required"),
  nextOfKinPhone: z
    .string()
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),

  amount: z.number().positive("Amount must be greater than 0"),
  planId: z.string().min(1, "Plan is required"),
});

export const CreateLoanApplicationSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),
  durationMonths: z.number().positive("Duration must be greater than 0"),
  amount: z.number().positive("Amount must be greater than 0"),
  repaymentPlanId: z.string().min(1, "Plan is required"),
  loanAppId: z.string().min(1, "Loan app is required"),
});

export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>;
export type NewApplicationInput = z.infer<typeof NewApplicationSchema>;
export type CreateLoanApplicationInput = z.infer<
  typeof CreateLoanApplicationSchema
>;
