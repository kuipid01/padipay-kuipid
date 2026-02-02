
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

router.use("*", authMiddleware);

// Verify BVN
router.post("/bvn", async (c) => {
    const { bvn } = await c.req.json();
    
    // Mock BVN Verification
    // Call 3rd party like Dojah/SmileID here
    return c.json({
        status: "success",
        data: {
            firstName: "John",
            lastName: "Doe",
            dob: "1990-01-01",
            phone: "08012345678"
        }
    });
});

// Verify NIN
router.post("/nin", async (c) => {
    const { nin } = await c.req.json();
    
    return c.json({
        status: "success",
        data: {
            firstName: "John",
            lastName: "Doe",
            ninString: nin
        }
    });
});

// Verify Bank Account
router.post("/account", async (c) => {
    const { accountNumber, bankCode } = await c.req.json();

    return c.json({
        status: "success",
        data: {
            accountName: "JOHN DOE",
            accountNumber
        }
    });
});

export default router;
