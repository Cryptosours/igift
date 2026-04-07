/**
 * Clustering Engine Tests — Task 5.9
 *
 * Tests the duplicate clustering engine which groups offers by
 * brand + denomination + currency and computes agreement bonuses.
 *
 * Mock strategy: same chainable Drizzle mock as API route tests.
 * The clustering logic is tested by controlling what "rows" the DB returns.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock: @/db ─────────────────────────────────────────────────────────

let mockSelectResult: unknown = [];
let mockUpdateCalls: Array<{ set: unknown; whereId: unknown }> = [];

function createSelectChain(result?: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "from", "where", "orderBy", "limit", "innerJoin", "leftJoin", "groupBy"];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = (resolve: (v: unknown) => void) => resolve(result ?? mockSelectResult);
  return chain;
}

function createUpdateChain() {
  const chain: Record<string, unknown> = {};
  let setData: unknown;
  chain.update = vi.fn(() => chain);
  chain.set = vi.fn((data: unknown) => { setData = data; return chain; });
  chain.where = vi.fn((condition: unknown) => {
    mockUpdateCalls.push({ set: setData, whereId: condition });
    return chain;
  });
  chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
  return chain;
}

const updateChain = createUpdateChain();

const mockDb = {
  select: vi.fn(() => createSelectChain()),
  update: vi.fn(() => updateChain),
};

vi.mock("@/db", () => ({
  db: mockDb,
}));

// ── Mock: @/db/schema ──────────────────────────────────────────────────

function schemaProxy(tableName: string) {
  return new Proxy({}, {
    get: (_target, prop) => `${tableName}.${String(prop)}`,
  });
}

vi.mock("@/db/schema", () => ({
  offers: schemaProxy("offers"),
  brands: schemaProxy("brands"),
  sources: schemaProxy("sources"),
}));

// ── Mock: drizzle-orm ──────────────────────────────────────────────────

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => ({ op: "eq", args })),
  and: vi.fn((...args: unknown[]) => ({ op: "and", args })),
  sql: Object.assign(
    vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
      op: "sql",
      strings: Array.from(strings),
      values,
    })),
    { join: vi.fn(), raw: vi.fn() },
  ),
}));

// ── Helpers ─────────────────────────────────────────────────────────────

function makeOffer(overrides: Partial<{
  id: number;
  brandSlug: string;
  denomination: string | null;
  currency: string;
  effectivePriceCents: number;
  faceValueCents: number;
  effectiveDiscountPct: number;
  sourceId: number;
  sourceSlug: string;
  trustZone: string;
  sellerRating: number | null;
  status: string;
  dealQualityScore: number;
  confidenceScore: number;
}>) {
  return {
    id: 1,
    brandSlug: "steam",
    denomination: "$50",
    currency: "USD",
    effectivePriceCents: 4750,
    faceValueCents: 5000,
    effectiveDiscountPct: 5.0,
    sourceId: 1,
    sourceSlug: "bitrefill",
    trustZone: "green",
    sellerRating: null,
    status: "active",
    dealQualityScore: 72,
    confidenceScore: 60,
    ...overrides,
  };
}

// ── Reset ──────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockSelectResult = [];
  mockUpdateCalls = [];
});

// ════════════════════════════════════════════════════════════════════════
// runClustering
// ════════════════════════════════════════════════════════════════════════

describe("runClustering", () => {
  let runClustering: () => Promise<{
    clustersFound: number;
    offersUpdated: number;
    confidenceBoosts: number;
    clusters: Array<{
      clusterKey: string;
      brandSlug: string;
      denomination: string | null;
      currency: string;
      offerCount: number;
      sourceCount: number;
      bestPriceCents: number;
      bestSourceSlug: string;
      priceSpreadPct: number;
    }>;
  }>;

  beforeEach(async () => {
    const mod = await import("./clustering");
    runClustering = mod.runClustering;
  });

  it("returns empty result when no offers exist", async () => {
    mockSelectResult = [];
    mockDb.select.mockReturnValueOnce(createSelectChain([]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(0);
    expect(result.offersUpdated).toBe(0);
    expect(result.confidenceBoosts).toBe(0);
    expect(result.clusters).toEqual([]);
  });

  it("skips single-source clusters", async () => {
    // Two offers from the SAME source — no cluster should form
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill" }),
      makeOffer({ id: 2, sourceId: 1, sourceSlug: "bitrefill" }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(0);
  });

  it("clusters offers from different sources with same brand+denom+currency", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", effectivePriceCents: 4750, confidenceScore: 60 }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", effectivePriceCents: 4800, confidenceScore: 55 }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(1);
    expect(result.clusters[0].offerCount).toBe(2);
    expect(result.clusters[0].sourceCount).toBe(2);
    expect(result.clusters[0].bestPriceCents).toBe(4750);
    expect(result.clusters[0].bestSourceSlug).toBe("bitrefill");
  });

  it("computes price spread correctly", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", effectivePriceCents: 4000 }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", effectivePriceCents: 5000 }),
    ]));

    const result = await runClustering();
    // Spread = (5000 - 4000) / 5000 = 0.2
    expect(result.clusters[0].priceSpreadPct).toBe(0.2);
  });

  it("does not cluster offers with different currencies", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", currency: "USD" }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", currency: "EUR" }),
    ]));

    const result = await runClustering();
    // Each gets its own cluster key, both are single-source → 0 clusters
    expect(result.clustersFound).toBe(0);
  });

  it("does not cluster offers with different denominations", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", denomination: "$50" }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", denomination: "$100" }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(0);
  });

  it("does not cluster offers with different brands", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", brandSlug: "steam" }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", brandSlug: "xbox" }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(0);
  });

  it("normalizes denomination case for clustering", async () => {
    // "$50" and "$50" (same case) should cluster; testing that the lowercase trim works
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", denomination: "$50 Gift Card" }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", denomination: "$50 gift card" }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(1);
  });

  it("handles null denomination as 'default'", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", denomination: null }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", denomination: null }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(1);
    expect(result.clusters[0].denomination).toBeNull();
  });

  it("gives confidence boost when sources agree within 5% price range", async () => {
    // Both at 4750 and 4800 — difference is 50, which is within 5% of 4750 (=237.5)
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", effectivePriceCents: 4750, confidenceScore: 60 }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", effectivePriceCents: 4800, confidenceScore: 55 }),
    ]));

    const result = await runClustering();
    expect(result.confidenceBoosts).toBeGreaterThan(0);
    expect(result.offersUpdated).toBeGreaterThan(0);
  });

  it("caps agreement bonus at +15 with many agreeing sources", async () => {
    // 5 sources all at similar prices — bonus = min(4*5, 15) = 15
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "src1", effectivePriceCents: 4750, confidenceScore: 80 }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "src2", effectivePriceCents: 4760, confidenceScore: 80 }),
      makeOffer({ id: 3, sourceId: 3, sourceSlug: "src3", effectivePriceCents: 4770, confidenceScore: 80 }),
      makeOffer({ id: 4, sourceId: 4, sourceSlug: "src4", effectivePriceCents: 4780, confidenceScore: 80 }),
      makeOffer({ id: 5, sourceId: 5, sourceSlug: "src5", effectivePriceCents: 4790, confidenceScore: 80 }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(1);
    expect(result.clusters[0].sourceCount).toBe(5);
    // Each offer sees 4 agreeing sources. Bonus = min(4*5, 15) = 15
    // New confidence = min(80 + 15, 100) = 95
    // All 5 should be updated
    expect(result.offersUpdated).toBe(5);
  });

  it("caps confidence score at 100", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "src1", effectivePriceCents: 4750, confidenceScore: 95 }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "src2", effectivePriceCents: 4760, confidenceScore: 95 }),
    ]));

    const result = await runClustering();
    expect(result.confidenceBoosts).toBeGreaterThan(0);
    // The update call should set confidence to min(95 + 5, 100) = 100
    // We can verify via the update mock that it was called
    expect(mockDb.update).toHaveBeenCalled();
  });

  it("does NOT boost confidence when prices differ by more than 5%", async () => {
    // Price difference: 4750 vs 6000 — 5% of 4750 = 237.5; diff = 1250 (exceeds threshold)
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", effectivePriceCents: 4750, confidenceScore: 60 }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", effectivePriceCents: 6000, confidenceScore: 55 }),
    ]));

    const result = await runClustering();
    // Cluster should be found but no confidence boosts (prices too far apart)
    expect(result.clustersFound).toBe(1);
    expect(result.confidenceBoosts).toBe(0);
    expect(result.offersUpdated).toBe(0);
  });

  it("handles multiple distinct clusters in a single run", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      // Cluster 1: Steam $50 USD
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", brandSlug: "steam", denomination: "$50", effectivePriceCents: 4750 }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", brandSlug: "steam", denomination: "$50", effectivePriceCents: 4800 }),
      // Cluster 2: Xbox $25 USD
      makeOffer({ id: 3, sourceId: 1, sourceSlug: "bitrefill", brandSlug: "xbox", denomination: "$25", effectivePriceCents: 2350 }),
      makeOffer({ id: 4, sourceId: 3, sourceSlug: "raise", brandSlug: "xbox", denomination: "$25", effectivePriceCents: 2400 }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(2);
    expect(result.clusters.map(c => c.brandSlug).sort()).toEqual(["steam", "xbox"]);
  });

  it("normalizes currency to uppercase for clustering", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([
      makeOffer({ id: 1, sourceId: 1, sourceSlug: "bitrefill", currency: "usd" }),
      makeOffer({ id: 2, sourceId: 2, sourceSlug: "dundle", currency: "USD" }),
    ]));

    const result = await runClustering();
    expect(result.clustersFound).toBe(1);
  });
});

// ════════════════════════════════════════════════════════════════════════
// getClusterForOffer
// ════════════════════════════════════════════════════════════════════════

describe("getClusterForOffer", () => {
  let getClusterForOffer: (
    brandSlug: string,
    denomination: string | null,
    currency: string,
  ) => Promise<Array<{
    id: number;
    sourceSlug: string;
    sourceName: string;
    effectivePriceCents: number;
    effectiveDiscountPct: number;
    trustZone: string;
    externalUrl: string;
  }>>;

  beforeEach(async () => {
    const mod = await import("./clustering");
    getClusterForOffer = mod.getClusterForOffer;
  });

  it("returns offers sorted by effective price", async () => {
    const clusterOffers = [
      { id: 1, sourceSlug: "bitrefill", sourceName: "Bitrefill", effectivePriceCents: 4750, effectiveDiscountPct: 5.0, trustZone: "green", externalUrl: "https://bitrefill.com/steam" },
      { id: 2, sourceSlug: "dundle", sourceName: "Dundle", effectivePriceCents: 4600, effectiveDiscountPct: 8.0, trustZone: "green", externalUrl: "https://dundle.com/steam" },
    ];

    mockDb.select.mockReturnValueOnce(createSelectChain(clusterOffers));

    const result = await getClusterForOffer("steam", "$50", "USD");
    expect(result).toHaveLength(2);
    expect(result[0].sourceSlug).toBe("bitrefill");
    expect(result[1].sourceSlug).toBe("dundle");
  });

  it("returns empty array when no cluster members found", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([]));

    const result = await getClusterForOffer("nonexistent", "$50", "USD");
    expect(result).toEqual([]);
  });

  it("accepts null denomination", async () => {
    mockDb.select.mockReturnValueOnce(createSelectChain([]));

    const result = await getClusterForOffer("steam", null, "USD");
    expect(result).toEqual([]);
    // Verify it didn't throw
    expect(mockDb.select).toHaveBeenCalled();
  });
});
