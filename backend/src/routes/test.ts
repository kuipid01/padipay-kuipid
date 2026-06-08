import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  borrowers,
  lenderWallets,
  loanApps,
  repaymentPlans,
  subscriptionPayments,
  users,
} from "../db/schema";
import { hashPassword, signToken } from "../lib/auth";
import { requireTestSuite } from "../lib/suite";
import {
  TEST_OTP,
  mockBanks,
  mockBvnEntity,
  mockCloudinaryUpload,
  mockCreditReport,
  mockCreditScore,
  mockNinEntity,
  mockNuban,
  mockPaystackCharge,
  mockPaystackInitialize,
  mockPaystackVerify,
} from "../test-suite/external-mocks";

const test = new Hono();

test.use("*", requireTestSuite);

test.get("/status", (c) => {
  return c.json({
    suite: process.env.SUITE,
    enabled: true,
    otp: TEST_OTP,
    mockedProviders: ["dojah", "paystack", "termii", "brevo", "cloudinary", "banks"],
    routes: [
      "GET /api/test/status",
      "POST /api/test/seed/demo",
      "POST /api/test/dojah/bvn",
      "POST /api/test/dojah/nin",
      "POST /api/test/paystack/initialize",
      "GET /api/test/paystack/verify/:reference",
      "POST /api/test/paystack/charge",
      "POST /api/test/otp/send",
      "POST /api/test/otp/verify",
      "POST /api/test/brevo/email",
      "POST /api/test/cloudinary/upload",
      "GET /api/test/banks",
      "GET /api/test/banks/resolve",
    ],
  });
});

test.post("/seed/demo", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const suffix = body.suffix || Date.now().toString(36);
  const lenderEmail = body.lenderEmail || `suite-lender-${suffix}@example.com`;
  const borrowerEmail = body.borrowerEmail || `suite-borrower-${suffix}@example.com`;
  const borrowerPhone = body.borrowerPhone || `080${String(Date.now()).slice(-8)}`;

  const passwordHash = await hashPassword(body.password || "Password123!");

  const [lender] = await db
    .insert(users)
    .values({
      email: lenderEmail,
      passwordHash,
      fullName: "Suite Test Lender",
      phone: "08000000001",
      role: "LENDER",
      emailVerified: true,
      subscriptionStatus: "active",
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      plan: "Pro",
    })
    .onConflictDoNothing()
    .returning();

  const existingLender = lender || await db.query.users.findFirst({ where: eq(users.email, lenderEmail) });
  if (!existingLender) return c.json({ error: "Unable to create demo lender" }, 500);

  const slug = body.slug || `suite-demo-${suffix}`;
  const [loanApp] = await db
    .insert(loanApps)
    .values({
      name: "Suite Demo Loan",
      slug,
      ownerId: existingLender.id,
      minLoanAmount: 10000,
      maxLoanAmount: 500000,
      autoApprovalLimit: 75000,
      allowCustomAmounts: true,
      requireCreditCheck: true,
      collectionStrategy: "standard",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const existingLoanApp = loanApp || await db.query.loanApps.findFirst({ where: eq(loanApps.slug, slug) });
  if (!existingLoanApp) return c.json({ error: "Unable to create demo loan app" }, 500);

  const [plan] = await db
    .insert(repaymentPlans)
    .values({
      loanAppId: existingLoanApp.id,
      name: "30 days",
      durationDays: 30,
      interestRate: 10,
      creditTier: "all",
      isDefault: true,
      isActive: true,
    })
    .returning();

  const bvn = body.bvn || "22222222222";
  const kyc = mockBvnEntity(bvn);
  const [borrower] = await db
    .insert(borrowers)
    .values({
      phone: borrowerPhone,
      email: borrowerEmail,
      emailVerified: true,
      bvn,
      firstName: kyc.first_name,
      lastName: kyc.last_name,
      middleName: kyc.middle_name,
      gender: kyc.gender,
      dob: kyc.date_of_birth,
      image: kyc.image,
      kycVerified: true,
      state: kyc.state_of_origin,
      creditReport: mockCreditReport(bvn),
      creditScore: mockCreditScore(bvn),
      passcodeHash: await hashPassword("123456"),
    })
    .returning();

  await db
    .insert(lenderWallets)
    .values({ lenderId: existingLender.id, balance: body.walletBalance || 50000000, lockedBalance: 0 })
    .onConflictDoNothing();

  const token = await signToken({ id: existingLender.id, email: existingLender.email, role: existingLender.role });
  const borrowerToken = await signToken({ id: borrower.id, email: borrower.email, role: "BORROWER" });

  return c.json({
    success: true,
    credentials: {
      lenderEmail,
      borrowerEmail,
      password: body.password || "Password123!",
      borrowerPasscode: "123456",
    },
    tokens: { lender: token, borrower: borrowerToken },
    loanApp: existingLoanApp,
    repaymentPlan: plan,
    borrower,
  });
});

test.post("/dojah/bvn", async (c) => {
  const { bvn = "22222222222" } = await c.req.json().catch(() => ({}));
  return c.json({ entity: mockBvnEntity(bvn), creditReport: mockCreditReport(bvn), creditScore: mockCreditScore(bvn) });
});

test.post("/dojah/nin", async (c) => {
  const { nin = "11111111111" } = await c.req.json().catch(() => ({}));
  return c.json({ entity: mockNinEntity(nin) });
});

test.post("/paystack/initialize", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(mockPaystackInitialize({ email: body.email || "suite@example.com", amount: body.amount || 100000, reference: body.reference, metadata: body.metadata }));
});

