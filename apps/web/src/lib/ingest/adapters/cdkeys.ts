/**
 * CDKeys.com adapter — live HTML scraper for public product pages.
 * CDKeys is a reputable authorized digital reseller (Trustpilot ~4.4/5).
 * Only fetches public, non-authenticated pages. Polite 500ms delay.
 */

import type { SourceAdapter, RawOffer, AdapterResult } from "../types";

const USER_AGENT =
  "iGift/1.0 (deal-intelligence-platform; +https://igift.app)";

interface TrackedProduct {
  slug: string;
  brandSlug: string;
  faceValueCents: number;
  currency: string;
  url: string;
}

const TRACKED_PRODUCTS: TrackedProduct[] = [
  // Steam
  {
    slug: "steam-5",
    brandSlug: "steam",
    faceValueCents: 500,
    currency: "USD",
    url: "https://www.cdkeys.com/steam/steam-5-usd-gift-card",
  },
  {
    slug: "steam-10",
    brandSlug: "steam",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.cdkeys.com/steam/steam-10-usd-gift-card",
  },
  {
    slug: "steam-20",
    brandSlug: "steam",
    faceValueCents: 2000,
    currency: "USD",
    url: "https://www.cdkeys.com/steam/steam-20-usd-gift-card",
  },
  {
    slug: "steam-50",
    brandSlug: "steam",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.cdkeys.com/steam/steam-50-usd-gift-card",
  },
  {
    slug: "steam-100",
    brandSlug: "steam",
    faceValueCents: 10000,
    currency: "USD",
    url: "https://www.cdkeys.com/steam/steam-100-usd-gift-card",
  },
  // Xbox
  {
    slug: "xbox-10",
    brandSlug: "xbox",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.cdkeys.com/xbox/xbox-10-usd-gift-card",
  },
  {
    slug: "xbox-25",
    brandSlug: "xbox",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.cdkeys.com/xbox/xbox-25-usd-gift-card",
  },
  {
    slug: "xbox-50",
    brandSlug: "xbox",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.cdkeys.com/xbox/xbox-50-usd-gift-card",
  },
  {
    slug: "xbox-100",
    brandSlug: "xbox",
    faceValueCents: 10000,
    currency: "USD",
    url: "https://www.cdkeys.com/xbox/xbox-100-usd-gift-card",
  },
  // PlayStation
  {
    slug: "psn-10",
    brandSlug: "playstation",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.cdkeys.com/playstation/psn-10-usd-gift-card",
  },
  {
    slug: "psn-25",
    brandSlug: "playstation",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.cdkeys.com/playstation/psn-25-usd-gift-card",
  },
  {
    slug: "psn-50",
    brandSlug: "playstation",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.cdkeys.com/playstation/psn-50-usd-gift-card",
  },
  {
    slug: "psn-100",
    brandSlug: "playstation",
    faceValueCents: 10000,
    currency: "USD",
    url: "https://www.cdkeys.com/playstation/psn-100-usd-gift-card",
  },
  // Nintendo
  {
    slug: "nintendo-10",
    brandSlug: "nintendo",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.cdkeys.com/nintendo/nintendo-10-usd-eshop-card",
  },
  {
    slug: "nintendo-20",
    brandSlug: "nintendo",
    faceValueCents: 2000,
    currency: "USD",
    url: "https://www.cdkeys.com/nintendo/nintendo-20-usd-eshop-card",
  },
  {
    slug: "nintendo-35",
    brandSlug: "nintendo",
    faceValueCents: 3500,
    currency: "USD",
    url: "https://www.cdkeys.com/nintendo/nintendo-35-usd-eshop-card",
  },
  {
    slug: "nintendo-50",
    brandSlug: "nintendo",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.cdkeys.com/nintendo/nintendo-50-usd-eshop-card",
  },
  // Google Play
  {
    slug: "google-play-25",
    brandSlug: "google-play",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.cdkeys.com/google/google-play-25-usd-gift-card",
  },
  {
    slug: "google-play-50",
    brandSlug: "google-play",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.cdkeys.com/google/google-play-50-usd-gift-card",
  },
  // Roblox
  {
    slug: "roblox-10",
    brandSlug: "roblox",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.cdkeys.com/roblox/roblox-10-usd-gift-card",
  },
  {
    slug: "roblox-25",
    brandSlug: "roblox",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.cdkeys.com/roblox/roblox-25-usd-gift-card",
  },
  {
    slug: "roblox-50",
    brandSlug: "roblox",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.cdkeys.com/roblox/roblox-50-usd-gift-card",
  },
  // Valorant Points
  {
    slug: "valorant-1000vp",
    brandSlug: "valorant",
    faceValueCents: 999,
    currency: "USD",
    url: "https://www.cdkeys.com/valorant/valorant-1000-vp",
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchProductPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse waterfall: JSON-LD → data-price-amount → itemprop="price"
 */
function parseCdKeysPage(
  html: string,
  product: TrackedProduct
): RawOffer | null {
  // 1. JSON-LD structured data
  const jsonLdMatch = html.match(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
  );
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      const offers = data.offers ?? data["@graph"]?.find((n: { "@type": string }) => n["@type"] === "Product")?.offers;
      const offer = Array.isArray(offers) ? offers[0] : offers;
      if (offer?.price) {
        const askCents = Math.round(parseFloat(offer.price) * 100);
        if (askCents > 0) {
          return buildOffer(product, askCents, { source: "json-ld", data });
        }
      }
    } catch {
      // fall through
    }
  }

  // 2. data-price-amount attribute (CDKeys product widget)
  const dataAttrMatch = html.match(/data-price-amount="([\d.]+)"/);
  if (dataAttrMatch) {
    const askCents = Math.round(parseFloat(dataAttrMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "data-price-amount", raw: dataAttrMatch[0] });
    }
  }

  // 3. itemprop="price" fallback
  const itempropMatch = html.match(/itemprop="price"[^>]*content="([\d.]+)"/);
  if (itempropMatch) {
    const askCents = Math.round(parseFloat(itempropMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "itemprop", raw: itempropMatch[0] });
    }
  }

  return null;
}

