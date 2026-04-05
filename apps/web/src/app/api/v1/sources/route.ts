import { NextResponse } from "next/server";
import { getAllSourceScorecards } from "@/lib/data";

/**
 * GET /api/v1/sources
 *
 * Returns trust scorecards for all monitored sources.
 * Sorted by trustScore descending.
 *
 * Response shape:
 * {
 *   sources: SourceScorecard[],
 *   meta: { total, greenCount, yellowCount, redCount, generatedAt }
 * }
 */
export const revalidate = 1800; // 30 min ISR cache

export async function GET() {
  try {
    const all = await getAllSourceScorecards();
    const sorted = [...all].sort((a, b) => b.trustScore - a.trustScore);

    const meta = {
      total: sorted.length,
      greenCount: sorted.filter((s) => s.trustZone === "green").length,
      yellowCount: sorted.filter((s) => s.trustZone === "yellow").length,
      redCount: sorted.filter((s) => s.trustZone === "red").length,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { sources: sorted, meta },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/v1/sources] error:", err);
    return NextResponse.json({ error: "Failed to load sources" }, { status: 500 });
  }
}
