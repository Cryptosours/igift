/**
 * Ingestion Orchestrator
 *
 * Coordinates the full pipeline:
 * 1. Fetch from all registered adapters
 * 2. Normalize each raw offer (brand resolution, FX, region, denomination)
 * 3. Score each normalized offer (Deal Quality + Confidence)
 * 4. Upsert to database (offers table + price history)
 * 5. Update source metadata (lastFetchedAt, fetchSuccessRate)
 *
 * Can be triggered via API route or scheduled cron.
 */

import { db } from "@/db";
import { offers, brands, sources, priceHistory, moderationCases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { scoreOffer } from "@/lib/scoring";
import type { SourceAdapter, AdapterResult } from "./types";
import { normalizeOffer, type NormalizedOffer } from "./normalize";
import { flagOffer, type FlagContext } from "./flagging";

// ── Adapter Registry ──

import { bitrefillAdapter } from "./adapters/bitrefill";
import { dundleAdapter } from "./adapters/dundle";
import { getAllCatalogAdapters } from "./adapters/catalog";

/** All registered adapters. Add new ones here. */
function getRegisteredAdapters(): SourceAdapter[] {
  return [
    bitrefillAdapter,
    dundleAdapter,
    ...getAllCatalogAdapters(),
  ];
}

// ── Types ──

export interface IngestionResult {
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  sources: SourceIngestionResult[];
  totalOffersProcessed: number;
  totalOffersUpserted: number;
  totalFlagged: number;
  totalErrors: number;
}

interface SourceIngestionResult {
  sourceSlug: string;
  sourceName: string;
  fetchDurationMs: number;
  rawOfferCount: number;
  normalizedCount: number;
  upsertedCount: number;
  flaggedCount: number;
  skippedCount: number;
  warnings: string[];
  failed: boolean;
  failureReason?: string;
}

// ── Source Lookup Cache ──

interface SourceRecord {
  id: number;
  trustZone: "green" | "yellow" | "red";
  sourceType: string;
  hasBuyerProtection: boolean;
  hasRefundPolicy: boolean;
  lastSuccessAt: Date | null;
}

interface BrandRecord {
  id: number;
  slug: string;
  name: string;
}

async function loadSourceMap(): Promise<Map<string, SourceRecord>> {
  const rows = await db
    .select({
      id: sources.id,
      slug: sources.slug,
      trustZone: sources.trustZone,
      sourceType: sources.sourceType,
      hasBuyerProtection: sources.hasBuyerProtection,
      hasRefundPolicy: sources.hasRefundPolicy,
      lastSuccessAt: sources.lastSuccessAt,
    })
    .from(sources)
    .where(eq(sources.isActive, true));

  return new Map(rows.map((r) => [r.slug, r]));
}

async function loadBrandMap(): Promise<Map<string, BrandRecord>> {
  const rows = await db
    .select({ id: brands.id, slug: brands.slug, name: brands.name })
    .from(brands)
    .where(eq(brands.isActive, true));

  return new Map(rows.map((r) => [r.slug, r]));
}

// ── Scoring Bridge ──

function mapSourceTypeToDataSource(
  sourceType: string,
  provenance: string,
): "official_api" | "affiliate_feed" | "public_page" | "manual" | "community" {
  if (provenance === "manual") return "manual";
  switch (sourceType) {
    case "official_api": return "official_api";
    case "affiliate_feed": return "affiliate_feed";
    case "authorized_reseller":
    case "marketplace_resale":
    case "crypto_store":
    case "public_page": return "public_page";
    case "deal_community": return "community";
    default: return "public_page";
  }
}

// ── Upsert Logic ──

interface UpsertResult {
  offerId: number;
  confidenceScore: number | null;
}

async function upsertOffer(
  normalized: NormalizedOffer,
  source: SourceRecord,
  brand: BrandRecord,
): Promise<UpsertResult> {
  const effectivePriceCents = normalized.effectivePriceCents;
  const discountPct = normalized.effectiveDiscountPct;
  const provenance = (normalized.rawSnapshot as Record<string, unknown>).provenance === "manual"
    ? "manual"
    : source.sourceType;

  // Score the offer
  const scoring = scoreOffer({
    effectivePriceCents,
    faceValueCents: normalized.faceValueCents,
    historicalMedianCents: null, // TODO: query price history for median
    historicalLowCents: null, // TODO: query price history for low
    feesKnown: normalized.feeTotalCents >= 0,
    feeBreakdownAvailable: normalized.feeTotalCents > 0,
    regionCompatible: normalized.countryRedeemable.length > 0 ? true : null,
    accountRegionRequired: null,
    trustZone: source.trustZone,
    sellerRating: normalized.sellerRating,
    hasBuyerProtection: normalized.hasBuyerProtection,
    hasRefundPolicy: source.hasRefundPolicy,
    lastSeenMinutesAgo: 0, // just fetched
    lastVerifiedMinutesAgo: 0,
    dataSource: mapSourceTypeToDataSource(source.sourceType, provenance),
    duplicateSourcesAgree: 1,
    totalSources: 1,
    discountPctFromFace: Math.max(0, discountPct),
    abnormallyDeep: discountPct > 0.35, // flag >35% as suspicious
  });

  // Upsert: update if externalId exists, insert if not
  const existing = await db
    .select({ id: offers.id })
    .from(offers)
    .where(
      and(
        eq(offers.sourceId, source.id),
        eq(offers.externalId, normalized.externalId),
      ),
    )
    .limit(1);

  const offerData = {
    sourceId: source.id,
    brandId: brand.id,
    originalTitle: normalized.originalTitle,
    normalizedTitle: normalized.normalizedTitle,
    externalUrl: normalized.externalUrl,
    externalId: normalized.externalId,
    faceValueCents: normalized.faceValueCents,
    askingPriceCents: normalized.askingPriceCents,
    feeTotalCents: normalized.feeTotalCents,
    effectivePriceCents,
    currency: normalized.currency,
    denomination: normalized.denomination,
    effectiveDiscountPct: Math.round(discountPct * 10000) / 10000,
    countryRedeemable: normalized.countryRedeemable,
    trustZone: source.trustZone,
    buyerProtectionLevel: normalized.hasBuyerProtection ? "full" : "none",
    sellerRating: normalized.sellerRating,
    sellerName: normalized.sellerName,
    dealQualityScore: scoring.dealQualityScore,
    confidenceScore: scoring.confidenceScore,
    finalScore: scoring.finalScore,
    status: (scoring.suppressionReason ? "suppressed" : "active") as "active" | "suppressed",
    suppressionReason: scoring.suppressionReason,
    isHistoricalLow: scoring.isHistoricalLow,
    lastSeenAt: new Date(),
    provenance,
    rawSnapshot: normalized.rawSnapshot,
    updatedAt: new Date(),
  };

  let offerId: number;
  if (existing.length > 0) {
    await db
      .update(offers)
      .set(offerData)
      .where(eq(offers.id, existing[0].id));
    offerId = existing[0].id;
  } else {
    const [inserted] = await db.insert(offers).values(offerData).returning({ id: offers.id });
    offerId = inserted.id;
  }

  // Record price history
  await db.insert(priceHistory).values({
    brandId: brand.id,
    sourceId: source.id,
    denomination: normalized.denomination,
    currency: normalized.currency,
    country: normalized.countryRedeemable[0] ?? null,
    effectivePriceCents,
    faceValueCents: normalized.faceValueCents,
    effectiveDiscountPct: discountPct,
  });

  return { offerId, confidenceScore: scoring.confidenceScore };
}

// ── Main Pipeline ──

export async function runIngestion(options?: {
  sourceSlug?: string;
  dryRun?: boolean;
}): Promise<IngestionResult> {
  const startedAt = new Date();
  const results: SourceIngestionResult[] = [];
  let totalOffersProcessed = 0;
  let totalOffersUpserted = 0;
  let totalFlagged = 0;
  let totalErrors = 0;

  // Load lookup maps
  const sourceMap = await loadSourceMap();
  const brandMap = await loadBrandMap();

  // Get adapters (optionally filter to one source)
  let adapters = getRegisteredAdapters();
  if (options?.sourceSlug) {
    adapters = adapters.filter((a) => a.sourceSlug === options.sourceSlug);
  }

  for (const adapter of adapters) {
    const source = sourceMap.get(adapter.sourceSlug);
    if (!source) {
      results.push({
        sourceSlug: adapter.sourceSlug,
        sourceName: adapter.name,
        fetchDurationMs: 0,
        rawOfferCount: 0,
        normalizedCount: 0,
        upsertedCount: 0,
        flaggedCount: 0,
        skippedCount: 0,
        warnings: [`Source '${adapter.sourceSlug}' not found in database — skipping`],
        failed: true,
        failureReason: "Source not registered",
      });
      totalErrors++;
      continue;
    }

    // Step 1: Fetch
    let fetchResult: AdapterResult;
    try {
      fetchResult = await adapter.fetchOffers({ dryRun: options?.dryRun });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({
        sourceSlug: adapter.sourceSlug,
        sourceName: adapter.name,
        fetchDurationMs: 0,
        rawOfferCount: 0,
        normalizedCount: 0,
        upsertedCount: 0,
        flaggedCount: 0,
        skippedCount: 0,
        warnings: [`Fetch threw: ${msg}`],
        failed: true,
        failureReason: msg,
      });
      totalErrors++;
      continue;
    }

    totalOffersProcessed += fetchResult.offers.length;
    let normalizedCount = 0;
    let upsertedCount = 0;
    let flaggedCount = 0;
    let skippedCount = 0;
    const warnings = [...fetchResult.warnings];

    // Determine if this is the first ingestion run for this source
    const isFirstRun = source.lastSuccessAt === null;
    let firstRunFlagSampled = false; // Only flag one sample per new source

    // Step 2: Normalize + Score + Upsert each offer
    for (const rawOffer of fetchResult.offers) {
      try {
        const normalized = normalizeOffer(rawOffer);

        // Resolve brand
        if (!normalized.brandSlug) {
          warnings.push(`Unknown brand: '${rawOffer.rawBrandName}' — skipping`);
          skippedCount++;
          continue;
        }

        const brand = brandMap.get(normalized.brandSlug);
        if (!brand) {
          warnings.push(`Brand slug '${normalized.brandSlug}' not in DB — skipping`);
          skippedCount++;
          continue;
        }

        normalizedCount++;

        if (options?.dryRun) {
          upsertedCount++; // count as "would upsert"
          continue;
        }

        // Step 3: Upsert
        const upsertResult = await upsertOffer(normalized, source, brand);
        upsertedCount++;

        // Step 4: Auto-flag suspicious offers
        const flagContext: FlagContext = {
          trustZone: source.trustZone,
          confidenceScore: upsertResult.confidenceScore,
          isFirstRunForSource: isFirstRun && !firstRunFlagSampled,
          sourceSlug: adapter.sourceSlug,
        };

        const flags = flagOffer(normalized, flagContext);
        if (flags.length > 0) {
          if (isFirstRun) firstRunFlagSampled = true;

          // Create moderation cases for each flag
          for (const flag of flags) {
            await db.insert(moderationCases).values({
              offerId: upsertResult.offerId,
              sourceId: source.id,
              caseType: flag.caseType,
              description: flag.description,
              status: "open",
            });
          }

          // Set offer to pending_review
          await db
            .update(offers)
            .set({
              status: "pending_review",
              suppressionReason: `Auto-flagged: ${flags.map((f) => f.caseType).join(", ")}`,
              updatedAt: new Date(),
            })
            .where(eq(offers.id, upsertResult.offerId));

          flaggedCount++;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        warnings.push(`Offer ${rawOffer.externalId}: ${msg}`);
        skippedCount++;
      }
    }

    totalOffersUpserted += upsertedCount;
    totalFlagged += flaggedCount;

    // Step 4: Update source metadata
    if (!options?.dryRun && !fetchResult.failed) {
      try {
        await db
          .update(sources)
          .set({
            lastFetchedAt: fetchResult.fetchedAt,
            lastSuccessAt: fetchResult.failed ? undefined : fetchResult.fetchedAt,
            updatedAt: new Date(),
          })
          .where(eq(sources.id, source.id));
      } catch {
        warnings.push("Failed to update source metadata");
      }
    }

    results.push({
      sourceSlug: adapter.sourceSlug,
      sourceName: adapter.name,
      fetchDurationMs: fetchResult.durationMs,
      rawOfferCount: fetchResult.offers.length,
      normalizedCount,
      upsertedCount,
      flaggedCount,
      skippedCount,
      warnings,
      failed: fetchResult.failed,
      failureReason: fetchResult.failureReason,
    });
  }

  const completedAt = new Date();

  return {
    startedAt,
    completedAt,
    durationMs: completedAt.getTime() - startedAt.getTime(),
    sources: results,
    totalOffersProcessed,
    totalOffersUpserted,
    totalFlagged,
    totalErrors,
  };
}
