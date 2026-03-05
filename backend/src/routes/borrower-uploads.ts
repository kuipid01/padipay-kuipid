
import { Hono } from "hono";
import { generateUploadSignature } from "../utils/upload";
import { borrowerAuthMiddleware } from "../middleware/auth";

const router = new Hono();

// Apply borrower auth middleware
 router.use("*", borrowerAuthMiddleware);

router.get("/sign", async (c) => {
    try {
        const user = c.get("user");
        console.log(user,"user")
        const signData = await generateUploadSignature(user.id);
        return c.json(signData);
    } catch (err: any) {
        console.error("Sign upload error:", err);
        return c.json({ error: err.message || "Failed to generate signature" }, 500);
    }
});

export default router;
