/**
 * Auto-flagging rules for the ingestion pipeline.
 *
 * After an offer is scored and before upsert, these rules check for
 * anomalies that should create moderation cases for human review.
 *
 * Flagging does NOT block the offer from being upserted — it creates
 * a moderation case and sets the offer status to "pending_review".
 */

import type { NormalizedOffer } from "./normalize";

export interface FlagResult {
  flagged: boolean;
  caseType: string;
  description: string;
}

// ── Thresholds ──

/** Discounts above this rate are suspicious for gift cards */
const SUSPICIOUS_DISCOUNT_THRESHOLD = 0.35;

/** Confidence scores below this need human verification */
const LOW_CONFIDENCE_THRESHOLD = 40;

/** Discount + yellow/red zone combined threshold (lower bar for less trusted sources) */
const UNTRUSTED_DISCOUNT_THRESHOLD = 0.25;

// ── Rules ──

function checkSuspiciousDiscount(
  offer: NormalizedOffer,
  context: FlagContext,
): FlagResult | null {
  const discount = offer.effectiveDiscountPct;

  // Hard threshold for all sources
  if (discount > SUSPICIOUS_DISCOUNT_THRESHOLD) {
    return {
      flagged: true,
      caseType: "suspicious_discount",
      description: `Discount of ${(discount * 100).toFixed(1)}% exceeds ${(SUSPICIOUS_DISCOUNT_THRESHOLD * 100)}% threshold. Brand: ${offer.brandSlug}, Source: ${context.sourceSlug}. Face value: $${(offer.faceValueCents / 100).toFixed(2)}, effective: $${(offer.effectivePriceCents / 100).toFixed(2)}.`,
    };
  }

  // Lower threshold for yellow/red zone sources
  if (context.trustZone !== "green" && discount > UNTRUSTED_DISCOUNT_THRESHOLD) {
    return {
      flagged: true,
      caseType: "suspicious_discount",
      description: `${context.trustZone}-zone source with ${(discount * 100).toFixed(1)}% discount (threshold: ${(UNTRUSTED_DISCOUNT_THRESHOLD * 100)}% for non-green). Brand: ${offer.brandSlug}, Source: ${context.sourceSlug}.`,
    };
  }

  return null;
}

function checkMissingRegion(
  offer: NormalizedOffer,
  context: FlagContext,
): FlagResult | null {
  if (
    !offer.countryRedeemable ||
    offer.countryRedeemable.length === 0
  ) {
    return {
      flagged: true,
      caseType: "missing_region",
      description: `No region data for "${offer.normalizedTitle}" from ${context.sourceSlug}. Region-fit cannot be determined — rule #6 violation.`,
    };
  }
  return null;
}

function checkLowConfidence(
  offer: NormalizedOffer,
  context: FlagContext,
): FlagResult | null {
  if (context.confidenceScore !== null && context.confidenceScore < LOW_CONFIDENCE_THRESHOLD) {
    return {
      flagged: true,
      caseType: "price_anomaly",
      description: `Low confidence score (${context.confidenceScore}) for "${offer.normalizedTitle}" from ${context.sourceSlug}. May indicate unreliable pricing data or suspicious source.`,
    };
  }
  return null;
}

// ── Main flagging function ──

export interface FlagContext {
  trustZone: string;
  confidenceScore: number | null;
  isFirstRunForSource: boolean;
  sourceSlug: string;
}

/**
 * Run all flagging rules against a normalized offer.
 * Returns an array of flag results (empty if no issues).
 */
export function flagOffer(
  offer: NormalizedOffer,
  context: FlagContext,
): FlagResult[] {
  const flags: FlagResult[] = [];

  const discountFlag = checkSuspiciousDiscount(offer, context);
  if (discountFlag) flags.push(discountFlag);

  const regionFlag = checkMissingRegion(offer, context);
  if (regionFlag) flags.push(regionFlag);

  const confidenceFlag = checkLowConfidence(offer, context);
  if (confidenceFlag) flags.push(confidenceFlag);

  // Flag a sample from first-run sources for manual verification
  if (context.isFirstRunForSource) {
    flags.push({
      flagged: true,
      caseType: "new_source",
      description: `First ingestion run for source "${context.sourceSlug}". Sample offer: "${offer.normalizedTitle}" at ${(offer.effectiveDiscountPct * 100).toFixed(1)}% discount. Verify source legitimacy.`,
    });
  }

  return flags;
}
