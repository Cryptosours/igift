/**
 * Bitrefill Source Adapter
 *
 * Fetches gift card data from Bitrefill product pages.
 * Each product page embeds pricing data in a TanStack Query dehydrated state.
 *
 * Compliance: public pages only, no login, no anti-bot bypass.
 * Pricing: Bitrefill charges a small markup but may offer cashback.
 * Effective price = askingPrice - (faceValue * cashbackPct / 100)
 */

import type { SourceAdapter, AdapterResult, RawOffer, AdapterConfig } from "../types";

/** Products we track on Bitrefill — slug maps to their URL path */
interface BitrefillProduct {
  slug: string;
  brandName: string;
  countries: string[];
}

const TRACKED_PRODUCTS: BitrefillProduct[] = [
  { slug: "steam-usa", brandName: "Steam", countries: ["US"] },
  { slug: "amazon_com-usa", brandName: "Amazon", countries: ["US"] },
  { slug: "uber-usa", brandName: "Uber", countries: ["US"] },
  { slug: "netflix-usa", brandName: "Netflix", countries: ["US"] },
  { slug: "google-play-usa", brandName: "Google Play", countries: ["US"] },
  { slug: "apple-usa", brandName: "Apple", countries: ["US"] },
  { slug: "playstation-store-usa", brandName: "PlayStation", countries: ["US"] },
  { slug: "xbox-usa", brandName: "Xbox", countries: ["US"] },
  { slug: "spotify-usa", brandName: "Spotify", countries: ["US"] },
  { slug: "nintendo-eshop-usa", brandName: "Nintendo", countries: ["US"] },
  { slug: "doordash-usa", brandName: "DoorDash", countries: ["US"] },
  { slug: "disney-plus-usa", brandName: "Disney+", countries: ["US"] },
];

const BASE_URL = "https://www.bitrefill.com/us/en/gift-cards";
const USER_AGENT = "iGift/1.0 (deal-intelligence-platform; +https://igift.app)";

/** Parse price data from the HTML of a Bitrefill product page */
function parseProductPage(html: string, product: BitrefillProduct): RawOffer[] {
  const offers: RawOffer[] = [];

  // Extract cashback percentage
  let cashbackPct = 0;
  const cashbackMatch = html.match(/"cashbackPercentageFinal"\s*:\s*(\d+(?:\.\d+)?)/);
  if (cashbackMatch) {
    cashbackPct = parseFloat(cashbackMatch[1]);
  }

  // Check if cashback is disabled
  const cashbackDisabled = html.includes('"cashbackDisabled":true');
  if (cashbackDisabled) cashbackPct = 0;

  // Extract denominations and prices
  // Bitrefill embeds denomination data as objects with `amount` and `prices.USD` fields
  // Pattern: {"amount":50,...,"prices":{"USD":5366,...}}
  const denomPattern = /"amount"\s*:\s*(\d+(?:\.\d+)?)\s*,[\s\S]*?"prices"\s*:\s*\{[^}]*?"USD"\s*:\s*(\d+(?:\.\d+)?)/g;
  let match;

  const seenAmounts = new Set<number>();
  while ((match = denomPattern.exec(html)) !== null) {
    const faceValueDollars = parseFloat(match[1]);
    const askingPriceCents = Math.round(parseFloat(match[2]));

    // Skip duplicates (the data appears multiple times in dehydrated state)
    if (seenAmounts.has(faceValueDollars)) continue;
    seenAmounts.add(faceValueDollars);

    // Skip very small denominations (gift card amounts, not transaction fees)
    if (faceValueDollars < 5) continue;

    const faceValueCents = Math.round(faceValueDollars * 100);

    // Effective fee: the markup Bitrefill charges
    const feeTotalCents = Math.max(0, askingPriceCents - faceValueCents);

    offers.push({
      externalId: `bitrefill-${product.slug}-${faceValueDollars}`,
      originalTitle: `${product.brandName} Gift Card $${faceValueDollars}`,
      externalUrl: `${BASE_URL}/${product.slug}/`,
      rawBrandName: product.brandName,
      faceValueCents,
      askingPriceCents,
      feeTotalCents,
      currency: "USD",
      denomination: String(faceValueDollars),
      countryRedeemable: product.countries,
      sellerName: null,
      sellerRating: null,
      hasBuyerProtection: true, // Bitrefill has buyer protection
      rawSnapshot: {
        source: "bitrefill",
        productSlug: product.slug,
        cashbackPct,
        faceValueDollars,
        askingPriceCents,
        fetchedAt: new Date().toISOString(),
      },
    });
  }

  return offers;
}

/** Fetch a single product page with timeout and error handling */
async function fetchProductPage(
  product: BitrefillProduct,
  timeoutMs: number,
): Promise<{ offers: RawOffer[]; warning?: string }> {
  const url = `${BASE_URL}/${product.slug}/`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
        warning: `${product.slug}: no denominations found in page`,
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
    clearTimeout(timeout);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const bitrefillAdapter: SourceAdapter = {
  name: "Bitrefill",
  sourceSlug: "bitrefill",

  async fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult> {
    const timeoutMs = config?.timeoutMs ?? 10000;
    const startTime = Date.now();
    const allOffers: RawOffer[] = [];
    const warnings: string[] = [];

    if (config?.dryRun) {
      return {
        sourceSlug: "bitrefill",
        offers: [],
        fetchedAt: new Date(),
        durationMs: 0,
        warnings: ["Dry run — no fetches performed"],
        failed: false,
      };
    }

    // Fetch product pages sequentially to be respectful of rate limits
    for (const product of TRACKED_PRODUCTS) {
      const result = await fetchProductPage(product, timeoutMs);
      allOffers.push(...result.offers);
      if (result.warning) warnings.push(result.warning);

      // Small delay between requests to be polite
      await delay(500);
    }

    return {
      sourceSlug: "bitrefill",
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
