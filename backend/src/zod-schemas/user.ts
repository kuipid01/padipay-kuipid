import { z } from "zod";
import { InferInsertModel } from "drizzle-orm";
import { userSessions } from "../db/schema";


export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
    avatarUrl:z.string().url().optional(),
  brandLogoUrl: z.string().url().optional(),
  brandColor: z.string().optional(),

  emailNotifyNewApplication: z.boolean().optional(),
  emailNotifyPaymentReceived: z.boolean().optional(),
  isTwoFactorEnabled: z.boolean().optional(),
  emailNotifyPaymentFailed: z.boolean().optional(),
  emailNotifyLoanOverdue: z.boolean().optional(),

  smsNotifyCriticalOnly: z.boolean().optional(),
});




export type InsertUserSession = InferInsertModel<typeof userSessions>;
