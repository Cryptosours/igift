import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { bitrefillAdapter } from "./bitrefill";
import { dundleAdapter } from "./dundle";
import { raiseAdapter } from "./raise";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Create a mock Response object that vitest's fetch stub will return */
function mockResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: { "Content-Type": "text/html" } });
}

/** Create a fetch stub that returns a specific response for matching URLs */
function stubFetch(
  urlMatcher: string | RegExp,
  html: string,
  otherStatus = 404,
) {
  return vi.fn((url: string) => {
    const matches =
      typeof urlMatcher === "string"
        ? url.includes(urlMatcher)
        : urlMatcher.test(url);
    return Promise.resolve(
      matches ? mockResponse(html) : mockResponse("", otherStatus),
    );
  });
}

// ─── Bitrefill ────────────────────────────────────────────────────────────

/** Minimal Bitrefill HTML: one denomination ($50, asking $51.66) with 2% cashback */
const BITREFILL_HTML_STEAM = `
<html><body>
<script>
window.__REACT_QUERY_STATE__ = {
  "queries": [{
    "data": {
      "amount": 50,
      "cashbackPercentageFinal": 2.0,
      "prices": { "USD": 5166 }
    }
  }, {
    "data": {
      "amount": 100,
      "cashbackPercentageFinal": 2.0,
      "prices": { "USD": 10332 }
    }
  }]
}
</script>
</body></html>
`;

/** Bitrefill HTML with cashbackDisabled:true */
const BITREFILL_HTML_CASHBACK_DISABLED = `
<html><body>
<script>
"amount":25,"prices":{"USD":2550}
"cashbackDisabled":true
"cashbackPercentageFinal":5
</script>
</body></html>
`;

/** Bitrefill HTML with a tiny denomination (< $5) that should be skipped */
const BITREFILL_HTML_TINY_DENOM = `
<html><body>
<script>
"amount":1,"prices":{"USD":105}
"amount":3,"prices":{"USD":315}
"amount":50,"prices":{"USD":5100}
</script>
</body></html>
`;

describe("bitrefillAdapter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("dry run returns empty result without making network requests", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await bitrefillAdapter.fetchOffers({ dryRun: true });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.sourceSlug).toBe("bitrefill");
    expect(result.offers).toHaveLength(0);
    expect(result.failed).toBe(false);
    expect(result.warnings).toContain("Dry run — no fetches performed");
  });

  it("parses denominations and fees from Bitrefill embedded data", async () => {
    vi.stubGlobal("fetch", stubFetch("steam-usa", BITREFILL_HTML_STEAM));

    const promise = bitrefillAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    // Steam $50 offer
    const steamOffer = result.offers.find((o) => o.denomination === "50");
    expect(steamOffer).toBeDefined();
    expect(steamOffer!.externalId).toBe("bitrefill-steam-usa-50");
    expect(steamOffer!.faceValueCents).toBe(5000);
    expect(steamOffer!.askingPriceCents).toBe(5166);
    expect(steamOffer!.feeTotalCents).toBe(166); // 5166 - 5000
    expect(steamOffer!.currency).toBe("USD");
    expect(steamOffer!.hasBuyerProtection).toBe(true);
    expect(steamOffer!.rawSnapshot.cashbackPct).toBe(2);
  });

  it("parses $100 denomination from same page", async () => {
    vi.stubGlobal("fetch", stubFetch("steam-usa", BITREFILL_HTML_STEAM));

    const promise = bitrefillAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const steamOffer = result.offers.find((o) => o.denomination === "100");
    expect(steamOffer).toBeDefined();
    expect(steamOffer!.faceValueCents).toBe(10000);
    expect(steamOffer!.askingPriceCents).toBe(10332);
  });

  it("sets cashbackPct to 0 when cashbackDisabled is true", async () => {
    vi.stubGlobal(
      "fetch",
      stubFetch("steam-usa", BITREFILL_HTML_CASHBACK_DISABLED),
    );

    const promise = bitrefillAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const offer = result.offers[0];
    if (offer) {
      expect(offer.rawSnapshot.cashbackPct).toBe(0);
    }
  });

  it("filters out denominations below $5", async () => {
    vi.stubGlobal("fetch", stubFetch("steam-usa", BITREFILL_HTML_TINY_DENOM));

    const promise = bitrefillAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const steams = result.offers.filter((o) =>
      o.externalId.startsWith("bitrefill-steam-usa"),
    );
    // $1 and $3 should be filtered, only $50 passes
    expect(steams.every((o) => parseFloat(o.denomination) >= 5)).toBe(true);
  });

  it("emits warning and no offers on HTTP 4xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(mockResponse("", 404))),
    );

    const promise = bitrefillAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.offers).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("HTTP 404"))).toBe(true);
    expect(result.failed).toBe(true);
  });

  it("emits warning and no offers when fetch rejects (network error)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("ECONNREFUSED"))),
    );

    const promise = bitrefillAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.offers).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("ECONNREFUSED"))).toBe(true);
    expect(result.failed).toBe(true);
  });

  it("result always includes required AdapterResult fields", async () => {
    const result = await bitrefillAdapter.fetchOffers({ dryRun: true });

    expect(result).toHaveProperty("sourceSlug");
    expect(result).toHaveProperty("offers");
    expect(result).toHaveProperty("fetchedAt");
    expect(result).toHaveProperty("durationMs");
    expect(result).toHaveProperty("warnings");
    expect(result).toHaveProperty("failed");
    expect(result.fetchedAt).toBeInstanceOf(Date);
    expect(typeof result.durationMs).toBe("number");
  });
});

