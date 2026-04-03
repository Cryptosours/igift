/**
 * Parser Health Monitoring + Freshness SLAs
 *
 * Computes health status per source adapter based on:
 * - Freshness: how recently data was successfully fetched vs the SLA
 * - Reliability: fetch success rate over recent history
 * - Status: healthy / degraded / unhealthy / unknown
 *
 * Does NOT require a new table — derives everything from the existing
 * sources table (lastFetchedAt, lastSuccessAt, fetchSuccessRate, refreshIntervalMinutes).
 */

import { db } from "@/db";
import { sources, offers } from "@/db/schema";
import { eq, and, lt, count } from "drizzle-orm";

// ── Health Status Types ──

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface SourceHealth {
  slug: string;
  name: string;
  status: HealthStatus;
  /** Minutes since last successful fetch */
  minutesSinceSuccess: number | null;
  /** The SLA target in minutes (from refreshIntervalMinutes) */
  slaMinutes: number;
  /** Whether the source is past its SLA deadline */
  isStale: boolean;
  /** Fetch success rate (0-1) */
  successRate: number;
  /** Last successful fetch timestamp */
  lastSuccessAt: Date | null;
  /** Last attempted fetch timestamp */
  lastFetchedAt: Date | null;
  /** Whether the source is active */
  isActive: boolean;
  /** Trust zone */
  trustZone: string;
  /** Number of active offers from this source */
  activeOfferCount: number;
  /** Human-readable status message */
  message: string;
}

export interface HealthReport {
  generatedAt: Date;
  overall: HealthStatus;
  sources: SourceHealth[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
    stale: number;
  };
}

// ── SLA Configuration ──

/**
 * SLA multiplier: a source is "stale" if time since last success
 * exceeds refreshIntervalMinutes * SLA_STALENESS_MULTIPLIER.
 *
 * E.g., a source with 30-min refresh is stale after 60 minutes (2x).
 * "Degraded" kicks in at 1.5x the refresh interval.
 */
const SLA_STALENESS_MULTIPLIER = 2.0;
const SLA_DEGRADED_MULTIPLIER = 1.5;

/** Success rate thresholds */
const SUCCESS_RATE_DEGRADED = 0.8;
const SUCCESS_RATE_UNHEALTHY = 0.5;

// ── Health Computation ──

function computeStatus(
  minutesSinceSuccess: number | null,
  slaMinutes: number,
  successRate: number,
): { status: HealthStatus; message: string } {
  // No data yet
  if (minutesSinceSuccess === null) {
    return { status: "unknown", message: "Never fetched — no data available" };
  }

  const staleThreshold = slaMinutes * SLA_STALENESS_MULTIPLIER;
  const degradedThreshold = slaMinutes * SLA_DEGRADED_MULTIPLIER;

  // Check freshness first (most visible to users)
  if (minutesSinceSuccess > staleThreshold) {
    return {
      status: "unhealthy",
      message: `Data is ${Math.round(minutesSinceSuccess)} min stale (SLA: ${slaMinutes} min)`,
    };
  }

  // Check success rate
  if (successRate < SUCCESS_RATE_UNHEALTHY) {
    return {
      status: "unhealthy",
      message: `Success rate ${(successRate * 100).toFixed(0)}% is below 50% threshold`,
    };
  }

  if (minutesSinceSuccess > degradedThreshold) {
    return {
      status: "degraded",
      message: `Data is ${Math.round(minutesSinceSuccess)} min old (approaching SLA: ${slaMinutes} min)`,
    };
  }

  if (successRate < SUCCESS_RATE_DEGRADED) {
    return {
      status: "degraded",
      message: `Success rate ${(successRate * 100).toFixed(0)}% is below 80% target`,
    };
  }

  return {
    status: "healthy",
    message: `Fresh (${Math.round(minutesSinceSuccess)} min ago), ${(successRate * 100).toFixed(0)}% success rate`,
  };
}

// ── Public API ──

