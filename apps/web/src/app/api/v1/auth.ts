/**
 * B2B API v1 — Key authentication + rate limiting
 *
 * Keys are passed via: X-API-Key header (or Authorization: Bearer <key>)
 * Stored as SHA-256 hex hashes — raw key is never persisted.
 *
 * Rate limiting uses a DB-side rolling 1-hour window:
 *   - If now() > windowStartAt + 1h → reset counter and window
 *   - Otherwise increment counter
 *   - If counter > rateLimitPerHour → 429
 *
 * This avoids Redis for V1 at the cost of one extra DB write per request.
 * Acceptable at B2B volumes (<100 clients).
 */

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export interface ApiAuthResult {
  ok: true;
  keyId: number;
  tier: "free" | "pro";
}

export interface ApiAuthError {
  ok: false;
  response: NextResponse;
}

export type ApiAuthOutcome = ApiAuthResult | ApiAuthError;

/** Hash a raw API key to its stored form */
export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Extract raw key from request headers */
function extractRawKey(request: Request): string | null {
  const xKey = request.headers.get("x-api-key");
  if (xKey) return xKey.trim();
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

/** Authenticate an API request. Returns key metadata or an error response. */
export async function authenticateApiRequest(request: Request): Promise<ApiAuthOutcome> {
  const raw = extractRawKey(request);
  if (!raw) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "missing_api_key", message: "Provide your API key via X-API-Key header or Authorization: Bearer <key>." },
        { status: 401 },
      ),
    };
  }

  const keyHash = hashApiKey(raw);

  let row;
  try {
    [row] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).limit(1);
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "server_error", message: "Authentication service unavailable." },
        { status: 503 },
      ),
    };
  }

  if (!row || !row.isActive) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "invalid_api_key", message: "API key not found or revoked." },
        { status: 401 },
      ),
    };
  }

  // Rolling-window rate limit check + counter update
  const now = Date.now();
  const windowStart = row.windowStartAt?.getTime() ?? now;
  const windowExpired = now - windowStart > ONE_HOUR_MS;

  if (windowExpired) {
    // Reset window
    await db.update(apiKeys)
      .set({ requestCountHour: 1, windowStartAt: new Date(now), lastUsedAt: new Date(now) })
      .where(eq(apiKeys.id, row.id));
  } else if (row.requestCountHour >= row.rateLimitPerHour) {
    const resetMs = ONE_HOUR_MS - (now - windowStart);
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message: `Rate limit of ${row.rateLimitPerHour} requests/hour exceeded.`,
          retryAfterSeconds: Math.ceil(resetMs / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(resetMs / 1000)),
            "X-RateLimit-Limit": String(row.rateLimitPerHour),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil((windowStart + ONE_HOUR_MS) / 1000)),
          },
        },
      ),
    };
  } else {
    await db.update(apiKeys)
      .set({ requestCountHour: sql`${apiKeys.requestCountHour} + 1`, lastUsedAt: new Date(now) })
      .where(eq(apiKeys.id, row.id));
  }

  return { ok: true, keyId: row.id, tier: row.tier };
}

/** Standard rate-limit headers for successful responses */
export function rateLimitHeaders(remaining: number, limit: number, resetUnix: number): HeadersInit {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(resetUnix),
  };
}
