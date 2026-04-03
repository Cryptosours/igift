/**
 * Duplicate Clustering Engine
 *
 * Groups offers that represent the same product (brand + denomination + currency)
 * from different sources. This enables:
 * - "Best price across N sources" display
 * - Confidence boost when multiple sources agree
 * - Deduplication in deal listings (show best offer per cluster)
 *
 * Cluster key: brandSlug:denomination:currency
 * Offers with the same key are considered duplicates from different sources.
 *
 * Runs after ingestion to update cluster assignments and confidence scores.
 */

import { db } from "@/db";
import { offers, brands, sources } from "@/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";
import { scoreOffer } from "@/lib/scoring";

// ── Types ──

export interface ClusterResult {
  clustersFound: number;
  offersUpdated: number;
  confidenceBoosts: number;
  clusters: ClusterSummary[];
}

export interface ClusterSummary {
  clusterKey: string;
  brandSlug: string;
  denomination: string | null;
  currency: string;
  offerCount: number;
  sourceCount: number;
  bestPriceCents: number;
  bestSourceSlug: string;
  priceSpreadPct: number;
}

// ── Clustering Logic ──

/**
 * Build cluster key for an offer.
 * Format: brandSlug:denomination:currency
 * Denomination is normalized to lowercase for consistent matching.
 */
function clusterKey(brandSlug: string, denomination: string | null, currency: string): string {
  const denom = (denomination ?? "default").toLowerCase().trim();
  return `${brandSlug}:${denom}:${currency.toUpperCase()}`;
}

/**
 * Run duplicate clustering across all active offers.
 *
 * 1. Groups active offers by cluster key
 * 2. For clusters with 2+ sources, updates scoring with source agreement data
 * 3. Returns cluster statistics
 */
export async function runClustering(): Promise<ClusterResult> {
  // Fetch all active/pending_review offers with brand and source info
  const rows = await db
    .select({
      id: offers.id,
      brandSlug: brands.slug,
      denomination: offers.denomination,
      currency: offers.currency,
      effectivePriceCents: offers.effectivePriceCents,
      faceValueCents: offers.faceValueCents,
      effectiveDiscountPct: offers.effectiveDiscountPct,
      sourceId: offers.sourceId,
      sourceSlug: sources.slug,
      trustZone: offers.trustZone,
      sellerRating: offers.sellerRating,
      status: offers.status,
      dealQualityScore: offers.dealQualityScore,
      confidenceScore: offers.confidenceScore,
    })
    .from(offers)
    .innerJoin(brands, eq(offers.brandId, brands.id))
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .where(
      sql`${offers.status} IN ('active', 'pending_review')`,
    );

  // Group by cluster key
  const clusters = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = clusterKey(row.brandSlug, row.denomination, row.currency);
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(row);
  }

  let offersUpdated = 0;
  let confidenceBoosts = 0;
  const clusterSummaries: ClusterSummary[] = [];

  for (const [key, members] of clusters) {
    // Count unique sources in this cluster
    const uniqueSources = new Set(members.map((m) => m.sourceId));
    const sourceCount = uniqueSources.size;

    if (sourceCount < 2) continue; // Skip single-source clusters

    // Compute cluster stats
    const prices = members.map((m) => m.effectivePriceCents);
    const bestPrice = Math.min(...prices);
    const worstPrice = Math.max(...prices);
    const priceSpreadPct = worstPrice > 0
      ? ((worstPrice - bestPrice) / worstPrice)
      : 0;

    const bestOffer = members.find((m) => m.effectivePriceCents === bestPrice)!;
    const firstMember = members[0];

    clusterSummaries.push({
      clusterKey: key,
      brandSlug: firstMember.brandSlug,
      denomination: firstMember.denomination,
      currency: firstMember.currency,
      offerCount: members.length,
      sourceCount,
      bestPriceCents: bestPrice,
      bestSourceSlug: bestOffer.sourceSlug,
      priceSpreadPct: Math.round(priceSpreadPct * 10000) / 10000,
    });

    // Update each offer in the cluster with source agreement data
    // This boosts confidence scores for offers confirmed by multiple sources
    for (const member of members) {
      // Count how many other sources agree within 5% price range
      const agreementThreshold = member.effectivePriceCents * 0.05;
      const agreeing = members.filter(
        (m) =>
          m.sourceId !== member.sourceId &&
          Math.abs(m.effectivePriceCents - member.effectivePriceCents) <= agreementThreshold,
      ).length;

      // Only update if there's meaningful agreement
      if (agreeing > 0) {
        // Store cluster info in the offer's rawSnapshot for reference
        // Also update confidence via a lightweight re-score factor
        const currentConfidence = member.confidenceScore ?? 50;
        const agreementBonus = Math.min(agreeing * 5, 15); // +5 per agreeing source, max +15
        const newConfidence = Math.min(currentConfidence + agreementBonus, 100);

        if (newConfidence !== currentConfidence) {
          await db
            .update(offers)
            .set({
              confidenceScore: newConfidence,
              updatedAt: new Date(),
            })
            .where(eq(offers.id, member.id));

          offersUpdated++;
          confidenceBoosts++;
        }
      }
    }
  }

  return {
    clustersFound: clusterSummaries.length,
    offersUpdated,
    confidenceBoosts,
    clusters: clusterSummaries,
  };
}

/**
 * Get cluster data for a specific brand + denomination (used by frontend).
 * Returns all offers in the cluster, sorted by effective price.
 */
export async function getClusterForOffer(
  brandSlug: string,
  denomination: string | null,
  currency: string,
): Promise<Array<{
  id: number;
  sourceSlug: string;
  sourceName: string;
  effectivePriceCents: number;
  effectiveDiscountPct: number;
  trustZone: string;
  externalUrl: string;
}>> {
  const denom = (denomination ?? "default").toLowerCase().trim();

  const rows = await db
    .select({
      id: offers.id,
      sourceSlug: sources.slug,
      sourceName: sources.name,
      effectivePriceCents: offers.effectivePriceCents,
      effectiveDiscountPct: offers.effectiveDiscountPct,
      trustZone: offers.trustZone,
      externalUrl: offers.externalUrl,
    })
    .from(offers)
    .innerJoin(brands, eq(offers.brandId, brands.id))
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .where(
      and(
        eq(brands.slug, brandSlug),
        eq(offers.currency, currency.toUpperCase()),
        eq(offers.status, "active"),
        denomination
          ? sql`LOWER(TRIM(${offers.denomination})) = ${denom}`
          : sql`${offers.denomination} IS NULL OR ${offers.denomination} = 'default'`,
      ),
    )
    .orderBy(offers.effectivePriceCents);

  return rows;
}
