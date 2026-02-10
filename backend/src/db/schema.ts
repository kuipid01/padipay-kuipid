import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  decimal,
  numeric,
  doublePrecision,
  jsonb
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["LENDER", "ADMIN", "BORROWER"]);
export const loanAppStatusEnum = pgEnum("loan_app_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const loanStatusEnum = pgEnum("loan_status", [
  "ACTIVE",
  "COMPLETED",
  "DEFAULTED",
]);
export const repaymentStatusEnum = pgEnum("repayment_status", [
  "PENDING",
  "PAID",
  "FAILED",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "EMAIL",
  "SMS",
]);

export const planEnum = pgEnum("plan", ["Basic", "Pro", "Enterprise"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "inactive",
  "past_due",
  "canceled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
  "abandoned",
]);

export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "annual"]);

// Enums matching your Zod creditTier and collectionStrategy
export const creditTierEnum = pgEnum("credit_tier", ["excellent", "good", "fair", "poor", "all"]);
export const collectionStrategyEnum = pgEnum("collection_strategy", ["standard", "aggressive", "lenient"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").default("LENDER"),
  paystackPublicKey: text("paystack_public_key"),
  paystackSecretKey: text("paystack_secret_key"),
  resetPasswordToken: varchar("reset_password_token", { length: 255 }),
  resetPasswordExpires: timestamp("reset_password_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
  deletionRequestedAt: timestamp("deletion_requested_at"),
  disabledAt: timestamp("disabled_at"),

  // Profile
  avatarUrl: text("avatar_url"),
  timezone: varchar("timezone", { length: 50 }).default("Africa/Lagos"),
  language: varchar("language", { length: 20 }).default("English"),

  // Security
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),

  // Branding (Global/Account Level)
  brandLogoUrl: text("brand_logo_url"),
  brandColor: varchar("brand_color", { length: 10 }).default("#0D4715"),

  // Subscription
  plan: planEnum("plan").default("Basic"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("inactive"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),

  // Notifications - Email
  emailNotifyNewApplication: boolean("email_notify_new_application").default(
    true,
  ),
  emailNotifyPaymentReceived: boolean("email_notify_payment_received").default(
    true,
  ),
  emailNotifyPaymentFailed: boolean("email_notify_payment_failed").default(
    true,
  ),
  emailNotifyLoanOverdue: boolean("email_notify_loan_overdue").default(true),

  // Notifications - SMS
  smsNotifyCriticalOnly: boolean("sms_notify_critical_only").default(false),
});

export const payoutAccounts = pgTable("payout_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("NGN"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  deviceName: varchar("device_name", { length: 100 }),
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),

  ipAddress: varchar("ip_address", { length: 45 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 50 }),

  deviceFingerprint: varchar("device_fingerprint", { length: 64 }).notNull(),

  isCurrent: boolean("is_current").default(false),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});




/**
 * Loan Applications Table
 * Stores the main portal configuration
 */
export const loanApps = pgTable("loan_apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
    isActive:boolean("is_active").default(true),
  // Amounts
  minLoanAmount: integer("min_loan_amount").notNull().default(100),
  maxLoanAmount: integer("max_loan_amount").notNull().default(10000),
  autoApprovalLimit: integer("auto_approval_limit"),
  
  // Global Settings
  allowCustomAmounts: boolean("allow_custom_amounts").notNull().default(true),
  requireCreditCheck: boolean("require_credit_check").notNull().default(false),
  collectionStrategy: collectionStrategyEnum("collection_strategy").notNull().default("standard"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});   


/**
 * Repayment Plans Table
 * Linked to a specific Loan App
 */
export const repaymentPlans = pgTable("repayment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  loanAppId: uuid("loan_app_id")
    .references(() => loanApps.id, { onDelete: "cascade" })
    .notNull(),
  
  name: text("name").notNull(),
  durationDays: integer("duration_days").notNull(),
  interestRate: doublePrecision("interest_rate").notNull(),
  creditTier: creditTierEnum("credit_tier").notNull().default("all"),
  
  // Repayment Specifics
  earlyRepaymentAllowed: boolean("early_repayment_allowed").default(true),
  earlyRepaymentDiscount: doublePrecision("early_repayment_discount").default(0),
  lateFeesPercentage: doublePrecision("late_fees_percentage").notNull().default(5),
  gracePeriodDays: integer("grace_period_days").notNull().default(3),
  
  // UI/Logic States
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
});






