/**
 * /api/admin/moderation/[id] — Individual case management
 *
 * GET: Fetch case details
 * PATCH: Resolve or update a case (approve, suppress, dismiss)
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { moderationCases, offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminAuth } from "../../auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** GET /api/admin/moderation/[id] — Fetch case details */
export async function GET(request: Request, { params }: Props) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) {
    return NextResponse.json({ error: "Invalid case ID" }, { status: 400 });
  }

  try {
    const [modCase] = await db
      .select()
      .from(moderationCases)
      .where(eq(moderationCases.id, caseId));

    if (!modCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({ case: modCase });
  } catch (error) {
    console.error("Failed to fetch case:", error);
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

/** PATCH /api/admin/moderation/[id] — Resolve/update a case */
export async function PATCH(request: Request, { params }: Props) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) {
    return NextResponse.json({ error: "Invalid case ID" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Fetch the existing case
    const [existing] = await db
      .select()
      .from(moderationCases)
      .where(eq(moderationCases.id, caseId));

    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Determine the action
    const action = body.action as string | undefined;
    const validActions = ["approve", "suppress", "dismiss", "reopen"];

    if (action && !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be: ${validActions.join(", ")}` },
        { status: 400 },
      );
    }

    // Build update
    const updates: Record<string, unknown> = {};
    if (body.resolution) updates.resolution = body.resolution;

    if (action === "approve" || action === "dismiss") {
      updates.status = "resolved";
      updates.resolvedAt = new Date();
      updates.resolution = body.resolution ?? (action === "approve" ? "Approved — offer is legitimate" : "Dismissed — no action needed");
    } else if (action === "suppress") {
      updates.status = "resolved";
      updates.resolvedAt = new Date();
      updates.resolution = body.resolution ?? "Suppressed — offer removed from listings";
    } else if (action === "reopen") {
      updates.status = "open";
      updates.resolvedAt = null;
      updates.resolution = null;
    }

    const [updated] = await db
      .update(moderationCases)
      .set(updates)
      .where(eq(moderationCases.id, caseId))
      .returning();

    // Apply the action to the linked offer
    if (existing.offerId && action) {
      if (action === "approve") {
        await db
          .update(offers)
          .set({
            status: "active",
            suppressionReason: null,
            updatedAt: new Date(),
          })
          .where(eq(offers.id, existing.offerId));
      } else if (action === "suppress") {
        await db
          .update(offers)
          .set({
            status: "suppressed",
            suppressionReason: body.resolution ?? `Suppressed via moderation case #${caseId}`,
            updatedAt: new Date(),
          })
          .where(eq(offers.id, existing.offerId));
      } else if (action === "dismiss") {
        // Dismiss = no issue found, restore to active
        await db
          .update(offers)
          .set({
            status: "active",
            suppressionReason: null,
            updatedAt: new Date(),
          })
          .where(eq(offers.id, existing.offerId));
      }
    }

    return NextResponse.json({ case: updated });
  } catch (error) {
    console.error("Failed to update case:", error);
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}
