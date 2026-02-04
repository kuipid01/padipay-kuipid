import { db } from "../db";
import { loanPreferences } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { Hono } from "hono";
import { LoanPreferencesSchema } from "../zod-schemas/loan-prefence";

const router = new Hono();

router.use("*", authMiddleware);

/* =========================
   GET /loan-preferences
========================= */
router.get("/", async (c) => {
  const user = c.get("user");

  const preferences = await db.query.loanPreferences.findFirst({
    where: (lp, { eq }) => eq(lp.userId, user.id),
  });

  // If none exists, create defaults
  if (!preferences) {
    const [created] = await db
      .insert(loanPreferences)
      .values({ userId: user.id })
      .returning();

    return c.json(created);
  }

  return c.json(preferences);
});

/* =========================
   PATCH /loan-preferences
========================= */
router.patch("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const parsed = LoanPreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: "Invalid request payload",
        details: parsed.error.flatten(),
      },
      400
    );
  }

  const values = {
    ...parsed.data,
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(loanPreferences)
    .set(values)
    .where(eq(loanPreferences.userId, user.id))
    .returning();

  return c.json(updated);
});

export default router;
