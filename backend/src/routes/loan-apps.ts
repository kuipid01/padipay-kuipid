import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { loanAppsService } from "../domain/loan-apps";

const loanApps = new Hono();

/**
 * Loan Apps Routes
 * 
 * Original paths preserved:
 * - GET    /api/loan-apps         -> List all loan apps for user
 * - POST   /api/loan-apps         -> Create new loan app
 * - GET    /api/loan-apps/:appId  -> Get single loan app
 * - PATCH  /api/loan-apps/:appId  -> Update loan app
 * - DELETE /api/loan-apps/:appId  -> Delete loan app
 * 
 * Routes are thin transport layers - all logic in service.
 */

// Apply auth middleware to all routes
loanApps.use("/*", authMiddleware);

// GET /api/loan-apps - List all loan apps
loanApps.get("/", async (c) => {
  const user = c.get("user");
  const result = await loanAppsService.getAll(user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 404 | 500);
  }
  
  return c.json({ loanApps: result.data });
});

// POST /api/loan-apps - Create loan app
loanApps.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  const result = await loanAppsService.create({
    ownerId: user.id,
    name: body.name,
    slug: body.slug,
    defaultInterestRate: body.defaultInterestRate,
    defaultDurationMonths: body.defaultDurationMonths,
  });
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 404 | 500);
  }
  
  return c.json({ loanApp: result.data }, 201);
});

// GET /api/loan-apps/:appId - Get single loan app
loanApps.get("/:appId", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  
  const result = await loanAppsService.getById(appId, user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 404 | 500);
  }
  
  return c.json({ app: result.data });
});

// PATCH /api/loan-apps/:appId - Update loan app
loanApps.patch("/:appId", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  const body = await c.req.json();
  
  const result = await loanAppsService.update(appId, user.id, {
    name: body.name,
    slug: body.slug,
    defaultInterestRate: body.defaultInterestRate,
    defaultDurationMonths: body.defaultDurationMonths,
    isActive: body.isActive,
  });
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 404 | 500);
  }
  
  return c.json({ app: result.data });
});

// DELETE /api/loan-apps/:appId - Delete loan app
loanApps.delete("/:appId", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  
  const result = await loanAppsService.delete(appId, user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 404 | 500);
  }
  
  return c.json({ success: true });
});

export default loanApps;
