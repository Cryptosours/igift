/**
 * Offer Revalidation & Staleness Detection
 *
 * Manages offer lifecycle at the individual offer level:
 * - Stale detection: offers not refreshed within source SLA
 * - Expiry: offers not seen for extended periods
 * - Disappeared detection: offers missing from latest ingestion run
 * - Revalidation summary for admin dashboard
 *
 * Works alongside health.ts (source-level) to provide full freshness coverage.
 */

import { db } from "@/db";
import { offers, sources } from "@/db/schema";
import { eq, and, lt, sql, ne, isNotNull } from "drizzle-orm";

// ── Configuration ──

/**
 * Offers not seen for this many multiples of their source's refresh interval
 * are marked stale. E.g., source refreshes every 60min → offer stale after 180min (3x).
 */
const OFFER_STALE_MULTIPLIER = 3;

/**
 * Offers not seen for this many days are expired (removed from active results).
 * These likely no longer exist on the source.
 */
const OFFER_EXPIRY_DAYS = 7;

/**
 * Offers not seen for this many days are candidates for cleanup (hard removal).
 * Not acted on yet — just tracked in the report for future use.
 */
const OFFER_CLEANUP_DAYS = 30;

// ── Types ──

export interface RevalidationResult {
  ranAt: Date;
  durationMs: number;
  staleMarked: number;
  expiredMarked: number;
  alreadyStale: number;
  alreadyExpired: number;
  cleanupCandidates: number;
  activeOffers: number;
}

export interface RevalidationReport {
  generatedAt: Date;
  /** Counts by offer status */
  statusCounts: {
    active: number;
    stale: number;
    expired: number;
    suppressed: number;
    pending_review: number;
  };
  /** Offers approaching staleness (>50% through SLA window) */
  atRiskCount: number;
  /** Offers that haven't been seen in 30+ days */
  cleanupCandidates: number;
  /** Per-source breakdown */
  sourceStaleness: Array<{
    sourceSlug: string;
    sourceName: string;
    activeOffers: number;
    staleOffers: number;
    expiredOffers: number;
    oldestLastSeenMinutes: number | null;
  }>;
}

// ── Core Revalidation ──

/**
 * Run full revalidation cycle:
 * 1. Mark stale: active offers not seen within source SLA * multiplier
 * 2. Mark expired: stale offers not seen for OFFER_EXPIRY_DAYS
 */
