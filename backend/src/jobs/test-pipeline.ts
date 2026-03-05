import { db } from "../db/index";
import { users, borrowers, loanApps, repaymentPlans, loanApplications, loans, repayments } from "../db/schema";
import { schedulePreDueReminders, scheduleDueTodayReminders } from "./cron";
import { redisConnection } from "../lib/redis";
import { notificationWorker } from "./worker";
import { eq } from "drizzle-orm";

async function runTest() {
  console.log("Setting up data for test pipeline...");

  const nonce = Date.now();

  // Find the required user
  let userRecord = await db.query.users.findFirst({
    where: eq(users.email, "kuipid01@gmail.com")
  });

  if (!userRecord) {
    console.log("User kuipid01@gmail.com not found, creating a mock...");
    const [newUser] = await db.insert(users).values({
      email: "kuipid01@gmail.com",
      passwordHash: "dummy",
      role: "LENDER",
    }).returning();
    userRecord = newUser;
  }

  // Use the test borrower
  let borrowerRecord = await db.query.borrowers.findFirst({
    where: eq(borrowers.email, "kuipid02@gmail.com")
  });

  if (!borrowerRecord) {
    const [newBorrower] = await db.insert(borrowers).values({
      phone: "2348112835593", // limit SMS to Termii test numbers
      email: `kuipid02@gmail.com`,
      firstName: "Test",
      lastName: "Borrower",
    }).returning();
    borrowerRecord = newBorrower;
  }

  // Create Loan App & Plan
  const [loanApp] = await db.insert(loanApps).values({
    name: "Pipeline Test App",
    slug: `pipeline-test-app-${nonce}`,
    ownerId: userRecord.id,
  }).returning();

  const [plan] = await db.insert(repaymentPlans).values({
    loanAppId: loanApp.id,
    name: "Standard",
    durationDays: 30,
    interestRate: 5,
  }).returning();

  // Helper to create a loan and repayment with a specific due date offset
  async function createLoanWithDueOffset(daysOffset: number, amount: string) {
    const [loanApplication] = await db.insert(loanApplications).values({
      loanAppId: loanApp.id,
      repaymentPlanId: plan.id,
      borrowerId: borrowerRecord!.id,
      amount: "10000",
      durationMonths: 1,
      status: "APPROVED"
    }).returning();

    const [loan] = await db.insert(loans).values({
      applicationId: loanApplication.id,
      lenderId: userRecord!.id,
      borrowerId: borrowerRecord!.id,
      principal: "10000",
      interest: "500",
      totalPayable: amount,
    }).returning();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOffset);

    const [repayment] = await db.insert(repayments).values({
      loanId: loan.id,
      amount: amount,
      dueDate: dueDate,
      status: "PENDING"
    }).returning();

    return repayment;
  }

  console.log("Generating loans and repayments...");

  // To limit SMS to 2 as requested, we will only create 2 events: due in 3 days, and due in 1 day
  const rep3Days = await createLoanWithDueOffset(3, "15000");   // PRE_DUE_3_DAYS
  const rep1Day = await createLoanWithDueOffset(1, "25000");    // PRE_DUE_1_DAY
  // const repToday = await createLoanWithDueOffset(0, "40000"); // DUE_TODAY (Skipped to restrict SMS to 2) 

  console.log(`Created repayment due in 3 days: ${rep3Days.id}`);
  console.log(`Created repayment due in 1 day: ${rep1Day.id}`);

  console.log("Triggering Cron schedules...");
  await schedulePreDueReminders(3, "PRE_DUE_3_DAYS");
  await schedulePreDueReminders(1, "PRE_DUE_1_DAY");
  // await scheduleDueTodayReminders();

  console.log("Waiting 10 seconds for worker to process all queue jobs (Emails & SMS)...");
  await new Promise((res) => setTimeout(res, 10000));
  await notificationWorker.close();

  console.log("Checking DB logs for processing results...");
  const logs = await db.query.notificationLogs.findMany({
    where: (logs, { inArray }) => inArray(logs.repaymentId, [rep3Days.id, rep1Day.id])
  });

  console.log(`Found ${logs.length} notification logs.`);
  logs.forEach(l => {
     console.log(`[${l.category}] Channel: ${l.channel}, Status: ${l.status}, Error: ${l.errorMessage}, Idempotency: ${l.idempotencyKey}`);
  });

  await redisConnection.quit();
  process.exit(0);
}

runTest().catch((e) => {
    console.error(e);
    process.exit(1);
});
