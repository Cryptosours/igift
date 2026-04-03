/**
 * GET  /api/admin/revalidation — Offer freshness report (read-only)
 * POST /api/admin/revalidation — Trigger revalidation cycle (marks stale + expired)
 *
 * Protected by ADMIN_API_KEY.
 */

import { NextResponse } from "next/server";
import { runRevalidation, getRevalidationReport } from "@/lib/revalidation";
import { checkAdminAuth } from "../auth";

export const dynamic = "force-dynamic";

/** GET — Revalidation status report (no mutations) */
export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await getRevalidationReport();

    return NextResponse.json({
      generatedAt: report.generatedAt.toISOString(),
      statusCounts: report.statusCounts,
      atRiskCount: report.atRiskCount,
      cleanupCandidates: report.cleanupCandidates,
      sourceStaleness: report.sourceStaleness,
    });
  } catch (error) {
    console.error("Revalidation report failed:", error);
    return NextResponse.json(
      { error: "Failed to generate revalidation report" },
      { status: 500 },
    );
  }
}

/** POST — Run revalidation cycle (stale detection + expiry) */
export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRevalidation();

    return NextResponse.json({
      success: true,
      ranAt: result.ranAt.toISOString(),
      durationMs: result.durationMs,
      staleMarked: result.staleMarked,
      expiredMarked: result.expiredMarked,
      activeOffers: result.activeOffers,
      alreadyStale: result.alreadyStale,
      alreadyExpired: result.alreadyExpired,
      cleanupCandidates: result.cleanupCandidates,
    });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { error: "Revalidation cycle failed" },
      { status: 500 },
    );
  }
}
