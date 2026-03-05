import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis";
import { db } from "../db";
import { notificationLogs, repayments } from "../db/schema";
import { brevo } from "../lib/brevo";
import { termii } from "../lib/termii";
import { Templates } from "./templates";
import { eq } from "drizzle-orm";

interface NotificationPayload {
  borrowerId: string;
  repaymentId: string;
  category: keyof typeof Templates;
  channels: ("SMS" | "EMAIL")[];
  payload: {
    firstName: string;
    amountDueFormatted: string;
    dueDateFormatted: string;
    email: string;
    phone: string;
    paymentLink: string;
  };
}

export const notificationWorker = new Worker(
  "notifications",
  async (job: Job<NotificationPayload>) => {
    const { borrowerId, repaymentId, category, channels, payload } = job.data;
    
    // Safety verification: Ensure loan isn't already paid if it's a reminder
    const repaymentRecord = await db.query.repayments.findFirst({
        where: eq(repayments.id, repaymentId)
    });

    if (repaymentRecord && repaymentRecord.status === 'PAID' && !category.includes('CONFIRMATION')) {
        console.log(`Loan ${repaymentId} already paid. Skipping reminder.`);
        return { skipped: true, reason: 'ALREADY_PAID' };
    }

    const results = [];

    // Process each channel
    for (const channel of channels) {
        const idempotencyKey = `${repaymentId}_${category}_${channel}`;
        
        try {
            // Attempt DB Insert to prevent duplicate execution
            const logEntryResult = await db.insert(notificationLogs).values({
                borrowerId,
                repaymentId,
                category,
                channel,
                status: 'PENDING',
                idempotencyKey
            }).onConflictDoNothing().returning({ id: notificationLogs.id });

            if (logEntryResult.length === 0) {
                console.log(`Duplicate detected for ${idempotencyKey}, skipping.`);
                continue; 
            }

            const logEntryId = logEntryResult[0].id;
            const template = Templates[category];
            let providerMessageId = "";
            let apiError = false;

            if (channel === 'SMS') {
                const messageBody = template.SMS(payload.firstName, payload.amountDueFormatted, payload.dueDateFormatted, payload.paymentLink);
                const smsRes = await termii.sendSMS({
                    to: payload.phone, 
                    message: messageBody, 
                });
                if (!smsRes.success) {
                    apiError = true;
                    throw new Error(smsRes.error || "SMS failed");
                }
                providerMessageId = smsRes.messageId || "";
            } else if (channel === 'EMAIL') {
                const subject = template.EMAIL_SUBJECT(payload.amountDueFormatted, payload.dueDateFormatted);
                const htmlContent = template.EMAIL_HTML(payload.firstName, payload.amountDueFormatted, payload.dueDateFormatted, payload.paymentLink);
                
                const emailRes = await brevo.sendEmail({
                    to: [{ email: payload.email, name: payload.firstName }],
                    subject,
                    htmlContent
                });
                if (!emailRes.success) {
                     apiError = true;
                     throw new Error(emailRes.error || "Email failed");
                }
                providerMessageId = emailRes.messageId || "";
            }

            // Mark Success
            await db.update(notificationLogs)
              .set({ status: 'SENT', providerMessageId })
              .where(eq(notificationLogs.id, logEntryId));
            
            results.push({ channel, status: 'SENT' });

        } catch (error: any) {
            // Check if error is due to bad request to fail permanently, otherwise throw for retry
            // Determine if error is 4xx (permanent) or 5xx (transient) based on provider error responses
            
            // By default, assume failure, and THROW for BullMQ retry (Exponential backoff)
             await db.update(notificationLogs)
              .set({ status: 'FAILED', errorMessage: error.message || String(error) })
              .where(eq(notificationLogs.idempotencyKey, idempotencyKey!)); // update the pending row added
            
             throw error; 
        }
    }
    
    return results;
  },
  {
    connection: redisConnection as any,
    concurrency: 50,
  }
);

notificationWorker.on('failed', (job, err) => {
    if (job && job.attemptsMade === job.opts.attempts) {
        console.error(`Permanent Failure for job ${job.id}: ${err.message}`);
    }
});

notificationWorker.on('error', (err) => {
  console.error(err);
});
