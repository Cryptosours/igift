import { NextRequest, NextResponse } from "next/server";
import { searchDeals } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000, route: "search" });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const region = searchParams.get("region") ?? undefined;
  const trustZone = searchParams.get("trustZone") as "green" | "yellow" | undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  if (!q) {
    return NextResponse.json({ deals: [], total: 0, query: "" });
  }

  try {
    const results = await searchDeals(q, { limit, region, trustZone });
    return NextResponse.json({ deals: results, total: results.length, query: q });
  } catch {
    return NextResponse.json({ deals: [], total: 0, query: q, error: "Search temporarily unavailable" });
  }
}
