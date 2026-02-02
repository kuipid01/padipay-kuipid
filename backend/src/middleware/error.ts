import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

interface ErrorResponse {
  error: string;
  message?: string;
  stack?: string;
}

/**
 * Global error handling middleware.
 * Catches all errors and returns consistent JSON responses.
 */
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error("[Error]", error);

    // Handle Hono's HTTPException
    if (error instanceof HTTPException) {
      const response: ErrorResponse = {
        error: error.message,
      };
      return c.json(response, error.status);
    }

    // Handle standard errors
    if (error instanceof Error) {
      const response: ErrorResponse = {
        error: error.message,
      };

      // Include stack trace in development
      if (process.env.NODE_ENV === "development") {
        response.stack = error.stack;
      }

      return c.json(response, 500);
    }

    // Unknown error
    return c.json({ error: "Internal server error" }, 500);
  }
}

/**
 * Request logging middleware for development.
 */
export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  
  await next();
  
  const duration = Date.now() - start;
  console.log(`[${c.req.method}] ${c.req.path} - ${c.res.status} (${duration}ms)`);
}

/**
 * Not found handler.
 */
export function notFoundHandler(c: Context) {
  return c.json({ error: "Not found" }, 404);
}
