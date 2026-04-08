import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brands, offers, sources } from "@/db/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limited = rateLimit(request, { limit: 60, windowMs: 60_000, route: "brands" });
  if (limited) return limited;

  const { slug } = await params;

  try {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.slug, slug))
      .limit(1);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const brandOffers = await db
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
        sourceName: sources.name,
        sourceSlug: sources.slug,
      })
      .from(offers)
      .innerJoin(sources, eq(offers.sourceId, sources.id))
      .where(and(
        eq(offers.brandId, brand.id),
        eq(offers.status, "active"),
        // Hard rule: never show overpriced offers
        lte(offers.effectivePriceCents, offers.faceValueCents),
      ))
      .orderBy(desc(offers.finalScore));

    return NextResponse.json({ brand, offers: brandOffers });
  } catch (error) {
    console.error("Failed to fetch brand:", error);
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 },
    );
  }
}
