/**
 * Normalization Pipeline
 *
 * Transforms raw adapter output into canonical form:
 * 1. Brand resolution: messy name → canonical brand slug
 * 2. Currency normalization: convert to USD cents
 * 3. Region mapping: standardize country codes
 * 4. Denomination extraction: parse "$50" etc. from titles
 * 5. Title normalization: clean up messy source titles
 */

import type { RawOffer } from "./types";

// ── Brand Resolution ──

/** Map of common brand name variations to canonical slugs */
const BRAND_ALIASES: Record<string, string> = {
  // Apple
  apple: "apple",
  "apple gift card": "apple",
  "app store": "apple",
  "app store & itunes": "apple",
  itunes: "apple",
  "itunes gift card": "apple",
  // Steam
  steam: "steam",
  "steam wallet": "steam",
  "steam gift card": "steam",
  // Netflix
  netflix: "netflix",
  "netflix gift card": "netflix",
  // PlayStation
  playstation: "playstation",
  "playstation store": "playstation",
  psn: "playstation",
  "ps store": "playstation",
  "ps5": "playstation",
  "ps4": "playstation",
  // Google Play
  "google play": "google-play",
  "google play gift card": "google-play",
  "google play store": "google-play",
  // Amazon
  amazon: "amazon",
  "amazon.com": "amazon",
  "amazon gift card": "amazon",
  "amazon.co.uk": "amazon",
  "amazon.de": "amazon",
  // Xbox
  xbox: "xbox",
  "xbox gift card": "xbox",
  "xbox live": "xbox",
  "xbox game pass": "xbox",
  "microsoft xbox": "xbox",
  // Spotify
  spotify: "spotify",
  "spotify premium": "spotify",
  "spotify gift card": "spotify",
  // Nintendo
  nintendo: "nintendo",
  "nintendo eshop": "nintendo",
  "nintendo switch": "nintendo",
  // Uber
  uber: "uber",
  "uber gift card": "uber",
  "uber eats": "uber",
  // DoorDash
  doordash: "doordash",
  "door dash": "doordash",
  "doordash gift card": "doordash",
  // Disney+
  "disney+": "disney-plus",
  "disney plus": "disney-plus",
  disney: "disney-plus",
  "disney+ gift card": "disney-plus",
};

/** Resolve a messy brand name to a canonical slug. Returns null if unknown. */
export function resolveBrandSlug(rawName: string): string | null {
  const normalized = rawName.trim().toLowerCase().replace(/[™®©]/g, "");
  if (BRAND_ALIASES[normalized]) return BRAND_ALIASES[normalized];

  // Try partial match — check if any alias is a substring
  for (const [alias, slug] of Object.entries(BRAND_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      return slug;
    }
  }

  return null;
}

// ── Currency / FX ──

/**
 * Hardcoded FX rates to USD. Updated periodically.
 * For V1, we use static rates. Phase 2+ will fetch live rates.
 */
const FX_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.26,
  CAD: 0.74,
  AUD: 0.65,
  JPY: 0.0067,
  CHF: 1.12,
  SEK: 0.096,
  NOK: 0.094,
  DKK: 0.145,
  BRL: 0.20,
  MXN: 0.058,
  INR: 0.012,
};

/** Convert an amount in cents from sourceCurrency to USD cents */
export function toUsdCents(amountCents: number, sourceCurrency: string): number {
  const rate = FX_TO_USD[sourceCurrency.toUpperCase()];
  if (!rate) return amountCents; // default to passthrough if unknown
  return Math.round(amountCents * rate);
}

/** Check if a currency is supported */
export function isSupportedCurrency(currency: string): boolean {
  return currency.toUpperCase() in FX_TO_USD;
}

// ── Region Mapping ──

/** Normalize country code variations to ISO 3166-1 alpha-2 */
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "US",
  us: "US",
  "united states": "US",
  america: "US",
  uk: "GB",
  "united kingdom": "GB",
  england: "GB",
  britain: "GB",
  de: "DE",
  germany: "DE",
  fr: "FR",
  france: "FR",
  ca: "CA",
  canada: "CA",
  au: "AU",
  australia: "AU",
  jp: "JP",
  japan: "JP",
  eu: "EU",
  europe: "EU",
  global: "Global",
  worldwide: "Global",
  international: "Global",
};

