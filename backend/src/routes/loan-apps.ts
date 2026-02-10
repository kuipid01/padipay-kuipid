import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { checkLoanAppLimit } from "../middleware/subscription";
import { loanAppsService } from "../domain/loan-apps";
import { CreateLoanAppSchema, UpdateLoanAppSchema } from "../zod-schemas/loan-apps";
import { zValidator } from "@hono/zod-validator";

const loanApps = new Hono();

/**
 * Loan Apps Routes
 * 
 * Original paths preserved:
 * - GET    /api/loan-apps         -> List all loan apps for user
 * - POST   /api/loan-apps         -> Create new loan app
 * - GET    /api/loan-apps/:appId           -> Get single loan app
 * - PATCH  /api/loan-apps/:appId           -> Update loan app
 * - DELETE /api/loan-apps/:appId           -> Delete loan app
 * - GET    /api/loan-apps/:appId/analytics -> Get loan app performance metrics
 * 
 * Routes are thin transport layers - all logic in service.
 */

// Public route to get loan app details by Slug (bypasses auth middleware)
loanApps.get("/public/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await loanAppsService.getPublicBySlug(slug);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as any);
  }
  
  return c.json(result.data);
});

// Apply auth middleware to all routes below this point
loanApps.use("/*", authMiddleware);

type errorcode = 400 | 404 | 500;
// GET /api/loan-apps - List all loan apps
loanApps.get("/", async (c) => {
  const user = c.get("user");
  const result = await loanAppsService.getAll(user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }
  
  return c.json({ loanApps: result.data });
});


// POST /api/loan-apps - Check subscription limit before creating
loanApps.post("/", checkLoanAppLimit, zValidator("json", CreateLoanAppSchema), async (c) => {
  const user = c.get("user");
  // This is now type-safe and fully validated
  const body = c.req.valid("json"); 
  
  const result = await loanAppsService.create({
    ...body,
    ownerId: user.id,
  });
  
  if (!result.success) {
    return c.json(
      { error: result.error.message }, 
      (result.error.code || 500) as errorcode
    );
  }
  
  return c.json({ loanApp: result.data }, 201);
});

// GET /api/loan-apps/:appId - Get single loan app
loanApps.get("/:appId", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  
  const result = await loanAppsService.getById(appId, user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }
  
  return c.json({ app: result.data });
});

// PATCH /api/loan-apps/:appId - Update loan app
loanApps.patch("/:appId", zValidator("json", UpdateLoanAppSchema), async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  const body = c.req.valid("json");
  
  const result = await loanAppsService.update(appId, user.id, body);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }
  
  return c.json({ app: result.data });
});

// DELETE /api/loan-apps/:appId - Delete loan app
loanApps.delete("/:appId", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  
  const result = await loanAppsService.delete(appId, user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }
  
  return c.json({ success: true });
});

// GET /api/loan-apps/:appId/analytics
loanApps.get("/:appId/analytics", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  
  const result = await loanAppsService.getAnalytics(appId, user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }
  
  return c.json(result.data);
});

export default loanApps;
