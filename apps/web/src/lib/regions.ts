/**
 * Region Configuration
 *
 * Canonical region registry for all deal regions supported by iGift.
 * Used in deal filtering, deal cards, currency formatting, and locale mapping.
 */

export type RegionCode = "US" | "EU" | "UK" | "AU" | "Global";

export interface RegionConfig {
  code: RegionCode;
  displayName: string;
  /** Unicode flag emoji */
  flag: string;
  /** ISO 4217 currency code */
  currency: string;
  /** Currency symbol */
  symbol: string;
  /** ISO 3166-1 alpha-2 country codes included in this region */
  countryCodes: string[];
}

export const REGIONS: Record<RegionCode, RegionConfig> = {
  US: {
    code: "US",
    displayName: "United States",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    countryCodes: ["US"],
  },
  EU: {
    code: "EU",
    displayName: "Europe",
    flag: "🇪🇺",
    currency: "EUR",
    symbol: "€",
    countryCodes: [
      "AT", "BE", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR",
      "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL",
      "PL", "PT", "RO", "SE", "SI", "SK",
    ],
  },
  UK: {
    code: "UK",
    displayName: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    symbol: "£",
    countryCodes: ["GB", "UK"],
  },
  AU: {
    code: "AU",
    displayName: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    symbol: "A$",
    countryCodes: ["AU"],
  },
  Global: {
    code: "Global",
    displayName: "Global",
    flag: "🌐",
    currency: "USD",
    symbol: "$",
    countryCodes: [],
  },
};

/** All region codes except Global — used in filter UIs */
export const SELECTABLE_REGIONS: RegionCode[] = ["US", "EU", "UK", "AU"];

/** All supported region codes including Global */
export const ALL_REGION_CODES: RegionCode[] = ["US", "EU", "UK", "AU", "Global"];

/**
 * Map next-intl locale → suggested region code.
 * Used to pre-select the most relevant region for the user's language.
 */
export const LOCALE_TO_REGION: Record<string, RegionCode> = {
  en: "US",
  de: "EU",
};

/**
 * Returns the region config for a given code, with a Global fallback.
 */
export function getRegion(code: string): RegionConfig {
  return REGIONS[code as RegionCode] ?? REGIONS.Global;
}

/**
 * Format a price in cents to a locale-aware currency string.
 *
 * @example
 * formatRegionPrice(1999, 'EUR', 'de') → '19,99 €'
 * formatRegionPrice(1999, 'USD', 'en') → '$19.99'
 */
export function formatRegionPrice(
  cents: number,
  currency: string,
  locale: string = "en",
): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unknown currency codes
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Infer region code from a currency string.
 * Used for display when explicit region data is missing.
 */
export function regionFromCurrency(currency: string): RegionCode {
  const map: Record<string, RegionCode> = {
    USD: "US",
    EUR: "EU",
    GBP: "UK",
    AUD: "AU",
  };
  return map[currency.toUpperCase()] ?? "Global";
}