function buildOffer(
  product: TrackedProduct,
  askingPriceCents: number,
  rawSnapshot: Record<string, unknown>
): RawOffer {
  return {
    externalId: `cdkeys-${product.slug}`,
    originalTitle: `CDKeys ${product.brandSlug} ${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    externalUrl: product.url,
    rawBrandName: product.brandSlug,
    faceValueCents: product.faceValueCents,
    askingPriceCents,
    feeTotalCents: 0,
    currency: product.currency,
    denomination: `${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    countryRedeemable: ["US"],
    sellerName: null,
    sellerRating: 0.88,
    hasBuyerProtection: true,
    rawSnapshot,
  };
}

export const cdkeysAdapter: SourceAdapter = {
  name: "CDKeys",
  sourceSlug: "cdkeys",

  async fetchOffers(): Promise<AdapterResult> {
    const fetchedAt = new Date();
    const start = Date.now();
    const offers: RawOffer[] = [];
    const warnings: string[] = [];

    for (const product of TRACKED_PRODUCTS) {
      await delay(500);
      const html = await fetchProductPage(product.url);
      if (!html) {
        warnings.push(`Failed to fetch ${product.slug}`);
        continue;
      }
      const offer = parseCdKeysPage(html, product);
      if (offer) {
        offers.push(offer);
      } else {
        warnings.push(`Could not parse price for ${product.slug}`);
      }
    }

    return {
      sourceSlug: "cdkeys",
      offers,
      fetchedAt,
      durationMs: Date.now() - start,
      warnings,
      failed: offers.length === 0,
      failureReason: offers.length === 0 ? "No offers parsed" : undefined,
    };
  },
};
