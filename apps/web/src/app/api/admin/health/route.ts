/**
 * GET /api/admin/health — Source health dashboard API
 *
 * Returns health status for all sources (freshness SLAs, success rates).
 * Protected by ADMIN_API_KEY.
 *
 * POST /api/admin/health/mark-stale — Mark offers from stale sources
 */

import { NextResponse } from "next/server";
import { getHealthReport, markStaleOffers } from "@/lib/health";
import { checkAdminAuth } from "../auth";

export const dynamic = "force-dynamic";

/** GET — Health report for all sources */
export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await getHealthReport();

    return NextResponse.json({
      generatedAt: report.generatedAt.toISOString(),
      overall: report.overall,
      summary: report.summary,
      sources: report.sources.map((s) => ({
        slug: s.slug,
        name: s.name,
        status: s.status,
        trustZone: s.trustZone,
        isActive: s.isActive,
        minutesSinceSuccess: s.minutesSinceSuccess,
        slaMinutes: s.slaMinutes,
        isStale: s.isStale,
        successRate: s.successRate,
        lastSuccessAt: s.lastSuccessAt?.toISOString() ?? null,
        lastFetchedAt: s.lastFetchedAt?.toISOString() ?? null,
        activeOfferCount: s.activeOfferCount,
        message: s.message,
      })),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { error: "Failed to generate health report" },
      { status: 500 },
    );
  }
}

/** POST — Mark offers from stale sources as stale */
export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const markedCount = await markStaleOffers();
    return NextResponse.json({
      success: true,
      offersMarkedStale: markedCount,
    });
  } catch (error) {
    console.error("Mark stale failed:", error);
    return NextResponse.json(
      { error: "Failed to mark stale offers" },
      { status: 500 },
    );
  }
}
