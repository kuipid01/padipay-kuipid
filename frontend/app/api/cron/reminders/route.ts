import { NextResponse } from "next/server";
import { db } from "@/db";
import { repayments, loans, borrowers } from "@/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { sendNotification } from "@/lib/notifications";
import { format, addDays } from "date-fns";

export async function GET(req: Request) {
  // Security check for cron (e.g., Vercel Cron Secret)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);

    // 1. Fetch repayments due in exactly 3 days
    // Logic: dueDate matches 3 days from now
    const upcomingRepayments = await db.query.repayments.findMany({
      where: and(
        eq(repayments.status, "PENDING"),
        gte(repayments.dueDate, threeDaysFromNow),
        lte(repayments.dueDate, addDays(threeDaysFromNow, 1))
      ),
      with: {
        loan: {
          with: {
            borrower: true,
          }
        }
      }
    });

    for (const rep of upcomingRepayments) {
      const borrower = rep.loan.borrower;
      const amount = parseFloat(rep.amount.toString()).toLocaleString();
      const dueDate = format(new Date(rep.dueDate), "MMM d, yyyy");

      await sendNotification({
        borrowerId: borrower.id,
        type: "EMAIL",
        message: `Hi ${borrower.fullName}, your loan repayment of ₦${amount} is due in 3 days (${dueDate}). Please ensure your card is funded.`,
      });
    }

    return NextResponse.json({ processed: upcomingRepayments.length });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Cron Failed" }, { status: 500 });
  }
}
