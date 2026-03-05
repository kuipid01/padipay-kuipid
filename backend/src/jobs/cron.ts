import cron from "node-cron";
import { notificationQueue } from "../lib/redis";
import { db } from "../db";
import { sql } from "drizzle-orm";

const APP_URL = process.env.FRONTEND_URL || "https://padiloan.com";

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

// Helper to format date
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export const startCronJobs = () => {
    // Run hourly
    cron.schedule("0 * * * *", async () => {
        console.log("Running hourly notification cron job...");
        try {
            await schedulePreDueReminders(3, "PRE_DUE_3_DAYS");
            await schedulePreDueReminders(1, "PRE_DUE_1_DAY");
            await scheduleDueTodayReminders();
            // Overdue Reminders
            await scheduleOverdueReminders(1, "OVERDUE_1_DAY");
            await scheduleOverdueReminders(3, "OVERDUE_3_DAYS");
            await scheduleOverdueReminders(7, "OVERDUE_7_DAYS");
        } catch (e) {
            console.error("Cron job error:", e);
        }
    });
};

export async function schedulePreDueReminders(daysAhead: number, category: string) {
    const targetDateStr = `CURRENT_DATE + INTERVAL '${daysAhead} days'`;

    // Query for due dates exactly "daysAhead" away, ignoring users who already got notified
    const dueRepayments = await db.execute(sql`
        SELECT r.id as "repaymentId", r.amount as "amountDue", r.due_date as "dueDate",
               b.id as "borrowerId", b.first_name as "firstName", b.phone as "phone", b.email as "email"
        FROM repayments r
        JOIN loans l ON l.id = r.loan_id
        JOIN borrowers b ON b.id = l.borrower_id
        WHERE r.due_date::date = (${sql.raw(targetDateStr)})::date
          AND r.status = 'PENDING'
          AND NOT EXISTS (
              SELECT 1 FROM notification_logs n
              WHERE n.repayment_id = r.id AND n.category = ${category}
          )
        LIMIT 1000
    `);

    if (dueRepayments.length === 0) return;

    const jobs = dueRepayments.map((r: any) => ({
        name: "send_notification",
        data: {
            borrowerId: r.borrowerId,
            repaymentId: r.repaymentId,
            category: category as any,
            channels: ["SMS", "EMAIL"] as ("SMS" | "EMAIL")[],
            payload: {
                firstName: r.firstName || "Customer",
                amountDueFormatted: formatCurrency(Number(r.amountDue)),
                dueDateFormatted: formatDate(new Date(r.dueDate)),
                email: r.email,
                phone: r.phone,
                paymentLink: `${APP_URL}/dashboard/loans/${r.repaymentId}/pay` // Example link
            }
        },
        opts: {
            jobId: `${category}_${r.repaymentId}`,
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 }
        }
    }));

    await notificationQueue.addBulk(jobs);
    console.log(`Enqueued ${jobs.length} jobs for ${category}`);
}

export async function scheduleDueTodayReminders() {
    const category = "DUE_TODAY";
    const dueRepayments = await db.execute(sql`
        SELECT r.id as "repaymentId", r.amount as "amountDue", r.due_date as "dueDate",
               b.id as "borrowerId", b.first_name as "firstName", b.phone as "phone", b.email as "email"
        FROM repayments r
        JOIN loans l ON l.id = r.loan_id
        JOIN borrowers b ON b.id = l.borrower_id
        WHERE r.due_date::date = CURRENT_DATE
          AND r.status = 'PENDING'
          AND NOT EXISTS (
              SELECT 1 FROM notification_logs n
              WHERE n.repayment_id = r.id AND n.category = ${category}
          )
        LIMIT 1000
    `);

    if (dueRepayments.length === 0) return;

    const jobs = dueRepayments.map((r: any) => ({
        name: "send_notification",
        data: {
            borrowerId: r.borrowerId,
            repaymentId: r.repaymentId,
            category: category as any,
            channels: ["SMS", "EMAIL"] as ("SMS" | "EMAIL")[],
            payload: {
                firstName: r.firstName || "Customer",
                amountDueFormatted: formatCurrency(Number(r.amountDue)),
                dueDateFormatted: formatDate(new Date(r.dueDate)),
                email: r.email,
                phone: r.phone,
                paymentLink: `${APP_URL}/dashboard/loans/${r.repaymentId}/pay` 
            }
        },
        opts: {
            jobId: `${category}_${r.repaymentId}`,
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 }
        }
    }));

    await notificationQueue.addBulk(jobs);
    console.log(`Enqueued ${jobs.length} jobs for ${category}`);
}

export async function scheduleOverdueReminders(daysBehind: number, category: string) {
    const targetDateStr = `CURRENT_DATE - INTERVAL '${daysBehind} days'`;

    // Query for due dates exactly "daysBehind" away (in the past), ignoring users who already got notified
    const dueRepayments = await db.execute(sql`
        SELECT r.id as "repaymentId", r.amount as "amountDue", r.due_date as "dueDate",
               b.id as "borrowerId", b.first_name as "firstName", b.phone as "phone", b.email as "email"
        FROM repayments r
        JOIN loans l ON l.id = r.loan_id
        JOIN borrowers b ON b.id = l.borrower_id
        WHERE r.due_date::date = (${sql.raw(targetDateStr)})::date
          AND r.status = 'PENDING'
          AND NOT EXISTS (
              SELECT 1 FROM notification_logs n
              WHERE n.repayment_id = r.id AND n.category = ${category}
          )
        LIMIT 1000
    `);

    if (dueRepayments.length === 0) return;

    const jobs = dueRepayments.map((r: any) => ({
        name: "send_notification",
        data: {
            borrowerId: r.borrowerId,
            repaymentId: r.repaymentId,
            category: category as any,
            channels: ["SMS", "EMAIL"] as ("SMS" | "EMAIL")[],
            payload: {
                firstName: r.firstName || "Customer",
                amountDueFormatted: formatCurrency(Number(r.amountDue)),
                dueDateFormatted: formatDate(new Date(r.dueDate)),
                email: r.email,
                phone: r.phone,
                paymentLink: `${APP_URL}/dashboard/loans/${r.repaymentId}/pay` 
            }
        },
        opts: {
            jobId: `${category}_${r.repaymentId}`,
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 }
        }
    }));

    await notificationQueue.addBulk(jobs);
    console.log(`Enqueued ${jobs.length} jobs for ${category}`);
}
