import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis";
import { db } from "../db";
import { brevo } from "../lib/brevo";
import { Templates } from "./templates";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

interface ApplicationEventPayload {
  applicationId: string;
  category: keyof typeof Templates;
  channels: ("EMAIL")[]; // Default to email for these for now, can add SMS
  payload: {
    userName: string;
    amountFormatted: string;
    email: string;
    link: string;
  };
}

export const applicationEventsWorker = new Worker(
  "application_events",
  async (job: Job<ApplicationEventPayload>) => {
    const { applicationId, category, channels, payload } = job.data;

    const results = [];

    for (const channel of channels) {
      try {
        const template = Templates[category];

        if (channel === 'EMAIL') {
          const subject = template.EMAIL_SUBJECT(payload.amountFormatted, "");
          const htmlContent = template.EMAIL_HTML(payload.userName, payload.amountFormatted, "", payload.link);
          console.log("TRYINGH TO SEND MAIL", payload.email)
          const emailRes = await brevo.sendEmail({
            to: [{ email: payload.email, name: payload.userName }],
            subject,
            htmlContent
          });
          console.log(emailRes, "EMAIL RES")
          if (!emailRes.success) {
            throw new Error(emailRes.error || "Email failed");
          }
        }

        results.push({ channel, status: 'SENT' });

      } catch (error: any) {
        console.error(`Error sending application event ${category} on ${channel}:`, error);
        throw error;
      }
    }

    return results;
  },
  {
    connection: redisConnection as any,
    concurrency: 10,
  }
);

applicationEventsWorker.on('failed', (job, err) => {
  if (job && job.attemptsMade === job.opts.attempts) {
    console.error(`Permanent Failure for job ${job.id}: ${err.message}`);
  }
});

applicationEventsWorker.on('error', (err) => {
  console.error(err);
});
