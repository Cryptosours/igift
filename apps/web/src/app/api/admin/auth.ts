/**
 * Shared admin API authentication.
 * Bearer token via ADMIN_API_KEY env var.
 * Uses timing-safe comparison to prevent side-channel attacks.
 */

import { timingSafeEqual } from "crypto";

const ADMIN_KEY = process.env.ADMIN_API_KEY;

/** Constant-time string comparison to prevent timing attacks. */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function checkAdminAuth(request: Request): boolean {
  if (!ADMIN_KEY) return false; // No key configured — deny all
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const headerToken = request.headers.get("x-api-key")?.trim() ?? null;
  const token = bearerToken ?? headerToken;
  if (!token) return false;
  return safeCompare(token, ADMIN_KEY);
}
