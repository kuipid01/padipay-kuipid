import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyToken } from "../lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
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
 * 
 * Usage in routes:
 * - Protected routes: Use this middleware
 * - Access user: c.get("user")
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new HTTPException(401, { message: "Authorization header is required" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Invalid authorization format. Use: Bearer <token>" });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

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
