/**
 * Gift Card Granny Source Adapter
 *
 * Fetches gift card deal data from GiftCardGranny.com.
 * GCG is an aggregator (green zone) that compares prices across sellers.
 * They show the best discounts available from trusted retailers.
 *
 * Data is extracted from public brand comparison pages.
 * Compliance: public pages only, no login, no anti-bot bypass.
 */

import type { SourceAdapter, AdapterResult, RawOffer, AdapterConfig } from "../types";

interface GcgProduct {
  slug: string;
  brandName: string;
  countries: string[];
}

const TRACKED_PRODUCTS: GcgProduct[] = [
  { slug: "apple", brandName: "Apple", countries: ["US"] },
  { slug: "steam", brandName: "Steam", countries: ["US", "Global"] },
  { slug: "amazon", brandName: "Amazon", countries: ["US"] },
  { slug: "xbox", brandName: "Xbox", countries: ["US", "Global"] },
  { slug: "playstation-store", brandName: "PlayStation", countries: ["US"] },
  { slug: "google-play", brandName: "Google Play", countries: ["US"] },
  { slug: "netflix", brandName: "Netflix", countries: ["US"] },
  { slug: "uber", brandName: "Uber", countries: ["US"] },
  { slug: "doordash", brandName: "DoorDash", countries: ["US"] },
  { slug: "nintendo-eshop", brandName: "Nintendo", countries: ["US"] },
  { slug: "spotify", brandName: "Spotify", countries: ["US", "Global"] },
  { slug: "disney-plus", brandName: "Disney+", countries: ["US", "Global"] },
];

const BASE_URL = "https://www.giftcardgranny.com/buy-gift-cards";
const USER_AGENT = "RealDeal/1.0 (deal-intelligence-platform; +https://igift.app)";

/**
 * Parse deal data from Gift Card Granny comparison pages.
 * GCG shows a table of sellers with discount percentages and prices.
 */