test.get("/paystack/verify/:reference", (c) => {
  return c.json(mockPaystackVerify(c.req.param("reference")));
});

test.post("/paystack/charge", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(mockPaystackCharge({ email: body.email || "suite@example.com", amount: body.amount || 100000, reference: body.reference, metadata: body.metadata }));
});

test.post("/otp/send", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, message: `Mock OTP sent to ${body.value || body.to || "recipient"}`, pinId: "mock-pin-id", devOtp: TEST_OTP });
});

test.post("/otp/verify", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: body.otp === TEST_OTP || body.pin === TEST_OTP, verified: body.otp === TEST_OTP || body.pin === TEST_OTP, attemptsRemaining: 3 });
});

test.post("/brevo/email", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, messageId: `mock-email-${Date.now()}`, accepted: body.to || [] });
});

test.post("/cloudinary/upload", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ success: true, ...mockCloudinaryUpload(body.folder || "suite-test") });
});

test.get("/banks", (c) => c.json({ status: true, message: "Mock banks", data: mockBanks }));

test.get("/banks/resolve", (c) => {
  const accountNumber = c.req.query("account_number") || "0123456789";
  const bankCode = c.req.query("bank_code") || "044";
  return c.json({ status: true, message: "Account number resolved", data: mockNuban(accountNumber, bankCode) });
});

test.post("/subscription/initialize", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const reference = body.reference || `SUB_MOCK_${Date.now()}`;
  return c.json({ success: true, data: { authorizationUrl: `https://mock.paystack.local/checkout/${reference}`, accessCode: `mock_access_${reference}`, reference } });
});

test.post("/subscription/record", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (!body.userId) return c.json({ error: "userId is required" }, 400);
  const reference = body.reference || `SUB_MOCK_${Date.now()}`;
  const [payment] = await db.insert(subscriptionPayments).values({
    userId: body.userId,
    plan: body.plan || "Pro",
    billingCycle: body.billingCycle || "monthly",
    amount: String(body.amount || 5000),
    reference,
    paystackAccessCode: `mock_access_${reference}`,
    paystackAuthorizationUrl: `https://mock.paystack.local/checkout/${reference}`,
    paymentStatus: body.paymentStatus || "success",
    paidAt: new Date(),
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    metadata: JSON.stringify({ suite: "test" }),
  }).returning();
  return c.json({ success: true, payment });
});

export default test;
