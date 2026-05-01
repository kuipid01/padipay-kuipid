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
  "FUNDED",
]);
export const loanStatusEnum = pgEnum("loan_status", [
  "ACTIVE",
  "COMPLETED",
  "DEFAULTED",
]);
export const repaymentStatusEnum = pgEnum("repayment_status", [
  "PENDING",
  "PAID",
  "PARTIAL",
  "FAILED",
]);
export const subRepaymentsEnum = pgEnum("sub_repayment_status", [
  "PAID",
  "FAILED",
  "PENDING"
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

export const fundingStatusEnum = pgEnum("funding_status", [
  "initiated",
  "pending",
  "confirmed",
  "failed",
]);

export const fundingChannelEnum = pgEnum("funding_channel", ["paystack"]);

export const documentTypeEnum = pgEnum("document_type", [
  "GOVERNMENT_ID",
  "PROOF_OF_ADDRESS",
  "BANK_STATEMENT",
  "UTILITY_BILL",
  "EMPLOYMENT_LETTER",
  "OTHER",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);


export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
  "funding_credit",
  "loan_debit",
  "repayment_credit",
  "fee_debit",
]);

export const settlementTypeEnum = pgEnum("settlement_type", [
  "LOAN_DISBURSEMENT",
  "LENDER_PAYOUT",
]);

export const settlementStatusEnum = pgEnum("settlement_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REVERSED",
  "OTP_REQUIRED",
]);

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
 emailVerified:boolean("email_verified").default(false),
 phoneNumberVerified:boolean("phone_verified").default(false),
  // Branding (Global/Account Level)
  brandLogoUrl: text("brand_logo_url"),
  brandColor: varchar("brand_color", { length: 10 }).default("#0D4715"),

  // Subscription
  plan: planEnum("plan").default("Basic"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("inactive"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  trialEndsAt: timestamp("trial_ends_at"),

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
    emailVerified: boolean("email_verified").default(false),
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
 monthlyIncome: text("monthly_income"),
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
export const subRepayments = pgTable("sub_repayments", {
  id: uuid("id").defaultRandom().primaryKey(),
  repaymentId: uuid("repayment_id")
    .references(() => repayments.id)
    .notNull(),
  amount: decimal("amount").notNull(),
  paidAt: timestamp("paid_at"),
  status: subRepaymentsEnum("status").default("PENDING"),
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
  bankCode: varchar("bank_code", { length: 20 }),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountNumberMasked: varchar("account_number_masked", { length: 50 }),
  provider: varchar("provider", { length: 50 }).notNull().default("MANUAL"), // Mono, Okra, Stitch, MANUAL
  accountToken: text("account_token"), // Encrypted
  status: varchar("status", { length: 20 }).default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transferRecipients = pgTable("transfer_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id)
    .notNull(),
  recipientCode: varchar("recipient_code", { length: 255 }).notNull().unique(), // e.g., RCP_m7ljkv8leesep7p
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  bankCode: varchar("bank_code", { length: 20 }).notNull(),
  accountName: varchar("account_name", { length: 255 }),
  bankName: varchar("bank_name", { length: 255 }),
  currency: varchar("currency", { length: 10 }).default("NGN"),
  type: varchar("type", { length: 20 }).default("nuban"),
  metadata: jsonb("metadata"),
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

export const notificationLogs = pgTable("notification_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id)
    .notNull(),
  repaymentId: uuid("repayment_id")
    .references(() => repayments.id),
  category: varchar("category", { length: 50 }).notNull(), // 'PRE_DUE_3_DAYS', 'PAYMENT_CONFIRMATION', etc.
  channel: varchar("channel", { length: 20 }).notNull(),  // 'EMAIL', 'SMS'
  status: varchar("status", { length: 20 }).notNull(),   // 'PENDING', 'SENT', 'FAILED', 'DELIVERED'
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  errorMessage: text("error_message"),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const borrowerDocuments = pgTable("borrower_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: documentTypeEnum("type").notNull(),
  url: text("url").notNull(),
  status: documentStatusEnum("status").default("PENDING").notNull(),
  rejectionReason: text("rejection_reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const lenderWallets = pgTable("lender_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  lenderId: uuid("lender_id")
    .references(() => users.id)
    .notNull().unique(),
  balance: integer("balance").default(0).notNull(), // available (in kobo)
  lockedBalance: integer("locked_balance").default(0).notNull(), // committed to loans
  currency: varchar("currency", { length: 3 }).default("NGN"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lenderFundings = pgTable("lender_fundings", {
  id: uuid("id").primaryKey().defaultRandom(),
  lenderId: uuid("lender_id")
    .references(() => users.id)
    .notNull(),
  reference: text("reference").unique().notNull(), // Paystack reference
  grossAmount: integer("gross_amount").notNull(), // amount lender sent (kobo)
  paystackFee: integer("paystack_fee"),
  platformFee: integer("platform_fee").default(20000), // ₦200 in kobo
  netAmount: integer("net_amount"), // credited to wallet
  status: fundingStatusEnum("status").default("initiated").notNull(),
  channel: fundingChannelEnum("channel").default("paystack").notNull(),
  metadata: jsonb("metadata"), // raw Paystack payload
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => lenderWallets.id)
    .notNull(),
  type: walletTransactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // + or -
  reference: text("reference"),
  balanceAfter: integer("balance_after").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  lenderId: uuid("lender_id")
    .references(() => users.id)
    .notNull(),
  borrowerId: uuid("borrower_id")
    .references(() => borrowers.id),
  applicationId: uuid("application_id")
    .references(() => loanApplications.id),
  amount: decimal("amount").notNull(),
  type: settlementTypeEnum("type").notNull(),
  paystackTransferId: text("paystack_transfer_id"),
  paystackTransferCode: text("paystack_transfer_code"),
  paystackReference: text("paystack_reference").unique(),
  status: settlementStatusEnum("status").default("PENDING").notNull(),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});







// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  loanApps: many(loanApps),
  payoutAccounts: many(payoutAccounts),
  loanPreferences: one(loanPreferences),
  settlements: many(settlements),
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
  ({ one, many }) => ({
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
    settlements: many(settlements),
  }), 
);

export const repaymentsRelations = relations(repayments, ({ one, many }) => ({
  loan: one(loans, {
    fields: [repayments.loanId],
    references: [loans.id],
  }),
  subRepayments: many(subRepayments),
  notificationLogs: many(notificationLogs),
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
  notificationLogs: many(notificationLogs),
  documents: many(borrowerDocuments),
  transferRecipients: many(transferRecipients),
  settlements: many(settlements),
}));

export const transferRecipientsRelations = relations(transferRecipients, ({ one }) => ({
  borrower: one(borrowers, {
    fields: [transferRecipients.borrowerId],
    references: [borrowers.id],
  }),
}));

export const borrowerDocumentsRelations = relations(borrowerDocuments, ({ one }) => ({
  borrower: one(borrowers, {
    fields: [borrowerDocuments.borrowerId],
    references: [borrowers.id],
  }),
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

export const lenderWalletsRelations = relations(lenderWallets, ({ one, many }) => ({
  user: one(users, {
    fields: [lenderWallets.lenderId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const lenderFundingsRelations = relations(lenderFundings, ({ one }) => ({
  user: one(users, {
    fields: [lenderFundings.lenderId],
    references: [users.id],
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(lenderWallets, {
    fields: [walletTransactions.walletId],
    references: [lenderWallets.id],
  }),
}));




export const subRepaymentsRelations = relations(subRepayments, ({ one }) => ({
  repayment: one(repayments, {
    fields: [subRepayments.repaymentId],
    references: [repayments.id],
  }),
}));

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  borrower: one(borrowers, {
    fields: [notificationLogs.borrowerId],
    references: [borrowers.id],
  }),
  repayment: one(repayments, {
    fields: [notificationLogs.repaymentId],
    references: [repayments.id],
  }),
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id")
    .references(() => loanApplications.id)
    .notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  actorId: uuid("actor_id")
    .references(() => users.id)
    .notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  application: one(loanApplications, {
    fields: [auditLogs.applicationId],
    references: [loanApplications.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const settlementsRelations = relations(settlements, ({ one }) => ({
  lender: one(users, {
    fields: [settlements.lenderId],
    references: [users.id],
  }),
  borrower: one(borrowers, {
    fields: [settlements.borrowerId],
    references: [borrowers.id],
  }),
  application: one(loanApplications, {
    fields: [settlements.applicationId],
    references: [loanApplications.id],
  }),
}));