function parseProductPage(html: string, product: GcgProduct): RawOffer[] {
  const offers: RawOffer[] = [];
  const seenKeys = new Set<string>();

  // Strategy 1: Parse structured product/offer JSON-LD
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;

  while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);

      if (data["@type"] === "Product" && data.offers) {
        const offerList = Array.isArray(data.offers) ? data.offers : [data.offers];

        for (const offer of offerList) {
          const price = parseFloat(offer.price ?? offer.lowPrice ?? "0");
          if (price <= 0) continue;

          const sellerName = offer.seller?.name ?? offer.offeredBy?.name ?? null;
          const denomination = String(price);
          const key = `${denomination}-${sellerName ?? "unknown"}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          const priceCents = Math.round(price * 100);

          offers.push({
            externalId: `gcg-${product.slug}-${denomination}-${(sellerName ?? "direct").toLowerCase().replace(/\s+/g, "-")}`,
            originalTitle: data.name ?? `${product.brandName} Gift Card $${denomination}`,
            externalUrl: offer.url ?? `${BASE_URL}/${product.slug}/`,
            rawBrandName: product.brandName,
            faceValueCents: priceCents,
            askingPriceCents: priceCents,
            feeTotalCents: 0,
            currency: offer.priceCurrency ?? "USD",
            denomination,
            countryRedeemable: product.countries,
            sellerName,
            sellerRating: null,
            hasBuyerProtection: true,
            rawSnapshot: {
              source: "giftcardgranny",
              productSlug: product.slug,
              schemaOffer: offer,
              fetchedAt: new Date().toISOString(),
            },
          });
        }
      }
    } catch {
      // Invalid JSON-LD — try next block
    }
  }

  // Strategy 2: Parse discount table patterns
  // GCG shows patterns like "Up to X% off" and "$50 for $47.50"
  if (offers.length === 0) {
    // Look for discount percentage advertised
    const discountMatch = html.match(/(?:up\s+to\s+)?(\d+(?:\.\d+)?)\s*%\s*(?:off|discount|savings)/i);
    const maxDiscount = discountMatch ? parseFloat(discountMatch[1]) / 100 : 0;

    // Look for face value / price pairs
    const pairPattern = /\$(\d+(?:\.\d{2})?)\s*(?:gift\s*card|face\s*value)[\s\S]{0,100}?\$(\d+(?:\.\d{2})?)/gi;
    let pairMatch;

    while ((pairMatch = pairPattern.exec(html)) !== null) {
      const faceValue = parseFloat(pairMatch[1]);
      const askingPrice = parseFloat(pairMatch[2]);

      if (faceValue < 10 || faceValue > 500) continue;
      if (askingPrice >= faceValue) continue; // Must be a discount

      const denomination = String(faceValue);
      const key = `pair-${denomination}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      offers.push({
        externalId: `gcg-${product.slug}-${denomination}`,
        originalTitle: `${product.brandName} Gift Card $${denomination}`,
        externalUrl: `${BASE_URL}/${product.slug}/`,
        rawBrandName: product.brandName,
        faceValueCents: Math.round(faceValue * 100),
        askingPriceCents: Math.round(askingPrice * 100),
        feeTotalCents: 0,
        currency: "USD",
        denomination,
        countryRedeemable: product.countries,
        sellerName: null,
        sellerRating: null,
        hasBuyerProtection: true,
        rawSnapshot: {
          source: "giftcardgranny",
          productSlug: product.slug,
          parsedFrom: "fallback-pair-pattern",
          fetchedAt: new Date().toISOString(),
        },
      });
    }

    // Strategy 3: If we found a max discount but no pairs, create entries
    // for common denominations
    if (offers.length === 0 && maxDiscount > 0.01) {
      const commonDenoms = [25, 50, 100];
      for (const denom of commonDenoms) {
        const faceValueCents = denom * 100;
        const askingPriceCents = Math.round(faceValueCents * (1 - maxDiscount));

        offers.push({
          externalId: `gcg-${product.slug}-${denom}`,
          originalTitle: `${product.brandName} Gift Card $${denom}`,
          externalUrl: `${BASE_URL}/${product.slug}/`,
          rawBrandName: product.brandName,
          faceValueCents,
          askingPriceCents,
          feeTotalCents: 0,
          currency: "USD",
          denomination: String(denom),
          countryRedeemable: product.countries,
          sellerName: null,
          sellerRating: null,
          hasBuyerProtection: true,
          rawSnapshot: {
            source: "giftcardgranny",
            productSlug: product.slug,
            parsedFrom: "fallback-discount-synthetic",
            maxDiscountApplied: maxDiscount,
            fetchedAt: new Date().toISOString(),
          },
        });
      }
    }
  }

  return offers;
}

async function fetchProductPage(
  product: GcgProduct,
  timeoutMs: number,
): Promise<{ offers: RawOffer[]; warning?: string }> {
  const url = `${BASE_URL}/${product.slug}/`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        offers: [],
        warning: `${product.slug}: HTTP ${response.status}`,
      };
    }

    const html = await response.text();
    const offers = parseProductPage(html, product);

    if (offers.length === 0) {
      return {
        offers: [],
        warning: `${product.slug}: no deal data found`,
      };
    }

    return { offers };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      offers: [],
      warning: `${product.slug}: ${message}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const giftCardGrannyAdapter: SourceAdapter = {
  name: "Gift Card Granny",
  sourceSlug: "giftcardgranny",

  async fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult> {
    const timeoutMs = config?.timeoutMs ?? 10000;
    const startTime = Date.now();
    const allOffers: RawOffer[] = [];
    const warnings: string[] = [];

    if (config?.dryRun) {
      return {
        sourceSlug: "giftcardgranny",
        offers: [],
        fetchedAt: new Date(),
        durationMs: 0,
        warnings: ["Dry run — no fetches performed"],
        failed: false,
      };
    }

    for (const product of TRACKED_PRODUCTS) {
      const result = await fetchProductPage(product, timeoutMs);
      allOffers.push(...result.offers);
      if (result.warning) warnings.push(result.warning);

      await delay(800); // Polite delay — GCG is smaller, be extra respectful
    }

    return {
      sourceSlug: "giftcardgranny",
      offers: allOffers,
      fetchedAt: new Date(),
      durationMs: Date.now() - startTime,
      warnings,
      failed: allOffers.length === 0 && warnings.length > 0,
      failureReason:
        allOffers.length === 0 && warnings.length > 0
          ? `All ${TRACKED_PRODUCTS.length} products failed to parse`
          : undefined,
    };
  },
};
