/**
 * Sentry Server Configuration
 *
 * Initializes Sentry on the Node.js server for API route errors,
 * SSR failures, and server-side performance tracking.
 *
 * Conditional: only initializes if SENTRY_DSN is set.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Performance: sample 10% of server transactions in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Don't send PII
    sendDefaultPii: false,

    // Tag with app version
    release: `igift@${process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}`,

    // Server-side: capture unhandled promise rejections
    integrations: [],

    // Filter sensitive data from breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Strip query params from URLs (may contain API keys)
      if (breadcrumb.category === "fetch" && breadcrumb.data?.url) {
        try {
          const url = new URL(breadcrumb.data.url);
          url.search = "";
          breadcrumb.data.url = url.toString();
        } catch {
          // Keep original if URL parsing fails
        }
      }
      return breadcrumb;
    },
  });
}