/** Generate a full health report for all sources */
export async function getHealthReport(): Promise<HealthReport> {
  const now = new Date();

  // Fetch all sources with their active offer counts
  const rows = await db
    .select({
      slug: sources.slug,
      name: sources.name,
      isActive: sources.isActive,
      trustZone: sources.trustZone,
      refreshIntervalMinutes: sources.refreshIntervalMinutes,
      lastFetchedAt: sources.lastFetchedAt,
      lastSuccessAt: sources.lastSuccessAt,
      fetchSuccessRate: sources.fetchSuccessRate,
      activeOfferCount: count(offers.id),
    })
    .from(sources)
    .leftJoin(
      offers,
      and(eq(sources.id, offers.sourceId), eq(offers.status, "active")),
    )
    .groupBy(sources.id)
    .orderBy(sources.name);

  const sourceHealths: SourceHealth[] = rows.map((row) => {
    const minutesSinceSuccess = row.lastSuccessAt
      ? (now.getTime() - new Date(row.lastSuccessAt).getTime()) / 60000
      : null;

    const slaMinutes = row.refreshIntervalMinutes;
    const successRate = row.fetchSuccessRate ?? 1.0;
    const isStale = minutesSinceSuccess !== null && minutesSinceSuccess > slaMinutes * SLA_STALENESS_MULTIPLIER;

    const { status, message } = row.isActive
      ? computeStatus(minutesSinceSuccess, slaMinutes, successRate)
      : { status: "unknown" as HealthStatus, message: "Source is disabled" };

    return {
      slug: row.slug,
      name: row.name,
      status,
      minutesSinceSuccess: minutesSinceSuccess !== null ? Math.round(minutesSinceSuccess) : null,
      slaMinutes,
      isStale,
      successRate,
      lastSuccessAt: row.lastSuccessAt,
      lastFetchedAt: row.lastFetchedAt,
      isActive: row.isActive,
      trustZone: row.trustZone,
      activeOfferCount: Number(row.activeOfferCount),
      message,
    };
  });

  const summary = {
    total: sourceHealths.length,
    healthy: sourceHealths.filter((s) => s.status === "healthy").length,
    degraded: sourceHealths.filter((s) => s.status === "degraded").length,
    unhealthy: sourceHealths.filter((s) => s.status === "unhealthy").length,
    unknown: sourceHealths.filter((s) => s.status === "unknown").length,
    stale: sourceHealths.filter((s) => s.isStale).length,
  };

  // Overall status: worst of all active sources
  const activeSources = sourceHealths.filter((s) => s.isActive);
  let overall: HealthStatus = "healthy";
  if (activeSources.some((s) => s.status === "unhealthy")) {
    overall = "unhealthy";
  } else if (activeSources.some((s) => s.status === "degraded")) {
    overall = "degraded";
  } else if (activeSources.some((s) => s.status === "unknown")) {
    overall = "unknown";
  }

  return {
    generatedAt: now,
    overall,
    sources: sourceHealths,
    summary,
  };
}

/** Mark offers from stale sources as "stale" status.
 *  Returns count of offers marked stale. */
export async function markStaleOffers(): Promise<number> {
  const report = await getHealthReport();
  const staleSlugs = report.sources
    .filter((s) => s.isStale && s.isActive)
    .map((s) => s.slug);

  if (staleSlugs.length === 0) return 0;

  // Get source IDs for stale sources
  const staleSourceRows = await db
    .select({ id: sources.id })
    .from(sources)
    .where(
      and(
        eq(sources.isActive, true),
        // Filter to stale slugs — use individual queries since we can't do IN with Drizzle easily
      ),
    );

  let totalMarked = 0;
  for (const slug of staleSlugs) {
    const [source] = await db
      .select({ id: sources.id })
      .from(sources)
      .where(eq(sources.slug, slug))
      .limit(1);

    if (!source) continue;

    const result = await db
      .update(offers)
      .set({
        status: "stale",
        suppressionReason: `Source '${slug}' exceeded freshness SLA`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(offers.sourceId, source.id),
          eq(offers.status, "active"),
        ),
      )
      .returning({ id: offers.id });

    totalMarked += result.length;
  }

  return totalMarked;
}
