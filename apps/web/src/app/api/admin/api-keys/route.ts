/**
 * /api/admin/api-keys — B2B API key management
 *
 * GET    — List all keys (hashes redacted, metadata only)
 * POST   — Issue a new key (raw key shown once in response, then lost)
 * DELETE — Revoke a key by id
 *
 * Protected by ADMIN_API_KEY.
 */

import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkAdminAuth } from "../auth";

export const dynamic = "force-dynamic";

/** Generate a cryptographically random API key: igift_live_<32 hex bytes> */
function generateRawKey(): string {
  return `igift_live_${randomBytes(32).toString("hex")}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// ── GET — list all keys ──

export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        ownerEmail: apiKeys.ownerEmail,
        tier: apiKeys.tier,
        rateLimitPerHour: apiKeys.rateLimitPerHour,
        isActive: apiKeys.isActive,
        requestCountHour: apiKeys.requestCountHour,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
        // keyHash intentionally excluded from listing — internal only
      })
      .from(apiKeys)
      .orderBy(desc(apiKeys.createdAt));

    return NextResponse.json({ keys, total: keys.length });
  } catch (error) {
    console.error("[admin/api-keys GET]", error);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

// ── POST — issue a new key ──

export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; ownerEmail?: string; tier?: "free" | "pro" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, ownerEmail, tier = "free" } = body;
  if (!name || !ownerEmail) {
    return NextResponse.json({ error: "name and ownerEmail are required" }, { status: 400 });
  }

  const rawKey = generateRawKey();
  const keyHash = sha256(rawKey);
  const rateLimitPerHour = tier === "pro" ? 1000 : 100;

  try {
    const [created] = await db
      .insert(apiKeys)
      .values({ name, ownerEmail, tier, keyHash, rateLimitPerHour })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        ownerEmail: apiKeys.ownerEmail,
        tier: apiKeys.tier,
        rateLimitPerHour: apiKeys.rateLimitPerHour,
        createdAt: apiKeys.createdAt,
      });

    return NextResponse.json(
      {
        // rawKey is shown ONCE here and never again — client must save it
        key: rawKey,
        ...created,
        warning: "Save this key now — it cannot be retrieved again.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[admin/api-keys POST]", error);
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}

// ── DELETE — revoke by id ──

export async function DELETE(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") ?? "");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  try {
    await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, id));
    return NextResponse.json({ revoked: true, id });
  } catch (error) {
    console.error("[admin/api-keys DELETE]", error);
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
  }
}
