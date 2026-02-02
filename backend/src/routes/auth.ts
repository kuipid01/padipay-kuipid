import { Hono } from "hono";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { authService } from "../domain/auth";

const auth = new Hono();

/**
 * Auth Routes
 * 
 * Original paths preserved:
 * - POST /api/auth/register    -> Register new user
 * - POST /api/auth/login       -> Login user
 * - GET  /api/auth/me          -> Get current user
 * - POST /api/auth/logout      -> Logout (now just a success response)
 * - POST /api/auth/change-password -> Change password
 * 
 * Key difference: Login/Register now return token in response body
 * instead of setting HTTP-only cookie.
 */

// POST /api/auth/register
auth.post("/register", async (c) => {
  const body = await c.req.json();
  
  const result = await authService.register({
    email: body.email,
    password: body.password,
    fullName: body.fullName,
    phone: body.phone,
  });
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 401);
  }
  
  // Return token instead of setting cookie
  return c.json({ 
    user: result.data.user,
    token: result.data.token 
  }, 201);
});

// POST /api/auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  
  const result = await authService.login({
    email: body.email,
    password: body.password,
  });
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 401);
  }
  
  // Return token instead of setting cookie
  return c.json({ 
    user: result.data.user,
    token: result.data.token 
  });
});

// GET /api/auth/me - with optional auth for compatibility
auth.get("/me", optionalAuthMiddleware, async (c) => {
  const user = c.get("user");
  
  if (!user) {
    return c.json({ user: null });
  }
  
  const result = await authService.getMe(user.id);
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 404 | 500);
  }
  
  return c.json({ user: result.data.user });
});

// POST /api/auth/logout
// With Bearer tokens, logout is client-side (discard the token)
// We provide this endpoint for API compatibility
auth.post("/logout", async (c) => {
  return c.json({ success: true, message: "Logged out successfully" });
});

// POST /api/auth/change-password
auth.post("/change-password", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  if (!body.oldPassword || !body.newPassword) {
    return c.json({ error: "Old and new passwords are required" }, 400);
  }
  
  const result = await authService.changePassword(
    user.id,
    body.oldPassword,
    body.newPassword
  );
  
  if (!result.success) {
    return c.json({ error: result.error.message }, result.error.code as 400 | 401 | 404);
  }
  
  return c.json({ success: true, message: "Password changed successfully" });
});

export default auth;
