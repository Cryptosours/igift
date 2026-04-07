/**
 * GET  /api/watchlist          — return all watched brand slugs for this session
 * POST /api/watchlist          — add a brand to watchlist   { brandSlug: string }
 * DELETE /api/watchlist?slug=  — remove a brand from watchlist
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { watchlistItems, brands } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "igift_session";

async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

/** GET — list all watched brands for this session */
export async function GET() {
  const sessionId = await getSession();
  if (!sessionId) return NextResponse.json({ watched: [] });

  const rows = await db
    .select({
      brandId: watchlistItems.brandId,
      slug: brands.slug,
      name: brands.name,
      category: brands.category,
      createdAt: watchlistItems.createdAt,
    })
    .from(watchlistItems)
    .innerJoin(brands, eq(watchlistItems.brandId, brands.id))
    .where(eq(watchlistItems.sessionId, sessionId))
    .orderBy(watchlistItems.createdAt);

  return NextResponse.json({ watched: rows });
}

/** POST — add brand to watchlist */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 20, windowMs: 60_000, route: "watchlist" });
  if (limited) return limited;

  const sessionId = await getSession();
  if (!sessionId) {
    return NextResponse.json({ error: "No session — please reload the page" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brandSlug = String(body.brandSlug ?? "").trim().toLowerCase();
  if (!brandSlug) {
    return NextResponse.json({ error: "brandSlug is required" }, { status: 400 });
  }

  const [brand] = await db
    .select({ id: brands.id, slug: brands.slug })
    .from(brands)
    .where(eq(brands.slug, brandSlug))
    .limit(1);

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Upsert (ignore conflict if already watched)
  await db
    .insert(watchlistItems)
    .values({ sessionId, brandId: brand.id })
    .onConflictDoNothing();

  return NextResponse.json({ success: true, slug: brand.slug }, { status: 201 });
}

/** DELETE — remove brand from watchlist */
export async function DELETE(request: NextRequest) {
  const limited = rateLimit(request, { limit: 20, windowMs: 60_000, route: "watchlist" });
  if (limited) return limited;

  const sessionId = await getSession();
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const brandSlug = searchParams.get("slug")?.trim().toLowerCase();

  if (!brandSlug) {
    return NextResponse.json({ error: "?slug= is required" }, { status: 400 });
  }

  const [brand] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.slug, brandSlug))
    .limit(1);

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  await db
    .delete(watchlistItems)
    .where(
      and(
        eq(watchlistItems.sessionId, sessionId),
        eq(watchlistItems.brandId, brand.id),
      ),
    );

  return NextResponse.json({ success: true });
}
