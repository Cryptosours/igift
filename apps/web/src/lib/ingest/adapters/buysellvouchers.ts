/**
 * BuySellVouchers Source Adapter
 *
 * Fetches gift card data from buysellvouchers.com.
 * BSV is a P2P gift card marketplace (yellow zone) with buyer protection.
 * 10+ year history, 650K+ monthly transactions, Trustpilot 3.8/5.
 *
 * The site is Next.js-based — product data is rendered in __next_f payloads
 * and visible HTML. We parse both structured data and visible price patterns.
 *
 * Compliance: public pages only, no login, no anti-bot bypass.
 * Pricing: Marketplace prices set by sellers, often discounted from face value.
 */

import type { SourceAdapter, AdapterResult, RawOffer, AdapterConfig } from "../types";

interface BsvProduct {
  slug: string;
  brandName: string;
  countries: string[];
}

const TRACKED_PRODUCTS: BsvProduct[] = [
  { slug: "Gift_cards-Steam", brandName: "Steam", countries: ["US", "Global"] },
  { slug: "Gift_cards-Amazon", brandName: "Amazon", countries: ["US"] },
  { slug: "Gift_cards-Apple", brandName: "Apple", countries: ["US"] },
  { slug: "Gift_cards-Google_Play", brandName: "Google Play", countries: ["US"] },
  { slug: "Gift_cards-Xbox", brandName: "Xbox", countries: ["US", "Global"] },
  { slug: "Gift_cards-PlayStation", brandName: "PlayStation", countries: ["US"] },
  { slug: "Gift_cards-Netflix", brandName: "Netflix", countries: ["US"] },
  { slug: "Gift_cards-Spotify", brandName: "Spotify", countries: ["US", "Global"] },
  { slug: "Gift_cards-Nintendo", brandName: "Nintendo", countries: ["US"] },
  { slug: "Gift_cards-Uber", brandName: "Uber", countries: ["US"] },
  { slug: "Gift_cards-eBay", brandName: "eBay", countries: ["US"] },
  { slug: "Gift_cards-Disney_Plus", brandName: "Disney+", countries: ["US", "Global"] },
];

const BASE_URL = "https://www.buysellvouchers.com/en/products/list";
const USER_AGENT = "RealDeal/1.0 (deal-intelligence-platform; +https://igift.app)";

/**
 * Map BSV seller rating tier names to a 0-1 scale for confidence scoring.
 * BSV tiers: Beginner(1) -> Gamer(3) -> Master(5) -> Hero(6) -> Legend(10)
 */
function parseSellerRating(ratingText: string): number | null {
  const tierMap: Record<string, number> = {
    beginner: 0.2,
    gamer: 0.4,
    master: 0.6,
    hero: 0.7,
    legend: 0.9,
    "platform legend": 1.0,
  };

  const lower = ratingText.toLowerCase();
  for (const [tier, score] of Object.entries(tierMap)) {
    if (lower.includes(tier)) return score;
  }
  return null;
}

/** Escape regex special characters in a string */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parse gift card listings from BuySellVouchers product pages.
 *
 * BSV pages show listing cards with:
 * - Product name (brand + denomination + currency)
 * - Price in USD
 * - Original price + discount %
 * - Seller name and rating tier
 * - Sales count
 */
