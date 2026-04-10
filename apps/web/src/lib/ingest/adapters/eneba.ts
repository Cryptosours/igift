/**
 * Eneba.com adapter — live HTML scraper for public product pages.
 * Eneba is an EU-regulated marketplace (green/yellow zone depending on seller).
 * Prices extracted from embedded __NEXT_DATA__ JSON, with JSON-LD fallback.
 * Only fetches public, non-authenticated pages. Polite 600ms delay.
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

function countriesForCurrency(currency: string): string[] {
  switch (currency.toUpperCase()) {
    case "EUR":
      return ["EU"];
    case "GBP":
      return ["UK"];
    case "AUD":
      return ["AU"];
    default:
      return ["US"];
  }
}

const TRACKED_PRODUCTS: TrackedProduct[] = [
  // Steam (USD)
  { slug: "steam-5", brandSlug: "steam", faceValueCents: 500, currency: "USD", url: "https://www.eneba.com/us/steam-steam-5-usd-gift-card-united-states" },
  { slug: "steam-10", brandSlug: "steam", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/steam-steam-10-usd-gift-card-united-states" },
  { slug: "steam-20", brandSlug: "steam", faceValueCents: 2000, currency: "USD", url: "https://www.eneba.com/us/steam-steam-20-usd-gift-card-united-states" },
  { slug: "steam-50", brandSlug: "steam", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/steam-steam-50-usd-gift-card-united-states" },
  { slug: "steam-100", brandSlug: "steam", faceValueCents: 10000, currency: "USD", url: "https://www.eneba.com/us/steam-steam-100-usd-gift-card-united-states" },
  // Steam (EUR)
  { slug: "steam-10-eur", brandSlug: "steam", faceValueCents: 1000, currency: "EUR", url: "https://www.eneba.com/steam-steam-10-eur-gift-card-europe" },
  { slug: "steam-20-eur", brandSlug: "steam", faceValueCents: 2000, currency: "EUR", url: "https://www.eneba.com/steam-steam-20-eur-gift-card-europe" },
  { slug: "steam-50-eur", brandSlug: "steam", faceValueCents: 5000, currency: "EUR", url: "https://www.eneba.com/steam-steam-50-eur-gift-card-europe" },
  // Xbox
  { slug: "xbox-15", brandSlug: "xbox", faceValueCents: 1500, currency: "USD", url: "https://www.eneba.com/us/xbox-xbox-15-usd-gift-card-united-states" },
  { slug: "xbox-25", brandSlug: "xbox", faceValueCents: 2500, currency: "USD", url: "https://www.eneba.com/us/xbox-xbox-25-usd-gift-card-united-states" },
  { slug: "xbox-50", brandSlug: "xbox", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/xbox-xbox-50-usd-gift-card-united-states" },
  { slug: "xbox-100", brandSlug: "xbox", faceValueCents: 10000, currency: "USD", url: "https://www.eneba.com/us/xbox-xbox-100-usd-gift-card-united-states" },
  // PlayStation
  { slug: "psn-10", brandSlug: "playstation", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/playstation-psn-10-usd-gift-card-usa" },
  { slug: "psn-25", brandSlug: "playstation", faceValueCents: 2500, currency: "USD", url: "https://www.eneba.com/us/playstation-psn-25-usd-gift-card-usa" },
  { slug: "psn-50", brandSlug: "playstation", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/playstation-psn-50-usd-gift-card-usa" },
  { slug: "psn-100", brandSlug: "playstation", faceValueCents: 10000, currency: "USD", url: "https://www.eneba.com/us/playstation-psn-100-usd-gift-card-usa" },
  // Nintendo
  { slug: "nintendo-10", brandSlug: "nintendo", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/nintendo-nintendo-eshop-10-usd-gift-card-united-states" },
  { slug: "nintendo-20", brandSlug: "nintendo", faceValueCents: 2000, currency: "USD", url: "https://www.eneba.com/us/nintendo-nintendo-eshop-20-usd-gift-card-united-states" },
  { slug: "nintendo-50", brandSlug: "nintendo", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/nintendo-nintendo-eshop-50-usd-gift-card-united-states" },
  // Google Play
  { slug: "google-play-10", brandSlug: "google-play", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/google-play-google-play-10-usd-gift-card-united-states" },
  { slug: "google-play-25", brandSlug: "google-play", faceValueCents: 2500, currency: "USD", url: "https://www.eneba.com/us/google-play-google-play-25-usd-gift-card-united-states" },
  { slug: "google-play-50", brandSlug: "google-play", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/google-play-google-play-50-usd-gift-card-united-states" },
  // Apple / iTunes
  { slug: "apple-10", brandSlug: "apple", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/apple-itunes-10-usd-gift-card-united-states" },
  { slug: "apple-25", brandSlug: "apple", faceValueCents: 2500, currency: "USD", url: "https://www.eneba.com/us/apple-itunes-25-usd-gift-card-united-states" },
  { slug: "apple-50", brandSlug: "apple", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/apple-itunes-50-usd-gift-card-united-states" },
  { slug: "apple-100", brandSlug: "apple", faceValueCents: 10000, currency: "USD", url: "https://www.eneba.com/us/apple-itunes-100-usd-gift-card-united-states" },
  // Roblox
  { slug: "roblox-10", brandSlug: "roblox", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/roblox-roblox-10-usd-gift-card-united-states" },
  { slug: "roblox-25", brandSlug: "roblox", faceValueCents: 2500, currency: "USD", url: "https://www.eneba.com/us/roblox-roblox-25-usd-gift-card-united-states" },
  { slug: "roblox-50", brandSlug: "roblox", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/roblox-roblox-50-usd-gift-card-united-states" },
  // Spotify
  { slug: "spotify-10", brandSlug: "spotify", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/spotify-spotify-10-usd-gift-card-united-states" },
  { slug: "spotify-30", brandSlug: "spotify", faceValueCents: 3000, currency: "USD", url: "https://www.eneba.com/us/spotify-spotify-30-usd-gift-card-united-states" },
  // Netflix
  { slug: "netflix-25", brandSlug: "netflix", faceValueCents: 2500, currency: "USD", url: "https://www.eneba.com/us/netflix-netflix-25-usd-gift-card-united-states" },
  { slug: "netflix-50", brandSlug: "netflix", faceValueCents: 5000, currency: "USD", url: "https://www.eneba.com/us/netflix-netflix-50-usd-gift-card-united-states" },
  // EA Play
  { slug: "ea-play-1m", brandSlug: "ea-play", faceValueCents: 499, currency: "USD", url: "https://www.eneba.com/us/ea-play-1-month-subscription-united-states" },
  // Razer Gold
  { slug: "razer-gold-10", brandSlug: "razer-gold", faceValueCents: 1000, currency: "USD", url: "https://www.eneba.com/us/razer-gold-razer-gold-10-usd" },
  { slug: "razer-gold-25", brandSlug: "razer-gold", faceValueCents: 2500, currency: "USD", url: "https://www.eneba.com/us/razer-gold-razer-gold-25-usd" },
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
 * Parse waterfall: __NEXT_DATA__ JSON → JSON-LD → meta[property="product:price:amount"]
 */
