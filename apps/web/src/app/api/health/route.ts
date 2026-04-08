/**
 * Health Check API — GET /api/health
 *
 * Lightweight endpoint for uptime monitors and infrastructure checks.
 *
 * Public (no auth):
 *   Returns { status: "ok"|"degraded"|"down", timestamp, offerCount }
 *   HTTP 200 if DB reachable, 503 if not.
 *
 * Authenticated (?detail=true + ADMIN_API_KEY):
 *   Returns full source-level health report with SLA compliance.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers, sources } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { checkAdminAuth } from "@/app/api/admin/auth";
import { getHealthReport } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const start = Date.now();

  try {
    // Basic DB connectivity check + offer count
    const [activeOffers] = await db
      .select({ total: count(offers.id) })
      .from(offers)
      .where(eq(offers.status, "active"));

    const [activeSources] = await db
      .select({ total: count(sources.id) })
      .from(sources)
      .where(eq(sources.isActive, true));

    const offerCount = Number(activeOffers?.total ?? 0);
    const sourceCount = Number(activeSources?.total ?? 0);

    // Determine basic status
    const status = offerCount > 0 ? "ok" : sourceCount > 0 ? "degraded" : "down";

    // If detail requested and admin-authenticated, include full report
    const wantsDetail = request.nextUrl.searchParams.get("detail") === "true";
    const isAdmin = checkAdminAuth(request);

    if (wantsDetail && isAdmin) {
      const report = await getHealthReport();
      return NextResponse.json(
        {
          status,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - start,
          offers: offerCount,
          sources: sourceCount,
          report,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - start,
        offers: offerCount,
        sources: sourceCount,
      },
      { status: 200 },
    );
  } catch (error) {
    // DB unreachable or other fatal error
    return NextResponse.json(
      {
        status: "down",
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - start,
        error: "Database connectivity check failed",
      },
      { status: 503 },
    );
  }
}