// ─── Dundle ───────────────────────────────────────────────────────────────

/** Dundle HTML with JSON-LD Product schema */
const DUNDLE_HTML_STEAM = `
<html><body>
<script type="application/ld+json">
{
  "@type": "Product",
  "name": "Steam Gift Card",
  "offers": [
    {
      "@type": "Offer",
      "price": "25.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://www.dundle.com/us/steam/25",
      "name": "Steam $25",
      "sku": "$25"
    },
    {
      "@type": "Offer",
      "price": "50.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://www.dundle.com/us/steam/50",
      "name": "Steam $50",
      "sku": "$50"
    }
  ]
}
</script>
</body></html>
`;

/** Dundle HTML where all offers are OutOfStock */
const DUNDLE_HTML_OUT_OF_STOCK = `
<html><body>
<script type="application/ld+json">
{
  "@type": "Product",
  "offers": [{
    "@type": "Offer",
    "price": "25.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/OutOfStock"
  }]
}
</script>
</body></html>
`;

/** Dundle HTML with no JSON-LD — triggers fallback price parser */
const DUNDLE_HTML_FALLBACK = `
<html><body>
<p>Buy <strong>Steam Gift Card $25 USD</strong> at the best price.</p>
<p>Also available: $50 USD, $100 USD</p>
</body></html>
`;

