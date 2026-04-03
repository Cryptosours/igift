/**
 * POST /api/ingest — Trigger the ingestion pipeline
 *
 * Protected by a simple shared secret (INGEST_API_KEY env var).
 * In production, this would be called by a cron job or scheduler.
 *
 * Query params:
 *   source: optional source slug to ingest only one source
 *   dryRun: if "true", fetches but doesn't write to DB
 */

import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingest/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes max for full pipeline

const INGEST_KEY = process.env.INGEST_API_KEY ?? "dev-ingest-key";

export async function POST(request: Request) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  const providedKey = authHeader?.replace("Bearer ", "");

  if (providedKey !== INGEST_KEY) {
    return NextResponse.json(
      { error: "Unauthorized — provide valid INGEST_API_KEY" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const sourceSlug = searchParams.get("source") ?? undefined;
  const dryRun = searchParams.get("dryRun") === "true";

  try {
    const result = await runIngestion({ sourceSlug, dryRun });

    return NextResponse.json({
      success: true,
      dryRun,
      duration: `${result.durationMs}ms`,
      summary: {
        totalOffersProcessed: result.totalOffersProcessed,
        totalOffersUpserted: result.totalOffersUpserted,
        totalFlagged: result.totalFlagged,
        totalErrors: result.totalErrors,
        staleMarked: result.staleMarked,
        revalidation: result.revalidation,
        sourcesProcessed: result.sources.length,
      },
      sources: result.sources.map((s) => ({
        source: s.sourceSlug,
        name: s.sourceName,
        fetchDurationMs: s.fetchDurationMs,
        rawOffers: s.rawOfferCount,
        normalized: s.normalizedCount,
        upserted: s.upsertedCount,
        flagged: s.flaggedCount,
        skipped: s.skippedCount,
        failed: s.failed,
        warnings: s.warnings.length > 0 ? s.warnings : undefined,
      })),
    });
  } catch (error) {
    console.error("Ingestion failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Ingestion pipeline failed", details: message },
      { status: 500 },
    );
  }
}

/** GET /api/ingest — Returns pipeline info (no auth required) */
export async function GET() {
  return NextResponse.json({
    description: "RealDeal Ingestion Pipeline",
    method: "POST to trigger ingestion",
    auth: "Bearer token via INGEST_API_KEY",
    params: {
      source: "optional — ingest only this source slug",
      dryRun: "true — fetch and normalize but don't write to DB",
    },
  });
}
