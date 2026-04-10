/**
 * Kinguin.net adapter — live HTML scraper for public product pages.
 * Kinguin is a Polish marketplace (yellow trust zone — authorized reseller mix).
 * Prices extracted from JSON-LD, then data attributes. Polite 700ms delay.
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
  { slug: "steam-5", brandSlug: "steam", faceValueCents: 500, currency: "USD", url: "https://www.kinguin.net/category/164/steam-5-usd-gift-card" },
  { slug: "steam-10", brandSlug: "steam", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/163/steam-10-usd-gift-card" },
  { slug: "steam-20", brandSlug: "steam", faceValueCents: 2000, currency: "USD", url: "https://www.kinguin.net/category/1074/steam-20-usd-gift-card" },
  { slug: "steam-50", brandSlug: "steam", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/1075/steam-50-usd-gift-card" },
  { slug: "steam-100", brandSlug: "steam", faceValueCents: 10000, currency: "USD", url: "https://www.kinguin.net/category/1076/steam-100-usd-gift-card" },
  // Steam (EUR)
  { slug: "steam-10-eur", brandSlug: "steam", faceValueCents: 1000, currency: "EUR", url: "https://www.kinguin.net/category/165/steam-10-eur-gift-card" },
  { slug: "steam-20-eur", brandSlug: "steam", faceValueCents: 2000, currency: "EUR", url: "https://www.kinguin.net/category/166/steam-20-eur-gift-card" },
  { slug: "steam-50-eur", brandSlug: "steam", faceValueCents: 5000, currency: "EUR", url: "https://www.kinguin.net/category/167/steam-50-eur-gift-card" },
  // Xbox
  { slug: "xbox-15", brandSlug: "xbox", faceValueCents: 1500, currency: "USD", url: "https://www.kinguin.net/category/56/xbox-live-15-usd-gift-card" },
  { slug: "xbox-25", brandSlug: "xbox", faceValueCents: 2500, currency: "USD", url: "https://www.kinguin.net/category/57/xbox-live-25-usd-gift-card" },
  { slug: "xbox-50", brandSlug: "xbox", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/58/xbox-live-50-usd-gift-card" },
  { slug: "xbox-100", brandSlug: "xbox", faceValueCents: 10000, currency: "USD", url: "https://www.kinguin.net/category/59/xbox-live-100-usd-gift-card" },
  // PlayStation
  { slug: "psn-10", brandSlug: "playstation", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/43/psn-card-10-usd" },
  { slug: "psn-25", brandSlug: "playstation", faceValueCents: 2500, currency: "USD", url: "https://www.kinguin.net/category/44/psn-card-25-usd" },
  { slug: "psn-50", brandSlug: "playstation", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/45/psn-card-50-usd" },
  { slug: "psn-100", brandSlug: "playstation", faceValueCents: 10000, currency: "USD", url: "https://www.kinguin.net/category/46/psn-card-100-usd" },
  // Nintendo
  { slug: "nintendo-10", brandSlug: "nintendo", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/215/nintendo-eshop-10-usd-gift-card" },
  { slug: "nintendo-20", brandSlug: "nintendo", faceValueCents: 2000, currency: "USD", url: "https://www.kinguin.net/category/216/nintendo-eshop-20-usd-gift-card" },
  { slug: "nintendo-50", brandSlug: "nintendo", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/217/nintendo-eshop-50-usd-gift-card" },
  // Google Play
  { slug: "google-play-10", brandSlug: "google-play", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/90115/google-play-10-usd-gift-card" },
  { slug: "google-play-25", brandSlug: "google-play", faceValueCents: 2500, currency: "USD", url: "https://www.kinguin.net/category/90116/google-play-25-usd-gift-card" },
  { slug: "google-play-50", brandSlug: "google-play", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/90117/google-play-50-usd-gift-card" },
  // Apple / iTunes
  { slug: "apple-10", brandSlug: "apple", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/201/apple-itunes-10-usd-gift-card" },
  { slug: "apple-25", brandSlug: "apple", faceValueCents: 2500, currency: "USD", url: "https://www.kinguin.net/category/202/apple-itunes-25-usd-gift-card" },
  { slug: "apple-50", brandSlug: "apple", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/203/apple-itunes-50-usd-gift-card" },
  { slug: "apple-100", brandSlug: "apple", faceValueCents: 10000, currency: "USD", url: "https://www.kinguin.net/category/204/apple-itunes-100-usd-gift-card" },
  // Roblox
  { slug: "roblox-10", brandSlug: "roblox", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/94060/roblox-10-usd-gift-card" },
  { slug: "roblox-25", brandSlug: "roblox", faceValueCents: 2500, currency: "USD", url: "https://www.kinguin.net/category/94061/roblox-25-usd-gift-card" },
  { slug: "roblox-50", brandSlug: "roblox", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/94062/roblox-50-usd-gift-card" },
  // Valorant
  { slug: "valorant-1000vp", brandSlug: "valorant", faceValueCents: 999, currency: "USD", url: "https://www.kinguin.net/category/200413/valorant-1000-vp" },
  { slug: "valorant-2050vp", brandSlug: "valorant", faceValueCents: 1999, currency: "USD", url: "https://www.kinguin.net/category/200414/valorant-2050-vp" },
  // Spotify
  { slug: "spotify-10", brandSlug: "spotify", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/182/spotify-10-usd-gift-card" },
  { slug: "spotify-30", brandSlug: "spotify", faceValueCents: 3000, currency: "USD", url: "https://www.kinguin.net/category/183/spotify-30-usd-gift-card" },
  // Netflix
  { slug: "netflix-25", brandSlug: "netflix", faceValueCents: 2500, currency: "USD", url: "https://www.kinguin.net/category/178/netflix-25-usd-gift-card" },
  { slug: "netflix-50", brandSlug: "netflix", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/179/netflix-50-usd-gift-card" },
  // EA Play
  { slug: "ea-play-1m", brandSlug: "ea-play", faceValueCents: 499, currency: "USD", url: "https://www.kinguin.net/category/200001/ea-play-1-month" },
  { slug: "ea-play-12m", brandSlug: "ea-play", faceValueCents: 2999, currency: "USD", url: "https://www.kinguin.net/category/200002/ea-play-12-months" },
  // Razer Gold
  { slug: "razer-gold-10", brandSlug: "razer-gold", faceValueCents: 1000, currency: "USD", url: "https://www.kinguin.net/category/100001/razer-gold-10-usd" },
  { slug: "razer-gold-25", brandSlug: "razer-gold", faceValueCents: 2500, currency: "USD", url: "https://www.kinguin.net/category/100002/razer-gold-25-usd" },
  { slug: "razer-gold-50", brandSlug: "razer-gold", faceValueCents: 5000, currency: "USD", url: "https://www.kinguin.net/category/100003/razer-gold-50-usd" },
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
 * Parse waterfall: JSON-LD → data-cheapest-price → .product-price regex
 */
