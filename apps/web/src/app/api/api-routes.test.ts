/**
 * API Route Integration Tests — Task 5.8
 *
 * Tests the public and admin API route handlers by mocking the Drizzle DB layer.
 * Each route handler is a plain async function(Request) → Response, so we can
 * import and call it directly without a running server.
 *
 * Mock strategy:
 *   - vi.mock("@/db") replaces the Drizzle `db` with a chainable mock builder
 *   - vi.mock("@/lib/data") replaces searchDeals with a controllable stub
 *   - vi.mock("@/lib/affiliate") replaces affiliate helpers
 *   - vi.mock("@/lib/health") replaces health report
 *   - vi.mock("@/lib/ingest/orchestrator") replaces runIngestion
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock: @/db ─────────────────────────────────────────────────────────

/** Chainable mock that mirrors Drizzle's query builder pattern:
 *  db.select({...}).from(table).where(...).orderBy(...).limit(n)
 *  db.insert(table).values({...}).returning({...})
 *  db.update(table).set({...}).where(...).returning({...})
 *  db.delete(table).where(...)
 *
 *  The chain resolves to whatever mockDbResult is set to.
 */
let mockDbResult: unknown = [];
let mockDbInsertResult: unknown = [];

function createChain() {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select", "from", "where", "orderBy", "limit",
    "innerJoin", "leftJoin", "groupBy",
    "insert", "values", "returning", "onConflictDoNothing",
    "update", "set", "delete",
  ];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  // Terminal: when awaited, the chain resolves to mockDbResult
  chain.then = (resolve: (v: unknown) => void) => resolve(mockDbResult);
  return chain;
}

// Special chain for insert that resolves to mockDbInsertResult
function createInsertChain() {
  const chain: Record<string, unknown> = {};
  const methods = ["insert", "values", "returning", "onConflictDoNothing"];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = (resolve: (v: unknown) => void) => resolve(mockDbInsertResult);
  return chain;
}

const selectChain = createChain();
const insertChain = createInsertChain();
const updateChain = createChain();
const deleteChain = createChain();

const mockDb = {
  select: vi.fn(() => selectChain),
  insert: vi.fn(() => insertChain),
  update: vi.fn(() => updateChain),
  delete: vi.fn(() => deleteChain),
};

vi.mock("@/db", () => ({
  db: mockDb,
}));

// ── Mock: @/db/schema ──────────────────────────────────────────────────
// Route files import column references from the schema. We mock them as
// identity proxies so `eq(offers.status, "active")` doesn't throw.

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
  moderationCases: schemaProxy("moderationCases"),
  watchlistItems: schemaProxy("watchlistItems"),
  affiliateClicks: schemaProxy("affiliateClicks"),
  sponsoredPlacements: schemaProxy("sponsoredPlacements"),
  priceHistory: schemaProxy("priceHistory"),
  apiKeys: schemaProxy("apiKeys"),
}));

// ── Mock: drizzle-orm operators ────────────────────────────────────────
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => ({ op: "eq", args })),
  desc: vi.fn((col: unknown) => ({ op: "desc", col })),
  and: vi.fn((...args: unknown[]) => ({ op: "and", args })),
  or: vi.fn((...args: unknown[]) => ({ op: "or", args })),
  gte: vi.fn((...args: unknown[]) => ({ op: "gte", args })),
  gt: vi.fn((...args: unknown[]) => ({ op: "gt", args })),
  lte: vi.fn((...args: unknown[]) => ({ op: "lte", args })),
  count: vi.fn((col: unknown) => ({ op: "count", col })),
  avg: vi.fn((col: unknown) => ({ op: "avg", col })),
  ilike: vi.fn((...args: unknown[]) => ({ op: "ilike", args })),
  sql: vi.fn(),
  min: vi.fn((col: unknown) => ({ op: "min", col })),
  max: vi.fn((col: unknown) => ({ op: "max", col })),
}));

// ── Mock: @/lib/rate-limit ─────────────────────────────────────────────
// Rate limiting is tested independently; always allow in route tests.
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => null,
  checkRateLimit: () => ({ allowed: true, limit: 100, remaining: 99, resetUnix: 0 }),
  getClientIp: () => "127.0.0.1",
  withRateLimitHeaders: (res: unknown) => res,
}));

