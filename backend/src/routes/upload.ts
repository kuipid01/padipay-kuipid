
import { Hono } from "hono";
import { uploadToCloudinary } from "../utils/upload";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

router.use("*", authMiddleware);

router.post("/", async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file || !(file instanceof File)) {
            return c.json({ error: "No file uploaded or invalid file" }, 400);
        }
       const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadToCloudinary(buffer, "padi-loan/user-uploads");
        return c.json({ url });
    } catch (err: any) {
        console.error("Upload error:", err);
        return c.json({ error: err.message || "Upload failed" }, 500);
    }
});
router.post("/sign", async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file || !(file instanceof File)) {
            return c.json({ error: "No file uploaded or invalid file" }, 400);
        }
  const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadToCloudinary(buffer, "padi-loan/user-uploads");
        return c.json({ url });
    } catch (err: any) {
        console.error("Upload error:", err);
        return c.json({ error: err.message || "Upload failed" }, 500);
    }
});

export default router;
