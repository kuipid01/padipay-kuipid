import { Hono } from "hono";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { authService } from "../domain/auth";
import * as UAParser from "ua-parser-js";

async function createDeviceFingerprint(browserName: string, osName: string, browserVersion: string): Promise<string> {
  const data = new TextEncoder().encode(`${browserName}|${osName}|${browserVersion}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

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
    return c.json(
      { error: result.error.message },
      result.error.code as 400 | 401,
    );
  }

  const verificationMailSent = await authService.sendVerificationMessage(body.email);
  if (!verificationMailSent.success) {
    return c.json(
      { error: verificationMailSent.error.message },
      verificationMailSent.error.code as 400 | 401 | 404,
    );
  }

  // Return token instead of setting cookie
  return c.json(
    {
      user: result.data.user,
      token: result.data.token,
      verificationMail:verificationMailSent.success
    },
    201,
  );
});

// POST /api/auth/login
auth.post("/login", async (c) => {
  console.log("➡️ POST /api/auth/login");

  const body = await c.req.json();
  console.log("📦 Login body:", body);

  // ✅ Parse device safely
  const parser = new UAParser.UAParser(body?.device?.userAgent ?? "");
  const ua = parser.getResult();

  const deviceName = `${ua.browser.name ?? "Unknown"} on ${ua.os.name ?? "Unknown"}`;

  const result = await authService.login({
    email: body.email,
    password: body.password,
  });

  if (result.success === false) {
    return c.json(
      { error: result.error.message },
      result.error.code as 400 | 401,
    );
  }

  // Check if user account is soft-deleted
  if (result.data.user.deletedAt) {
    return c.json(
      { error: "Account has been deleted and cannot be used for login" },
      401
    );
  }
  // ✅ Get IP safely
  const ip =
  c.req.header("cf-connecting-ip") ??
  c.req.header("x-forwarded-for") ??
  c.req.header("x-real-ip") ??
  "unknown";

const geoCountry = c.req.header("cf-ipcountry") ?? "unknown";
const geoCity = c.req.header("cf-ipcity") ?? "unknown";

const deviceFingerprint = await createDeviceFingerprint(
  ua.browser.name ?? "Unknown",
  ua.os.name ?? "Unknown",
  ua.browser.version ?? "Unknown"
);
// ✅ Save session
await authService.saveSessions({
  userId: result.data.user.id,
  deviceName,
  browser: ua.browser.name,
  os: ua.os.name,
  ipAddress: ip,
  city:geoCity,
  country:geoCountry,
  isCurrent: true,
  deviceFingerprint,
});

  return c.json({
    user: result.data.user,
    token: result.data.token,
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
    return c.json(
      { error: result.error.message },
      result.error.code as 400 | 404 | 500,
    );
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
    body.newPassword,
  );

  if (!result.success) {
    return c.json(
      { error: result.error.message },
      result.error.code as 400 | 401 | 404,
    );
  }


  return c.json({ success: true, message: "Password changed successfully" });
});

// POST /api/auth/forgot-password
auth.post("/forgot-password", async (c) => {
  const body = await c.req.json();
  
  if (!body.email) {
    return c.json({ error: "Email is required" }, 400);
  }

  const result = await authService.forgotPassword(body.email);

  // Still return 200/success even if email doesn't exist (handled by service)
  return c.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
});

// GET /api/auth/verify-token
auth.get("/verify-token", async (c) => {
  const token = c.req.query("token");

  if (!token) {
    return c.json({ error: "Token is required" }, 400);
  }

  const result = await authService.verifyToken(token);

  if (!result.success) {
    return c.json(
      { error: result.error.message },
      result.error.code as 400 | 401 | 404
    );
  }

  return c.json({ user: result.data.user });
});

// POST /api/auth/reset-password
auth.post("/reset-password", async (c) => {
  const body = await c.req.json();

  if (!body.token || !body.password) {
    return c.json({ error: "Token and password are required" }, 400);
  }

  const result = await authService.resetPassword(body.token, body.password);

  if (!result.success) {
    return c.json(
      { error: result.error.message },
      result.error.code as 400 | 401 | 404
    );
  }

  return c.json({ success: true, message: "Password has been successfully reset" });
});

export default auth;
