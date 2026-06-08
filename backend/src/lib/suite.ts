import type { Context, Next } from "hono";

export const TEST_SUITE_NAME = "test";

export function isTestSuite() {
  return process.env.SUITE === TEST_SUITE_NAME;
}

export async function requireTestSuite(c: Context, next: Next) {
  if (!isTestSuite()) {
    return c.json(
      {
        error: "Test suite routes are disabled",
        hint: "Set SUITE=test to enable mock external-service routes.",
      },
      404,
    );
  }

  await next();
}

export function suiteProviderName(realProvider: string) {
  return isTestSuite() ? `mock:${realProvider}` : realProvider;
}
