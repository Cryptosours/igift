import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory sliding-window rate limiter for public API routes.
 *
 * Each "bucket" is identified by a key (typically IP + route).
 * Tokens are stored as timestamps; expired tokens are pruned on each check.
 *
 * Limits reset after `windowMs`. Not shared across serverless instances
 * or restarts — acceptable for a single-VPS deploy. For multi-instance,
 * swap to Redis/Upstash.
 */

interface TokenBucket {
  timestamps: number[];
}

const store = new Map<string, TokenBucket>();

// Prune stale entries every 5 minutes to prevent memory leaks
const PRUNE_INTERVAL_MS = 5 * 60_000;
let lastPrune = Date.now();

function pruneStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  const cutoff = now - windowMs;
  for (const [key, bucket] of store) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length === 0) store.delete(key);
  }
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds (default: 60_000 = 1 minute) */
  windowMs?: number;
  /** Route identifier for per-route limits (default: "global") */
  route?: string;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetUnix: number;
}

/** Extract client IP from request headers (Cloudflare → X-Forwarded-For → fallback) */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Check rate limit and return result with headers info */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig,
): RateLimitResult {
  const { limit, windowMs = 60_000, route = "global" } = config;
  const now = Date.now();
  const windowStart = now - windowMs;
  const key = `${ip}:${route}`;

  pruneStaleEntries(windowMs);

  let bucket = store.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    store.set(key, bucket);
  }

  // Remove expired timestamps
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  const resetUnix = Math.ceil((now + windowMs) / 1000);

  if (bucket.timestamps.length >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetUnix,
    };
  }

  bucket.timestamps.push(now);

  return {
    allowed: true,
    limit,
    remaining: limit - bucket.timestamps.length,
    resetUnix,
  };
}

/** Convenience: check rate limit and return 429 response if exceeded, or null if allowed */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "rate_limit_exceeded",
        message: `Rate limit of ${result.limit} requests per ${Math.round((config.windowMs ?? 60_000) / 1000)}s exceeded.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetUnix),
          "Retry-After": String(Math.ceil((config.windowMs ?? 60_000) / 1000)),
        },
      },
    );
  }

  return null;
}

/** Add rate limit headers to a successful response */
export function withRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.resetUnix));
  return response;
}
