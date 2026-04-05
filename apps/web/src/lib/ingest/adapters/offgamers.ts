/**
 * OffGamers.com adapter — live HTML scraper for public product pages.
 * OffGamers is an Asian-based digital marketplace with strong global coverage.
 * Prices extracted from JSON-LD, then data attributes. Polite 600ms delay.
 * Only fetches public, non-authenticated pages.
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
    slug: "steam-10",
    brandSlug: "steam",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-steam-wallet-code-usd.html",
  },
  {
    slug: "steam-20",
    brandSlug: "steam",
    faceValueCents: 2000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-steam-wallet-code-usd-20.html",
  },
  {
    slug: "steam-50",
    brandSlug: "steam",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-steam-wallet-code-usd-50.html",
  },
  // Xbox
  {
    slug: "xbox-10",
    brandSlug: "xbox",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-xbox-live-gift-card-usd-10.html",
  },
  {
    slug: "xbox-25",
    brandSlug: "xbox",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-xbox-live-gift-card-usd-25.html",
  },
  {
    slug: "xbox-50",
    brandSlug: "xbox",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-xbox-live-gift-card-usd-50.html",
  },
  // PlayStation
  {
    slug: "psn-10",
    brandSlug: "playstation",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-psn-gift-card-usd-10.html",
  },
  {
    slug: "psn-25",
    brandSlug: "playstation",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-psn-gift-card-usd-25.html",
  },
  {
    slug: "psn-50",
    brandSlug: "playstation",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-psn-gift-card-usd-50.html",
  },
  // Nintendo
  {
    slug: "nintendo-10",
    brandSlug: "nintendo",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-nintendo-eshop-gift-card-usd-10.html",
  },
  {
    slug: "nintendo-20",
    brandSlug: "nintendo",
    faceValueCents: 2000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-nintendo-eshop-gift-card-usd-20.html",
  },
  {
    slug: "nintendo-50",
    brandSlug: "nintendo",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-nintendo-eshop-gift-card-usd-50.html",
  },
  // Google Play
  {
    slug: "google-play-10",
    brandSlug: "google-play",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-google-play-gift-card-usd-10.html",
  },
  {
    slug: "google-play-25",
    brandSlug: "google-play",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-google-play-gift-card-usd-25.html",
  },
  // Roblox
  {
    slug: "roblox-10",
    brandSlug: "roblox",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-roblox-gift-card-usd-10.html",
  },
  {
    slug: "roblox-25",
    brandSlug: "roblox",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.offgamers.com/game-card/game-points/buy-roblox-gift-card-usd-25.html",
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
 * Parse waterfall: JSON-LD → data-price → span.price-tag regex
 */
function parseOffGamersPage(
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

  // 2. data-price attribute (OffGamers custom widget)
  const dataPriceMatch = html.match(/data-price="([\d.]+)"/);
  if (dataPriceMatch) {
    const askCents = Math.round(parseFloat(dataPriceMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "data-price", raw: dataPriceMatch[0] });
    }
  }

  // 3. Price span regex — matches common "USD X.XX" patterns
  const priceSpanMatch = html.match(
    /class="[^"]*price[^"]*"[^>]*>\s*\$?\s*([\d]+\.[\d]{2})/i
  );
  if (priceSpanMatch) {
    const askCents = Math.round(parseFloat(priceSpanMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "price-span", raw: priceSpanMatch[0] });
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
    externalId: `offgamers-${product.slug}`,
    originalTitle: `OffGamers ${product.brandSlug} ${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    externalUrl: product.url,
    rawBrandName: product.brandSlug,
    faceValueCents: product.faceValueCents,
    askingPriceCents,
    feeTotalCents: 0,
    currency: product.currency,
    denomination: `${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    countryRedeemable: ["US"],
    sellerName: null,
    sellerRating: 0.80,
    hasBuyerProtection: true,
    rawSnapshot,
  };
}

export const offgamersAdapter: SourceAdapter = {
  name: "OffGamers",
  sourceSlug: "offgamers",

  async fetchOffers(): Promise<AdapterResult> {
    const fetchedAt = new Date();
    const start = Date.now();
    const offers: RawOffer[] = [];
    const warnings: string[] = [];

    for (const product of TRACKED_PRODUCTS) {
      await delay(600);
      const html = await fetchProductPage(product.url);
      if (!html) {
        warnings.push(`Failed to fetch ${product.slug}`);
        continue;
      }
      const offer = parseOffGamersPage(html, product);
      if (offer) {
        offers.push(offer);
      } else {
        warnings.push(`Could not parse price for ${product.slug}`);
      }
    }

    return {
      sourceSlug: "offgamers",
      offers,
      fetchedAt,
      durationMs: Date.now() - start,
      warnings,
      failed: offers.length === 0,
      failureReason: offers.length === 0 ? "No offers parsed" : undefined,
    };
  },
};