describe("dundleAdapter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("dry run returns empty result without network requests", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await dundleAdapter.fetchOffers({ dryRun: true });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.sourceSlug).toBe("dundle");
    expect(result.offers).toHaveLength(0);
    expect(result.failed).toBe(false);
  });

  it("parses JSON-LD Product offers from Dundle page", async () => {
    vi.stubGlobal("fetch", stubFetch("steam", DUNDLE_HTML_STEAM));

    const promise = dundleAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const steam25 = result.offers.find((o) => o.denomination === "25");
    expect(steam25).toBeDefined();
    expect(steam25!.externalId).toBe("dundle-steam-25");
    expect(steam25!.faceValueCents).toBe(2500);
    expect(steam25!.askingPriceCents).toBe(2500);
    expect(steam25!.feeTotalCents).toBe(0); // dundle charges no markup
    expect(steam25!.currency).toBe("USD");
    expect(steam25!.hasBuyerProtection).toBe(true);

    const steam50 = result.offers.find((o) => o.denomination === "50");
    expect(steam50).toBeDefined();
    expect(steam50!.faceValueCents).toBe(5000);
  });

  it("skips OutOfStock offers", async () => {
    vi.stubGlobal("fetch", stubFetch("steam", DUNDLE_HTML_OUT_OF_STOCK));

    const promise = dundleAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const steamOffers = result.offers.filter((o) =>
      o.externalId.startsWith("dundle-steam"),
    );
    expect(steamOffers).toHaveLength(0);
    // Should emit a warning since no offers found
    const steamWarnings = result.warnings.filter((w) => w.includes("steam"));
    expect(steamWarnings.length).toBeGreaterThan(0);
  });

  it("falls back to text-based price parsing when JSON-LD is absent", async () => {
    vi.stubGlobal("fetch", stubFetch("steam", DUNDLE_HTML_FALLBACK));

    const promise = dundleAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    // Fallback parser should have found $25, $50, $100
    const steamOffers = result.offers.filter((o) =>
      o.externalId.startsWith("dundle-steam"),
    );
    expect(steamOffers.length).toBeGreaterThanOrEqual(1);
    expect(steamOffers.some((o) => o.denomination === "25")).toBe(true);
  });

  it("emits warning on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(mockResponse("", 503))),
    );

    const promise = dundleAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.offers).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("HTTP 503"))).toBe(true);
  });

  it("result always includes required AdapterResult fields", async () => {
    const result = await dundleAdapter.fetchOffers({ dryRun: true });

    expect(result).toHaveProperty("sourceSlug", "dundle");
    expect(result.fetchedAt).toBeInstanceOf(Date);
    expect(typeof result.durationMs).toBe("number");
    expect(Array.isArray(result.offers)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

// ─── Raise ────────────────────────────────────────────────────────────────

/** Raise HTML with JSON-LD AggregateOffer — price < highPrice means discount */
const RAISE_HTML_APPLE_DISCOUNTED = `
<html><body>
<script type="application/ld+json">
{
  "@type": "Product",
  "name": "Apple Gift Card",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "23.75",
    "highPrice": "25.00",
    "priceCurrency": "USD",
    "url": "https://www.raise.com/buy/apple-gift-cards"
  }
}
</script>
</body></html>
`;

/** Raise HTML where price = highPrice (no discount) */
const RAISE_HTML_NO_DISCOUNT = `
<html><body>
<script type="application/ld+json">
{
  "@type": "Product",
  "name": "Steam Gift Card",
  "offers": [{
    "@type": "Offer",
    "price": "50.00",
    "highPrice": "50.00",
    "priceCurrency": "USD",
    "url": "https://www.raise.com/buy/steam-gift-cards"
  }]
}
</script>
</body></html>
`;

/** Raise HTML with no JSON-LD — fallback: $50 gift card + 4% off */
const RAISE_HTML_FALLBACK = `
<html><body>
<h1>Buy Discounted Gift Cards</h1>
<div>$50 Gift Card Value — 4% off</div>
<div>$100 Gift Card Value — 4% off</div>
</body></html>
`;

describe("raiseAdapter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("dry run returns empty result without network requests", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await raiseAdapter.fetchOffers({ dryRun: true });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.sourceSlug).toBe("raise");
    expect(result.offers).toHaveLength(0);
    expect(result.failed).toBe(false);
  });

  it("parses discounted price from JSON-LD (highPrice > price)", async () => {
    vi.stubGlobal("fetch", stubFetch("apple", RAISE_HTML_APPLE_DISCOUNTED));

    const promise = raiseAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const appleOffer = result.offers.find((o) =>
      o.externalId.startsWith("raise-apple"),
    );
    expect(appleOffer).toBeDefined();
    expect(appleOffer!.faceValueCents).toBe(2500); // highPrice = $25
    expect(appleOffer!.askingPriceCents).toBe(2375); // lowPrice = $23.75
    expect(appleOffer!.denomination).toBe("25");
    expect(appleOffer!.hasBuyerProtection).toBe(true);
    expect(appleOffer!.currency).toBe("USD");
  });

  it("sets faceValue = askingPrice when highPrice equals price (no discount)", async () => {
    vi.stubGlobal("fetch", stubFetch("steam", RAISE_HTML_NO_DISCOUNT));

    const promise = raiseAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const steamOffer = result.offers.find((o) =>
      o.externalId.startsWith("raise-steam"),
    );
    expect(steamOffer).toBeDefined();
    expect(steamOffer!.faceValueCents).toBe(5000);
    expect(steamOffer!.askingPriceCents).toBe(5000);
  });

  it("falls back to text pattern when JSON-LD is absent", async () => {
    vi.stubGlobal("fetch", stubFetch("apple", RAISE_HTML_FALLBACK));

    const promise = raiseAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    const appleOffers = result.offers.filter((o) =>
      o.externalId.startsWith("raise-apple"),
    );
    expect(appleOffers.length).toBeGreaterThanOrEqual(1);

    // Fallback should apply the 4% discount
    const offer50 = appleOffers.find((o) => o.denomination === "50");
    if (offer50) {
      expect(offer50.faceValueCents).toBe(5000);
      expect(offer50.askingPriceCents).toBe(4800); // 5000 * (1 - 0.04)
    }
  });

  it("emits warning on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(mockResponse("", 429))),
    );

    const promise = raiseAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.offers).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("HTTP 429"))).toBe(true);
  });

  it("handles fetch abort gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new DOMException("AbortError", "AbortError"))),
    );

    const promise = raiseAdapter.fetchOffers({ timeoutMs: 5000 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.offers).toHaveLength(0);
    expect(result.failed).toBe(true);
  });

  it("result always includes required AdapterResult fields", async () => {
    const result = await raiseAdapter.fetchOffers({ dryRun: true });

    expect(result).toHaveProperty("sourceSlug", "raise");
    expect(result.fetchedAt).toBeInstanceOf(Date);
    expect(typeof result.durationMs).toBe("number");
    expect(Array.isArray(result.offers)).toBe(true);
  });
});
