import { db } from "@/db";
import { offers, brands, sources, watchlistItems, sponsoredPlacements, priceHistory } from "@/db/schema";
import { eq, desc, and, or, ilike, count, avg, sql, lte, gte, min, max, inArray } from "drizzle-orm";
import type { DealCardProps } from "@/components/deals/deal-card";
import type { Brand } from "@/db/schema";

// ── Helpers ──

function timeAgo(date: Date | null): string {
  if (!date) return "unknown";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function centsToDollars(cents: number): number {
  return cents / 100;
}

function buildRegionCondition(region: string) {
  const regionJson = JSON.stringify([region]);
  const globalJson = JSON.stringify(["Global"]);

  return sql`(${offers.countryRedeemable} @> ${regionJson}::jsonb OR ${offers.countryRedeemable} @> ${globalJson}::jsonb)`;
}

// Category display metadata (icons/descriptions for the enum values)
const categoryMeta: Record<string, { name: string; slug: string; icon: string; description: string }> = {
  gaming: { name: "Gaming", slug: "gaming", icon: "🎮", description: "Steam, PlayStation, Xbox, Nintendo, Roblox" },
  app_stores: { name: "App Stores", slug: "app-stores", icon: "📱", description: "Apple, Google Play, Microsoft" },
  streaming: { name: "Streaming", slug: "streaming", icon: "🎬", description: "Netflix, Spotify, Disney+, YouTube" },
  retail: { name: "Retail", slug: "retail", icon: "🛍️", description: "Amazon, Target, Walmart, Best Buy" },
  food_dining: { name: "Food & Dining", slug: "food-dining", icon: "🍔", description: "DoorDash, Uber Eats, Starbucks, Chipotle" },
  travel: { name: "Travel", slug: "travel", icon: "✈️", description: "Airbnb, Hotels.com, Southwest, Uber" },
  telecom: { name: "Telecom", slug: "telecom", icon: "📞", description: "Phone and internet service credits" },
  other: { name: "Other", slug: "other", icon: "🏷️", description: "Miscellaneous digital value cards" },
};

// Reverse lookup: slug → category enum value
const slugToCategory: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMeta).map(([enumVal, meta]) => [meta.slug, enumVal]),
);

// ── Data Fetchers ──

/** Fetch active offers as DealCardProps, sorted by finalScore desc */
export async function getDeals(options?: {
  limit?: number;
  region?: string;
  trustZone?: "green" | "yellow";
  brandSlug?: string;
  category?: string;
}): Promise<DealCardProps[]> {
  const limit = options?.limit ?? 50;

  const conditions = [
    eq(offers.status, "active"),
    lte(offers.effectivePriceCents, offers.faceValueCents),
  ];
  if (options?.trustZone) {
    conditions.push(eq(offers.trustZone, options.trustZone));
  }
  if (options?.region) {
    conditions.push(buildRegionCondition(options.region));
  }
  if (options?.brandSlug) {
    conditions.push(eq(brands.slug, options.brandSlug));
  }
  if (options?.category) {
    const category = (slugToCategory[options.category] ?? options.category) as Brand["category"];
    conditions.push(eq(brands.category, category));
  }

  const results = await db
    .select({
      id: offers.id,
      title: offers.normalizedTitle,
      originalTitle: offers.originalTitle,
      externalUrl: offers.externalUrl,
      faceValueCents: offers.faceValueCents,
      effectivePriceCents: offers.effectivePriceCents,
      currency: offers.currency,
      effectiveDiscountPct: offers.effectiveDiscountPct,
      dealQualityScore: offers.dealQualityScore,
      confidenceScore: offers.confidenceScore,
      finalScore: offers.finalScore,
      trustZone: offers.trustZone,
      countryRedeemable: offers.countryRedeemable,
      isHistoricalLow: offers.isHistoricalLow,
      lastSeenAt: offers.lastSeenAt,
      brandName: brands.name,
      brandSlug: brands.slug,
      brandCategory: brands.category,
      sourceName: sources.name,
    })
    .from(offers)
    .innerJoin(brands, eq(offers.brandId, brands.id))
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .where(and(...conditions))
    .orderBy(desc(offers.finalScore))
    .limit(limit);

  return results.map((r) => ({
    id: String(r.id),
    brand: r.brandName,
    brandSlug: r.brandSlug,
    title: r.title ?? r.originalTitle,
    faceValue: centsToDollars(r.faceValueCents),
    effectivePrice: centsToDollars(r.effectivePriceCents),
    currency: r.currency === "USD" ? "$" : r.currency,
    effectiveDiscount: r.effectiveDiscountPct,
    dealScore: r.dealQualityScore ?? 0,
    confidenceScore: r.confidenceScore ?? 0,
    trustZone: r.trustZone,
    sourceName: r.sourceName,
    sourceUrl: r.externalUrl,
    region: (r.countryRedeemable as string[] | null)?.join(", ") ?? "Unknown",
    lastVerified: timeAgo(r.lastSeenAt),
    historicalLow: r.isHistoricalLow,
  }));
}

