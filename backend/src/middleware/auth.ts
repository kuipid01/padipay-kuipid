import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyToken } from "../lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  borrowerId?: string;
}

// Extend Hono's context with auth user
declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Authentication middleware that validates Bearer tokens.
 * Replaces Next.js cookie-based auth with standard Bearer token auth.
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new HTTPException(401, { message: "Authorization header is required" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Invalid authorization format. Use: Bearer <token>" });
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new HTTPException(401, { message: "Token is required" });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }

  // Attach user to context
  c.set("user", {
    id: payload.id as string,
    email: payload.email as string,
    role: payload.role as string,
    borrowerId: payload.borrowerId as string,
  });

  await next();
}

/**
 * Specialized auth middleware for borrower routes.
 * Ensures the user has a BORROWER role and properly maps the borrower ID.
 */
export async function borrowerAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Authorization required" });
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload || payload.role !== "BORROWER") {
    throw new HTTPException(403, { message: "Unauthorized. Borrower access only." });
  }

  let borrowerId = payload.borrowerId as string;

  // If borrowerId is missing (e.g., logged in via main auth), try to resolve it by email
  if (!borrowerId && payload.email) {
    try {
      const { db } = await import("../db");
      const { borrowers } = await import("../db/schema");
      const { eq } = await import("drizzle-orm");

      const borrower = await db.query.borrowers.findFirst({
        where: eq(borrowers.email, payload.email as string),
      });

      if (borrower) {
        borrowerId = borrower.id;
      }
    } catch (error) {
      console.error("Error resolving borrowerId:", error);
    }
  }

  // If we still don't have a valid borrowerId that would satisfy FK constraints, 
  // we use the payload.id but it might still fail if it's a user_id. 
  // However, mapping it here gives it the best chance.
  const finalId = borrowerId || (payload.id as string);

  c.set("user", {
    id: finalId,
    email: payload.email as string,
    role: payload.role as string,
    borrowerId: borrowerId,
  });

  await next();
}

/**
 * Optional auth middleware - does not throw if no token present.
 * Useful for routes that work both with and without auth.
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (payload) {
      c.set("user", {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string,
      });
    }
  }

  await next();
}

/**
 * Role-based authorization middleware.
 * Must be used AFTER authMiddleware.
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }

    if (!roles.includes(user.role)) {
      throw new HTTPException(403, { message: "Insufficient permissions" });
    }

    await next();
  };
}