// ── Mock: @/lib/data ───────────────────────────────────────────────────
const mockSearchDeals = vi.fn();
vi.mock("@/lib/data", () => ({
  searchDeals: mockSearchDeals,
}));

// ── Mock: @/lib/ingest/orchestrator ────────────────────────────────────
const mockRunIngestion = vi.fn();
vi.mock("@/lib/ingest/orchestrator", () => ({
  runIngestion: mockRunIngestion,
}));

// ── Mock: @/lib/health ─────────────────────────────────────────────────
const mockGetHealthReport = vi.fn();
const mockMarkStaleOffers = vi.fn();
vi.mock("@/lib/health", () => ({
  getHealthReport: mockGetHealthReport,
  markStaleOffers: mockMarkStaleOffers,
}));

// ── Mock: @/lib/affiliate ──────────────────────────────────────────────
const mockBuildAffiliateUrl = vi.fn();
const mockGetClickTarget = vi.fn();
const mockLogClick = vi.fn();
vi.mock("@/lib/affiliate", () => ({
  buildAffiliateUrl: mockBuildAffiliateUrl,
  getClickTarget: mockGetClickTarget,
  logClick: mockLogClick,
}));

// ── Mock: @/app/api/admin/auth ────────────────────────────────────────
// Mock the auth module so ingest route can resolve it (avoids @/ alias
// resolution issues with Vitest 4.x dynamic imports) and so health route
// doesn't depend on module-level env var capture timing.
vi.mock("@/app/api/admin/auth", () => ({
  safeCompare: (a: string, b: string) => a === b,
  checkAdminAuth: (req: Request) => {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    return token === "dev-admin-key";
  },
}));

// ── Mock: next/headers (for watchlist which uses cookies()) ────────────
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: (_name: string) => ({ value: "test-session-id" }), // eslint-disable-line @typescript-eslint/no-unused-vars
  })),
}));

// ── Helpers ────────────────────────────────────────────────────────────

function makeRequest(url: string, init?: RequestInit): Request {
  return new Request(url, init);
}

function makeAuthRequest(url: string, key: string, init?: RequestInit): Request {
  return new Request(url, {
    ...init,
    headers: {
      ...((init?.headers as Record<string, string>) ?? {}),
      Authorization: `Bearer ${key}`,
    },
  });
}

async function jsonBody(response: Response) {
  return response.json();
}

// ── Reset ──────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockDbResult = [];
  mockDbInsertResult = [];
});

// ════════════════════════════════════════════════════════════════════════
// GET /api/deals
// ════════════════════════════════════════════════════════════════════════

describe("GET /api/deals", () => {
  // Dynamic import so mocks are applied first
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./deals/route");
    GET = mod.GET;
  });

  it("returns deals array with total count", async () => {
    mockDbResult = [
      {
        id: 1,
        title: "Steam $50",
        originalTitle: "Steam Wallet $50",
        externalUrl: "https://example.com",
        faceValueCents: 5000,
        effectivePriceCents: 4750,
        feeTotalCents: 0,
        currency: "USD",
        effectiveDiscountPct: 5.0,
        dealQualityScore: 72,
        confidenceScore: 85,
        finalScore: 78,
        trustZone: "green",
        countryRedeemable: ["US", "Global"],
        isHistoricalLow: false,
        lastSeenAt: new Date(),
        brandName: "Steam",
        brandSlug: "steam",
        sourceName: "Bitrefill",
        sourceSlug: "bitrefill",
      },
    ];

    const res = await GET(makeRequest("http://localhost/api/deals"));
    expect(res.status).toBe(200);

    const data = await jsonBody(res);
    expect(data.deals).toHaveLength(1);
    expect(data.total).toBe(1);
    expect(data.deals[0].title).toBe("Steam $50");
  });

  it("limits results to max 100", async () => {
    mockDbResult = [];
    const res = await GET(makeRequest("http://localhost/api/deals?limit=500"));
    expect(res.status).toBe(200);
    // The route clamps limit to 100 via Math.min — we can't easily assert
    // the SQL param, but we can verify no error
    const data = await jsonBody(res);
    expect(data.deals).toEqual([]);
    expect(data.total).toBe(0);
  });

  it("filters by region in application layer", async () => {
    mockDbResult = [
      { id: 1, title: "US Only Deal", countryRedeemable: ["US"], brandSlug: "test" },
      { id: 2, title: "Global Deal", countryRedeemable: ["Global"], brandSlug: "test" },
      { id: 3, title: "UK Only Deal", countryRedeemable: ["UK"], brandSlug: "test" },
    ];

    const res = await GET(makeRequest("http://localhost/api/deals?region=US"));
    const data = await jsonBody(res);

    // Should include US-specific and Global, exclude UK-only
    expect(data.deals).toHaveLength(2);
    expect(data.deals.map((d: { id: number }) => d.id)).toEqual([1, 2]);
  });

  it("returns empty array with error message on DB failure", async () => {
    // Make the chain throw when awaited
    const errorChain = createChain();
    errorChain.then = (_resolve: unknown, reject: (e: Error) => void) => {
      reject(new Error("connection refused"));
    };
    mockDb.select.mockReturnValueOnce(errorChain as ReturnType<typeof mockDb.select>);

    const res = await GET(makeRequest("http://localhost/api/deals"));
    expect(res.status).toBe(200); // graceful degradation, not 500
    const data = await jsonBody(res);
    expect(data.deals).toEqual([]);
    expect(data.error).toBe("Database not available");
  });
});

