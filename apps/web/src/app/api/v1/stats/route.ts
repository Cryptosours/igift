/**
 * GET /api/v1/stats
 *
 * Platform-level statistics snapshot.
 * Read-only. Requires X-API-Key.
 *
 * Returns total active offers, brands, historical lows, and category breakdown.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers, brands } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { authenticateApiRequest } from "../../v1/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const [totalOffers] = await db
      .select({ value: count() })
      .from(offers)
      .where(eq(offers.status, "active"));

    const [totalBrands] = await db
      .select({ value: count() })
      .from(brands)
      .where(eq(brands.isActive, true));

    const [historicalLows] = await db
      .select({ value: count() })
      .from(offers)
      .where(and(eq(offers.status, "active"), eq(offers.isHistoricalLow, true)));

    const [greenZone] = await db
      .select({ value: count() })
      .from(offers)
      .where(and(eq(offers.status, "active"), eq(offers.trustZone, "green")));

    const categoryBreakdown = await db
      .select({ category: brands.category, count: count(offers.id) })
      .from(brands)
      .leftJoin(
        offers,
        and(eq(offers.brandId, brands.id), eq(offers.status, "active")),
      )
      .where(eq(brands.isActive, true))
      .groupBy(brands.category);

    return NextResponse.json({
      data: {
        activeOffers: Number(totalOffers?.value ?? 0),
        activeBrands: Number(totalBrands?.value ?? 0),
        historicalLows: Number(historicalLows?.value ?? 0),
        greenZoneOffers: Number(greenZone?.value ?? 0),
        byCategory: Object.fromEntries(
          categoryBreakdown.map((r) => [r.category, Number(r.count)]),
        ),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API v1 /stats]", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to fetch stats." },
      { status: 500 },
    );
  }
}