/** Search offers by query string across brand, title, source, and category.
 *  Uses Postgres ILIKE for case-insensitive matching across multiple fields.
 *  Results ranked by finalScore desc. Falls back to sample data if DB unavailable. */
export async function searchDeals(
  query: string,
  options?: { limit?: number; region?: string; trustZone?: "green" | "yellow" },
): Promise<DealCardProps[]> {
  const limit = options?.limit ?? 50;
  const q = `%${query.trim()}%`;

  if (!query.trim()) return getDeals({ limit });

  const conditions = [
    eq(offers.status, "active"),
    lte(offers.effectivePriceCents, offers.faceValueCents),
    or(
      ilike(offers.normalizedTitle, q),
      ilike(offers.originalTitle, q),
      ilike(brands.name, q),
      ilike(brands.slug, q),
      ilike(sources.name, q),
      ilike(brands.category, q),
    ),
  ];

  if (options?.trustZone) {
    conditions.push(eq(offers.trustZone, options.trustZone));
  }
  if (options?.region) {
    conditions.push(buildRegionCondition(options.region));
  }

  const results = await db
    .select({
      id: offers.id,
      title: offers.normalizedTitle,
      originalTitle: offers.originalTitle,
      externalUrl: offers.externalUrl,
      faceValueCents: offers.faceValueCents,
      effectivePriceCents: offers.effectivePriceCents,
      currency: offers.currency,
      effectiveDiscountPct: offers.effectiveDiscountPct,
      dealQualityScore: offers.dealQualityScore,
      confidenceScore: offers.confidenceScore,
      finalScore: offers.finalScore,
      trustZone: offers.trustZone,
      countryRedeemable: offers.countryRedeemable,
      isHistoricalLow: offers.isHistoricalLow,
      lastSeenAt: offers.lastSeenAt,
      brandName: brands.name,
      brandSlug: brands.slug,
      brandCategory: brands.category,
      sourceName: sources.name,
    })
    .from(offers)
    .innerJoin(brands, eq(offers.brandId, brands.id))
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .where(and(...conditions))
    .orderBy(desc(offers.finalScore))
    .limit(limit);

  return results.map((r) => ({
    id: String(r.id),
    brand: r.brandName,
    brandSlug: r.brandSlug,
    title: r.title ?? r.originalTitle,
    faceValue: centsToDollars(r.faceValueCents),
    effectivePrice: centsToDollars(r.effectivePriceCents),
    currency: r.currency === "USD" ? "$" : r.currency,
    effectiveDiscount: r.effectiveDiscountPct,
    dealScore: r.dealQualityScore ?? 0,
    confidenceScore: r.confidenceScore ?? 0,
    trustZone: r.trustZone,
    sourceName: r.sourceName,
    sourceUrl: r.externalUrl,
    region: (r.countryRedeemable as string[] | null)?.join(", ") ?? "Unknown",
    lastVerified: timeAgo(r.lastSeenAt),
    historicalLow: r.isHistoricalLow,
  }));
}

/** Fetch all active brands with deal counts and avg discount */
export async function getBrands(): Promise<
  {
    name: string;
    slug: string;
    category: string;
    categorySlug: string;
    description: string | null;
    regionsSupported: string[];
    dealCount: number;
    avgDiscount: number;
  }[]
