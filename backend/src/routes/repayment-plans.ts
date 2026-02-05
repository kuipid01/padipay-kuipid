import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { repaymentPlansService } from "../domain/repayment-plans";
import { zValidator } from "@hono/zod-validator";
import { UpdateRepaymentPlanSchema } from "../zod-schemas/repayment-plans";

const repaymentPlans = new Hono();

/**
 * Repayment Plans Routes
 * 
 * Original paths preserved:
 * - GET   /api/repayment-plans/:planId -> Get single repayment plan
 * - PATCH /api/repayment-plans/:planId -> Update repayment plan
 */

type errorcode = 400 | 403 | 404 | 500;

// Apply auth middleware to all routes
repaymentPlans.use("/*", authMiddleware);

// GET /api/repayment-plans/:planId
repaymentPlans.get("/:planId", async (c) => {
  const planId = c.req.param("planId");
  
  const result = await repaymentPlansService.getById(planId);
  
  if (!result.success) {
    return c.json(
      { error: result.error.message }, 
      (result.error.code || 500) as errorcode
    );
  }
  
  return c.json({ plan: result.data });
});

// PATCH /api/repayment-plans/:planId
repaymentPlans.patch("/:planId", zValidator("json", UpdateRepaymentPlanSchema), async (c) => {
  const user = c.get("user");
  const planId = c.req.param("planId");
  const body = c.req.valid("json");
  
  const result = await repaymentPlansService.update(planId, user.id, body);
  
  if (!result.success) {
    return c.json(
      { error: result.error.message }, 
      (result.error.code || 500) as errorcode
    );
  }
  
  return c.json({ plan: result.data });
});

export default repaymentPlans;
