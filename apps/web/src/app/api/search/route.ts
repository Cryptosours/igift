import { NextResponse } from "next/server";
import { searchDeals } from "@/lib/data";
import { sampleDeals } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
    // DB unavailable — search sample data as fallback
    const lower = q.toLowerCase();
    const filtered = sampleDeals.filter(
      (d) =>
        d.brand.toLowerCase().includes(lower) ||
        d.title.toLowerCase().includes(lower) ||
        d.sourceName.toLowerCase().includes(lower),
    );
    return NextResponse.json({ deals: filtered, total: filtered.length, query: q });
  }
}
