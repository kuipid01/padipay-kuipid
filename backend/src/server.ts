import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "dotenv/config";


import { errorHandler, notFoundHandler } from "./middleware";
import { authRoutes, loanAppsRoutes, otpRoutes, dashboardRoutes, loansRoutes, paymentsRoutes, repaymentsRoutes, verifyRoutes, webhooksRoutes, settingsRoutes, newsletterRoutes, publicRoutes, uploadRoutes, userRoutes, loanPreferenceRoute, repaymentPlansRoutes, applicationsRoutes, subscriptionRoutes, borrowerRoutes, lenderWalletRoutes, internalRoutes, notificationRoutes } from "./routes";
import { startCronJobs } from "./jobs/cron";
import "./jobs/worker"; // Initialize BullMQ Worker

/**
 * PadiLoan Backend Server
 * 
 * Standalone Bun + Hono server that exposes the same API as the original
 * Next.js API routes. All paths are preserved for compatibility.
 * 
 * Key differences from Next.js version:
 * - Uses Bearer token auth instead of HTTP-only cookies
 * - Login/Register return token in response body
 * - Client stores token and sends via Authorization header
 */

const app = new Hono();

// ─────────────────────────────────────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Request logging
app.use("*", logger());

// Error handling
app.use("*", errorHandler);

// CORS - allow frontend and mobile apps
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow configured frontend URL
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      if (origin === frontendUrl) return origin;
      
      // Allow mobile apps (no origin) and localhost for dev
      if (!origin || origin.startsWith("http://localhost")) return origin;
      
      // In production, add your mobile app schemes here
      // e.g., "padiloan://", "exp://", etc.
      return frontendUrl;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────────────────

app.get("/", (c) => {
  return c.json({
    name: "PadiLoan API",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// Mounted at /api/* to match Next.js paths
// ─────────────────────────────────────────────────────────────────────────────

app.route("/api/auth", authRoutes);
app.route("/api/loan-apps", loanAppsRoutes);
app.route("/api/otp", otpRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/loans", loansRoutes);
app.route("/api/payments", paymentsRoutes);
app.route("/api/repayments", repaymentsRoutes);
app.route("/api/verify", verifyRoutes);
app.route("/api/webhooks", webhooksRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/newsletter", newsletterRoutes);
app.route("/api/public", publicRoutes);
app.route("/api/upload", uploadRoutes);
app.route("/api/user", userRoutes);
app.route("/api/loan-preference", loanPreferenceRoute);
app.route("/api/repayment-plans", repaymentPlansRoutes);
app.route("/api/applications", applicationsRoutes);
app.route("/api/subscription", subscriptionRoutes);
app.route("/api/borrower", borrowerRoutes);
app.route("/api/lender", lenderWalletRoutes);
app.route("/api/internal", internalRoutes);
app.route("/api/notifications", notificationRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────────────────────

app.notFound(notFoundHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

const port = Number.parseInt(process.env.PORT || "3001", 10);

// Initialize Jobs
startCronJobs();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                     🏦 PadiLoan API Server                     ║
╠════════════════════════════════════════════════════════════════╣
║  Runtime: Bun ${Bun.version}                                        
║  Port: ${port}                                                   
║  Environment: ${process.env.NODE_ENV || "development"}                           
║                                                                                         
╚════════════════════════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};
