/**
 * Raise (GCX) Source Adapter
 *
 * Fetches gift card data from Raise.com / GCX marketplace.
 * Raise is a secondary marketplace (yellow zone) with buyer protection.
 * Data is extracted from public product listing pages.
 *
 * Compliance: public pages only, no login, no anti-bot bypass.
 * Pricing: Discounted gift cards from verified sellers.
 */

import type { SourceAdapter, AdapterResult, RawOffer, AdapterConfig } from "../types";

interface RaiseProduct {
  slug: string;
  brandName: string;
  countries: string[];
}

const TRACKED_PRODUCTS: RaiseProduct[] = [
  { slug: "apple", brandName: "Apple", countries: ["US"] },
  { slug: "steam", brandName: "Steam", countries: ["US", "Global"] },
  { slug: "amazon-com", brandName: "Amazon", countries: ["US"] },
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

const BASE_URL = "https://www.raise.com/buy";
const USER_AGENT = "iGift/1.0 (deal-intelligence-platform; +https://igift.app)";

/**
 * Parse gift card listings from Raise product pages.
 * Raise pages embed product data in JSON-LD and data attributes.
 */
function parseProductPage(html: string, product: RaiseProduct): RawOffer[] {
  const offers: RawOffer[] = [];
  const seenDenoms = new Set<string>();

  // Strategy 1: Parse JSON-LD Product data
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

          const highPrice = parseFloat(offer.highPrice ?? "0");
          // On Raise, price = discounted price, highPrice = face value
          const faceValue = highPrice > price ? highPrice : price;
          const askingPrice = price;

          const denomination = String(faceValue);
          if (seenDenoms.has(denomination)) continue;
          seenDenoms.add(denomination);

          const faceValueCents = Math.round(faceValue * 100);
          const askingPriceCents = Math.round(askingPrice * 100);

          offers.push({
            externalId: `raise-${product.slug}-${denomination}`,
            originalTitle: data.name ?? `${product.brandName} Gift Card $${denomination}`,
            externalUrl: offer.url ?? `${BASE_URL}/${product.slug}-gift-cards`,
            rawBrandName: product.brandName,
            faceValueCents,
            askingPriceCents,
            feeTotalCents: 0,
            currency: offer.priceCurrency ?? "USD",
            denomination,
            countryRedeemable: product.countries,
            sellerName: null,
            sellerRating: null,
            hasBuyerProtection: true, // Raise has 1-year buyer guarantee
            rawSnapshot: {
              source: "raise",
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

  // Strategy 2: Regex fallback — parse discount patterns from page text
  if (offers.length === 0) {
    // Pattern: "$50 Gift Card" with "X% off" or price like "$47.50"
    const cardPattern = /\$(\d+(?:\.\d{2})?)\s*(?:gift\s*card|value)/gi;
    const discountPattern = /(\d+(?:\.\d+)?)\s*%\s*off/i;

    const globalDiscount = discountPattern.exec(html);
    const discountPct = globalDiscount ? parseFloat(globalDiscount[1]) / 100 : 0;

    let cardMatch;
    while ((cardMatch = cardPattern.exec(html)) !== null) {
      const faceValue = parseFloat(cardMatch[1]);
      if (faceValue < 10 || faceValue > 500) continue;

      const denomination = String(faceValue);
      if (seenDenoms.has(denomination)) continue;
      seenDenoms.add(denomination);

      const faceValueCents = Math.round(faceValue * 100);
      const askingPriceCents = discountPct > 0
        ? Math.round(faceValueCents * (1 - discountPct))
        : faceValueCents;

      offers.push({
        externalId: `raise-${product.slug}-${denomination}`,
        originalTitle: `${product.brandName} Gift Card $${denomination}`,
        externalUrl: `${BASE_URL}/${product.slug}-gift-cards`,
        rawBrandName: product.brandName,
        faceValueCents,
        askingPriceCents,
        feeTotalCents: 0,
        currency: "USD",
        denomination,
        countryRedeemable: product.countries,
        sellerName: null,
        sellerRating: null,
        hasBuyerProtection: true,
        rawSnapshot: {
          source: "raise",
          productSlug: product.slug,
          parsedFrom: "fallback-card-pattern",
          discountPctApplied: discountPct,
          fetchedAt: new Date().toISOString(),
        },
      });
    }
  }

  return offers;
}

async function fetchProductPage(
  product: RaiseProduct,
  timeoutMs: number,
): Promise<{ offers: RawOffer[]; warning?: string }> {
  const url = `${BASE_URL}/${product.slug}-gift-cards`;
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
        warning: `${product.slug}: no pricing data found`,
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

export const raiseAdapter: SourceAdapter = {
  name: "Raise",
  sourceSlug: "gcx",

  async fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult> {
    const timeoutMs = config?.timeoutMs ?? 10000;
    const startTime = Date.now();
    const allOffers: RawOffer[] = [];
    const warnings: string[] = [];

    if (config?.dryRun) {
      return {
        sourceSlug: "gcx",
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

      await delay(600); // Polite delay between requests
    }

    return {
      sourceSlug: "gcx",
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
