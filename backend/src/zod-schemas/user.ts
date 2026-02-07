import  { z } from "zod";
import { InferInsertModel } from "drizzle-orm";
import { userSessions } from "../db/schema";


const dateSchema = z.preprocess(
  (val) => (typeof val === "string" ? new Date(val) : val),
  z.date()
);




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
paystackPublicKey:z.string().optional(),
paystackSecretKey:z.string().optional(),
  smsNotifyCriticalOnly: z.boolean().optional(),
    deletedAt: dateSchema.optional(),
    deletionRequestedAt: dateSchema.optional(),
    disabledAt: dateSchema.optional(),
  
  // Subscription fields
  plan: z.enum(["Basic", "Pro", "Enterprise"]).optional(),
  subscriptionStatus: z.enum(["active", "inactive", "past_due", "canceled"]).optional(),
  subscriptionEndsAt: dateSchema.optional(),
});




export type InsertUserSession = InferInsertModel<typeof userSessions>;
