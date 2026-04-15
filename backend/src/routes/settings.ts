
import { Hono } from "hono";
import { db } from "../db";
import { users, payoutAccounts } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { updateUserSchema } from "../zod-schemas/user";
import { comparePassword } from "../lib";
import { usersRepo } from "../domain/auth";

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
      role: true,
      avatarUrl: true,
      brandColor: true,
      brandLogoUrl: true,
      isTwoFactorEnabled: true,
      language: true,
      timezone: true,
      emailNotifyNewApplication: true,
      emailNotifyPaymentFailed: true,
      emailNotifyPaymentReceived: true,
      emailNotifyLoanOverdue: true,
      smsNotifyCriticalOnly: true,
      disabledAt: true,
      deletedAt: true,
      deletionRequestedAt: true,
      plan: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      trialEndsAt: true,
    }
  });

  return c.json(settings);
});

router.patch("/", async (c) => {
  console.log("➡️  PATCH /api/settings");

  try {
    // 1️⃣ Auth
    const user = c.get("user");
    console.log("👤 user from context:", user);

    if (!user?.id) {
      console.error("❌ No user in context");
      return c.json({ error: "Unauthorized" }, 401);
    }

    // 2️⃣ Raw body
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
      console.log("📦 Raw body received:", rawBody);
    } catch (e) {
      console.error("❌ Failed to parse JSON body", e);
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    // 3️⃣ Zod validation
    let body;
    try {
      body = updateUserSchema.parse(rawBody);
      console.log("✅ Parsed body after Zod:", body);
    } catch (e) {
      console.error("❌ Zod validation error:", e);
      return c.json(
        { error: "Invalid request payload", details: e },
        400
      );
    }

    // 4️⃣ Empty update guard
    if (Object.keys(body).length === 0) {
      console.warn("⚠️ Empty update payload");
      return c.json({ error: "No fields to update" }, 400);
    }

    // 5️⃣ DB update
    console.log("📝 Updating user:", user.id);
    console.log("📝 Update payload:", body);

    const updated = await db
      .update(users)
      .set(body)
      .where(eq(users.id, user.id))
      .returning();

    console.log("📤 DB update result:", updated);

    if (!updated.length) {
      console.warn("⚠️ No rows updated for user:", user.id);
      return c.json({ error: "User not found" }, 404);
    }

    // 6️⃣ Success
    console.log("✅ User updated successfully:", updated[0].id);
    return c.json(updated[0]);

  } catch (err) {
    // 7️⃣ Catch-all (THIS is what your proxy sees)
    console.error("🔥 PATCH /api/settings crashed:", err);

    return c.json(
      { error: "Internal Server Error" },
      500
    );
  }
});


//enable user 

//enable user 
router.post("/enable", async (c) => {
  const userCtx = c.get("user");
  if (!userCtx?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { password } = await c.req.json();

  const user = await usersRepo.findById(userCtx.id);
  if (!user) {
    return c.json({
      success: false,
      error: { code: 401, message: "Invalid credentials" }
    }, 401);
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: "Invalid password" }, 401);
  }

  const updated = await db.update(users)
    .set({ disabledAt: null })
    .where(eq(users.id, user.id))
    .returning();

  return c.json(updated[0]);
})


export default router;
