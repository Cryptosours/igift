/**
 * Next.js Instrumentation Hook
 *
 * Called once when the Next.js server starts.
 * Loads the appropriate Sentry config based on the runtime.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side: Node.js runtime (API routes, SSR)
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime (middleware)
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (...args: Parameters<NonNullable<typeof import("@sentry/nextjs").captureRequestError>>) => {
  // Only import Sentry if DSN is configured
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
};