function parseProductPage(html: string, product: BsvProduct): RawOffer[] {
  const offers: RawOffer[] = [];
  const seenKeys = new Set<string>();

  // Strategy 1: Parse price/listing data from visible page patterns
  // BSV listing pattern: "$X.XX" price with denomination in title like "Brand XX USD"
  // Example titles: "Steam 50 USD", "Xbox 25 USD | USA", "Netflix Gift Card 200 TL"

  const brandPattern = escapeRegex(product.brandName) +
    "|" + escapeRegex(product.slug.replace("Gift_cards-", ""));

  // Match denomination: "Brand XX USD" or "Brand $XX" patterns followed by price
  const listingRegex = new RegExp(
    `(?:${brandPattern})[^\\d]*?(\\d+(?:\\.\\d{1,2})?)\\s*(?:USD|\\$|usd)` +
    `[\\s\\S]{0,300}?` +
    `\\$(\\d+(?:\\.\\d{1,2})?)`,
    "gi"
  );

  let listMatch;
  while ((listMatch = listingRegex.exec(html)) !== null) {
    const faceValue = parseFloat(listMatch[1]);
    const askingPrice = parseFloat(listMatch[2]);

    if (faceValue < 5 || faceValue > 500) continue;
    if (askingPrice <= 0 || askingPrice > faceValue * 1.5) continue;

    const denomination = String(faceValue);
    const key = `listing-${denomination}-${askingPrice}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    // BSV charges 0.5% buyer fee
    const buyerFeeCents = Math.round(askingPrice * 0.005 * 100);

    offers.push({
      externalId: `bsv-${product.slug}-${denomination}-${askingPrice}`,
      originalTitle: `${product.brandName} Gift Card $${denomination}`,
      externalUrl: `${BASE_URL}/${product.slug}/`,
      rawBrandName: product.brandName,
      faceValueCents: Math.round(faceValue * 100),
      askingPriceCents: Math.round(askingPrice * 100),
      feeTotalCents: buyerFeeCents,
      currency: "USD",
      denomination,
      countryRedeemable: product.countries,
      sellerName: null,
      sellerRating: null,
      hasBuyerProtection: true,
      rawSnapshot: {
        source: "buysellvouchers",
        productSlug: product.slug,
        parsedFrom: "listing-pattern",
        fetchedAt: new Date().toISOString(),
      },
    });
  }

  // Strategy 2: Parse USD price patterns with discount percentages
  // Pattern: "$XX.XX" followed nearby by "-XX%" discount
  if (offers.length === 0) {
    const priceDiscountPattern = /\$(\d+(?:\.\d{2})?)\s*[\s\S]{0,50}?(-?\d+(?:\.\d+)?)\s*%/gi;
    let pdMatch;

    while ((pdMatch = priceDiscountPattern.exec(html)) !== null) {
      const askingPrice = parseFloat(pdMatch[1]);
      const discountPct = Math.abs(parseFloat(pdMatch[2])) / 100;

      if (askingPrice < 3 || askingPrice > 500 || discountPct > 0.5) continue;

      // Reverse-calculate face value from discount
      const faceValue = discountPct > 0
        ? Math.round(askingPrice / (1 - discountPct) * 100) / 100
        : askingPrice;

      const denomination = String(Math.round(faceValue));
      const key = `discount-${denomination}-${askingPrice}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const buyerFeeCents = Math.round(askingPrice * 0.005 * 100);

      offers.push({
        externalId: `bsv-${product.slug}-${denomination}`,
        originalTitle: `${product.brandName} Gift Card $${denomination}`,
        externalUrl: `${BASE_URL}/${product.slug}/`,
        rawBrandName: product.brandName,
        faceValueCents: Math.round(faceValue * 100),
        askingPriceCents: Math.round(askingPrice * 100),
        feeTotalCents: buyerFeeCents,
        currency: "USD",
        denomination,
        countryRedeemable: product.countries,
        sellerName: null,
        sellerRating: null,
        hasBuyerProtection: true,
        rawSnapshot: {
          source: "buysellvouchers",
          productSlug: product.slug,
          parsedFrom: "price-discount-pattern",
          discountPct,
          fetchedAt: new Date().toISOString(),
        },
      });
    }
  }

  // Strategy 3: Simple USD price extraction as last resort
  if (offers.length === 0) {
    const simplePricePattern = /\$(\d+(?:\.\d{2})?)/g;
    let priceMatch;
    const prices: number[] = [];

    while ((priceMatch = simplePricePattern.exec(html)) !== null) {
      const price = parseFloat(priceMatch[1]);
      if (price >= 5 && price <= 500) {
        prices.push(price);
      }
    }

    // Deduplicate and take unique round-number prices as likely face values
    const uniquePrices = [...new Set(
      prices.filter(p => p % 5 === 0 || p % 10 === 0)
    )].slice(0, 8);

    for (const price of uniquePrices) {
      const denomination = String(price);
      const key = `simple-${denomination}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const buyerFeeCents = Math.round(price * 0.005 * 100);

      offers.push({
        externalId: `bsv-${product.slug}-${denomination}`,
        originalTitle: `${product.brandName} Gift Card $${denomination}`,
        externalUrl: `${BASE_URL}/${product.slug}/`,
        rawBrandName: product.brandName,
        faceValueCents: Math.round(price * 100),
        askingPriceCents: Math.round(price * 100),
        feeTotalCents: buyerFeeCents,
        currency: "USD",
        denomination,
        countryRedeemable: product.countries,
        sellerName: null,
        sellerRating: null,
        hasBuyerProtection: true,
        rawSnapshot: {
          source: "buysellvouchers",
          productSlug: product.slug,
          parsedFrom: "simple-price-fallback",
          fetchedAt: new Date().toISOString(),
        },
      });
    }
  }

  // Post-process: try to extract seller info from nearby context
  const sellerPattern = /(?:seller|by|from)\s*[:\s]*([A-Za-z0-9_.]+)\s*[\s\S]{0,50}?(\d+(?:Beginner|Gamer|Master|Hero|Legend))/gi;
  let sellerMatch;
  const sellers: Array<{ name: string; rating: number | null }> = [];
  while ((sellerMatch = sellerPattern.exec(html)) !== null) {
    sellers.push({
      name: sellerMatch[1],
      rating: parseSellerRating(sellerMatch[2]),
    });
  }

  // Attach best seller info to offers if found
  if (sellers.length > 0) {
    const bestSeller = sellers.reduce((a, b) =>
      (a.rating ?? 0) > (b.rating ?? 0) ? a : b
    );
    for (const offer of offers) {
      offer.sellerName = bestSeller.name;
      offer.sellerRating = bestSeller.rating;
      (offer.rawSnapshot as Record<string, unknown>).sellerName = bestSeller.name;
      (offer.rawSnapshot as Record<string, unknown>).sellerRatingTier = bestSeller.rating;
    }
  }

  return offers;
}

async function fetchProductPage(
  product: BsvProduct,
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
        "Accept-Language": "en-US,en;q=0.9",
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

export const buySellVouchersAdapter: SourceAdapter = {
  name: "BuySellVouchers",
  sourceSlug: "buysellvouchers",

  async fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult> {
    const timeoutMs = config?.timeoutMs ?? 12000;
    const startTime = Date.now();
    const allOffers: RawOffer[] = [];
    const warnings: string[] = [];

    if (config?.dryRun) {
      return {
        sourceSlug: "buysellvouchers",
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

      await delay(1000); // BSV is smaller — be extra polite with 1s delays
    }

    return {
      sourceSlug: "buysellvouchers",
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
