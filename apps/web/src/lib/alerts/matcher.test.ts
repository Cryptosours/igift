/**
 * Alert Matcher Tests — Task 5.10
 *
 * Tests the alert matching engine which pairs active user alerts
 * with eligible offers based on brand, category, discount, and region filters.
 *
 * Mock strategy: Two DB queries are mocked:
 *   1. activeAlerts query → returns test alerts
 *   2. eligibleOffers query → returns test offers
 * The matching logic (4 filters + cooldown) runs as real application code.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock: @/db ─────────────────────────────────────────────────────────

let mockAlerts: unknown[] = [];
let mockOffers: unknown[] = [];
let queryCallCount = 0;

function createSelectChain() {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "from", "where", "orderBy", "limit", "innerJoin", "leftJoin", "groupBy"];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  // First call returns alerts, second returns offers
  chain.then = (resolve: (v: unknown) => void) => {
    const result = queryCallCount === 0 ? mockAlerts : mockOffers;
    queryCallCount++;
    return resolve(result);
  };
  return chain;
}

const mockUpdateChain = (() => {
  const chain: Record<string, unknown> = {};
  chain.update = vi.fn(() => chain);
  chain.set = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
  return chain;
})();

const mockDb = {
  select: vi.fn(() => createSelectChain()),
  update: vi.fn(() => mockUpdateChain),
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
  userAlerts: schemaProxy("userAlerts"),
}));

// ── Mock: drizzle-orm ──────────────────────────────────────────────────

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => ({ op: "eq", args })),
  and: vi.fn((...args: unknown[]) => ({ op: "and", args })),
  or: vi.fn((...args: unknown[]) => ({ op: "or", args })),
  isNull: vi.fn((col: unknown) => ({ op: "isNull", col })),
  lt: vi.fn((...args: unknown[]) => ({ op: "lt", args })),
  sql: Object.assign(
    vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
      op: "sql", strings: Array.from(strings), values,
    })),
    { join: vi.fn() },
  ),
}));

// ── Helpers ─────────────────────────────────────────────────────────────

function makeAlert(overrides: Partial<{
  id: number;
  email: string;
  brandId: number | null;
  category: string | null;
  targetDiscountPct: number | null;
  region: string | null;
  deliveryChannel: string;
  lastSentAt: Date | null;
}>) {
  return {
    id: 1,
    email: "user@example.com",
    brandId: null,
    category: null,
    targetDiscountPct: null,
    region: null,
    deliveryChannel: "email",
    lastSentAt: null,
    ...overrides,
  };
}

function makeOffer(overrides: Partial<{
  id: number;
  brandId: number;
  title: string;
  originalTitle: string;
  effectiveDiscountPct: number;
  faceValueCents: number;
  effectivePriceCents: number;
  currency: string;
  trustZone: string;
  externalUrl: string;
  countryRedeemable: string[] | null;
  brandName: string;
  brandSlug: string;
  brandCategory: string;
  sourceName: string;
}>) {
  return {
    id: 10,
    brandId: 1,
    title: "Steam $50",
    originalTitle: "Steam Wallet $50",
    effectiveDiscountPct: 8.5,
    faceValueCents: 5000,
    effectivePriceCents: 4575,
    currency: "USD",
    trustZone: "green",
    externalUrl: "https://bitrefill.com/steam",
    countryRedeemable: ["US", "Global"],
    brandName: "Steam",
    brandSlug: "steam",
    brandCategory: "gaming",
    sourceName: "Bitrefill",
    ...overrides,
  };
}

// ── Reset ──────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockAlerts = [];
  mockOffers = [];
  queryCallCount = 0;
});

// ════════════════════════════════════════════════════════════════════════
// matchAlerts
// ════════════════════════════════════════════════════════════════════════

describe("matchAlerts", () => {
  let matchAlerts: (offerIds?: number[]) => Promise<Array<{
    alertId: number;
    email: string;
    deliveryChannel: string;
    offer: {
      id: number;
      title: string;
      brandName: string;
      brandSlug: string;
      sourceName: string;
      effectiveDiscountPct: number;
      faceValueCents: number;
      effectivePriceCents: number;
      currency: string;
      trustZone: string;
      externalUrl: string;
    };
  }>>;

  beforeEach(async () => {
    const mod = await import("./matcher");
    matchAlerts = mod.matchAlerts;
  });

  it("returns empty when no active alerts exist", async () => {
    mockAlerts = [];
    mockOffers = [makeOffer({})];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  it("returns empty when no eligible offers exist", async () => {
    mockAlerts = [makeAlert({})];
    mockOffers = [];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  it("matches alert with no filters (wildcard) to any eligible offer", async () => {
    mockAlerts = [makeAlert({ id: 1 })];
    mockOffers = [makeOffer({ id: 10 })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
    expect(result[0].alertId).toBe(1);
    expect(result[0].offer.id).toBe(10);
    expect(result[0].email).toBe("user@example.com");
    expect(result[0].deliveryChannel).toBe("email");
  });

  // ── Brand filter ──

  it("matches when alert brandId matches offer brandId", async () => {
    mockAlerts = [makeAlert({ id: 1, brandId: 1 })];
    mockOffers = [makeOffer({ id: 10, brandId: 1 })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  it("filters out when alert brandId does NOT match offer brandId", async () => {
    mockAlerts = [makeAlert({ id: 1, brandId: 99 })];
    mockOffers = [makeOffer({ id: 10, brandId: 1 })];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  it("matches all brands when alert has null brandId", async () => {
    mockAlerts = [makeAlert({ id: 1, brandId: null })];
    mockOffers = [
      makeOffer({ id: 10, brandId: 1, brandName: "Steam" }),
      makeOffer({ id: 11, brandId: 2, brandName: "Xbox" }),
    ];

    // Only first match per alert (break statement)
    const result = await matchAlerts();
    expect(result).toHaveLength(1);
    expect(result[0].offer.id).toBe(10);
  });

  // ── Category filter ──

  it("matches when alert category matches offer category", async () => {
    mockAlerts = [makeAlert({ id: 1, category: "gaming" })];
    mockOffers = [makeOffer({ id: 10, brandCategory: "gaming" })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  it("filters out when category does NOT match", async () => {
    mockAlerts = [makeAlert({ id: 1, category: "streaming" })];
    mockOffers = [makeOffer({ id: 10, brandCategory: "gaming" })];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  // ── Discount threshold filter ──

  it("matches when offer discount meets target", async () => {
    mockAlerts = [makeAlert({ id: 1, targetDiscountPct: 5.0 })];
    mockOffers = [makeOffer({ id: 10, effectiveDiscountPct: 8.5 })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  it("matches when offer discount exactly equals target", async () => {
    mockAlerts = [makeAlert({ id: 1, targetDiscountPct: 8.5 })];
    mockOffers = [makeOffer({ id: 10, effectiveDiscountPct: 8.5 })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  it("filters out when offer discount is below target", async () => {
    mockAlerts = [makeAlert({ id: 1, targetDiscountPct: 15.0 })];
    mockOffers = [makeOffer({ id: 10, effectiveDiscountPct: 8.5 })];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  it("matches any discount when target is null", async () => {
    mockAlerts = [makeAlert({ id: 1, targetDiscountPct: null })];
    mockOffers = [makeOffer({ id: 10, effectiveDiscountPct: 1.0 })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  // ── Region filter ──

  it("matches when offer region includes alert region", async () => {
    mockAlerts = [makeAlert({ id: 1, region: "US" })];
    mockOffers = [makeOffer({ id: 10, countryRedeemable: ["US", "CA"] })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  it("filters out when offer region does NOT include alert region", async () => {
    mockAlerts = [makeAlert({ id: 1, region: "AU" })];
    mockOffers = [makeOffer({ id: 10, countryRedeemable: ["US", "CA"] })];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  it("filters out when offer has null countryRedeemable and alert has region", async () => {
    mockAlerts = [makeAlert({ id: 1, region: "US" })];
    mockOffers = [makeOffer({ id: 10, countryRedeemable: null })];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  it("matches all regions when alert has null region", async () => {
    mockAlerts = [makeAlert({ id: 1, region: null })];
    mockOffers = [makeOffer({ id: 10, countryRedeemable: ["UK"] })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  // ── Combined filters ──

  it("applies all 4 filters simultaneously", async () => {
    mockAlerts = [makeAlert({
      id: 1,
      brandId: 1,
      category: "gaming",
      targetDiscountPct: 5.0,
      region: "US",
    })];
    mockOffers = [makeOffer({
      id: 10,
      brandId: 1,
      brandCategory: "gaming",
      effectiveDiscountPct: 8.5,
      countryRedeemable: ["US", "Global"],
    })];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
  });

  it("rejects when any single filter fails in combination", async () => {
    mockAlerts = [makeAlert({
      id: 1,
      brandId: 1,          // ✅ matches
      category: "gaming",   // ✅ matches
      targetDiscountPct: 5.0, // ✅ matches
      region: "AU",         // ❌ NOT in countryRedeemable
    })];
    mockOffers = [makeOffer({
      id: 10,
      brandId: 1,
      brandCategory: "gaming",
      effectiveDiscountPct: 8.5,
      countryRedeemable: ["US", "Global"],
    })];

    const result = await matchAlerts();
    expect(result).toEqual([]);
  });

  // ── One match per alert ──

  it("returns only ONE match per alert (first eligible offer)", async () => {
    mockAlerts = [makeAlert({ id: 1 })];
    mockOffers = [
      makeOffer({ id: 10, effectiveDiscountPct: 5.0, brandName: "Steam" }),
      makeOffer({ id: 11, effectiveDiscountPct: 12.0, brandName: "Xbox" }),
    ];

    const result = await matchAlerts();
    expect(result).toHaveLength(1);
    expect(result[0].offer.id).toBe(10); // First offer wins
  });

  // ── Multiple alerts ──

  it("matches different alerts to different offers", async () => {
    mockAlerts = [
      makeAlert({ id: 1, brandId: 1, email: "gamer@test.com" }),
      makeAlert({ id: 2, brandId: 2, email: "streamer@test.com" }),
    ];
    mockOffers = [
      makeOffer({ id: 10, brandId: 1, brandName: "Steam" }),
      makeOffer({ id: 11, brandId: 2, brandName: "Netflix" }),
    ];

    const result = await matchAlerts();
    expect(result).toHaveLength(2);
    expect(result[0].alertId).toBe(1);
    expect(result[0].offer.brandName).toBe("Steam");
    expect(result[1].alertId).toBe(2);
    expect(result[1].offer.brandName).toBe("Netflix");
  });

  // ── Offer title fallback ──

  it("uses normalizedTitle when available", async () => {
    mockAlerts = [makeAlert({ id: 1 })];
    mockOffers = [makeOffer({ id: 10, title: "Normalized Title", originalTitle: "Original Title" })];

    const result = await matchAlerts();
    expect(result[0].offer.title).toBe("Normalized Title");
  });

  it("falls back to originalTitle when normalizedTitle is null", async () => {
    mockAlerts = [makeAlert({ id: 1 })];
    mockOffers = [makeOffer({ id: 10, title: null as unknown as string, originalTitle: "Fallback Title" })];

    const result = await matchAlerts();
    expect(result[0].offer.title).toBe("Fallback Title");
  });

  // ── Response shape ──

  it("returns correct AlertMatch shape", async () => {
    mockAlerts = [makeAlert({ id: 5, email: "test@igift.app", deliveryChannel: "email" })];
    mockOffers = [makeOffer({
      id: 42,
      brandName: "Steam",
      brandSlug: "steam",
      sourceName: "Bitrefill",
      effectiveDiscountPct: 8.5,
      faceValueCents: 5000,
      effectivePriceCents: 4575,
      currency: "USD",
      trustZone: "green",
      externalUrl: "https://bitrefill.com/steam",
    })];

    const result = await matchAlerts();
    expect(result[0]).toEqual({
      alertId: 5,
      email: "test@igift.app",
      deliveryChannel: "email",
      offer: {
        id: 42,
        title: "Steam $50",
        brandName: "Steam",
        brandSlug: "steam",
        sourceName: "Bitrefill",
        effectiveDiscountPct: 8.5,
        faceValueCents: 5000,
        effectivePriceCents: 4575,
        currency: "USD",
        trustZone: "green",
        externalUrl: "https://bitrefill.com/steam",
      },
    });
  });
});

// ════════════════════════════════════════════════════════════════════════
// markAlertsSent
// ════════════════════════════════════════════════════════════════════════

describe("markAlertsSent", () => {
  let markAlertsSent: (alertIds: number[]) => Promise<void>;

  beforeEach(async () => {
    const mod = await import("./matcher");
    markAlertsSent = mod.markAlertsSent;
  });

  it("does nothing for empty array", async () => {
    await markAlertsSent([]);
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("updates each alert ID", async () => {
    await markAlertsSent([1, 2, 3]);
    expect(mockDb.update).toHaveBeenCalledTimes(3);
  });
});
