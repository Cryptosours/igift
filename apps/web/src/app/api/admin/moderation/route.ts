/**
 * /api/admin/moderation — Moderation case management
 *
 * GET: List moderation cases with filters
 * POST: Create a new moderation case
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { moderationCases, offers, sources, brands } from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { checkAdminAuth } from "../auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/moderation — List cases with optional filters */
export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // open, resolved, dismissed
    const caseType = searchParams.get("type"); // suspicious_discount, new_source, missing_region, manual_report, etc.
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const conditions = [];
    if (status) conditions.push(eq(moderationCases.status, status));
    if (caseType) conditions.push(eq(moderationCases.caseType, caseType));

    const cases = await db
      .select({
        id: moderationCases.id,
        caseType: moderationCases.caseType,
        description: moderationCases.description,
        status: moderationCases.status,
        resolution: moderationCases.resolution,
        createdAt: moderationCases.createdAt,
        resolvedAt: moderationCases.resolvedAt,
        // Joined offer info
        offerId: moderationCases.offerId,
        offerTitle: offers.originalTitle,
        offerScore: offers.finalScore,
        offerStatus: offers.status,
        offerDiscount: offers.effectiveDiscountPct,
        offerTrustZone: offers.trustZone,
        // Joined source info
        sourceId: moderationCases.sourceId,
        sourceName: sources.name,
        sourceSlug: sources.slug,
        // Brand info (via offer)
        brandName: brands.name,
        brandSlug: brands.slug,
      })
      .from(moderationCases)
      .leftJoin(offers, eq(moderationCases.offerId, offers.id))
      .leftJoin(sources, eq(moderationCases.sourceId, sources.id))
      .leftJoin(brands, eq(offers.brandId, brands.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(moderationCases.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(moderationCases)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get status summary
    const statusCounts = await db
      .select({
        status: moderationCases.status,
        count: count(),
      })
      .from(moderationCases)
      .groupBy(moderationCases.status);

    return NextResponse.json({
      cases,
      total,
      limit,
      offset,
      summary: Object.fromEntries(statusCounts.map((s) => [s.status, s.count])),
    });
  } catch (error) {
    console.error("Failed to list moderation cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation cases" },
      { status: 500 },
    );
  }
}

/** POST /api/admin/moderation — Create a moderation case */
export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.caseType || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields: caseType, description" },
        { status: 400 },
      );
    }

    const validTypes = [
      "suspicious_discount",
      "new_source",
      "missing_region",
      "stale_data",
      "manual_report",
      "fraud_report",
      "invalid_code",
      "merchant_complaint",
      "price_anomaly",
    ];
    if (!validTypes.includes(body.caseType)) {
      return NextResponse.json(
        { error: `Invalid caseType. Must be: ${validTypes.join(", ")}` },
        { status: 400 },
      );
    }

    // If offerId provided, verify it exists and optionally set offer to pending_review
    if (body.offerId) {
      const [offer] = await db
        .select({ id: offers.id, sourceId: offers.sourceId })
        .from(offers)
        .where(eq(offers.id, body.offerId));
      if (!offer) {
        return NextResponse.json(
          { error: `Offer ${body.offerId} not found` },
          { status: 404 },
        );
      }
      // Auto-set sourceId from the offer if not provided
      if (!body.sourceId) body.sourceId = offer.sourceId;
    }

    const [newCase] = await db
      .insert(moderationCases)
      .values({
        offerId: body.offerId ?? null,
        sourceId: body.sourceId ?? null,
        caseType: body.caseType,
        description: body.description,
        status: "open",
      })
      .returning();

    // If flagging an offer, set it to pending_review
    if (body.offerId && body.flagOffer !== false) {
      await db
        .update(offers)
        .set({
          status: "pending_review",
          suppressionReason: `Moderation case #${newCase.id}: ${body.caseType}`,
          updatedAt: new Date(),
        })
        .where(eq(offers.id, body.offerId));
    }

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error("Failed to create moderation case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 },
    );
  }
}
