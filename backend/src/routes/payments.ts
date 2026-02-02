
import { Hono } from "hono";

import { authMiddleware } from "../middleware/auth";

const router = new Hono();

router.use("*", authMiddleware);

// Initialize a payment
router.post("/initialize", async (c) => {
    const { email, amount, metadata } = await c.req.json();
    
    // Mock Paystack initialization - using variables to avoid linter errors
    console.log(`Initializing payment for ${email} with amount ${amount}`);
    if (metadata) console.log("Metadata:", metadata);

    // In production, call Paystack API here
    const mockResponse = {
        authorization_url: "https://checkout.paystack.com/mock-ref-123",
        access_code: "mock_access_code",
        reference: `ref_${Date.now()}`
    };

    return c.json({
        status: true,
        message: "Authorization URL created",
        data: mockResponse
    });
});

// Verify a payment reference
router.get("/verify/:reference", async (c) => {
    const reference = c.req.param("reference");
    
    // Mock Verification Logic
    const mockVerification = {
        status: "success",
        reference,
        amount: 500000, // 5000.00
        gateway_response: "Successful",
        paid_at: new Date().toISOString(),
        channel: "card",
        currency: "NGN",
        authorization: {
           authorization_code: "AUTH_8dfhjjdt",
           card_type: "visa", 
           last4: "1381",
           exp_month: "12",
           exp_year: "2024",
           bin: "408408",
           bank: "TEST BANK",
           channel: "card",
           signature: "SIG_zeXOxx",
           reusable: true,
           country_code: "NG",
           account_name: "BoJack Horseman"
        }
    };

    return c.json({
        status: true,
        message: "Verification successful",
        data: mockVerification
    });
});

export default router;
