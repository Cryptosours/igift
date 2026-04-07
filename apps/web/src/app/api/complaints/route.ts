/**
 * POST /api/complaints — Submit a merchant/data quality complaint
 *
 * Public endpoint. Rate-limited via Cloudflare.
 * Stores complaints via the moderationCases table for admin review.
 * Does NOT immediately modify live offer data.
 *
 * Complaint types:
 * - "incorrect_price"   — listed price doesn't match the actual source
 * - "wrong_brand"       — offer is attributed to the wrong brand
 * - "expired"           — deal is no longer available at source
 * - "region_mismatch"   — offer is not actually available in listed region
 * - "low_quality"       — source quality concern (misleading, spam, etc.)
 * - "other"             — catch-all
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { moderationCases, offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const VALID_COMPLAINT_TYPES = [
  "incorrect_price",
  "wrong_brand",
  "expired",
  "region_mismatch",
  "low_quality",
  "other",
] as const;

type ComplaintType = (typeof VALID_COMPLAINT_TYPES)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Friendly labels shown in admin
const COMPLAINT_LABEL: Record<ComplaintType, string> = {
  incorrect_price: "Incorrect Price",
  wrong_brand: "Wrong Brand",
  expired: "Expired Deal",
  region_mismatch: "Region Mismatch",
  low_quality: "Low Quality Source",
  other: "Other",
};

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 5, windowMs: 60_000, route: "complaints" });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const offerId = body.offerId ? Number(body.offerId) : null;
  const complaintType = String(body.complaintType ?? "").trim() as ComplaintType;
  const description = String(body.description ?? "").trim();
  const reporterEmail = body.reporterEmail
    ? String(body.reporterEmail).trim().toLowerCase()
    : null;

  // Validate required fields
  if (!offerId || isNaN(offerId)) {
    return NextResponse.json({ error: "offerId is required" }, { status: 400 });
  }

  if (!VALID_COMPLAINT_TYPES.includes(complaintType)) {
    return NextResponse.json(
      { error: `complaintType must be one of: ${VALID_COMPLAINT_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  if (description.length < 10) {
    return NextResponse.json(
      { error: "description must be at least 10 characters" },
      { status: 400 },
    );
  }

  if (description.length > 1000) {
    return NextResponse.json(
      { error: "description must be under 1000 characters" },
      { status: 400 },
    );
  }

  if (reporterEmail && !EMAIL_RE.test(reporterEmail)) {
    return NextResponse.json(
      { error: "reporterEmail is not a valid email" },
      { status: 400 },
    );
  }

  // Verify the offer exists and get the source
  const [offer] = await db
    .select({ id: offers.id, sourceId: offers.sourceId })
    .from(offers)
    .where(eq(offers.id, offerId))
    .limit(1);

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  // Build description including reporter info
  const fullDescription = [
    `Type: ${COMPLAINT_LABEL[complaintType]}`,
    reporterEmail ? `Reporter: ${reporterEmail}` : null,
    `Details: ${description}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Insert into moderationCases
  const [caseRecord] = await db
    .insert(moderationCases)
    .values({
      offerId,
      sourceId: offer.sourceId,
      caseType: `complaint:${complaintType}`,
      description: fullDescription,
      status: "open",
    })
    .returning({ id: moderationCases.id, createdAt: moderationCases.createdAt });

  return NextResponse.json(
    {
      success: true,
      caseId: caseRecord.id,
      message:
        "Thank you for your report. Our team will review it within 48 hours.",
      createdAt: caseRecord.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
