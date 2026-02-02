import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function sendNotification({
  userId,
  borrowerId,
  type,
  message,
}: {
  userId?: string | null;
  borrowerId?: string | null;
  type: "EMAIL" | "SMS";
  message: string;
}) {
  try {
    // 1. Log to DB
    await db.insert(notifications).values({
      userId,
      borrowerId,
      type,
      message,
    });

    // 2. Integration logic (Mocked for now)
    if (type === "EMAIL") {
      console.log(`[EMAIL SENDING] to ${borrowerId || userId}: ${message}`);
      // Add SendGrid/Resend logic here
    } else if (type === "SMS") {
      console.log(`[SMS SENDING] to ${borrowerId || userId}: ${message}`);
      // Add Twilio/Termii logic here
    }

    return true;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return false;
  }
}
