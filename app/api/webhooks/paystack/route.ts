import { NextResponse } from "next/server";
import nodeCrypto from "node:crypto";
import { db } from "@/db";
import { repayments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = nodeCrypto.createHmac("sha512", secret).update(body).digest("hex");

  if (hash !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { metadata } = event.data;
    
    // Handle repayment success
    if (metadata.type === "REPAYMENT") {
      const repaymentId = metadata.repaymentId;
      await db.update(repayments).set({
        status: "PAID",
        paidAt: new Date(),
      }).where(eq(repayments.id, repaymentId));
    }
  }

  return NextResponse.json({ received: true });
}
