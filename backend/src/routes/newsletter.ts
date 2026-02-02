
import { Hono } from "hono";
import { db } from "../db";
import { newsletters } from "../db/schema";

const router = new Hono();

router.post("/", async (c) => {
    const { email } = await c.req.json();

    if (!email) {
        return c.json({ error: "Email is required" }, 400);
    }

    try {
        await db.insert(newsletters).values({ email });
        return c.json({ message: "Subscribed successfully" }, 201);
    } catch (e) {
        // Likely unique constraint violation
        return c.json({ message: "Already subscribed or invalid email" }, 400);
    }
});

export default router;
