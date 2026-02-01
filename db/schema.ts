import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["LENDER", "ADMIN"]);
export const loanAppStatusEnum = pgEnum("loan_app_status", ["PENDING", "APPROVED", "REJECTED"]);
export const loanStatusEnum = pgEnum("loan_status", ["ACTIVE", "COMPLETED", "DEFAULTED"]);
export const repaymentStatusEnum = pgEnum("repayment_status", ["PENDING", "PAID", "FAILED"]);
export const notificationTypeEnum = pgEnum("notification_type", ["EMAIL", "SMS"]);

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
});

export const loanApps = pgTable("loan_apps", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  defaultInterestRate: decimal("default_interest_rate").notNull(),
  defaultDurationMonths: integer("default_duration_months").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const borrowers = pgTable("borrowers", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  bvn: varchar("bvn", { length: 20 }),
  nin: varchar("nin", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loanApplications = pgTable("loan_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanAppId: uuid("loan_app_id").references(() => loanApps.id).notNull(),
  borrowerId: uuid("borrower_id").references(() => borrowers.id).notNull(),
  amount: decimal("amount").notNull(),
  durationMonths: integer("duration_months").notNull(),
  interestRate: decimal("interest_rate").notNull(),
  status: loanAppStatusEnum("status").default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id").references(() => loanApplications.id).notNull(),
  lenderId: uuid("lender_id").references(() => users.id).notNull(),
  borrowerId: uuid("borrower_id").references(() => borrowers.id).notNull(),
  principal: decimal("principal").notNull(),
  interest: decimal("interest").notNull(),
  totalPayable: decimal("total_payable").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  status: loanStatusEnum("status").default("ACTIVE"),
});

export const repayments = pgTable("repayments", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanId: uuid("loan_id").references(() => loans.id).notNull(),
  amount: decimal("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  status: repaymentStatusEnum("status").default("PENDING"),
});

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  borrowerId: uuid("borrower_id").references(() => borrowers.id).notNull(),
  provider: varchar("provider", { length: 50 }).default("PAYSTACK"),
  authorizationCode: text("authorization_code").notNull(),
  last4: varchar("last4", { length: 4 }),
  expiry: varchar("expiry", { length: 10 }),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  borrowerId: uuid("borrower_id").references(() => borrowers.id),
  type: notificationTypeEnum("type").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  loanApps: many(loanApps),
}));

export const loanAppsRelations = relations(loanApps, ({ one, many }) => ({
  owner: one(users, {
    fields: [loanApps.ownerId],
    references: [users.id],
  }),
  applications: many(loanApplications),
}));

export const loanApplicationsRelations = relations(loanApplications, ({ one }) => ({
  loanApp: one(loanApps, {
    fields: [loanApplications.loanAppId],
    references: [loanApps.id],
  }),
  borrower: one(borrowers, {
    fields: [loanApplications.borrowerId],
    references: [borrowers.id],
  }),
}));
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
}));

export const newsletters = pgTable("newsletters", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
