/**
 * Gameflip Source Adapter
 *
 * Fetches gift card data from Gameflip.com.
 * Gameflip is a gaming-focused marketplace (yellow zone) with buyer protection.
 * They specialize in gaming gift cards, game keys, and digital items.
 *
 * Data is extracted from public gift card category pages.
 * Compliance: public pages only, no login, no anti-bot bypass.
 */

import type { SourceAdapter, AdapterResult, RawOffer, AdapterConfig } from "../types";

interface GameflipProduct {
  slug: string;
  brandName: string;
  countries: string[];
  searchQuery: string;
}

const TRACKED_PRODUCTS: GameflipProduct[] = [
  { slug: "steam", brandName: "Steam", countries: ["US", "Global"], searchQuery: "steam+gift+card" },
  { slug: "xbox", brandName: "Xbox", countries: ["US", "Global"], searchQuery: "xbox+gift+card" },
  { slug: "playstation", brandName: "PlayStation", countries: ["US"], searchQuery: "playstation+gift+card" },
  { slug: "nintendo", brandName: "Nintendo", countries: ["US"], searchQuery: "nintendo+eshop+gift+card" },
  { slug: "google-play", brandName: "Google Play", countries: ["US"], searchQuery: "google+play+gift+card" },
  { slug: "apple", brandName: "Apple", countries: ["US"], searchQuery: "apple+gift+card" },
  { slug: "xbox-game-pass", brandName: "Xbox", countries: ["US", "Global"], searchQuery: "xbox+game+pass" },
  { slug: "spotify", brandName: "Spotify", countries: ["US", "Global"], searchQuery: "spotify+gift+card" },
  { slug: "netflix", brandName: "Netflix", countries: ["US"], searchQuery: "netflix+gift+card" },
  { slug: "amazon", brandName: "Amazon", countries: ["US"], searchQuery: "amazon+gift+card" },
];

const BASE_URL = "https://gameflip.com/browse/gift-cards";
const USER_AGENT = "iGift/1.0 (deal-intelligence-platform; +https://igift.app)";

/**
 * Parse gift card listing data from Gameflip pages.
 * Gameflip embeds listing data in structured formats and visible price elements.
 */
function parseProductPage(html: string, product: GameflipProduct): RawOffer[] {
  const offers: RawOffer[] = [];
  const seenKeys = new Set<string>();

  // Strategy 1: Parse JSON-LD data
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;

  while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);

      // Handle ItemList with individual listings
      if (data["@type"] === "ItemList" && data.itemListElement) {
        for (const item of data.itemListElement) {
          const listItem = item.item ?? item;
          if (!listItem.offers) continue;

          const offerData = Array.isArray(listItem.offers) ? listItem.offers[0] : listItem.offers;
          const price = parseFloat(offerData.price ?? "0");
          if (price <= 0 || price > 500) continue;

          // Try to extract face value from listing name
          const nameMatch = (listItem.name ?? "").match(/\$(\d+(?:\.\d{2})?)/);
          const faceValue = nameMatch ? parseFloat(nameMatch[1]) : price;

          const denomination = String(faceValue);
          const key = `jsonld-${denomination}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          offers.push({
            externalId: `gameflip-${product.slug}-${denomination}`,
            originalTitle: listItem.name ?? `${product.brandName} Gift Card $${denomination}`,
            externalUrl: listItem.url ?? `${BASE_URL}?q=${product.searchQuery}`,
            rawBrandName: product.brandName,
            faceValueCents: Math.round(faceValue * 100),
            askingPriceCents: Math.round(price * 100),
            feeTotalCents: 0,
            currency: offerData.priceCurrency ?? "USD",
            denomination,
            countryRedeemable: product.countries,
            sellerName: offerData.seller?.name ?? null,
            sellerRating: null,
            hasBuyerProtection: true, // Gameflip has buyer protection
            rawSnapshot: {
              source: "gameflip",
              productSlug: product.slug,
              schemaItem: listItem,
              fetchedAt: new Date().toISOString(),
            },
          });
        }
      }

      // Handle single Product
      if (data["@type"] === "Product" && data.offers) {
        const offerData = Array.isArray(data.offers) ? data.offers[0] : data.offers;
        const price = parseFloat(offerData.price ?? offerData.lowPrice ?? "0");
        if (price > 0 && price <= 500) {
          const nameMatch = (data.name ?? "").match(/\$(\d+(?:\.\d{2})?)/);
          const faceValue = nameMatch ? parseFloat(nameMatch[1]) : price;

          const denomination = String(faceValue);
          const key = `product-${denomination}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);

            offers.push({
              externalId: `gameflip-${product.slug}-${denomination}`,
              originalTitle: data.name ?? `${product.brandName} Gift Card $${denomination}`,
              externalUrl: offerData.url ?? `${BASE_URL}?q=${product.searchQuery}`,
              rawBrandName: product.brandName,
              faceValueCents: Math.round(faceValue * 100),
              askingPriceCents: Math.round(price * 100),
              feeTotalCents: 0,
              currency: offerData.priceCurrency ?? "USD",
              denomination,
              countryRedeemable: product.countries,
              sellerName: null,
              sellerRating: null,
              hasBuyerProtection: true,
              rawSnapshot: {
                source: "gameflip",
                productSlug: product.slug,
                schemaOffer: offerData,
                fetchedAt: new Date().toISOString(),
              },
            });
          }
        }
      }
    } catch {
      // Invalid JSON-LD — try next block
    }
  }

  // Strategy 2: Parse visible price data from listing cards
  if (offers.length === 0) {
    const listingPattern = /\$(\d+(?:\.\d{2})?)\s*(?:[\s\S]{0,50}?)(?:gift\s*card|\$(\d+))/gi;
    let listMatch;

    while ((listMatch = listingPattern.exec(html)) !== null) {
      const askingPrice = parseFloat(listMatch[1]);
      const faceValueFromContext = listMatch[2] ? parseFloat(listMatch[2]) : null;

      if (askingPrice < 5 || askingPrice > 500) continue;

      const faceValue = faceValueFromContext ?? askingPrice;
      const denomination = String(faceValue);
      const key = `listing-${denomination}-${askingPrice}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      offers.push({
        externalId: `gameflip-${product.slug}-${denomination}-${askingPrice}`,
        originalTitle: `${product.brandName} Gift Card $${denomination}`,
        externalUrl: `${BASE_URL}?q=${product.searchQuery}`,
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
          source: "gameflip",
          productSlug: product.slug,
          parsedFrom: "fallback-listing-pattern",
          fetchedAt: new Date().toISOString(),
        },
      });
    }
  }

  return offers;
}

async function fetchProductPage(
  product: GameflipProduct,
  timeoutMs: number,
): Promise<{ offers: RawOffer[]; warning?: string }> {
  const url = `${BASE_URL}?q=${product.searchQuery}`;
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
        warning: `${product.slug}: no listing data found`,
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

export const gameflipAdapter: SourceAdapter = {
  name: "Gameflip",
  sourceSlug: "gameflip",

  async fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult> {
    const timeoutMs = config?.timeoutMs ?? 10000;
    const startTime = Date.now();
    const allOffers: RawOffer[] = [];
    const warnings: string[] = [];

    if (config?.dryRun) {
      return {
        sourceSlug: "gameflip",
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

      await delay(700); // Polite delay between requests
    }

    return {
      sourceSlug: "gameflip",
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
