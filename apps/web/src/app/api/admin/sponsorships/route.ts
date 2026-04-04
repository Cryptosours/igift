/**
 * GET  /api/admin/sponsorships       — list all sponsorships
 * POST /api/admin/sponsorships       — create a new sponsorship
 * PATCH /api/admin/sponsorships?id=N — update (activate/deactivate/extend)
 *
 * All endpoints require Bearer ADMIN_API_KEY.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { sponsoredPlacements, brands } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkAdminAuth } from "../auth";

export const dynamic = "force-dynamic";

// ── GET — list all sponsorships ──

export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: sponsoredPlacements.id,
      placementType: sponsoredPlacements.placementType,
      startsAt: sponsoredPlacements.startsAt,
      endsAt: sponsoredPlacements.endsAt,
      isActive: sponsoredPlacements.isActive,
      notes: sponsoredPlacements.notes,
      createdAt: sponsoredPlacements.createdAt,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
    })
    .from(sponsoredPlacements)
    .innerJoin(brands, eq(sponsoredPlacements.brandId, brands.id))
    .orderBy(desc(sponsoredPlacements.createdAt));

  return NextResponse.json({ sponsorships: rows });
}

// ── POST — create sponsorship ──

const VALID_TYPES = ["featured_deal", "featured_brand"] as const;

export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brandSlug = String(body.brandSlug ?? "").trim().toLowerCase();
  const placementType = String(body.placementType ?? "");
  const startsAt = body.startsAt ? new Date(String(body.startsAt)) : new Date();
  const endsAt = body.endsAt ? new Date(String(body.endsAt)) : null;
  const notes = body.notes ? String(body.notes).trim() : null;

  if (!brandSlug) {
    return NextResponse.json({ error: "brandSlug is required" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(placementType as typeof VALID_TYPES[number])) {
    return NextResponse.json(
      { error: `placementType must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!endsAt || isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: "endsAt is required (ISO 8601)" }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: "endsAt must be after startsAt" }, { status: 400 });
  }

  // Resolve brand
  const [brand] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.slug, brandSlug))
    .limit(1);

  if (!brand) {
    return NextResponse.json({ error: `Brand '${brandSlug}' not found` }, { status: 404 });
  }

  const [placement] = await db
    .insert(sponsoredPlacements)
    .values({
      brandId: brand.id,
      placementType: placementType as typeof VALID_TYPES[number],
      startsAt,
      endsAt,
      notes,
    })
    .returning({ id: sponsoredPlacements.id, createdAt: sponsoredPlacements.createdAt });

  return NextResponse.json({ success: true, placement }, { status: 201 });
}

// ── PATCH — update (activate / deactivate / extend) ──

export async function PATCH(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get("id");
  if (!idStr || isNaN(Number(idStr))) {
    return NextResponse.json({ error: "Valid ?id= query parameter is required" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Partial<{
    isActive: boolean;
    endsAt: Date;
    notes: string | null;
  }> = {};

  if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
  if (body.endsAt) {
    const d = new Date(String(body.endsAt));
    if (!isNaN(d.getTime())) updates.endsAt = d;
  }
  if ("notes" in body) updates.notes = body.notes ? String(body.notes) : null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const result = await db
    .update(sponsoredPlacements)
    .set(updates)
    .where(eq(sponsoredPlacements.id, Number(idStr)))
    .returning({ id: sponsoredPlacements.id });

  if (result.length === 0) {
    return NextResponse.json({ error: "Sponsorship not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, updated: result[0].id });
}
