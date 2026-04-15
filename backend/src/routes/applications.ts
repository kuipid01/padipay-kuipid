import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { applicationsService } from "../domain/applications";
import { UpdateApplicationSchema } from "../zod-schemas/applications";
import { zValidator } from "@hono/zod-validator";

const applications = new Hono();

/**
 * Applications Routes (for Lenders to manage their borrowers' requests)
 * 
 * - GET    /api/applications             -> List all incoming applications
 * - GET    /api/applications/:appId      -> Get single application details
 * - PATCH  /api/applications/:appId      -> Update status (APPROVE/REJECT)
 */

type errorcode = 400 | 404 | 500;

// Apply auth middleware
applications.use("/*", authMiddleware);

// GET /api/applications
applications.get("/", async (c) => {
  const user = c.get("user");
  const result = await applicationsService.getAll(user.id);

  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }

  return c.json({ applications: result.data });
});

// GET /api/applications/:appId
applications.get("/:appId", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");

  const result = await applicationsService.getById(appId, user.id);

  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }

  return c.json({ application: result.data });
});

// PATCH /api/applications/:appId
applications.patch("/:appId", zValidator("json", UpdateApplicationSchema), async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");
  const body = c.req.valid("json");

  const result = await applicationsService.update(appId, user.id, body);
  console.log(result)
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }

  return c.json({ application: result.data });
});

// POST /api/applications/:appId/approve
applications.post("/:appId/approve", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");

  const result = await applicationsService.approve(appId, user.id);

  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }

  return c.json(result.data);
});

// POST /api/applications/:appId/fund
applications.post("/:appId/fund", async (c) => {
  const user = c.get("user");
  const appId = c.req.param("appId");

  const result = await applicationsService.fund(appId, user.id);

  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as errorcode);
  }

  return c.json(result.data);
});

export default applications;
