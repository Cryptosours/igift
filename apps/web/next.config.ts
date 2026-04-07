import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=15552000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Google Analytics (gtag.js) + future AdSense
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: https://*.ingest.sentry.io https://www.google-analytics.com https://analytics.google.com",
      // AdSense ad iframes
      "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@igift/ui", "@igift/schemas", "@igift/utils"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

// Wrap with Sentry (no-ops if SENTRY_DSN is not set)
export default withSentryConfig(withNextIntl(nextConfig), {
  // Suppress source map upload warnings when SENTRY_AUTH_TOKEN is not set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Don't upload source maps unless auth token is provided
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,

  // Don't create a Sentry release unless auth token is provided
  release: {
    create: !!process.env.SENTRY_AUTH_TOKEN,
  },

  // Tunnel Sentry events through our own domain to avoid ad blockers
  // (only if we set up the tunnel route later)
  tunnelRoute: undefined,
});
