
import { Hono } from "hono";
import { db } from "../db";
import { repayments } from "../db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

// Webhooks don't use auth middleware (protected by signature usually)

router.post("/paystack", async (c) => {
     // 1. Verify signature from Paystack (X-Paystack-Signature header)
     // const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');
    
    const body = await c.req.json();
    const event = body.event;

    if (event === "charge.success") {
        const { reference, metadata } = body.data;
        // Logic to find repayment by reference and mark as paid
        // console.log("Payment successful for", reference);
    }

    return c.json({ status: "acknowledged" }, 200);
});

export default router;