export const borrowers = pgTable("borrowers", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  bvn: varchar("bvn", { length: 20 }),
  nin: varchar("nin", { length: 20 }),
  passcodeHash: text("passcode_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  middleName: varchar("middle_name", { length: 255 }),
  gender: varchar("gender", { length: 20 }),
  dob: varchar("dob", { length: 50 }),
  image: text("image"),
  kycVerified: boolean("kyc_verified").default(false),
  
  // Address & Location
  address: text("address"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }).default("Nigeria"),
  
  // Employment
  employmentType: varchar("employment_type", { length: 50 }), // e.g., "Full-time", "Part-time", "Self-employed"
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }),
  employerName: varchar("employer_name", { length: 255 }),
  
  // Credit Check
  creditReport: jsonb("credit_report"),
  creditScore: jsonb("credit_score"),
  
  bankAccounts: jsonb("bank_accounts").default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tempBorrowers = pgTable("temp_borrowers", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  phoneNumberVerified: boolean("phone_number_verified").default(false),
  email: varchar("email", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
  bvn: varchar("bvn", { length: 20 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  middleName: varchar("middle_name", { length: 255 }),
  gender: varchar("gender", { length: 20 }),
  dob: varchar("dob", { length: 50 }),
  image: text("image"),
  kycVerified: boolean("kyc_verified").default(false),
  
  // Address & Location
  address: text("address"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }).default("Nigeria"),
  
  // Employment
  employmentType: varchar("employment_type", { length: 50 }), // e.g., "Full-time", "Part-time", "Self-employed"
  monthlyIncome: text("monthly_income"),
  employerName: varchar("employer_name", { length: 255 }),
  
  // Credit Check
  creditReport: jsonb("credit_report"),
  creditScore: jsonb("credit_score"),
  
  bankAccounts: jsonb("bank_accounts").default([]),
  passcodeHash: text("passcode_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



export const loanApplications = pgTable("loan_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanAppId: uuid("loan_app_id")
    .references(() => loanApps.id)
    .notNull(),
    repaymentPlanId: uuid("repayment_plan_id")
    .references(() => repaymentPlans.id)
    .notNull(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id)
    .notNull(),
  amount: decimal("amount").notNull(),
  durationMonths: integer("duration_months").notNull(),
  status: loanAppStatusEnum("status").default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id")
    .references(() => loanApplications.id)
    .notNull(),
  lenderId: uuid("lender_id")
    .references(() => users.id)
    .notNull(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id)
    .notNull(),
  principal: decimal("principal").notNull(),
  interest: decimal("interest").notNull(),
  totalPayable: decimal("total_payable").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  status: loanStatusEnum("status").default("ACTIVE"),
});

export const repayments = pgTable("repayments", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanId: uuid("loan_id")
    .references(() => loans.id)
    .notNull(),
  amount: decimal("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  status: repaymentStatusEnum("status").default("PENDING"),
});

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id)
    .notNull(),
  provider: varchar("provider", { length: 50 }).default("PAYSTACK"),
  authorizationCode: text("authorization_code").notNull(),
  last4: varchar("last4", { length: 4 }),
  expiry: varchar("expiry", { length: 10 }),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id)
    .notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountNumberMasked: varchar("account_number_masked", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // Mono, Okra, Stitch
  accountToken: text("account_token").notNull(), // Encrypted
  status: varchar("status", { length: 20 }).default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const debitMandates = pgTable("debit_mandates", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id)
    .notNull(),
  bankAccountId: uuid("bank_account_id")
    .references(() => bankAccounts.id)
    .notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // Paystack, Monnify, Remita
  mandateReference: varchar("mandate_reference", { length: 255 }).notNull().unique(),
  maxAmount: decimal("max_amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 20 }).default("PENDING"), // PENDING, APPROVED, REJECTED, ACTIVE
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  borrowerId: uuid("borrower_id").references(() => borrowers.id),
  type: notificationTypeEnum("type").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loanPreferences = pgTable("loan_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),

  // 🔗 One-to-one relationship
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  /* ================= Loan Rules ================= */
  minLoanAmount: integer("min_loan_amount").notNull().default(10_000),
  maxLoanAmount: integer("max_loan_amount").notNull().default(5_000_000),

  // percentage (e.g. 5.5%)
  defaultInterestRate: numeric("default_interest_rate", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("5.00"),

  gracePeriodDays: integer("grace_period_days").notNull().default(3),

  /* ================= Documents Required ================= */
  requireGovernmentId: boolean("require_government_id").notNull().default(true),
  requireProofOfAddress: boolean("require_proof_of_address").notNull().default(true),
  requireBankStatement: boolean("require_bank_statement").notNull().default(false),
  requireUtilityBill: boolean("require_utility_bill").notNull().default(false),
  requireEmploymentLetter: boolean("require_employment_letter").notNull().default(false),

  /* ================= Verification Requirements ================= */
  requireBVNVerification: boolean("require_bvn_verification").notNull().default(true),
  requirePhoneVerification: boolean("require_phone_verification").notNull().default(true),
  requireBankAccountValidation: boolean("require_bank_account_validation").notNull().default(true),
  requireCreditBureauCheck: boolean("require_credit_bureau_check").notNull().default(false),

  /* ================= Auto-Approve ================= */
  autoApproveEnabled: boolean("auto_approve_enabled").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Subscription Payments Table
 * Tracks subscription purchases and payment status
 */
export const subscriptionPayments = pgTable("subscription_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Plan details
  plan: planEnum("plan").notNull(),
  billingCycle: billingCycleEnum("billing_cycle").notNull(),
  amount: decimal("amount").notNull(),
  
  // Paystack details
  reference: varchar("reference", { length: 255 }).notNull().unique(),
  paystackAccessCode: text("paystack_access_code"),
  paystackAuthorizationUrl: text("paystack_authorization_url"),
  
  // Payment status
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  
  // Subscription period
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  
  // Metadata
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});







// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  loanApps: many(loanApps),
  payoutAccounts: many(payoutAccounts),
   loanPreferences: one(loanPreferences),
}));


export const loanPreferencesRelations = relations(
  loanPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [loanPreferences.userId],
      references: [users.id],
    }),
  })
);
export const payoutAccountsRelations = relations(payoutAccounts, ({ one }) => ({
  user: one(users, {
    fields: [payoutAccounts.userId],
    references: [users.id],
  }),
}));

