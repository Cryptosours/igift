/**
 * GET /api/v1/deals
 *
 * Returns active, scored deals. Read-only. Requires X-API-Key.
 *
 * Query params:
 *   category   — gaming | app_stores | streaming | retail | food_dining | travel | telecom | other
 *   trust_zone — green | yellow | red  (default: green only for free tier)
 *   region     — ISO country code e.g. "US", "GB"  (filter by redeemable countries)
 *   min_score  — 0–100 minimum deal score
 *   limit      — 1–100, default 50 (free), up to 200 (pro)
 *   cursor     — opaque pagination cursor (last offer id from previous page)
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers, brands } from "@/db/schema";
import type { Brand } from "@/db/schema";
import { eq, desc, and, gte, gt, lte } from "drizzle-orm";
import { authenticateApiRequest } from "../auth";

export const dynamic = "force-dynamic";

const FREE_LIMIT_MAX = 100;
const PRO_LIMIT_MAX = 200;
const DEFAULT_LIMIT = 50;

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") ?? undefined;
  const trustZone = searchParams.get("trust_zone") ?? undefined;
  const region = searchParams.get("region") ?? undefined;
  const minScore = parseFloat(searchParams.get("min_score") ?? "0");
  const cursorId = parseInt(searchParams.get("cursor") ?? "0") || 0;

  const limitMax = auth.tier === "pro" ? PRO_LIMIT_MAX : FREE_LIMIT_MAX;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT)), limitMax);

  // Free tier: green zone only unless explicitly requesting lower
  const effectiveTrustZone = auth.tier === "free" && !trustZone ? "green" : (trustZone ?? undefined);

  try {
    const conditions = [
      eq(offers.status, "active"),
      // Hard rule: never show overpriced offers
      lte(offers.effectivePriceCents, offers.faceValueCents),
    ];

    if (effectiveTrustZone) {
      conditions.push(eq(offers.trustZone, effectiveTrustZone as "green" | "yellow" | "red"));
    }
    if (category) {
      conditions.push(eq(brands.category, category as Brand["category"]));
    }
    if (minScore > 0) {
      conditions.push(gte(offers.finalScore, minScore));
    }
    if (cursorId > 0) {
      conditions.push(gt(offers.id, cursorId));
    }

    const rows = await db
      .select({
        id: offers.id,
        title: offers.normalizedTitle,
        brand: brands.name,
        brandSlug: brands.slug,
        category: brands.category,
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
        // Affiliate URL intentionally excluded — visit igift.app for click-out
      })
      .from(offers)
      .innerJoin(brands, eq(offers.brandId, brands.id))
      .where(and(...conditions))
      .orderBy(desc(offers.finalScore), desc(offers.id))
      .limit(limit + 1); // fetch one extra to detect next page

    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);

    // Filter by region in app layer (JSONB)
    const filtered = region
      ? data.filter((r) => {
          const countries = r.regionsRedeemable as string[] | null;
          return countries?.includes(region) || countries?.includes("Global");
        })
      : data;

    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return NextResponse.json({
      data: filtered,
      meta: {
        count: filtered.length,
        limit,
        hasMore,
        nextCursor,
        tier: auth.tier,
      },
    });
  } catch (error) {
    console.error("[API v1 /deals]", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to fetch deals." },
      { status: 500 },
    );
  }
}
