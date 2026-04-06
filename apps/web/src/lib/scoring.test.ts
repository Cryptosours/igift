import { describe, it, expect } from "vitest";
import {
  computeDealQualityScore,
  computeConfidenceScore,
  scoreOffer,
  getDealQualityLabel,
  getConfidenceLabel,
} from "./scoring";

/** Factory for a baseline "good" deal input — override specific fields per test */
function makeScoringInput(overrides: Record<string, unknown> = {}) {
  return {
    effectivePriceCents: 4500,
    faceValueCents: 5000,
    historicalMedianCents: null as number | null,
    historicalLowCents: null as number | null,
    feesKnown: true,
    feeBreakdownAvailable: true,
    regionCompatible: true as boolean | null,
    accountRegionRequired: null as string | null,
    trustZone: "green" as "green" | "yellow" | "red",
    sellerRating: 0.9,
    hasBuyerProtection: true,
    hasRefundPolicy: true,
    lastSeenMinutesAgo: 10,
    lastVerifiedMinutesAgo: 10,
    dataSource: "official_api" as const,
    duplicateSourcesAgree: 3,
    totalSources: 4,
    discountPctFromFace: 0.1,
    abnormallyDeep: false,
    ...overrides,
  };
}

// ── Deal Quality Score ──

describe("computeDealQualityScore", () => {
  it("returns a number between 0 and 100", () => {
    const score = computeDealQualityScore(makeScoringInput());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("scores higher for larger discounts", () => {
    const lowDiscount = computeDealQualityScore(
      makeScoringInput({ discountPctFromFace: 0.05 }),
    );
    const highDiscount = computeDealQualityScore(
      makeScoringInput({ discountPctFromFace: 0.25 }),
    );
    expect(highDiscount).toBeGreaterThan(lowDiscount);
  });

  it("penalizes unknown fees", () => {
    const knownFees = computeDealQualityScore(
      makeScoringInput({ feesKnown: true, feeBreakdownAvailable: true }),
    );
    const unknownFees = computeDealQualityScore(
      makeScoringInput({ feesKnown: false, feeBreakdownAvailable: false }),
    );
    expect(knownFees).toBeGreaterThan(unknownFees);
  });

  it("penalizes region-incompatible deals", () => {
    const compatible = computeDealQualityScore(
      makeScoringInput({ regionCompatible: true }),
    );
    const incompatible = computeDealQualityScore(
      makeScoringInput({ regionCompatible: false }),
    );
    expect(compatible).toBeGreaterThan(incompatible);
  });

  it("penalizes unknown region (null)", () => {
    const known = computeDealQualityScore(
      makeScoringInput({ regionCompatible: true }),
    );
    const unknown = computeDealQualityScore(
      makeScoringInput({ regionCompatible: null }),
    );
    expect(known).toBeGreaterThan(unknown);
  });

  it("scores green trust zone higher than yellow", () => {
    const green = computeDealQualityScore(
      makeScoringInput({ trustZone: "green" }),
    );
    const yellow = computeDealQualityScore(
      makeScoringInput({ trustZone: "yellow" }),
    );
    expect(green).toBeGreaterThan(yellow);
  });

  it("accounts for historical price improvement", () => {
    const noHistory = computeDealQualityScore(
      makeScoringInput({ historicalMedianCents: null }),
    );
    const belowMedian = computeDealQualityScore(
      makeScoringInput({
        historicalMedianCents: 5000,
        effectivePriceCents: 4000,
      }),
    );
    expect(belowMedian).toBeGreaterThan(noHistory);
  });

  it("penalizes stale data (>24h unseen)", () => {
    const fresh = computeDealQualityScore(
      makeScoringInput({ lastSeenMinutesAgo: 10 }),
    );
    const stale = computeDealQualityScore(
      makeScoringInput({ lastSeenMinutesAgo: 2000 }),
    );
    expect(fresh).toBeGreaterThan(stale);
  });
});

// ── Confidence Score ──

describe("computeConfidenceScore", () => {
  it("returns a number between 0 and 100", () => {
    const score = computeConfidenceScore(makeScoringInput());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("is higher for official_api than public_page", () => {
    const api = computeConfidenceScore(
      makeScoringInput({ dataSource: "official_api" }),
    );
    const page = computeConfidenceScore(
      makeScoringInput({ dataSource: "public_page" }),
    );
    expect(api).toBeGreaterThan(page);
  });

  it("penalizes abnormally deep discounts", () => {
    const normal = computeConfidenceScore(
      makeScoringInput({ abnormallyDeep: false }),
    );
    const flagged = computeConfidenceScore(
      makeScoringInput({ abnormallyDeep: true }),
    );
    expect(normal).toBeGreaterThan(flagged);
  });

  it("is higher with more agreeing sources", () => {
    const few = computeConfidenceScore(
      makeScoringInput({ duplicateSourcesAgree: 1, totalSources: 5 }),
    );
    const many = computeConfidenceScore(
      makeScoringInput({ duplicateSourcesAgree: 5, totalSources: 5 }),
    );
    expect(many).toBeGreaterThan(few);
  });

  it("penalizes red trust zone", () => {
    const green = computeConfidenceScore(
      makeScoringInput({ trustZone: "green" }),
    );
    const red = computeConfidenceScore(
      makeScoringInput({ trustZone: "red" }),
    );
    expect(green).toBeGreaterThan(red);
  });

  it("rewards historical reference data", () => {
    const noRef = computeConfidenceScore(
      makeScoringInput({ historicalMedianCents: null }),
    );
    const withRef = computeConfidenceScore(
      makeScoringInput({ historicalMedianCents: 5000 }),
    );
    expect(withRef).toBeGreaterThan(noRef);
  });
});

// ── scoreOffer (full pipeline) ──

describe("scoreOffer", () => {
  it("suppresses red zone sources entirely", () => {
    const result = scoreOffer(makeScoringInput({ trustZone: "red" }));
    expect(result.dealQualityScore).toBe(0);
    expect(result.confidenceScore).toBe(0);
    expect(result.finalScore).toBe(0);
    expect(result.suppressionReason).toContain("Red zone");
  });

  it("caps deal quality at 30 for region-incompatible", () => {
    const result = scoreOffer(
      makeScoringInput({ regionCompatible: false }),
    );
    expect(result.dealQualityScore).toBeLessThanOrEqual(30);
    expect(result.finalScore).toBe(0);
    expect(result.suppressionReason).toContain("Region incompatible");
  });

  it("applies fraud penalty for abnormally deep deals", () => {
    const normal = scoreOffer(
      makeScoringInput({ abnormallyDeep: false }),
    );
    const fraudy = scoreOffer(
      makeScoringInput({ abnormallyDeep: true }),
    );
    expect(fraudy.finalScore).toBeLessThan(normal.finalScore);
  });

  it("applies 15% penalty for unknown region", () => {
    const known = scoreOffer(
      makeScoringInput({ regionCompatible: true }),
    );
    const unknown = scoreOffer(
      makeScoringInput({ regionCompatible: null }),
    );
    // Unknown region multiplies by 0.85
    expect(unknown.finalScore).toBeLessThan(known.finalScore);
  });

  it("detects historical low correctly", () => {
    const result = scoreOffer(
      makeScoringInput({
        effectivePriceCents: 4000,
        historicalLowCents: 4200,
      }),
    );
    expect(result.isHistoricalLow).toBe(true);
  });

  it("does not flag historical low when price is higher", () => {
    const result = scoreOffer(
      makeScoringInput({
        effectivePriceCents: 4500,
        historicalLowCents: 4200,
      }),
    );
    expect(result.isHistoricalLow).toBe(false);
  });

  it("returns null suppressionReason for good deals", () => {
    const result = scoreOffer(makeScoringInput());
    expect(result.suppressionReason).toBeNull();
  });

  it("final score = quality * (0.5 + 0.5*confidence/100) for normal deals", () => {
    const input = makeScoringInput();
    const result = scoreOffer(input);
    const expectedFinal =
      result.dealQualityScore * (0.5 + (0.5 * result.confidenceScore) / 100);
    // Within rounding tolerance
    expect(result.finalScore).toBeCloseTo(
      Math.round(expectedFinal * 100) / 100,
      1,
    );
  });
});

// ── Label Helpers ──

describe("getDealQualityLabel", () => {
  it("returns Excellent for 85+", () => {
    expect(getDealQualityLabel(85)).toBe("Excellent");
    expect(getDealQualityLabel(100)).toBe("Excellent");
  });
  it("returns Good for 70-84", () => {
    expect(getDealQualityLabel(70)).toBe("Good");
    expect(getDealQualityLabel(84)).toBe("Good");
  });
  it("returns Fair for 50-69", () => {
    expect(getDealQualityLabel(50)).toBe("Fair");
    expect(getDealQualityLabel(69)).toBe("Fair");
  });
  it("returns Weak for <50", () => {
    expect(getDealQualityLabel(49)).toBe("Weak");
    expect(getDealQualityLabel(0)).toBe("Weak");
  });
});

describe("getConfidenceLabel", () => {
  it("returns High for 85+", () => {
    expect(getConfidenceLabel(85)).toBe("High");
  });
  it("returns Moderate for 60-84", () => {
    expect(getConfidenceLabel(60)).toBe("Moderate");
  });
  it("returns Low for 35-59", () => {
    expect(getConfidenceLabel(35)).toBe("Low");
  });
  it("returns Very Low for <35", () => {
    expect(getConfidenceLabel(34)).toBe("Very Low");
  });
});
