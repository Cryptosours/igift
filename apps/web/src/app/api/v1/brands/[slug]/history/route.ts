/**
 * GET /api/v1/brands/:slug/history
 *
 * Returns daily price history for a brand over the last N days.
 * One data point per day (lowest effective price that day).
 * Requires X-API-Key.
 *
 * Query params:
 *   days         — 1–365, default 90 (free: max 90, pro: max 365)
 *   denomination — filter to a specific denomination e.g. "$50"
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { brands, priceHistory } from "@/db/schema";
import { eq, and, gte, min } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { authenticateApiRequest } from "../../../../v1/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  const maxDays = auth.tier === "pro" ? 365 : 90;
  const days = Math.min(parseInt(searchParams.get("days") ?? "90"), maxDays);
  const denomination = searchParams.get("denomination") ?? undefined;

  try {
    const [brand] = await db
      .select({ id: brands.id, name: brands.name })
      .from(brands)
      .where(and(eq(brands.slug, slug), eq(brands.isActive, true)))
      .limit(1);

    if (!brand) {
      return NextResponse.json(
        { error: "not_found", message: `Brand '${slug}' not found.` },
        { status: 404 },
      );
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const conditions = [
      eq(priceHistory.brandId, brand.id),
      gte(priceHistory.recordedAt, cutoff),
    ];
    if (denomination) {
      conditions.push(eq(priceHistory.denomination, denomination));
    }

    const rows = await db
      .select({
        day: sql<string>`DATE_TRUNC('day', ${priceHistory.recordedAt})::date::text`,
        priceCents: min(priceHistory.effectivePriceCents),
        discountPct: min(priceHistory.effectiveDiscountPct),
        faceValueCents: min(priceHistory.faceValueCents),
        currency: priceHistory.currency,
      })
      .from(priceHistory)
      .where(and(...conditions))
      .groupBy(
        sql`DATE_TRUNC('day', ${priceHistory.recordedAt})::date`,
        priceHistory.currency,
      )
      .orderBy(sql`DATE_TRUNC('day', ${priceHistory.recordedAt})::date`);

    const data = rows.map((r) => ({
      date: r.day,
      priceCents: Number(r.priceCents ?? 0),
      faceValueCents: Number(r.faceValueCents ?? 0),
      discountPct: Number(Number(r.discountPct ?? 0).toFixed(2)),
      currency: r.currency,
    }));

    const prices = data.map((d) => d.priceCents).filter(Boolean);
    const allTimeLowCents = prices.length > 0 ? Math.min(...prices) : null;

    return NextResponse.json({
      data,
      meta: {
        brand: brand.name,
        slug,
        days,
        points: data.length,
        allTimeLowCents,
        tier: auth.tier,
        maxDays,
      },
    });
  } catch (error) {
    console.error("[API v1 /brands/[slug]/history]", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to fetch price history." },
      { status: 500 },
    );
  }
}