export async function runRevalidation(): Promise<RevalidationResult> {
  const startedAt = new Date();
  const now = new Date();

  // Step 1: Mark active offers as stale if not seen within SLA window
  // Uses a subquery to get each offer's source refresh interval
  const staleResult = await db.execute(sql`
    UPDATE offers o
    SET status = 'stale',
        suppression_reason = 'Offer not refreshed within source SLA (' || s.refresh_interval_minutes * ${OFFER_STALE_MULTIPLIER} || ' min)',
        updated_at = NOW()
    FROM sources s
    WHERE o.source_id = s.id
      AND o.status = 'active'
      AND o.last_seen_at < NOW() - (s.refresh_interval_minutes * ${OFFER_STALE_MULTIPLIER} || ' minutes')::interval
    RETURNING o.id
  `);
  const staleMarked = Array.isArray(staleResult) ? staleResult.length : 0;

  // Step 2: Mark stale offers as expired if not seen for OFFER_EXPIRY_DAYS
  const expiryThreshold = new Date(now.getTime() - OFFER_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const expiredResult = await db
    .update(offers)
    .set({
      status: "expired",
      suppressionReason: `Not seen for ${OFFER_EXPIRY_DAYS}+ days — likely removed from source`,
      updatedAt: now,
    })
    .where(
      and(
        eq(offers.status, "stale"),
        lt(offers.lastSeenAt, expiryThreshold),
      ),
    )
    .returning({ id: offers.id });
  const expiredMarked = expiredResult.length;

  // Step 3: Gather counts for reporting
  const countResult = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') AS active,
      COUNT(*) FILTER (WHERE status = 'stale') AS stale,
      COUNT(*) FILTER (WHERE status = 'expired') AS expired,
      COUNT(*) FILTER (WHERE last_seen_at < NOW() - INTERVAL '${sql.raw(String(OFFER_CLEANUP_DAYS))} days') AS cleanup
    FROM offers
  `);

  const counts = Array.isArray(countResult) && countResult.length > 0 ? countResult[0] : null;

  const completedAt = new Date();

  return {
    ranAt: startedAt,
    durationMs: completedAt.getTime() - startedAt.getTime(),
    staleMarked,
    expiredMarked,
    alreadyStale: Number(counts?.stale ?? 0),
    alreadyExpired: Number(counts?.expired ?? 0),
    cleanupCandidates: Number(counts?.cleanup ?? 0),
    activeOffers: Number(counts?.active ?? 0),
  };
}

/**
 * Generate a revalidation status report without modifying any data.
 * Used by the admin dashboard to show offer freshness state.
 */
export async function getRevalidationReport(): Promise<RevalidationReport> {
  const now = new Date();

  // Status counts
  const statusResult = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') AS active,
      COUNT(*) FILTER (WHERE status = 'stale') AS stale,
      COUNT(*) FILTER (WHERE status = 'expired') AS expired,
      COUNT(*) FILTER (WHERE status = 'suppressed') AS suppressed,
      COUNT(*) FILTER (WHERE status = 'pending_review') AS pending_review
    FROM offers
  `);

  const sc = Array.isArray(statusResult) && statusResult.length > 0 ? statusResult[0] : null;
  const statusCounts = {
    active: Number(sc?.active ?? 0),
    stale: Number(sc?.stale ?? 0),
    expired: Number(sc?.expired ?? 0),
    suppressed: Number(sc?.suppressed ?? 0),
    pending_review: Number(sc?.pending_review ?? 0),
  };

  // At-risk: active offers past 50% of their SLA window
  const atRiskResult = await db.execute(sql`
    SELECT COUNT(*) AS cnt
    FROM offers o
    JOIN sources s ON o.source_id = s.id
    WHERE o.status = 'active'
      AND o.last_seen_at < NOW() - (s.refresh_interval_minutes * ${OFFER_STALE_MULTIPLIER} * 0.5 || ' minutes')::interval
  `);
  const atRiskCount = Number(
    Array.isArray(atRiskResult) && atRiskResult.length > 0 ? atRiskResult[0]?.cnt ?? 0 : 0,
  );

  // Cleanup candidates (30+ days old)
  const cleanupResult = await db.execute(sql`
    SELECT COUNT(*) AS cnt
    FROM offers
    WHERE last_seen_at < NOW() - INTERVAL '${sql.raw(String(OFFER_CLEANUP_DAYS))} days'
  `);
  const cleanupCandidates = Number(
    Array.isArray(cleanupResult) && cleanupResult.length > 0 ? cleanupResult[0]?.cnt ?? 0 : 0,
  );

  // Per-source breakdown
  const sourceResult = await db.execute(sql`
    SELECT
      s.slug AS source_slug,
      s.name AS source_name,
      COUNT(*) FILTER (WHERE o.status = 'active') AS active_offers,
      COUNT(*) FILTER (WHERE o.status = 'stale') AS stale_offers,
      COUNT(*) FILTER (WHERE o.status = 'expired') AS expired_offers,
      EXTRACT(EPOCH FROM (NOW() - MIN(o.last_seen_at))) / 60 AS oldest_last_seen_minutes
    FROM sources s
    LEFT JOIN offers o ON s.id = o.source_id
    WHERE s.is_active = true
    GROUP BY s.id, s.slug, s.name
    ORDER BY s.name
  `);

  const sourceStaleness = (Array.isArray(sourceResult) ? sourceResult : []).map((row: Record<string, unknown>) => ({
    sourceSlug: String(row.source_slug ?? ""),
    sourceName: String(row.source_name ?? ""),
    activeOffers: Number(row.active_offers ?? 0),
    staleOffers: Number(row.stale_offers ?? 0),
    expiredOffers: Number(row.expired_offers ?? 0),
    oldestLastSeenMinutes: row.oldest_last_seen_minutes != null
      ? Math.round(Number(row.oldest_last_seen_minutes))
      : null,
  }));

  return {
    generatedAt: now,
    statusCounts,
    atRiskCount,
    cleanupCandidates,
    sourceStaleness,
  };
}
