/**
 * iGift Dual Scoring Engine
 *
 * Two scores, always shown separately:
 * 1. Deal Quality Score (0-100): How good is this deal?
 * 2. Confidence Score (0-100): How much do we trust our data about it?
 *
 * Final Score = DealQuality * (0.5 + 0.5 * Confidence/100) - penalties
 */

interface ScoringInput {
  // Price data
  effectivePriceCents: number;
  faceValueCents: number;
  historicalMedianCents: number | null;
  historicalLowCents: number | null;

  // Fee transparency
  feesKnown: boolean;
  feeBreakdownAvailable: boolean;

  // Region fit
  regionCompatible: boolean | null; // null = unknown
  accountRegionRequired: string | null;

  // Source trust
  trustZone: "green" | "yellow" | "red";
  sellerRating: number | null; // 0-1
  hasBuyerProtection: boolean;
  hasRefundPolicy: boolean;

  // Freshness
  lastSeenMinutesAgo: number;
  lastVerifiedMinutesAgo: number | null;

  // Data quality
  dataSource: "official_api" | "affiliate_feed" | "public_page" | "manual" | "community";
  duplicateSourcesAgree: number; // how many sources report similar price
  totalSources: number;

  // Fraud signals
  discountPctFromFace: number; // 0-1
  abnormallyDeep: boolean; // flagged by anomaly detection
}

interface ScoringOutput {
  dealQualityScore: number;
  confidenceScore: number;
  finalScore: number;
  isHistoricalLow: boolean;
  suppressionReason: string | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeDealQualityScore(input: ScoringInput): number {
  // PriceEdge: discount vs face value (0-100)
  const priceEdge = clamp(input.discountPctFromFace / 0.30, 0, 1) * 100;

  // HistoricalAdvantage: how does this compare to historical median? (0-100)
  let historicalAdvantage = 50; // neutral if no history
  if (input.historicalMedianCents !== null) {
    const improvement =
      (input.historicalMedianCents - input.effectivePriceCents) /
      input.historicalMedianCents;
    historicalAdvantage = clamp(50 + improvement * 200, 0, 100);
  }

  // FeeTransparency (0-100)
  const feeTransparency = input.feesKnown
    ? input.feeBreakdownAvailable
      ? 100
      : 70
    : 20;

  // RegionFit (0-100)
  let regionFit: number;
  if (input.regionCompatible === true) regionFit = 100;
  else if (input.regionCompatible === null) regionFit = 10;
  else regionFit = 0; // incompatible

  // SellerTrust (0-100)
  const trustBase =
    input.trustZone === "green" ? 80 : input.trustZone === "yellow" ? 50 : 10;
  const ratingBonus = input.sellerRating !== null ? input.sellerRating * 20 : 0;
  const sellerTrust = clamp(trustBase + ratingBonus, 0, 100);

  // BuyerProtection (0-100)
  const buyerProtection =
    (input.hasBuyerProtection ? 60 : 0) + (input.hasRefundPolicy ? 40 : 0);

  // Freshness (0-100)
  const freshness =
    input.lastSeenMinutesAgo <= 15
      ? 100
      : input.lastSeenMinutesAgo <= 60
        ? 80
        : input.lastSeenMinutesAgo <= 360
          ? 50
          : input.lastSeenMinutesAgo <= 1440
            ? 30
            : 10;

  // AvailabilityConfidence (0-100)
  const availConf = freshness > 50 ? 80 : 40;

  // Weighted composite
  const score =
    0.3 * priceEdge +
    0.15 * historicalAdvantage +
    0.1 * feeTransparency +
    0.1 * regionFit +
    0.1 * sellerTrust +
    0.1 * buyerProtection +
    0.1 * freshness +
    0.05 * availConf;

  return Math.round(clamp(score, 0, 100));
}

export function computeConfidenceScore(input: ScoringInput): number {
  // ReferencePriceConfidence (0-100)
  const refPriceConf = input.historicalMedianCents !== null ? 80 : 30;

  // DataFreshness (0-100)
  const verified = input.lastVerifiedMinutesAgo ?? input.lastSeenMinutesAgo;
  const dataFreshness =
    verified <= 30 ? 100 : verified <= 120 ? 75 : verified <= 720 ? 45 : 15;

  // SourceReliability (0-100)
  const sourceReliability =
    input.dataSource === "official_api"
      ? 95
      : input.dataSource === "affiliate_feed"
        ? 85
        : input.dataSource === "public_page"
          ? 55
          : input.dataSource === "manual"
            ? 70
            : 40;

  // DuplicateConsistency (0-100)
  const dupConsistency =
    input.totalSources <= 1
      ? 40
      : clamp((input.duplicateSourcesAgree / input.totalSources) * 100, 0, 100);

  // FraudLowRisk (0-100)
  let fraudLowRisk = 80;
  if (input.abnormallyDeep) fraudLowRisk -= 50;
  if (input.trustZone === "red") fraudLowRisk -= 30;
  if (input.discountPctFromFace > 0.4) fraudLowRisk -= 20;
  fraudLowRisk = clamp(fraudLowRisk, 0, 100);

  const score =
    0.3 * refPriceConf +
    0.2 * dataFreshness +
    0.2 * sourceReliability +
    0.15 * dupConsistency +
    0.15 * fraudLowRisk;

  return Math.round(clamp(score, 0, 100));
}

export function scoreOffer(input: ScoringInput): ScoringOutput {
  // Hard suppression rules
  if (input.trustZone === "red") {
    return {
      dealQualityScore: 0,
      confidenceScore: 0,
      finalScore: 0,
      isHistoricalLow: false,
      suppressionReason: "Red zone source — excluded from listings",
    };
  }

  if (input.regionCompatible === false) {
    return {
      dealQualityScore: Math.min(computeDealQualityScore(input), 30),
      confidenceScore: computeConfidenceScore(input),
      finalScore: 0,
      isHistoricalLow: false,
      suppressionReason: "Region incompatible — deal likely unusable",
    };
  }

  const dealQuality = computeDealQualityScore(input);
  const confidence = computeConfidenceScore(input);

  // Final Score = DealQuality * (0.5 + 0.5 * Confidence/100) - penalties
  let finalScore = dealQuality * (0.5 + (0.5 * confidence) / 100);

  // Fraud penalty
  if (input.abnormallyDeep) finalScore *= 0.5;

  // Policy penalty for unknown region — strong cap so unverified-region
  // offers never outrank confirmed-compatible deals.
  if (input.regionCompatible === null) finalScore *= 0.55;

  finalScore = Math.round(clamp(finalScore, 0, 100) * 100) / 100;

  // Historical low detection
  const isHistoricalLow =
    input.historicalLowCents !== null &&
    input.effectivePriceCents <= input.historicalLowCents;

  return {
    dealQualityScore: dealQuality,
    confidenceScore: confidence,
    finalScore,
    isHistoricalLow,
    suppressionReason: null,
  };
}

// Label helpers for UI
export function getDealQualityLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Weak";
}

export function getConfidenceLabel(score: number): string {
  if (score >= 85) return "High";
  if (score >= 60) return "Moderate";
  if (score >= 35) return "Low";
  return "Very Low";
}
