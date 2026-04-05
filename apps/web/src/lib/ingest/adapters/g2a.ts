/**
 * G2A.com adapter — live HTML scraper for public product pages.
 * G2A is a major marketplace (yellow trust zone — buyer protection varies by seller).
 * Prices extracted from JSON-LD, then __NEXT_DATA__, then meta tags.
 * Only fetches public, non-authenticated pages. Polite 700ms delay.
 *
 * Trust note: G2A is flagged yellow. Their buyer protection (G2A Shield) is opt-in.
 * We surface prices with appropriate trust scoring applied by the scoring engine.
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
    url: "https://www.g2a.com/steam-gift-card-5-usd-steam-key-united-states-of-america-i10000007062016",
  },
  {
    slug: "steam-10",
    brandSlug: "steam",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.g2a.com/steam-gift-card-10-usd-steam-key-united-states-of-america-i10000007062017",
  },
  {
    slug: "steam-20",
    brandSlug: "steam",
    faceValueCents: 2000,
    currency: "USD",
    url: "https://www.g2a.com/steam-gift-card-20-usd-steam-key-united-states-of-america-i10000007062018",
  },
  {
    slug: "steam-50",
    brandSlug: "steam",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.g2a.com/steam-gift-card-50-usd-steam-key-united-states-of-america-i10000007062019",
  },
  // Xbox
  {
    slug: "xbox-15",
    brandSlug: "xbox",
    faceValueCents: 1500,
    currency: "USD",
    url: "https://www.g2a.com/xbox-live-gift-card-15-usd-xbox-live-key-united-states-of-america-i10000001648001",
  },
  {
    slug: "xbox-25",
    brandSlug: "xbox",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.g2a.com/xbox-live-gift-card-25-usd-xbox-live-key-united-states-of-america-i10000001648002",
  },
  {
    slug: "xbox-50",
    brandSlug: "xbox",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.g2a.com/xbox-live-gift-card-50-usd-xbox-live-key-united-states-of-america-i10000001648003",
  },
  // PlayStation
  {
    slug: "psn-10",
    brandSlug: "playstation",
    faceValueCents: 1000,
    currency: "USD",
    url: "https://www.g2a.com/psn-gift-card-10-usd-psn-key-united-states-of-america-i10000001583001",
  },
  {
    slug: "psn-25",
    brandSlug: "playstation",
    faceValueCents: 2500,
    currency: "USD",
    url: "https://www.g2a.com/psn-gift-card-25-usd-psn-key-united-states-of-america-i10000001583002",
  },
  {
    slug: "psn-50",
    brandSlug: "playstation",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.g2a.com/psn-gift-card-50-usd-psn-key-united-states-of-america-i10000001583003",
  },
  // Nintendo
  {
    slug: "nintendo-20",
    brandSlug: "nintendo",
    faceValueCents: 2000,
    currency: "USD",
    url: "https://www.g2a.com/nintendo-eshop-card-20-usd-nintendo-key-united-states-of-america-i10000001736002",
  },
  {
    slug: "nintendo-50",
    brandSlug: "nintendo",
    faceValueCents: 5000,
    currency: "USD",
    url: "https://www.g2a.com/nintendo-eshop-card-50-usd-nintendo-key-united-states-of-america-i10000001736003",
  },
  // Valorant
  {
    slug: "valorant-1000vp",
    brandSlug: "valorant",
    faceValueCents: 999,
    currency: "USD",
    url: "https://www.g2a.com/valorant-1000-vp-valorant-key-global-i10000198238001",
  },
  {
    slug: "valorant-2050vp",
    brandSlug: "valorant",
    faceValueCents: 1999,
    currency: "USD",
    url: "https://www.g2a.com/valorant-2050-vp-valorant-key-global-i10000198238002",
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
 * Parse waterfall: JSON-LD → __NEXT_DATA__ → meta og:price:amount
 */
function parseG2APage(html: string, product: TrackedProduct): RawOffer | null {
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

  // 2. __NEXT_DATA__ (G2A uses Next.js)
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      const pageProps = nextData?.props?.pageProps;
      const price =
        pageProps?.product?.minPrice ??
        pageProps?.product?.price ??
        pageProps?.lowestOffer?.price;
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

  // 3. og:price:amount meta tag
  const ogMatch = html.match(
    /<meta[^>]+property="og:price:amount"[^>]*content="([\d.]+)"/i
  );
  if (ogMatch) {
    const askCents = Math.round(parseFloat(ogMatch[1]) * 100);
    if (askCents > 0) {
      return buildOffer(product, askCents, { source: "og-price", raw: ogMatch[0] });
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
    externalId: `g2a-${product.slug}`,
    originalTitle: `G2A ${product.brandSlug} ${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    externalUrl: product.url,
    rawBrandName: product.brandSlug,
    faceValueCents: product.faceValueCents,
    askingPriceCents,
    feeTotalCents: 0,
    currency: product.currency,
    denomination: `${product.currency} ${(product.faceValueCents / 100).toFixed(0)}`,
    countryRedeemable: ["US"],
    sellerName: null,
    // G2A is yellow zone — lower seller rating reflects platform-level trust variance
    sellerRating: 0.72,
    hasBuyerProtection: false, // Shield is opt-in per purchase, not guaranteed
    rawSnapshot,
  };
}

export const g2aAdapter: SourceAdapter = {
  name: "G2A",
  sourceSlug: "g2a",

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
      const offer = parseG2APage(html, product);
      if (offer) {
        offers.push(offer);
      } else {
        warnings.push(`Could not parse price for ${product.slug}`);
      }
    }

    return {
      sourceSlug: "g2a",
      offers,
      fetchedAt,
      durationMs: Date.now() - start,
      warnings,
      failed: offers.length === 0,
      failureReason: offers.length === 0 ? "No offers parsed" : undefined,
    };
  },
};