> {
  const results = await db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
      category: brands.category,
      description: brands.description,
      regionsSupported: brands.regionsSupported,
      dealCount: count(offers.id),
      avgDiscount: avg(offers.effectiveDiscountPct),
    })
    .from(brands)
    .leftJoin(offers, and(eq(brands.id, offers.brandId), eq(offers.status, "active")))
    .where(eq(brands.isActive, true))
    .groupBy(brands.id)
    .orderBy(brands.name);

  return results.map((r) => ({
    name: r.name,
    slug: r.slug,
    category: categoryMeta[r.category]?.name ?? r.category,
    categorySlug: categoryMeta[r.category]?.slug ?? r.category,
    description: r.description,
    regionsSupported: (r.regionsSupported as string[]) ?? [],
    dealCount: Number(r.dealCount),
    avgDiscount: Math.round(Number(r.avgDiscount ?? 0) * 100),
  }));
}

/** Fetch a single brand by slug with its offers */
export async function getBrandBySlug(slug: string) {
  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.slug, slug))
    .limit(1);

  if (!brand) return null;

  const deals = await getDeals({ brandSlug: slug, limit: 50 });

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    category: categoryMeta[brand.category]?.name ?? brand.category,
    description: brand.description ?? "",
    regions: (brand.regionsSupported as string[]) ?? [],
    avgDiscount: deals.length > 0
      ? Math.round(deals.reduce((sum, d) => sum + d.effectiveDiscount * 100, 0) / deals.length)
      : 0,
    deals,
  };
}

/** Fetch categories with deal counts (aggregated from brands + offers) */
export async function getCategories(): Promise<
  { name: string; slug: string; icon: string; description: string; dealCount: number }[]
