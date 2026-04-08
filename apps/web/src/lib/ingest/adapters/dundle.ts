/**
 * dundle Source Adapter
 *
 * Fetches gift card data from dundle.com product pages.
 * dundle is an authorized reseller (green zone) that sells at face value.
 * Useful as reference pricing and for their loyalty coin program.
 *
 * Data is in JSON-LD schema.org Product markup embedded in the page.
 * Compliance: public pages only, no login, no anti-bot bypass.
 */

import type { SourceAdapter, AdapterResult, RawOffer, AdapterConfig } from "../types";

interface DundleProduct {
  slug: string;
  brandName: string;
  countries: string[];
}

const TRACKED_PRODUCTS: DundleProduct[] = [
  // Core brands (US)
  { slug: "steam", brandName: "Steam", countries: ["US", "Global"] },
  { slug: "apple-gift-card", brandName: "Apple", countries: ["US"] },
  { slug: "google-play", brandName: "Google Play", countries: ["US"] },
  { slug: "xbox-gift-card", brandName: "Xbox", countries: ["US", "Global"] },
  { slug: "playstation-store-gift-card", brandName: "PlayStation", countries: ["US"] },
  { slug: "spotify", brandName: "Spotify", countries: ["US", "Global"] },
  { slug: "nintendo-eshop-card", brandName: "Nintendo", countries: ["US"] },
  { slug: "netflix", brandName: "Netflix", countries: ["US"] },
  { slug: "uber", brandName: "Uber", countries: ["US"] },
  { slug: "doordash", brandName: "DoorDash", countries: ["US"] },
  { slug: "disney-plus", brandName: "Disney+", countries: ["US", "Global"] },
  // Gaming
  { slug: "roblox", brandName: "Roblox", countries: ["US", "Global"] },
  { slug: "valorant", brandName: "Valorant", countries: ["US", "EU", "Global"] },
  { slug: "ea-play", brandName: "EA Play", countries: ["US", "Global"] },
  { slug: "razer-gold", brandName: "Razer Gold", countries: ["US", "Global"] },
  { slug: "twitch", brandName: "Twitch", countries: ["US", "Global"] },
  { slug: "fortnite", brandName: "Fortnite", countries: ["US", "Global"] },
  { slug: "riot-access", brandName: "Riot Access", countries: ["US", "EU", "Global"] },
  { slug: "pubg-mobile", brandName: "PUBG", countries: ["US", "Global"] },
  { slug: "free-fire", brandName: "Free Fire", countries: ["US", "Global"] },
  // EU / UK
  { slug: "steam-europe", brandName: "Steam", countries: ["EU"] },
  { slug: "playstation-store-europe", brandName: "PlayStation", countries: ["EU"] },
  { slug: "xbox-europe", brandName: "Xbox", countries: ["EU"] },
  { slug: "nintendo-eshop-europe", brandName: "Nintendo", countries: ["EU"] },
  { slug: "apple-gift-card-uk", brandName: "Apple", countries: ["UK"] },
  { slug: "google-play-uk", brandName: "Google Play", countries: ["UK"] },
  { slug: "spotify-uk", brandName: "Spotify", countries: ["UK"] },
];

const BASE_URL = "https://www.dundle.com/us";
const USER_AGENT = "iGift/1.0 (deal-intelligence-platform; +https://igift.app)";

/** Parse JSON-LD schema data from the HTML */
function parseProductPage(html: string, product: DundleProduct): RawOffer[] {
  const offers: RawOffer[] = [];

  // Extract JSON-LD blocks
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;

  while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);

      // Look for Product schema with offers
      if (data["@type"] === "Product" && data.offers) {
        const offerList = Array.isArray(data.offers) ? data.offers : [data.offers];

        for (const offer of offerList) {
          const price = parseFloat(offer.price ?? offer.lowPrice ?? "0");
          if (price <= 0) continue;

          const currency = offer.priceCurrency ?? "USD";
          const available = offer.availability !== "https://schema.org/OutOfStock";
          if (!available) continue;

          const priceCents = Math.round(price * 100);

          // For dundle, face value typically equals price (no discount)
          const denomMatch = (offer.name ?? offer.sku ?? "").match(/\$?(\d+(?:\.\d{2})?)/);
          const denomination = denomMatch ? denomMatch[1] : String(price);
          const faceValueCents = priceCents;

          offers.push({
            externalId: `dundle-${product.slug}-${denomination}`,
            originalTitle: offer.name ?? `${product.brandName} Gift Card $${denomination}`,
            externalUrl: offer.url ?? `${BASE_URL}/${product.slug}/`,
            rawBrandName: product.brandName,
            faceValueCents,
            askingPriceCents: priceCents,
            feeTotalCents: 0,
            currency,
            denomination,
            countryRedeemable: product.countries,
            sellerName: null,
            sellerRating: null,
            hasBuyerProtection: true,
            rawSnapshot: {
              source: "dundle",
              productSlug: product.slug,
              schemaOffer: offer,
              fetchedAt: new Date().toISOString(),
            },
          });
        }
      }
    } catch {
      // Invalid JSON-LD — skip
    }
  }

  // Fallback: parse price data from visible text patterns
  if (offers.length === 0) {
    const pricePattern = /\$(\d+(?:\.\d{2})?)\s*(?:USD)?/g;
    let priceMatch;
    const seenPrices = new Set<string>();

    while ((priceMatch = pricePattern.exec(html)) !== null) {
      const priceStr = priceMatch[1];
      if (seenPrices.has(priceStr)) continue;
      seenPrices.add(priceStr);

      const price = parseFloat(priceStr);
      if (price < 5 || price > 500) continue;

      const priceCents = Math.round(price * 100);

      offers.push({
        externalId: `dundle-${product.slug}-${priceStr}`,
        originalTitle: `${product.brandName} Gift Card $${priceStr}`,
        externalUrl: `${BASE_URL}/${product.slug}/`,
        rawBrandName: product.brandName,
        faceValueCents: priceCents,
        askingPriceCents: priceCents,
        feeTotalCents: 0,
        currency: "USD",
        denomination: priceStr,
        countryRedeemable: product.countries,
        sellerName: null,
        sellerRating: null,
        hasBuyerProtection: true,
        rawSnapshot: {
          source: "dundle",
          productSlug: product.slug,
          parsedFrom: "fallback-price-pattern",
          fetchedAt: new Date().toISOString(),
        },
      });
    }
  }

  return offers;
}

async function fetchProductPage(
  product: DundleProduct,
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

export const dundleAdapter: SourceAdapter = {
  name: "dundle",
  sourceSlug: "dundle",

  async fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult> {
    const timeoutMs = config?.timeoutMs ?? 10000;
    const startTime = Date.now();
    const allOffers: RawOffer[] = [];
    const warnings: string[] = [];

    if (config?.dryRun) {
      return {
        sourceSlug: "dundle",
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

      await delay(500);
    }

    return {
      sourceSlug: "dundle",
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
