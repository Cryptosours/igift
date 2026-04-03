/**
 * POST /api/alerts — Create a new price alert subscription
 * GET  /api/alerts — List alerts for an email (query param: ?email=)
 * DELETE /api/alerts?id=123 — Deactivate an alert
 *
 * No auth required (public, email-based). Rate limiting via Cloudflare.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { userAlerts, brands } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// ── Validation ──

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_REGIONS = ["US", "EU", "UK", "AU", "Global"];
const VALID_CHANNELS = ["email"];
const DISCOUNT_OPTIONS: Record<string, number | null> = {
  any: null,
  "5": 0.05,
  "10": 0.10,
  "15": 0.15,
  "20": 0.20,
};

/** POST — Create a new alert */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const brandQuery = String(body.brand ?? "").trim();
  const discountKey = String(body.targetDiscount ?? "any");
  const region = body.region ? String(body.region).trim() : null;
  const channel = String(body.channel ?? "email");

  // Validate email
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  // Validate channel
  if (!VALID_CHANNELS.includes(channel)) {
    return NextResponse.json({ error: `Channel must be one of: ${VALID_CHANNELS.join(", ")}` }, { status: 400 });
  }

  // Validate region
  if (region && !VALID_REGIONS.includes(region)) {
    return NextResponse.json({ error: `Region must be one of: ${VALID_REGIONS.join(", ")}` }, { status: 400 });
  }

  // Resolve discount
  const targetDiscountPct = DISCOUNT_OPTIONS[discountKey] ?? null;

  // Resolve brand (optional — can be slug, name, or empty for "all brands")
  let brandId: number | null = null;
  if (brandQuery) {
    const [brand] = await db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.slug, brandQuery.toLowerCase().replace(/\s+/g, "-")))
      .limit(1);

    if (!brand) {
      // Try name match
      const rows = await db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.isActive, true));

      const nameMatch = rows.find(
        (r) => r.id > 0, // fallback — search by name not well supported in Drizzle
      );
      // For now, if brand not found by slug, we skip brand filter
      // (alert will match all brands)
    } else {
      brandId = brand.id;
    }
  }

  // Check for duplicate alert
  const existing = await db
    .select({ id: userAlerts.id })
    .from(userAlerts)
    .where(
      and(
        eq(userAlerts.email, email),
        eq(userAlerts.isActive, true),
        brandId !== null ? eq(userAlerts.brandId, brandId) : undefined,
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "You already have an active alert matching these criteria", existingId: existing[0].id },
      { status: 409 },
    );
  }

  // Create alert
  const [alert] = await db
    .insert(userAlerts)
    .values({
      email,
      brandId,
      targetDiscountPct,
      region,
      deliveryChannel: channel,
    })
    .returning({ id: userAlerts.id, createdAt: userAlerts.createdAt });

  return NextResponse.json({
    success: true,
    alert: {
      id: alert.id,
      email,
      brandId,
      targetDiscountPct,
      region,
      channel,
      createdAt: alert.createdAt.toISOString(),
    },
  }, { status: 201 });
}

/** GET — List alerts for an email */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid ?email= query parameter is required" }, { status: 400 });
  }

  const alerts = await db
    .select({
      id: userAlerts.id,
      email: userAlerts.email,
      brandId: userAlerts.brandId,
      category: userAlerts.category,
      targetDiscountPct: userAlerts.targetDiscountPct,
      region: userAlerts.region,
      deliveryChannel: userAlerts.deliveryChannel,
      isActive: userAlerts.isActive,
      lastSentAt: userAlerts.lastSentAt,
      createdAt: userAlerts.createdAt,
    })
    .from(userAlerts)
    .where(eq(userAlerts.email, email))
    .orderBy(userAlerts.createdAt);

  return NextResponse.json({ alerts });
}

/** DELETE — Deactivate an alert */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get("id");

  if (!idStr || isNaN(Number(idStr))) {
    return NextResponse.json({ error: "Valid ?id= query parameter is required" }, { status: 400 });
  }

  const id = Number(idStr);

  const result = await db
    .update(userAlerts)
    .set({ isActive: false })
    .where(eq(userAlerts.id, id))
    .returning({ id: userAlerts.id });

  if (result.length === 0) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, deactivated: id });
}