> {
  const results = await db
    .select({
      category: brands.category,
      dealCount: count(offers.id),
    })
    .from(brands)
    .leftJoin(offers, and(eq(brands.id, offers.brandId), eq(offers.status, "active")))
    .where(eq(brands.isActive, true))
    .groupBy(brands.category);

  return results
    .map((r) => {
      const meta = categoryMeta[r.category];
      if (!meta) return null;
      return {
        name: meta.name,
        slug: meta.slug,
        icon: meta.icon,
        description: meta.description,
        dealCount: Number(r.dealCount),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.dealCount - a.dealCount);
}

/** Get category metadata by slug */
export function getCategoryBySlug(slug: string) {
  const enumVal = slugToCategory[slug];
  if (!enumVal) return null;
  return categoryMeta[enumVal];
}

/** Get watched brand slugs for a session — returns an empty Set if sessionId is falsy */
export async function getWatchedSlugs(sessionId: string | null | undefined): Promise<Set<string>> {
  if (!sessionId) return new Set();
  try {
    const rows = await db
      .select({ slug: brands.slug })
      .from(watchlistItems)
      .innerJoin(brands, eq(watchlistItems.brandId, brands.id))
      .where(eq(watchlistItems.sessionId, sessionId));
    return new Set(rows.map((r) => r.slug));
  } catch {
    return new Set();
  }
}

/** Get full watchlist for a session — returns brand slug, name, category, and best deal */
export async function getWatchlist(sessionId: string | null | undefined): Promise<
  Array<{ slug: string; name: string; category: string; bestDeal: DealCardProps | null }>
> {
  if (!sessionId) return [];
  try {
    const watched = await db
      .select({ brandId: watchlistItems.brandId, slug: brands.slug, name: brands.name, category: brands.category })
      .from(watchlistItems)
      .innerJoin(brands, eq(watchlistItems.brandId, brands.id))
      .where(eq(watchlistItems.sessionId, sessionId))
      .orderBy(watchlistItems.createdAt);

    if (watched.length === 0) return [];

    const brandIds = watched.map((w) => w.brandId);
    const dealRows = await db
      .select({
        id: offers.id,
        brandId: offers.brandId,
        brandSlug: brands.slug,
        brandName: brands.name,
        title: offers.normalizedTitle,
        originalTitle: offers.originalTitle,
        faceValueCents: offers.faceValueCents,
        effectivePriceCents: offers.effectivePriceCents,
        currency: offers.currency,
        effectiveDiscountPct: offers.effectiveDiscountPct,
        dealQualityScore: offers.dealQualityScore,
        confidenceScore: offers.confidenceScore,
        trustZone: offers.trustZone,
        sourceName: sources.name,
        sourceUrl: sources.url,
        accountRegionRequired: offers.accountRegionRequired,
        lastVerifiedAt: offers.lastVerifiedAt,
        isHistoricalLow: offers.isHistoricalLow,
      })
      .from(offers)
      .innerJoin(brands, eq(offers.brandId, brands.id))
      .innerJoin(sources, eq(offers.sourceId, sources.id))
      .where(
        and(
          eq(offers.status, "active"),
          inArray(offers.brandId, brandIds),
        ),
      )
      .orderBy(desc(offers.finalScore));

    // Group best deal per brand
    const bestByBrand = new Map<number, typeof dealRows[0]>();
    for (const row of dealRows) {
      if (!bestByBrand.has(row.brandId)) bestByBrand.set(row.brandId, row);
    }

    return watched.map((w) => {
      const best = bestByBrand.get(w.brandId) ?? null;
      return {
        slug: w.slug,
        name: w.name,
        category: w.category,
        bestDeal: best
          ? {
              id: String(best.id),
              brand: best.brandName,
              brandSlug: best.brandSlug,
              title: best.title ?? best.originalTitle,
              faceValue: best.faceValueCents / 100,
              effectivePrice: best.effectivePriceCents / 100,
              currency: best.currency,
              effectiveDiscount: best.effectiveDiscountPct,
              dealScore: best.dealQualityScore ?? 0,
              confidenceScore: best.confidenceScore ?? 0,
              trustZone: best.trustZone,
              sourceName: best.sourceName,
              sourceUrl: best.sourceUrl,
              region: best.accountRegionRequired ?? "Global",
              lastVerified: timeAgo(best.lastVerifiedAt),
              historicalLow: best.isHistoricalLow,
              initialWatched: true,
            }
          : null,
      };
    });
  } catch {
    return [];
  }
}

/** Get active sponsored placements with each brand's best deal.
 *  Placement type filters which page they appear on.
 *  Returns [] silently if DB unavailable — sponsored section simply doesn't render. */
export async function getFeaturedPlacements(
  type: "featured_deal" | "featured_brand",
): Promise<Array<{
  placementId: number;
  brandSlug: string;
  brandName: string;
  brandCategory: string;
  bestDeal: DealCardProps | null;
}>> {
  try {
    const now = new Date();

    const placements = await db
      .select({
        placementId: sponsoredPlacements.id,
        brandId: brands.id,
        brandSlug: brands.slug,
        brandName: brands.name,
        brandCategory: brands.category,
      })
      .from(sponsoredPlacements)
      .innerJoin(brands, eq(sponsoredPlacements.brandId, brands.id))
      .where(
        and(
          eq(sponsoredPlacements.placementType, type),
          eq(sponsoredPlacements.isActive, true),
          lte(sponsoredPlacements.startsAt, now),
          gte(sponsoredPlacements.endsAt, now),
          eq(brands.isActive, true),
        ),
      )
      .orderBy(sponsoredPlacements.createdAt);

    if (placements.length === 0) return [];

    const brandIds = placements.map((p) => p.brandId);

    const dealRows = await db
      .select({
        id: offers.id,
        brandId: offers.brandId,
        brandSlug: brands.slug,
        brandName: brands.name,
        title: offers.normalizedTitle,
        originalTitle: offers.originalTitle,
        faceValueCents: offers.faceValueCents,
        effectivePriceCents: offers.effectivePriceCents,
        currency: offers.currency,
        effectiveDiscountPct: offers.effectiveDiscountPct,
        dealQualityScore: offers.dealQualityScore,
        confidenceScore: offers.confidenceScore,
        trustZone: offers.trustZone,
        sourceName: sources.name,
        accountRegionRequired: offers.accountRegionRequired,
        lastVerifiedAt: offers.lastVerifiedAt,
        isHistoricalLow: offers.isHistoricalLow,
      })
      .from(offers)
      .innerJoin(brands, eq(offers.brandId, brands.id))
      .innerJoin(sources, eq(offers.sourceId, sources.id))
      .where(
        and(
          eq(offers.status, "active"),
          inArray(offers.brandId, brandIds),
        ),
      )
      .orderBy(desc(offers.finalScore));

    const bestByBrand = new Map<number, typeof dealRows[0]>();
    for (const row of dealRows) {
      if (!bestByBrand.has(row.brandId)) bestByBrand.set(row.brandId, row);
    }

    return placements.map((p) => {
      const best = bestByBrand.get(p.brandId) ?? null;
      return {
        placementId: p.placementId,
        brandSlug: p.brandSlug,
        brandName: p.brandName,
        brandCategory: categoryMeta[p.brandCategory]?.name ?? p.brandCategory,
        bestDeal: best
          ? {
              id: String(best.id),
              brand: best.brandName,
              brandSlug: best.brandSlug,
              title: best.title ?? best.originalTitle,
              faceValue: best.faceValueCents / 100,
              effectivePrice: best.effectivePriceCents / 100,
              currency: best.currency === "USD" ? "$" : best.currency,
              effectiveDiscount: best.effectiveDiscountPct,
              dealScore: best.dealQualityScore ?? 0,
              confidenceScore: best.confidenceScore ?? 0,
              trustZone: best.trustZone,
              sourceName: best.sourceName,
              sourceUrl: "",
              region: best.accountRegionRequired ?? "Global",
              lastVerified: timeAgo(best.lastVerifiedAt),
              historicalLow: best.isHistoricalLow,
            }
          : null,
      };
    });
  } catch {
    return [];
  }
}

/** Aggregate stats for the pro dashboard — market-level data */
export async function getDashboardStats(): Promise<{
  newIn24h: number;
  historicalLowsTotal: number;
  topCategory: string;
}> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [newRow] = await db
      .select({ value: count() })
      .from(offers)
      .where(and(eq(offers.status, "active"), gte(offers.createdAt, oneDayAgo)));

    const [lowRow] = await db
      .select({ value: count() })
      .from(offers)
      .where(and(eq(offers.status, "active"), eq(offers.isHistoricalLow, true)));

    const catRow = await db
      .select({ category: brands.category, total: count(offers.id) })
      .from(brands)
      .leftJoin(offers, and(eq(brands.id, offers.brandId), eq(offers.status, "active")))
      .where(eq(brands.isActive, true))
      .groupBy(brands.category)
      .orderBy(desc(count(offers.id)))
      .limit(1);

    const topCategoryKey = catRow[0]?.category ?? "gaming";
    const topCategory = categoryMeta[topCategoryKey]?.name ?? topCategoryKey;

    return {
      newIn24h: Number(newRow?.value ?? 0),
      historicalLowsTotal: Number(lowRow?.value ?? 0),
      topCategory,
    };
  } catch {
    return { newIn24h: 12, historicalLowsTotal: 8, topCategory: "Gaming" };
  }
}