/** Normalize a country code or name to standardized form */
export function normalizeCountry(raw: string): string {
  const lower = raw.trim().toLowerCase();
  return COUNTRY_ALIASES[lower] ?? raw.toUpperCase().slice(0, 2);
}

/** Normalize an array of country codes */
export function normalizeCountries(raw: string[]): string[] {
  const normalized = new Set(raw.map(normalizeCountry));
  return [...normalized];
}

// ── Denomination Extraction ──

const DENOM_PATTERNS = [
  /\$(\d+(?:\.\d{2})?)/,         // $50, $25.00
  /€(\d+(?:\.\d{2})?)/,          // €25
  /£(\d+(?:\.\d{2})?)/,          // £20
  /(\d+(?:\.\d{2})?)\s*USD/i,    // 50 USD
  /(\d+(?:\.\d{2})?)\s*EUR/i,    // 25 EUR
  /(\d+(?:\.\d{2})?)\s*GBP/i,    // 20 GBP
];

/** Extract denomination from a title string */
export function extractDenomination(title: string): string | null {
  for (const pattern of DENOM_PATTERNS) {
    const match = title.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ── Title Normalization ──

/** Clean up a messy source title into a normalized form */
export function normalizeTitle(
  rawTitle: string,
  brandName: string,
  denomination: string | null,
  currency: string,
): string {
  // Build a clean title: "Brand Gift Card $50"
  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  const denomPart = denomination ? ` ${currencySymbol}${denomination}` : "";
  return `${brandName} Gift Card${denomPart}`;
}

// ── Full Normalization Pipeline ──

export interface NormalizedOffer {
  externalId: string;
  brandSlug: string | null;
  originalTitle: string;
  normalizedTitle: string;
  externalUrl: string;
  faceValueCents: number;     // in USD cents
  askingPriceCents: number;   // in USD cents
  feeTotalCents: number;      // in USD cents
  effectivePriceCents: number; // asking + fees, in USD cents
  currency: string;           // always "USD" after conversion
  denomination: string | null;
  effectiveDiscountPct: number;
  countryRedeemable: string[];
  sellerName: string | null;
  sellerRating: number | null;
  hasBuyerProtection: boolean;
  rawSnapshot: Record<string, unknown>;
}

/** Run the full normalization pipeline on a raw offer */
export function normalizeOffer(raw: RawOffer, brandNameOverride?: string): NormalizedOffer {
  const brandSlug = resolveBrandSlug(raw.rawBrandName);
  const denomination = raw.denomination ?? extractDenomination(raw.originalTitle);
  const countries = normalizeCountries(raw.countryRedeemable);

  // Convert to USD cents
  const faceUsd = toUsdCents(raw.faceValueCents, raw.currency);
  const askingUsd = toUsdCents(raw.askingPriceCents, raw.currency);
  const feeUsd = toUsdCents(raw.feeTotalCents, raw.currency);
  const effectiveUsd = askingUsd + feeUsd;

  const discountPct = faceUsd > 0
    ? Math.round(((faceUsd - effectiveUsd) / faceUsd) * 10000) / 10000
    : 0;

  const brandDisplay = brandNameOverride ?? raw.rawBrandName;
  const normalizedTitle = normalizeTitle(raw.originalTitle, brandDisplay, denomination, "USD");

  return {
    externalId: raw.externalId,
    brandSlug,
    originalTitle: raw.originalTitle,
    normalizedTitle,
    externalUrl: raw.externalUrl,
    faceValueCents: faceUsd,
    askingPriceCents: askingUsd,
    feeTotalCents: feeUsd,
    effectivePriceCents: effectiveUsd,
    currency: "USD",
    denomination,
    effectiveDiscountPct: discountPct,
    countryRedeemable: countries,
    sellerName: raw.sellerName,
    sellerRating: raw.sellerRating,
    hasBuyerProtection: raw.hasBuyerProtection,
    rawSnapshot: raw.rawSnapshot,
  };
}