// ════════════════════════════════════════════════════════════════════════
// GET /api/brands
// ════════════════════════════════════════════════════════════════════════

describe("GET /api/brands", () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./brands/route");
    GET = mod.GET;
  });

  it("returns active brands with deal counts", async () => {
    mockDbResult = [
      {
        id: 1,
        name: "Steam",
        slug: "steam",
        category: "gaming",
        description: "Gaming platform",
        regionsSupported: ["US", "EU"],
        dealCount: 5,
        avgDiscount: 8.5,
      },
    ];

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await jsonBody(res);
    expect(data.brands).toHaveLength(1);
    expect(data.brands[0].name).toBe("Steam");
    expect(data.brands[0].dealCount).toBe(5);
  });

  it("returns empty array on DB error", async () => {
    const errorChain = createChain();
    errorChain.then = (_resolve: unknown, reject: (e: Error) => void) => {
      reject(new Error("connection refused"));
    };
    mockDb.select.mockReturnValueOnce(errorChain as ReturnType<typeof mockDb.select>);

    const res = await GET();
    const data = await jsonBody(res);
    expect(data.brands).toEqual([]);
    expect(data.error).toBe("Database not available");
  });
});

// ════════════════════════════════════════════════════════════════════════
// GET /api/brands/[slug]
// ════════════════════════════════════════════════════════════════════════

describe("GET /api/brands/[slug]", () => {
  let GET: (req: Request, ctx: { params: Promise<{ slug: string }> }) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./brands/[slug]/route");
    GET = mod.GET;
  });

  it("returns brand with its offers", async () => {
    // First query: brand lookup
    const brandChain = createChain();
    brandChain.then = (resolve: (v: unknown) => void) =>
      resolve([{ id: 1, name: "Steam", slug: "steam", category: "gaming", isActive: true }]);

    // Second query: offers for brand
    const offersChain = createChain();
    offersChain.then = (resolve: (v: unknown) => void) =>
      resolve([{ id: 10, title: "Steam $50", finalScore: 78, sourceName: "Bitrefill" }]);

    mockDb.select
      .mockReturnValueOnce(brandChain as ReturnType<typeof mockDb.select>)
      .mockReturnValueOnce(offersChain as ReturnType<typeof mockDb.select>);

    const res = await GET(
      makeRequest("http://localhost/api/brands/steam"),
      { params: Promise.resolve({ slug: "steam" }) },
    );
    expect(res.status).toBe(200);

    const data = await jsonBody(res);
    expect(data.brand.name).toBe("Steam");
    expect(data.offers).toHaveLength(1);
  });

  it("returns 404 for unknown brand", async () => {
    // Empty result for brand lookup
    const emptyChain = createChain();
    emptyChain.then = (resolve: (v: unknown) => void) => resolve([]);
    mockDb.select.mockReturnValueOnce(emptyChain as ReturnType<typeof mockDb.select>);

    const res = await GET(
      makeRequest("http://localhost/api/brands/nonexistent"),
      { params: Promise.resolve({ slug: "nonexistent" }) },
    );
    expect(res.status).toBe(404);

    const data = await jsonBody(res);
    expect(data.error).toBe("Brand not found");
  });

  it("returns 503 on DB failure", async () => {
    const errorChain = createChain();
    errorChain.then = (_resolve: unknown, reject: (e: Error) => void) => {
      reject(new Error("connection refused"));
    };
    mockDb.select.mockReturnValueOnce(errorChain as ReturnType<typeof mockDb.select>);

    const res = await GET(
      makeRequest("http://localhost/api/brands/steam"),
      { params: Promise.resolve({ slug: "steam" }) },
    );
    expect(res.status).toBe(503);
  });
});

