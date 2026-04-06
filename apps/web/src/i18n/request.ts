import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Server-side request configuration for next-intl.
 * Loads the correct message bundle for each request based on the detected locale.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Validate locale — fall back to defaultLocale if the value is unexpected
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
