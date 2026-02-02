
import { Hono } from "hono";
import { db } from "../db";
import { users, payoutAccounts } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

router.use("*", authMiddleware);

router.get("/", async (c) => {
    const user = c.get("user");
    
    const settings = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            paystackPublicKey: true,
            role: true
        }
    });

    return c.json(settings);
});

router.patch("/", async (c) => {
    const user = c.get("user");
    const { fullName, phone, paystackPublicKey, paystackSecretKey } = await c.req.json();

    const updated = await db.update(users)
        .set({ 
            fullName, 
            phone, 
            paystackPublicKey, 
            paystackSecretKey // Warning: be careful returning/accepting secrets
        })
        .where(eq(users.id, user.id))
        .returning({
             id: users.id,
             fullName: users.fullName,
             email: users.email,
             phone: users.phone,
             paymentPublicKey: users.paystackPublicKey
        });

    return c.json(updated[0]);
});

export default router;