export const loanAppsRelations = relations(loanApps, ({ one, many }) => ({
  owner: one(users, {
    fields: [loanApps.ownerId],
    references: [users.id],
  }),
  applications: many(loanApplications),
  repaymentPlans: many(repaymentPlans),
}));

export const repaymentPlansRelations = relations(repaymentPlans, ({ one, many  }) => ({
  loanApp: one(loanApps, {
    fields: [repaymentPlans.loanAppId],
    references: [loanApps.id],
  }),
  applications: many(loanApplications),
}));


export const loanApplicationsRelations = relations(
  loanApplications,
  ({ one }) => ({
    loanApp: one(loanApps, {
      fields: [loanApplications.loanAppId],
      references: [loanApps.id],
    }),
    borrower: one(borrowers, {
      fields: [loanApplications.borrowerId],
      references: [borrowers.id],
    }),
    repaymentPlan: one(repaymentPlans, {
      fields: [loanApplications.repaymentPlanId],
      references: [repaymentPlans.id],
    }),
  }), 
);

export const repaymentsRelations = relations(repayments, ({ one }) => ({
  loan: one(loans, {
    fields: [repayments.loanId],
    references: [loans.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  borrower: one(borrowers, {
    fields: [loans.borrowerId],
    references: [borrowers.id],
  }),
  repayments: many(repayments),
}));

export const borrowersRelations = relations(borrowers, ({ many }) => ({
  applications: many(loanApplications),
  loans: many(loans),
  bankAccounts: many(bankAccounts),
  debitMandates: many(debitMandates),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  borrower: one(borrowers, {
    fields: [bankAccounts.borrowerId],
    references: [borrowers.id],
  }),
  mandates: many(debitMandates),
}));

export const debitMandatesRelations = relations(debitMandates, ({ one }) => ({
  borrower: one(borrowers, {
    fields: [debitMandates.borrowerId],
    references: [borrowers.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [debitMandates.bankAccountId],
    references: [bankAccounts.id],
  }),
}));
