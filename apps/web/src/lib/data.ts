import { db } from "@/db";
import { offers, brands, sources } from "@/db/schema";
import { eq, desc, and, count, avg, sql } from "drizzle-orm";
import type { DealCardProps } from "@/components/deals/deal-card";

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

  const conditions = [eq(offers.status, "active")];
  if (options?.trustZone) {
    conditions.push(eq(offers.trustZone, options.trustZone));
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

  // Application-layer filters (JSONB fields + category)
  let filtered = results;

  if (options?.region) {
    filtered = filtered.filter((r) => {
      const countries = r.countryRedeemable as string[] | null;
      return countries?.includes(options.region!) || countries?.includes("Global");
    });
  }

  if (options?.brandSlug) {
    filtered = filtered.filter((r) => r.brandSlug === options.brandSlug);
  }

  if (options?.category) {
    const enumVal = slugToCategory[options.category] ?? options.category;
    filtered = filtered.filter((r) => r.brandCategory === enumVal);
  }

  return filtered.map((r) => ({
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