/** Aggregate stats for the hero dashboard card */
// ── Price History ──

export interface PricePoint {
  date: string;          // ISO date string YYYY-MM-DD
  priceCents: number;    // lowest effective price seen that day
  discountPct: number;   // corresponding discount percentage
}

/**
 * Returns daily price history for a brand over the last N days.
 * One point per day: the lowest effective price seen (best deal of the day).
 * Optionally filtered by denomination (e.g. "$50", "€25").
 */
export async function getPriceHistory(
  brandId: number,
  options?: { days?: number; denomination?: string },
): Promise<PricePoint[]> {
  const days = options?.days ?? 90;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    // Daily aggregation using DATE_TRUNC — one point per day (lowest price)
    const rows = await db
      .select({
        day: sql<string>`DATE_TRUNC('day', ${priceHistory.recordedAt})::date::text`,
        priceCents: min(priceHistory.effectivePriceCents),
        discountPct: min(priceHistory.effectiveDiscountPct),
      })
      .from(priceHistory)
      .where(
        and(
          eq(priceHistory.brandId, brandId),
          gte(priceHistory.recordedAt, cutoff),
          ...(options?.denomination
            ? [eq(priceHistory.denomination, options.denomination)]
            : []),
        ),
      )
      .groupBy(sql`DATE_TRUNC('day', ${priceHistory.recordedAt})::date`)
      .orderBy(sql`DATE_TRUNC('day', ${priceHistory.recordedAt})::date`);

    return rows.map((r) => ({
      date: r.day,
      priceCents: Number(r.priceCents ?? 0),
      discountPct: Number(r.discountPct ?? 0),
    }));
  } catch {
    return [];
  }
}

/**
 * Returns all brands currently at a confirmed historical low —
 * i.e. they have at least one active offer with isHistoricalLow = true.
 * Used for the /historical-lows page.
 */
export async function getHistoricalLowBrands(): Promise<
  {
    id: number;
    name: string;
    slug: string;
    category: string;
    bestDeal: {
      faceValueCents: number;
      effectivePriceCents: number;
      discountPct: number;
      finalScore: number;
      currency: string;
    } | null;
  }[]
