/**
 * Sentry Edge Configuration
 *
 * Initializes Sentry in the Edge runtime (Next.js middleware).
 * Keeps config minimal since middleware runs on every request.
 *
 * Conditional: only initializes if SENTRY_DSN is set.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Middleware runs on every request — very low sample rate
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.01 : 0.1,

    // Don't send PII
    sendDefaultPii: false,

    release: `igift@${process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}`,
  });
}
