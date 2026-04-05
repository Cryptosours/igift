/**
 * GET /api/v1/brands
 *
 * Returns all active brands. Read-only. Requires X-API-Key.
 *
 * Query params:
 *   category — filter by category
 *   limit    — 1–200, default 100
 *   cursor   — pagination cursor (last brand id)
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { brands, offers } from "@/db/schema";
import type { Brand } from "@/db/schema";
import { eq, desc, and, gt, count } from "drizzle-orm";
import { authenticateApiRequest } from "../../v1/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const cursorId = parseInt(searchParams.get("cursor") ?? "0") || 0;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 200);

  try {
    const conditions = [eq(brands.isActive, true)];
    if (category) {
      conditions.push(eq(brands.category, category as Brand["category"]));
    }
    if (cursorId > 0) {
      conditions.push(gt(brands.id, cursorId));
    }

    const rows = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        category: brands.category,
        description: brands.description,
        regionsSupported: brands.regionsSupported,
        activeOffers: count(offers.id),
      })
      .from(brands)
      .leftJoin(
        offers,
        and(eq(offers.brandId, brands.id), eq(offers.status, "active")),
      )
      .where(and(...conditions))
      .groupBy(brands.id)
      .orderBy(desc(count(offers.id)), brands.name)
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return NextResponse.json({
      data,
      meta: { count: data.length, limit, hasMore, nextCursor },
    });
  } catch (error) {
    console.error("[API v1 /brands]", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to fetch brands." },
      { status: 500 },
    );
  }
}
