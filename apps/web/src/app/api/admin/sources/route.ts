/**
 * /api/admin/sources — Source Registry CRUD
 *
 * GET: List all sources with health metadata
 * POST: Register a new source
 *
 * Protected by ADMIN_API_KEY env var.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { sources, offers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { checkAdminAuth } from "../auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/sources — List all sources with stats */
export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await db
      .select({
        id: sources.id,
        name: sources.name,
        slug: sources.slug,
        url: sources.url,
        sourceType: sources.sourceType,
        trustZone: sources.trustZone,
        isActive: sources.isActive,
        refreshIntervalMinutes: sources.refreshIntervalMinutes,
        lastFetchedAt: sources.lastFetchedAt,
        lastSuccessAt: sources.lastSuccessAt,
        fetchSuccessRate: sources.fetchSuccessRate,
        hasBuyerProtection: sources.hasBuyerProtection,
        hasRefundPolicy: sources.hasRefundPolicy,
        affiliateNetwork: sources.affiliateNetwork,
        contractNotes: sources.contractNotes,
        createdAt: sources.createdAt,
        offerCount: count(offers.id),
      })
      .from(sources)
      .leftJoin(offers, eq(sources.id, offers.sourceId))
      .groupBy(sources.id)
      .orderBy(sources.name);

    return NextResponse.json({ sources: results });
  } catch (error) {
    console.error("Failed to list sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 },
    );
  }
}

/** POST /api/admin/sources — Register a new source */
export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    const required = ["name", "slug", "url", "sourceType", "trustZone"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const validTrustZones = ["green", "yellow", "red"];
    if (!validTrustZones.includes(body.trustZone)) {
      return NextResponse.json(
        { error: `Invalid trustZone. Must be: ${validTrustZones.join(", ")}` },
        { status: 400 },
      );
    }

    const validSourceTypes = [
      "official_api", "affiliate_feed", "authorized_reseller",
      "marketplace_resale", "crypto_store", "deal_community", "public_page",
    ];
    if (!validSourceTypes.includes(body.sourceType)) {
      return NextResponse.json(
        { error: `Invalid sourceType. Must be: ${validSourceTypes.join(", ")}` },
        { status: 400 },
      );
    }

    const [newSource] = await db
      .insert(sources)
      .values({
        name: body.name,
        slug: body.slug,
        url: body.url,
        sourceType: body.sourceType,
        trustZone: body.trustZone,
        isActive: body.isActive ?? true,
        refreshIntervalMinutes: body.refreshIntervalMinutes ?? 60,
        hasBuyerProtection: body.hasBuyerProtection ?? false,
        hasRefundPolicy: body.hasRefundPolicy ?? false,
        affiliateNetwork: body.affiliateNetwork ?? null,
        contractNotes: body.contractNotes ?? null,
      })
      .returning();

    return NextResponse.json({ source: newSource }, { status: 201 });
  } catch (error) {
    console.error("Failed to create source:", error);
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "Source with this slug already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create source", details: message },
      { status: 500 },
    );
  }
}
