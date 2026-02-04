import { Hono } from "hono";
import { db, userSessions } from "../db";
import { authMiddleware } from "../middleware";
import { eq } from "drizzle-orm";

const router = new Hono();

router.use("*", authMiddleware);

router.get("/sessions", async (c) => {
  const user = c.get("user");

  const settings = await db.query.userSessions.findMany({
    where: eq(userSessions.userId, user.id),
  });

  return c.json(settings);
});



export default router;