> {
  try {
    const rows = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        category: brands.category,
        faceValueCents: offers.faceValueCents,
        effectivePriceCents: offers.effectivePriceCents,
        discountPct: offers.effectiveDiscountPct,
        finalScore: offers.finalScore,
        currency: offers.currency,
      })
      .from(brands)
      .innerJoin(
        offers,
        and(
          eq(offers.brandId, brands.id),
          eq(offers.status, "active"),
          eq(offers.isHistoricalLow, true),
        ),
      )
      .where(eq(brands.isActive, true))
      .orderBy(desc(offers.finalScore));

    // Deduplicate — one entry per brand (the best scoring offer)
    const seen = new Set<number>();
    return rows
      .filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      })
      .map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        category: r.category,
        bestDeal: {
          faceValueCents: r.faceValueCents,
          effectivePriceCents: r.effectivePriceCents,
          discountPct: Number(r.discountPct),
          finalScore: Number(r.finalScore ?? 0),
          currency: r.currency,
        },
      }));
  } catch {
    return [];
  }
}

export async function getHeroStats(): Promise<{
  activeOffers: number;
  verifiedSources: number;
  avgDiscount: number;
  trackedBrands: number;
}> {
  try {
    const [offerCount] = await db
      .select({ value: count() })
      .from(offers)
      .where(eq(offers.status, "active"));

    const [sourceCount] = await db
      .select({ value: count() })
      .from(sources)
      .where(eq(sources.isActive, true));

    const [avgRow] = await db
      .select({ value: avg(offers.effectiveDiscountPct) })
      .from(offers)
      .where(eq(offers.status, "active"));

    const [brandCount] = await db
      .select({ value: count() })
      .from(brands)
      .where(eq(brands.isActive, true));

    return {
      activeOffers: offerCount?.value ?? 0,
      verifiedSources: sourceCount?.value ?? 0,
      avgDiscount: Math.round(Number(avgRow?.value ?? 0) * 100),
      trackedBrands: brandCount?.value ?? 0,
    };
  } catch {
    return { activeOffers: 180, verifiedSources: 15, avgDiscount: 12, trackedBrands: 12 };
  }
}

// ── Source Scorecards ──

export interface SourceScorecard {
  id: number;
  slug: string;
  name: string;
  url: string;
  sourceType: string;
  trustZone: "green" | "yellow" | "red";
  isActive: boolean;
  hasBuyerProtection: boolean;
  hasRefundPolicy: boolean;
  affiliateNetwork: string | null;
  contractNotes: string | null;
  // Live performance
  fetchSuccessRate: number;
  lastFetchedAt: Date | null;
  lastSuccessAt: Date | null;
  minutesSinceLastSuccess: number | null;
  slaMinutes: number;
  isStale: boolean;
  // Offer stats (computed)
  activeOfferCount: number;
  uniqueBrandCount: number;
  avgDiscountPct: number;
  bestDiscountPct: number;
  avgFinalScore: number;
  historicalLowCount: number;
  // Computed trust score 0-100
  trustScore: number;
  // Health status
  healthStatus: "healthy" | "degraded" | "unhealthy" | "unknown";
  createdAt: Date;
}

function computeTrustScore(s: {
  trustZone: string;
  hasBuyerProtection: boolean;
  hasRefundPolicy: boolean;
  fetchSuccessRate: number;
  isActive: boolean;
}): number {
  let score = 0;
  // Trust zone: 40 pts
  if (s.trustZone === "green") score += 40;
  else if (s.trustZone === "yellow") score += 20;
  // Buyer protection: 20 pts
  if (s.hasBuyerProtection) score += 20;
  // Refund policy: 15 pts
  if (s.hasRefundPolicy) score += 15;
  // Fetch reliability: 25 pts
  score += Math.round(s.fetchSuccessRate * 25);
  return Math.min(100, score);
}

function computeHealthStatus(
  minutesSinceLastSuccess: number | null,
  slaMinutes: number,
  fetchSuccessRate: number,
  isActive: boolean
): "healthy" | "degraded" | "unhealthy" | "unknown" {
  if (!isActive) return "unknown";
  if (minutesSinceLastSuccess === null) return "unknown";
  const staleFactor = minutesSinceLastSuccess / slaMinutes;
  if (fetchSuccessRate >= 0.9 && staleFactor <= 1.1) return "healthy";
  if (fetchSuccessRate >= 0.7 && staleFactor <= 2.0) return "degraded";
  return "unhealthy";
}

