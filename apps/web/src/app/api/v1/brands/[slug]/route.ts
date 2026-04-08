/**
 * GET /api/v1/brands/[slug]
 *
 * Returns a single brand with its current active offers.
 * Read-only. Requires X-API-Key.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { brands, offers, sources } from "@/db/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import { authenticateApiRequest } from "../../../v1/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return auth.response;

  const { slug } = await params;

  try {
    const [brand] = await db
      .select()
      .from(brands)
      .where(and(eq(brands.slug, slug), eq(brands.isActive, true)))
      .limit(1);

    if (!brand) {
      return NextResponse.json(
        { error: "not_found", message: `Brand '${slug}' not found.` },
        { status: 404 },
      );
    }

    const brandOffers = await db
      .select({
        id: offers.id,
        title: offers.normalizedTitle,
        source: sources.name,
        faceValueCents: offers.faceValueCents,
        effectivePriceCents: offers.effectivePriceCents,
        currency: offers.currency,
        discountPct: offers.effectiveDiscountPct,
        dealScore: offers.dealQualityScore,
        confidenceScore: offers.confidenceScore,
        finalScore: offers.finalScore,
        trustZone: offers.trustZone,
        isHistoricalLow: offers.isHistoricalLow,
        regionsRedeemable: offers.countryRedeemable,
        lastSeenAt: offers.lastSeenAt,
      })
      .from(offers)
      .innerJoin(sources, eq(offers.sourceId, sources.id))
      .where(and(
        eq(offers.brandId, brand.id),
        eq(offers.status, "active"),
        // Hard rule: never show overpriced offers
        lte(offers.effectivePriceCents, offers.faceValueCents),
      ))
      .orderBy(desc(offers.finalScore))
      .limit(auth.tier === "pro" ? 50 : 20);

    return NextResponse.json({
      data: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        category: brand.category,
        description: brand.description,
        regionsSupported: brand.regionsSupported,
        offers: brandOffers,
      },
    });
  } catch (error) {
    console.error("[API v1 /brands/[slug]]", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to fetch brand." },
      { status: 500 },
    );
  }
}