function parseEnebaPage(
  html: string,
  product: TrackedProduct
): RawOffer | null {
  // 1. Next.js __NEXT_DATA__ embedded JSON (most reliable for Eneba)
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      // Eneba stores lowest price in pageProps.product.price or auctions[0].price
      const pageProps = nextData?.props?.pageProps;
      const price =
        pageProps?.product?.lowestListingPrice?.amount ??
        pageProps?.product?.price?.amount ??
        pageProps?.auctions?.[0]?.price?.amount;
      if (price != null) {
        const askCents = Math.round(parseFloat(String(price)) * 100);
        if (askCents > 0) {
          return buildOffer(product, askCents, { source: "__NEXT_DATA__", price });
        }
      }
    } catch {
      // fall through
    }
  }

  // 2. JSON-LD structured data
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

  // 3. Open Graph / meta price tag
  const ogPriceMatch = html.match(
    /<meta[^>]+property="product:price:amount"[^>]*content="([\d.]+)"/i
  );
  if (ogPriceMatch) {
    const askCents = Math.round(parseFloat(ogPriceMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "og-price", raw: ogPriceMatch[0] });
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
    externalId: `eneba-${product.slug}`,
    originalTitle: `Eneba ${product.brandSlug} ${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    externalUrl: product.url,
    rawBrandName: product.brandSlug,
    faceValueCents: product.faceValueCents,
    askingPriceCents,
    feeTotalCents: 0,
    currency: product.currency,
    denomination: `${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    countryRedeemable: countriesForCurrency(product.currency),
    sellerName: null,
    sellerRating: 0.82,
    hasBuyerProtection: true,
    rawSnapshot,
  };
}

export const enebaAdapter: SourceAdapter = {
  name: "Eneba",
  sourceSlug: "eneba",

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
      const offer = parseEnebaPage(html, product);
      if (offer) {
        offers.push(offer);
      } else {
        warnings.push(`Could not parse price for ${product.slug}`);
      }
    }

    return {
      sourceSlug: "eneba",
      offers,
      fetchedAt,
      durationMs: Date.now() - start,
      warnings,
      failed: offers.length === 0,
      failureReason: offers.length === 0 ? "No offers parsed" : undefined,
    };
  },
};
