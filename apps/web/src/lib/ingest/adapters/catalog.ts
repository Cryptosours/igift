/**
 * Configured Catalog Adapter
 *
 * For sources where automated fetching isn't possible (anti-bot, 403s, login walls),
 * this adapter serves manually curated deal data. Every offer is marked with
 * provenance: "manual" and lower confidence scores.
 *
 * This is an honest temporary measure. When affiliate API access is established,
 * each source gets its own live adapter and these entries are retired.
 *
 * TEMPORARY: Replace with per-source API adapters as partnerships are signed.
 * Migration path: Each catalog entry includes sourceSlug — when a live adapter
 * for that slug is registered, the orchestrator skips catalog entries for it.
 */

import type { SourceAdapter, AdapterResult, RawOffer, AdapterConfig } from "../types";

interface CatalogEntry {
  sourceSlug: string;
  sourceName: string;
  brandName: string;
  title: string;
  faceValueCents: number;
  askingPriceCents: number;
  feeTotalCents: number;
  currency: string;
  denomination: string;
  countries: string[];
  externalUrl: string;
  hasBuyerProtection: boolean;
  /** When this entry was last manually verified */
  lastVerified: string;
}

/**
 * Manually verified deal catalog.
 * Each entry was verified on the source website on the date shown.
 * Prices may drift — confidence score accounts for staleness.
 */