// ════════════════════════════════════════════════════════════════════════
// GET /api/search
// ════════════════════════════════════════════════════════════════════════

describe("GET /api/search", () => {
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./search/route");
    GET = mod.GET;
  });

  it("returns matching deals for valid query", async () => {
    mockSearchDeals.mockResolvedValue([
      { id: 1, title: "Steam $50", finalScore: 80 },
      { id: 2, title: "Steam $100", finalScore: 75 },
    ]);

    const res = await GET(makeRequest("http://localhost/api/search?q=steam"));
    expect(res.status).toBe(200);

    const data = await jsonBody(res);
    expect(data.deals).toHaveLength(2);
    expect(data.query).toBe("steam");
    expect(data.total).toBe(2);
  });

  it("returns empty results for empty query", async () => {
    const res = await GET(makeRequest("http://localhost/api/search?q="));
    const data = await jsonBody(res);
    expect(data.deals).toEqual([]);
    expect(data.query).toBe("");
    expect(mockSearchDeals).not.toHaveBeenCalled();
  });

  it("returns empty results with no query param", async () => {
    const res = await GET(makeRequest("http://localhost/api/search"));
    const data = await jsonBody(res);
    expect(data.deals).toEqual([]);
  });

  it("handles search errors gracefully", async () => {
    mockSearchDeals.mockRejectedValue(new Error("search engine down"));

    const res = await GET(makeRequest("http://localhost/api/search?q=steam"));
    const data = await jsonBody(res);
    expect(data.deals).toEqual([]);
    expect(data.error).toBe("Search temporarily unavailable");
  });

  it("respects limit parameter (capped at 100)", async () => {
    mockSearchDeals.mockResolvedValue([]);

    await GET(makeRequest("http://localhost/api/search?q=test&limit=200"));
    // The route passes limit to searchDeals — verify it was capped
    expect(mockSearchDeals).toHaveBeenCalledWith("test", expect.objectContaining({ limit: 100 }));
  });

  it("passes region and trustZone filters", async () => {
    mockSearchDeals.mockResolvedValue([]);

    await GET(makeRequest("http://localhost/api/search?q=test&region=US&trustZone=green"));
    expect(mockSearchDeals).toHaveBeenCalledWith("test", expect.objectContaining({
      region: "US",
      trustZone: "green",
    }));
  });
});

// ════════════════════════════════════════════════════════════════════════
// POST /api/ingest
// ════════════════════════════════════════════════════════════════════════