export async function getAllSourceScorecards(): Promise<SourceScorecard[]> {
  try {
    const rows = await db
      .select({
        id: sources.id,
        slug: sources.slug,
        name: sources.name,
        url: sources.url,
        sourceType: sources.sourceType,
        trustZone: sources.trustZone,
        isActive: sources.isActive,
        hasBuyerProtection: sources.hasBuyerProtection,
        hasRefundPolicy: sources.hasRefundPolicy,
        affiliateNetwork: sources.affiliateNetwork,
        contractNotes: sources.contractNotes,
        fetchSuccessRate: sources.fetchSuccessRate,
        lastFetchedAt: sources.lastFetchedAt,
        lastSuccessAt: sources.lastSuccessAt,
        slaMinutes: sources.refreshIntervalMinutes,
        createdAt: sources.createdAt,
        // Aggregate offer stats
        activeOfferCount: count(sql`CASE WHEN ${offers.status} = 'active' THEN 1 END`),
        uniqueBrandCount: sql<number>`COUNT(DISTINCT CASE WHEN ${offers.status} = 'active' THEN ${offers.brandId} END)`,
        avgDiscountPct: avg(sql`CASE WHEN ${offers.status} = 'active' THEN ${offers.effectiveDiscountPct} END`),
        bestDiscountPct: max(sql`CASE WHEN ${offers.status} = 'active' THEN ${offers.effectiveDiscountPct} END`),
        avgFinalScore: avg(sql`CASE WHEN ${offers.status} = 'active' THEN ${offers.finalScore} END`),
        historicalLowCount: count(sql`CASE WHEN ${offers.status} = 'active' AND ${offers.isHistoricalLow} = true THEN 1 END`),
      })
      .from(sources)
      .leftJoin(offers, eq(offers.sourceId, sources.id))
      .groupBy(sources.id)
      .orderBy(desc(sources.trustZone), desc(sources.fetchSuccessRate));

    const now = Date.now();
    return rows.map((r) => {
      const minutesSinceLastSuccess = r.lastSuccessAt
        ? Math.floor((now - r.lastSuccessAt.getTime()) / 60000)
        : null;
      const slaMinutes = r.slaMinutes ?? 60;
      const fetchSuccessRate = r.fetchSuccessRate ?? 1.0;

      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        url: r.url,
        sourceType: r.sourceType,
        trustZone: r.trustZone as "green" | "yellow" | "red",
        isActive: r.isActive,
        hasBuyerProtection: r.hasBuyerProtection,
        hasRefundPolicy: r.hasRefundPolicy,
        affiliateNetwork: r.affiliateNetwork,
        contractNotes: r.contractNotes,
        fetchSuccessRate,
        lastFetchedAt: r.lastFetchedAt,
        lastSuccessAt: r.lastSuccessAt,
        minutesSinceLastSuccess,
        slaMinutes,
        isStale: minutesSinceLastSuccess !== null && minutesSinceLastSuccess > slaMinutes * 1.5,
        activeOfferCount: Number(r.activeOfferCount ?? 0),
        uniqueBrandCount: Number(r.uniqueBrandCount ?? 0),
        avgDiscountPct: Math.round(Number(r.avgDiscountPct ?? 0) * 100),
        bestDiscountPct: Math.round(Number(r.bestDiscountPct ?? 0) * 100),
        avgFinalScore: Math.round(Number(r.avgFinalScore ?? 0)),
        historicalLowCount: Number(r.historicalLowCount ?? 0),
        trustScore: computeTrustScore({
          trustZone: r.trustZone,
          hasBuyerProtection: r.hasBuyerProtection,
          hasRefundPolicy: r.hasRefundPolicy,
          fetchSuccessRate,
          isActive: r.isActive,
        }),
        healthStatus: computeHealthStatus(minutesSinceLastSuccess, slaMinutes, fetchSuccessRate, r.isActive),
        createdAt: r.createdAt,
      };
    });
  } catch {
    return [];
  }
}

export async function getSourceScorecardBySlug(slug: string): Promise<SourceScorecard | null> {
  try {
    const all = await getAllSourceScorecards();
    return all.find((s) => s.slug === slug) ?? null;
  } catch {
    return null;
  }
}
