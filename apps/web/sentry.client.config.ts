/**
 * Sentry Client Configuration
 *
 * Initializes Sentry in the browser for client-side error tracking,
 * performance monitoring, and session replay.
 *
 * Conditional: only initializes if NEXT_PUBLIC_SENTRY_DSN is set.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Performance: sample 10% of transactions in production, 100% in dev
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session Replay: capture 1% of sessions, 100% of error sessions
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        // Mask all text and block all media for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Don't send PII — we're a publisher, not handling user accounts in V1
    sendDefaultPii: false,

    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      /^ResizeObserver loop/,
      // Network errors from user's connection
      /^Failed to fetch/,
      /^Load failed/,
      /^NetworkError/,
      // Next.js hydration warnings (not real errors)
      /Hydration failed/,
      /Text content does not match/,
    ],

    // Tag with app version
    release: `igift@${process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}`,
  });
}
