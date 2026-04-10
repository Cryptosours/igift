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
  // Additional variations from marketplace listings
  "xbox game pass ultimate": "xbox",
  "psn card": "playstation",
  "playstation network": "playstation",
  "eshop": "nintendo",
  "nintendo eshop card": "nintendo",
  "google play card": "google-play",
  "apple itunes": "apple",
  "itunes & app store": "apple",
  "steam wallet code": "steam",
  "steam wallet gift card": "steam",
  "uber eats gift card": "uber",
  "spotify premium gift card": "spotify",
  "netflix gift card code": "netflix",
  "doordash gift card code": "doordash",
  // eBay
  ebay: "ebay",
  "ebay gift card": "ebay",
  "ebay.com": "ebay",
};

/** Resolve a messy brand name to a canonical slug. Returns null if unknown. */
export function resolveBrandSlug(rawName: string): string | null {
  const normalized = rawName.trim().toLowerCase().replace(/[™®©]/g, "");
  if (!normalized) return null;
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

import { STATIC_RATES } from "@/lib/fx-rates";

/**
 * Convert an amount in cents from sourceCurrency to USD cents.
 * Uses provided rates map if given, otherwise falls back to static rates.
 * Live rates are fetched once per ingestion run by the orchestrator.
 */
export function toUsdCents(
  amountCents: number,
  sourceCurrency: string,
  fxRates: Record<string, number> = STATIC_RATES,
): number | null {
  const rate = fxRates[sourceCurrency.toUpperCase()];
  if (!rate) return null; // unsupported currency — caller must suppress this offer
  return Math.round(amountCents * rate);
}

/** Check if a currency is supported */
export function isSupportedCurrency(
  currency: string,
  fxRates: Record<string, number> = STATIC_RATES,
): boolean {
  return currency.toUpperCase() in fxRates;
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

/**
 * Run the full normalization pipeline on a raw offer.
 * Returns null if the offer's currency is unsupported — the caller must
 * discard the offer rather than persisting it with wrong USD values.
 */
export function normalizeOffer(
  raw: RawOffer,
  brandNameOverride?: string,
  fxRates?: Record<string, number>,
): NormalizedOffer | null {
  const brandSlug = resolveBrandSlug(raw.rawBrandName);
  const denomination = raw.denomination ?? extractDenomination(raw.originalTitle);
  const countries = normalizeCountries(raw.countryRedeemable);

  // Convert to USD cents (uses live rates if provided, else static fallback).
  // Unsupported currencies return null — suppress rather than silently mislabel.
  const faceUsd = toUsdCents(raw.faceValueCents, raw.currency, fxRates);
  const askingUsd = toUsdCents(raw.askingPriceCents, raw.currency, fxRates);
  const feeUsd = toUsdCents(raw.feeTotalCents, raw.currency, fxRates);

  if (faceUsd === null || askingUsd === null || feeUsd === null) {
    return null; // unsupported currency — caller should log and skip
  }

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
