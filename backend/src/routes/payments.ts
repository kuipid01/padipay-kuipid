
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { paystackService } from "../utils/paystack";

const router = new Hono();



// Initialize a payment
router.post("/initialize", async (c) => {

    try {
      
        //for testing
        const { email, amount, metadata } = await c.req.json();
        console.log(email,amount,metadata)
        const callback_url_body = metadata?.callbackUrl;
        if (!email || !amount) {
            return c.json({
                status: false,
                message: "Email and amount are required"
            }, 400);
        }

        // Use callback_url from body, or from env, or fallback to undefined (Paystack will use dashboard setting)
        const callback_url = callback_url_body || process.env.PAYSTACK_CALLBACK_URL;

        const response = await paystackService.initializeTransaction({
            email,
            amount: Math.round(amount * 100), // Convert to kobo
            metadata: metadata || {},
            callback_url,
            reference: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        });

        return c.json(response);
    } catch (error: any) {
        console.error("Paystack initialization error:", error);
        return c.json({
            status: false,
            message: error.message || "Failed to initialize payment"
        }, 500);
    }
});
router.use("*", authMiddleware);



// Verify a payment reference
router.get("/verify/:reference", async (c) => {
    try {
        const reference = c.req.param("reference");
        
        if (!reference) {
            return c.json({
                status: false,
                message: "Reference is required"
            }, 400);
        }

        const response = await paystackService.verifyTransaction(reference);

        return c.json(response);
    } catch (error: any) {
        console.error("Paystack verification error:", error);
        return c.json({
            status: false,
            message: error.message || "Failed to verify payment"
        }, 500);
    }
});

export default router;