describe("POST /api/ingest", () => {
  let POST: (req: Request) => Promise<Response>;
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./ingest/route");
    POST = mod.POST;
    GET = mod.GET;
  });

  it("rejects unauthenticated requests", async () => {
    const res = await POST(makeRequest("http://localhost/api/ingest", { method: "POST" }));
    expect(res.status).toBe(401);
    const data = await jsonBody(res);
    expect(data.error).toContain("Unauthorized");
  });

  it("rejects wrong API key", async () => {
    const res = await POST(makeAuthRequest("http://localhost/api/ingest", "wrong-key", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("triggers ingestion with valid key", async () => {
    mockRunIngestion.mockResolvedValue({
      durationMs: 1234,
      totalOffersProcessed: 50,
      totalOffersUpserted: 45,
      totalFlagged: 2,
      totalErrors: 0,
      staleMarked: 3,
      revalidation: { checked: 10, removed: 1 },
      clustering: { clustersFound: 5, duplicatesRemoved: 2 },
      alerts: { matched: 3, sent: 3 },
      sources: [
        {
          sourceSlug: "bitrefill",
          sourceName: "Bitrefill",
          fetchDurationMs: 500,
          rawOfferCount: 20,
          normalizedCount: 18,
          upsertedCount: 18,
          flaggedCount: 1,
          skippedCount: 1,
          failed: false,
          warnings: [],
        },
      ],
    });

    const res = await POST(
      makeAuthRequest("http://localhost/api/ingest", "dev-ingest-key", { method: "POST" }),
    );
    expect(res.status).toBe(200);

    const data = await jsonBody(res);
    expect(data.success).toBe(true);
    expect(data.summary.totalOffersProcessed).toBe(50);
    expect(data.sources).toHaveLength(1);
    expect(data.sources[0].source).toBe("bitrefill");
  });

  it("passes source filter and dryRun params", async () => {
    mockRunIngestion.mockResolvedValue({
      durationMs: 100,
      totalOffersProcessed: 0,
      totalOffersUpserted: 0,
      totalFlagged: 0,
      totalErrors: 0,
      staleMarked: 0,
      revalidation: {},
      clustering: {},
      alerts: {},
      sources: [],
    });

    await POST(
      makeAuthRequest(
        "http://localhost/api/ingest?source=bitrefill&dryRun=true",
        "dev-ingest-key",
        { method: "POST" },
      ),
    );

    expect(mockRunIngestion).toHaveBeenCalledWith({
      sourceSlug: "bitrefill",
      dryRun: true,
    });
  });

  it("returns 500 on pipeline failure", async () => {
    mockRunIngestion.mockRejectedValue(new Error("adapter crash"));

    const res = await POST(
      makeAuthRequest("http://localhost/api/ingest", "dev-ingest-key", { method: "POST" }),
    );
    expect(res.status).toBe(500);
    const data = await jsonBody(res);
    expect(data.error).toContain("failed");
  });

  it("GET returns pipeline info", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await jsonBody(res);
    expect(data.description).toContain("Ingestion");
    expect(data.method).toContain("POST");
  });
});

// ════════════════════════════════════════════════════════════════════════
// POST /api/complaints
// ════════════════════════════════════════════════════════════════════════

describe("POST /api/complaints", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./complaints/route");
    POST = mod.POST;
  });

  it("rejects invalid JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: "not json",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    const data = await jsonBody(res);
    expect(data.error).toContain("Invalid JSON");
  });

  it("rejects missing offerId", async () => {
    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: JSON.stringify({ complaintType: "expired", description: "This deal is expired now" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    expect((await jsonBody(res)).error).toContain("offerId");
  });

  it("rejects invalid complaint type", async () => {
    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: JSON.stringify({ offerId: 1, complaintType: "invalid_type", description: "This is a test complaint" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    expect((await jsonBody(res)).error).toContain("complaintType");
  });

  it("rejects description too short", async () => {
    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: JSON.stringify({ offerId: 1, complaintType: "expired", description: "short" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    expect((await jsonBody(res)).error).toContain("10 characters");
  });

  it("rejects description too long (>1000 chars)", async () => {
    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          offerId: 1,
          complaintType: "expired",
          description: "x".repeat(1001),
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    expect((await jsonBody(res)).error).toContain("under 1000");
  });

  it("rejects invalid reporter email", async () => {
    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          offerId: 1,
          complaintType: "expired",
          description: "This deal is expired and no longer available",
          reporterEmail: "not-an-email",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    expect((await jsonBody(res)).error).toContain("email");
  });

  it("returns 404 when offer not found", async () => {
    // First select (offer lookup) returns empty
    const emptyChain = createChain();
    emptyChain.then = (resolve: (v: unknown) => void) => resolve([]);
    mockDb.select.mockReturnValueOnce(emptyChain as ReturnType<typeof mockDb.select>);

    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          offerId: 999,
          complaintType: "expired",
          description: "This deal is expired and no longer available",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(404);
    expect((await jsonBody(res)).error).toBe("Offer not found");
  });

  it("creates complaint case for valid submission", async () => {
    // Offer lookup returns a valid offer
    const offerChain = createChain();
    offerChain.then = (resolve: (v: unknown) => void) =>
      resolve([{ id: 42, sourceId: 1 }]);
    mockDb.select.mockReturnValueOnce(offerChain as ReturnType<typeof mockDb.select>);

    // Insert returns the case record
    mockDbInsertResult = [{ id: 100, createdAt: new Date("2026-04-07T12:00:00Z") }];

    const res = await POST(
      new Request("http://localhost/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          offerId: 42,
          complaintType: "incorrect_price",
          description: "The actual price on the site is $52, not $48 as shown",
          reporterEmail: "user@example.com",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(201);

    const data = await jsonBody(res);
    expect(data.success).toBe(true);
    expect(data.caseId).toBe(100);
    expect(data.message).toContain("48 hours");
  });
});

// ════════════════════════════════════════════════════════════════════════
// GET /api/admin/health
// ════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/health", () => {
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./admin/health/route");
    GET = mod.GET;
  });

  it("rejects unauthenticated requests", async () => {
    const res = await GET(makeRequest("http://localhost/api/admin/health"));
    expect(res.status).toBe(401);
  });

  it("returns health report with valid auth", async () => {
    mockGetHealthReport.mockResolvedValue({
      generatedAt: new Date("2026-04-07T12:00:00Z"),
      overall: "healthy",
      summary: { total: 6, healthy: 5, degraded: 1, down: 0 },
      sources: [
        {
          slug: "bitrefill",
          name: "Bitrefill",
          status: "healthy",
          trustZone: "green",
          isActive: true,
          minutesSinceSuccess: 15,
          slaMinutes: 120,
          isStale: false,
          successRate: 0.98,
          lastSuccessAt: new Date("2026-04-07T11:45:00Z"),
          lastFetchedAt: new Date("2026-04-07T11:45:00Z"),
          activeOfferCount: 150,
          message: "OK",
        },
      ],
    });

    const res = await GET(makeAuthRequest("http://localhost/api/admin/health", "dev-admin-key"));
    expect(res.status).toBe(200);

    const data = await jsonBody(res);
    expect(data.overall).toBe("healthy");
    expect(data.sources).toHaveLength(1);
    expect(data.sources[0].slug).toBe("bitrefill");
  });
});

// ════════════════════════════════════════════════════════════════════════
// GET /api/click/[offerId]
// ════════════════════════════════════════════════════════════════════════

describe("GET /api/click/[offerId]", () => {
  let GET: (req: Request, ctx: { params: Promise<{ offerId: string }> }) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./click/[offerId]/route");
    GET = mod.GET;
  });

  it("returns 400 for invalid offer ID", async () => {
    const req = new Request("http://localhost/api/click/abc");
    const res = await GET(req, { params: Promise.resolve({ offerId: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("redirects to /deals when offer not found", async () => {
    mockGetClickTarget.mockResolvedValue(null);

    const req = new Request("http://localhost/api/click/999");
    const res = await GET(req, { params: Promise.resolve({ offerId: "999" }) });
    // NextResponse.redirect returns a 302
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toContain("/deals");
  });

  it("redirects to affiliate URL for valid offer", async () => {
    mockGetClickTarget.mockResolvedValue({
      offerId: 42,
      sourceId: 1,
      brandId: 1,
      externalUrl: "https://bitrefill.com/steam",
      sourceUrl: "https://bitrefill.com",
      affiliateNetwork: "bitrefill",
      affiliateProgramId: "igift123",
    });
    mockBuildAffiliateUrl.mockReturnValue("https://bitrefill.com/steam?ref=igift123&utm_source=igift");

    const req = new Request("http://localhost/api/click/42");
    const res = await GET(req, { params: Promise.resolve({ offerId: "42" }) });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("https://bitrefill.com/steam?ref=igift123&utm_source=igift");
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(mockLogClick).toHaveBeenCalledWith(expect.objectContaining({ offerId: 42 }));
  });

  it("returns 400 for negative offer ID", async () => {
    const req = new Request("http://localhost/api/click/-5");
    const res = await GET(req, { params: Promise.resolve({ offerId: "-5" }) });
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════
// GET/POST /api/ingest (GET info endpoint)
// ════════════════════════════════════════════════════════════════════════

describe("GET /api/ingest (info endpoint)", () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    const mod = await import("./ingest/route");
    GET = mod.GET;
  });

  it("returns pipeline description", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await jsonBody(res);
    expect(data.description).toContain("Ingestion");
    expect(data.auth).toContain("Bearer");
  });
});
