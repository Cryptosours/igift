import { defineRouting } from "next-intl/routing";

/**
 * Defines the supported locales and routing strategy for next-intl.
 *
 * - English (en) is the default — served at `/` with no URL prefix
 * - German (de) — served at `/de/` prefix
 * - `localePrefix: 'as-needed'` means the default locale (en) has no prefix
 */
export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
