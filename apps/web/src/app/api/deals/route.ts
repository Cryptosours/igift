import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers, brands, sources } from "@/db/schema";
import { eq, desc, and, lte } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 60, windowMs: 60_000, route: "deals" });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const trustZone = searchParams.get("trustZone");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  try {
    const conditions = [
      eq(offers.status, "active"),
      // Hard rule: never show overpriced offers
      lte(offers.effectivePriceCents, offers.faceValueCents),
    ];
    if (trustZone === "green") {
      conditions.push(eq(offers.trustZone, "green"));
    }

    const results = await db
      .select({
        id: offers.id,
        title: offers.normalizedTitle,
        originalTitle: offers.originalTitle,
        externalUrl: offers.externalUrl,
        faceValueCents: offers.faceValueCents,
        effectivePriceCents: offers.effectivePriceCents,
        feeTotalCents: offers.feeTotalCents,
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
        sourceName: sources.name,
        sourceSlug: sources.slug,
      })
      .from(offers)
      .innerJoin(brands, eq(offers.brandId, brands.id))
      .innerJoin(sources, eq(offers.sourceId, sources.id))
      .where(and(...conditions))
      .orderBy(desc(offers.finalScore))
      .limit(limit);

    // Filter by region in application layer (JSONB contains)
    const filtered = region
      ? results.filter((r) => {
          const countries = r.countryRedeemable as string[] | null;
          return countries?.includes(region) || countries?.includes("Global");
        })
      : results;

    return NextResponse.json({ deals: filtered, total: filtered.length });
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    // Fallback: return empty if DB not available yet
    return NextResponse.json({ deals: [], total: 0, error: "Database not available" });
  }
}
