/**
 * /api/admin/moderation/offers/[id] — Direct offer moderation actions
 *
 * GET: Fetch offer details with moderation context
 * PATCH: Change offer status (approve, suppress, mark stale)
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers, sources, brands, moderationCases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkAdminAuth } from "../../../auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** GET /api/admin/moderation/offers/[id] — Full offer detail with moderation context */
export async function GET(request: Request, { params }: Props) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const offerId = parseInt(id);
  if (isNaN(offerId)) {
    return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
  }

  try {
    const [offer] = await db
      .select({
        id: offers.id,
        originalTitle: offers.originalTitle,
        normalizedTitle: offers.normalizedTitle,
        externalUrl: offers.externalUrl,
        faceValueCents: offers.faceValueCents,
        effectivePriceCents: offers.effectivePriceCents,
        effectiveDiscountPct: offers.effectiveDiscountPct,
        dealQualityScore: offers.dealQualityScore,
        confidenceScore: offers.confidenceScore,
        finalScore: offers.finalScore,
        status: offers.status,
        suppressionReason: offers.suppressionReason,
        trustZone: offers.trustZone,
        countryRedeemable: offers.countryRedeemable,
        provenance: offers.provenance,
        lastSeenAt: offers.lastSeenAt,
        createdAt: offers.createdAt,
        brandName: brands.name,
        brandSlug: brands.slug,
        sourceName: sources.name,
        sourceSlug: sources.slug,
        sourceTrustZone: sources.trustZone,
      })
      .from(offers)
      .innerJoin(brands, eq(offers.brandId, brands.id))
      .innerJoin(sources, eq(offers.sourceId, sources.id))
      .where(eq(offers.id, offerId));

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Get related moderation cases
    const cases = await db
      .select()
      .from(moderationCases)
      .where(eq(moderationCases.offerId, offerId));

    return NextResponse.json({ offer, moderationCases: cases });
  } catch (error) {
    console.error("Failed to fetch offer:", error);
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

/** PATCH /api/admin/moderation/offers/[id] — Set offer status */
export async function PATCH(request: Request, { params }: Props) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const offerId = parseInt(id);
  if (isNaN(offerId)) {
    return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = body.action as string;

    const validActions = ["approve", "suppress", "mark_stale", "pending_review"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be: ${validActions.join(", ")}` },
        { status: 400 },
      );
    }

    const statusMap: Record<string, string> = {
      approve: "active",
      suppress: "suppressed",
      mark_stale: "stale",
      pending_review: "pending_review",
    };

    const updates: Record<string, unknown> = {
      status: statusMap[action],
      updatedAt: new Date(),
    };

    if (action === "suppress") {
      updates.suppressionReason = body.reason ?? "Manually suppressed by admin";
    } else if (action === "approve") {
      updates.suppressionReason = null;
    }

    const [updated] = await db
      .update(offers)
      .set(updates)
      .where(eq(offers.id, offerId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Auto-resolve any open moderation cases for this offer if approved/suppressed
    if (action === "approve" || action === "suppress") {
      await db
        .update(moderationCases)
        .set({
          status: "resolved",
          resolution: action === "approve"
            ? "Offer approved by admin"
            : `Offer suppressed: ${body.reason ?? "admin action"}`,
          resolvedAt: new Date(),
        })
        .where(
          and(
            eq(moderationCases.offerId, offerId),
            eq(moderationCases.status, "open"),
          ),
        );
    }

    return NextResponse.json({ offer: updated });
  } catch (error) {
    console.error("Failed to update offer:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}