function parseKinguinPage(
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
      if (offer?.lowPrice ?? offer?.price) {
        const priceStr = offer.lowPrice ?? offer.price;
        const askCents = Math.round(parseFloat(priceStr) * 100);
        if (askCents > 0) {
          return buildOffer(product, askCents, { source: "json-ld", data });
        }
      }
    } catch {
      // fall through
    }
  }

  // 2. Kinguin custom data attribute for cheapest listing
  const cheapestMatch = html.match(/data-cheapest-price="([\d.]+)"/);
  if (cheapestMatch) {
    const askCents = Math.round(parseFloat(cheapestMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "data-cheapest-price", raw: cheapestMatch[0] });
    }
  }

  // 3. Product price element regex
  const productPriceMatch = html.match(
    /class="[^"]*product-price[^"]*"[^>]*>\s*\$?([\d]+\.[\d]{2})/i
  );
  if (productPriceMatch) {
    const askCents = Math.round(parseFloat(productPriceMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "product-price", raw: productPriceMatch[0] });
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
    externalId: `kinguin-${product.slug}`,
    originalTitle: `Kinguin ${product.brandSlug} ${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    externalUrl: product.url,
    rawBrandName: product.brandSlug,
    faceValueCents: product.faceValueCents,
    askingPriceCents,
    feeTotalCents: 0,
    currency: product.currency,
    denomination: `${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    countryRedeemable: countriesForCurrency(product.currency),
    sellerName: null,
    // Kinguin yellow zone — seller mix varies, platform has own protection program
    sellerRating: 0.74,
    hasBuyerProtection: true,
    rawSnapshot,
  };
}

export const kinguinAdapter: SourceAdapter = {
  name: "Kinguin",
  sourceSlug: "kinguin",

  async fetchOffers(): Promise<AdapterResult> {
    const fetchedAt = new Date();
    const start = Date.now();
    const offers: RawOffer[] = [];
    const warnings: string[] = [];

    for (const product of TRACKED_PRODUCTS) {
      await delay(700);
      const html = await fetchProductPage(product.url);
      if (!html) {
        warnings.push(`Failed to fetch ${product.slug}`);
        continue;
      }
      const offer = parseKinguinPage(html, product);
      if (offer) {
        offers.push(offer);
      } else {
        warnings.push(`Could not parse price for ${product.slug}`);
      }
    }

    return {
      sourceSlug: "kinguin",
      offers,
      fetchedAt,
      durationMs: Date.now() - start,
      warnings,
      failed: offers.length === 0,
      failureReason: offers.length === 0 ? "No offers parsed" : undefined,
    };
  },
};
