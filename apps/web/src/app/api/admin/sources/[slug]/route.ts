/**
 * /api/admin/sources/[slug] — Individual source management
 *
 * GET: Fetch source details
 * PATCH: Update source fields (trust zone, active state, refresh interval, etc.)
 * DELETE: Deactivate a source (soft delete — sets isActive to false)
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { sources } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ADMIN_KEY = process.env.ADMIN_API_KEY ?? "dev-admin-key";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") === ADMIN_KEY;
}

type Props = { params: Promise<{ slug: string }> };

/** GET /api/admin/sources/[slug] */
export async function GET(request: Request, { params }: Props) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const [source] = await db
    .select()
    .from(sources)
    .where(eq(sources.slug, slug))
    .limit(1);

  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json({ source });
}

/** PATCH /api/admin/sources/[slug] — Update source fields */
export async function PATCH(request: Request, { params }: Props) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const [existing] = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.slug, slug))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  const body = await request.json();

  // Only allow specific fields to be updated
  const allowedFields: Record<string, boolean> = {
    name: true,
    url: true,
    trustZone: true,
    isActive: true,
    refreshIntervalMinutes: true,
    hasBuyerProtection: true,
    hasRefundPolicy: true,
    affiliateNetwork: true,
    contractNotes: true,
  };

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const [key, value] of Object.entries(body)) {
    if (allowedFields[key]) {
      updates[key] = value;
    }
  }

  // Validate trust zone if provided
  if (updates.trustZone && !["green", "yellow", "red"].includes(updates.trustZone as string)) {
    return NextResponse.json(
      { error: "Invalid trustZone" },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(sources)
    .set(updates)
    .where(eq(sources.id, existing.id))
    .returning();

  return NextResponse.json({ source: updated });
}

/** DELETE /api/admin/sources/[slug] — Soft-delete (deactivate) */
export async function DELETE(request: Request, { params }: Props) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const [existing] = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.slug, slug))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  await db
    .update(sources)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(sources.id, existing.id));

  return NextResponse.json({ message: `Source '${slug}' deactivated` });
}