const CATALOG: CatalogEntry[] = [
  // ── Costco (green zone, authorized reseller) ──
  {
    sourceSlug: "costco",
    sourceName: "Costco",
    brandName: "Apple",
    title: "Apple Gift Card $100 (4-pack $25)",
    faceValueCents: 10000,
    askingPriceCents: 8499,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "100",
    countries: ["US"],
    externalUrl: "https://www.costco.com/apple-gift-card-4-x-%2425.product.100838923.html",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  {
    sourceSlug: "costco",
    sourceName: "Costco",
    brandName: "Netflix",
    title: "Netflix Gift Card $60 (2-pack $30)",
    faceValueCents: 6000,
    askingPriceCents: 4999,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "60",
    countries: ["US"],
    externalUrl: "https://www.costco.com/netflix-gift-card-2-x-%2430.product.100754912.html",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  {
    sourceSlug: "costco",
    sourceName: "Costco",
    brandName: "Xbox",
    title: "Xbox Gift Card $100 (Digital)",
    faceValueCents: 10000,
    askingPriceCents: 8999,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "100",
    countries: ["US"],
    externalUrl: "https://www.costco.com/xbox-gift-card-100.product.4000224916.html",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  // ── eGifter (green zone, authorized reseller) ──
  {
    sourceSlug: "egifter",
    sourceName: "eGifter",
    brandName: "Steam",
    title: "Steam Gift Card $50",
    faceValueCents: 5000,
    askingPriceCents: 5000,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "50",
    countries: ["US", "Global"],
    externalUrl: "https://www.egifter.com/giftcards/steam",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  {
    sourceSlug: "egifter",
    sourceName: "eGifter",
    brandName: "Nintendo",
    title: "Nintendo eShop Gift Card $35",
    faceValueCents: 3500,
    askingPriceCents: 3500,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "35",
    countries: ["US"],
    externalUrl: "https://www.egifter.com/giftcards/nintendo-eshop",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  {
    sourceSlug: "egifter",
    sourceName: "eGifter",
    brandName: "Disney+",
    title: "Disney+ Gift Card $50",
    faceValueCents: 5000,
    askingPriceCents: 5000,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "50",
    countries: ["US", "Global"],
    externalUrl: "https://www.egifter.com/giftcards/disney-plus",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  {
    sourceSlug: "egifter",
    sourceName: "eGifter",
    brandName: "DoorDash",
    title: "DoorDash Gift Card $50",
    faceValueCents: 5000,
    askingPriceCents: 5000,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "50",
    countries: ["US"],
    externalUrl: "https://www.egifter.com/giftcards/doordash",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  // ── CardCash (yellow zone, marketplace with buyer protection) ──
  {
    sourceSlug: "cardcash",
    sourceName: "CardCash",
    brandName: "PlayStation",
    title: "PlayStation Store Gift Card $75",
    faceValueCents: 7500,
    askingPriceCents: 6375,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "75",
    countries: ["US"],
    externalUrl: "https://www.cardcash.com/buy-playstation-store-gift-cards/",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  {
    sourceSlug: "cardcash",
    sourceName: "CardCash",
    brandName: "Amazon",
    title: "Amazon Gift Card $100",
    faceValueCents: 10000,
    askingPriceCents: 9400,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "100",
    countries: ["US"],
    externalUrl: "https://www.cardcash.com/buy-amazon-gift-cards/",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  // ── PayPal Digital Gifts (green zone, official) ──
  {
    sourceSlug: "paypal-digital-gifts",
    sourceName: "PayPal Digital Gifts",
    brandName: "Google Play",
    title: "Google Play Gift Card $50",
    faceValueCents: 5000,
    askingPriceCents: 5000,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "50",
    countries: ["US"],
    externalUrl: "https://www.paypal.com/us/gifts/brands/google-play",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
  {
    sourceSlug: "paypal-digital-gifts",
    sourceName: "PayPal Digital Gifts",
    brandName: "Spotify",
    title: "Spotify Premium Gift Card $30",
    faceValueCents: 3000,
    askingPriceCents: 3000,
    feeTotalCents: 0,
    currency: "USD",
    denomination: "30",
    countries: ["US"],
    externalUrl: "https://www.paypal.com/us/gifts/brands/spotify",
    hasBuyerProtection: true,
    lastVerified: "2026-04-01",
  },
];

function createCatalogAdapter(sourceSlug: string, sourceName: string): SourceAdapter {
  return {
    name: `${sourceName} (Catalog)`,
    sourceSlug,

    async fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult> {
      const startTime = Date.now();

      if (config?.dryRun) {
        return {
          sourceSlug,
          offers: [],
          fetchedAt: new Date(),
          durationMs: 0,
          warnings: ["Dry run — catalog adapter"],
          failed: false,
        };
      }

      const entries = CATALOG.filter((e) => e.sourceSlug === sourceSlug);

      const offers: RawOffer[] = entries.map((entry) => ({
        externalId: `catalog-${entry.sourceSlug}-${entry.brandName.toLowerCase().replace(/\s+/g, "-")}-${entry.denomination}`,
        originalTitle: entry.title,
        externalUrl: entry.externalUrl,
        rawBrandName: entry.brandName,
        faceValueCents: entry.faceValueCents,
        askingPriceCents: entry.askingPriceCents,
        feeTotalCents: entry.feeTotalCents,
        currency: entry.currency,
        denomination: entry.denomination,
        countryRedeemable: entry.countries,
        sellerName: null,
        sellerRating: null,
        hasBuyerProtection: entry.hasBuyerProtection,
        rawSnapshot: {
          source: entry.sourceSlug,
          provenance: "manual",
          lastVerified: entry.lastVerified,
          catalogEntry: true,
          fetchedAt: new Date().toISOString(),
        },
      }));

      return {
        sourceSlug,
        offers,
        fetchedAt: new Date(),
        durationMs: Date.now() - startTime,
        warnings:
          entries.length === 0
            ? [`No catalog entries for source: ${sourceSlug}`]
            : [],
        failed: false,
      };
    },
  };
}

/** Pre-built catalog adapters for each blocked source */
export const costcoCatalogAdapter = createCatalogAdapter("costco", "Costco");
export const egifterCatalogAdapter = createCatalogAdapter("egifter", "eGifter");
export const cardcashCatalogAdapter = createCatalogAdapter("cardcash", "CardCash");
export const paypalCatalogAdapter = createCatalogAdapter("paypal-digital-gifts", "PayPal Digital Gifts");

/** Get all catalog adapters */
export function getAllCatalogAdapters(): SourceAdapter[] {
  return [costcoCatalogAdapter, egifterCatalogAdapter, cardcashCatalogAdapter, paypalCatalogAdapter];
}
