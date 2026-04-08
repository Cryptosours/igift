import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers, brands, sources } from "@/db/schema";
import { eq, desc, and, lte } from "drizzle-orm";

/**
 * GET /api/offers/recent
 *
 * Returns the most recently discovered/updated offers.
 * Used by the "New Offers Found" live ticker on the homepage.
 * Returns up to 30 offers sorted by lastSeenAt desc.
 */
export async function GET() {
  try {
    const results = await db
      .select({
        id: offers.id,
        title: offers.normalizedTitle,
        originalTitle: offers.originalTitle,
        faceValueCents: offers.faceValueCents,
        effectivePriceCents: offers.effectivePriceCents,
        effectiveDiscountPct: offers.effectiveDiscountPct,
        currency: offers.currency,
        trustZone: offers.trustZone,
        countryRedeemable: offers.countryRedeemable,
        lastSeenAt: offers.lastSeenAt,
        brandName: brands.name,
        brandSlug: brands.slug,
        sourceName: sources.name,
        externalUrl: offers.externalUrl,
      })
      .from(offers)
      .innerJoin(brands, eq(offers.brandId, brands.id))
      .innerJoin(sources, eq(offers.sourceId, sources.id))
      .where(and(
        eq(offers.status, "active"),
        // Hard rule: never show overpriced offers (effectivePrice must be <= faceValue)
        lte(offers.effectivePriceCents, offers.faceValueCents),
      ))
      .orderBy(desc(offers.lastSeenAt))
      .limit(30);

    const recentOffers = results.map((r) => ({
      id: String(r.id),
      brand: r.brandName,
      brandSlug: r.brandSlug,
      title: r.title ?? r.originalTitle,
      faceValue: r.faceValueCents / 100,
      effectivePrice: r.effectivePriceCents / 100,
      discount: r.effectiveDiscountPct,
      currency: r.currency === "USD" ? "$" : r.currency,
      trustZone: r.trustZone,
      source: r.sourceName,
      region: (r.countryRedeemable as string[] | null)?.[0] ?? "Global",
      lastSeenAt: r.lastSeenAt?.toISOString() ?? null,
      url: r.externalUrl,
    }));

    return NextResponse.json(recentOffers, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    // DB unavailable — return empty array so the component degrades gracefully
    return NextResponse.json([]);
  }
}
