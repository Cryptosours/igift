import { describe, it, expect } from "vitest";
import {
  resolveBrandSlug,
  toUsdCents,
  isSupportedCurrency,
  normalizeCountry,
  normalizeCountries,
  extractDenomination,
  normalizeTitle,
  normalizeOffer,
} from "./normalize";
import type { RawOffer } from "./types";

// ── Brand Resolution ──

describe("resolveBrandSlug", () => {
  it("resolves exact matches", () => {
    expect(resolveBrandSlug("apple")).toBe("apple");
    expect(resolveBrandSlug("steam")).toBe("steam");
    expect(resolveBrandSlug("netflix")).toBe("netflix");
  });

  it("resolves case-insensitive and with whitespace", () => {
    expect(resolveBrandSlug("  Apple  ")).toBe("apple");
    expect(resolveBrandSlug("STEAM")).toBe("steam");
    expect(resolveBrandSlug("Netflix Gift Card")).toBe("netflix");
  });

  it("resolves known aliases", () => {
    expect(resolveBrandSlug("iTunes")).toBe("apple");
    expect(resolveBrandSlug("App Store & iTunes")).toBe("apple");
    expect(resolveBrandSlug("PSN")).toBe("playstation");
    expect(resolveBrandSlug("PS Store")).toBe("playstation");
    expect(resolveBrandSlug("Xbox Live")).toBe("xbox");
    expect(resolveBrandSlug("Nintendo eShop")).toBe("nintendo");
    expect(resolveBrandSlug("Google Play Gift Card")).toBe("google-play");
  });

  it("strips trademark symbols", () => {
    expect(resolveBrandSlug("Steam™")).toBe("steam");
    expect(resolveBrandSlug("Apple®")).toBe("apple");
  });

  it("resolves via partial match", () => {
    expect(resolveBrandSlug("Steam Wallet Code 50 USD")).toBe("steam");
    expect(resolveBrandSlug("$25 Amazon.com Gift Card")).toBe("amazon");
  });

  it("returns null for unknown brands", () => {
    expect(resolveBrandSlug("FooBarBaz123")).toBeNull();
    expect(resolveBrandSlug("")).toBeNull();
  });
});

// ── Currency / FX ──

describe("toUsdCents", () => {
  it("passes through USD unchanged", () => {
    expect(toUsdCents(5000, "USD")).toBe(5000);
  });

  it("converts EUR to USD", () => {
    const result = toUsdCents(1000, "EUR");
    // 1000 * 1.08 = 1080
    expect(result).toBe(1080);
  });

  it("converts GBP to USD", () => {
    const result = toUsdCents(1000, "GBP");
    expect(result).toBe(1260);
  });

  it("handles case-insensitive currency codes", () => {
    expect(toUsdCents(1000, "eur")).toBe(1080);
    expect(toUsdCents(1000, "Usd")).toBe(1000);
  });

  it("returns null for unknown currencies", () => {
    expect(toUsdCents(5000, "XYZ")).toBeNull();
  });

  it("rounds to whole cents", () => {
    // JPY: 0.0067 * 10000 = 67
    expect(toUsdCents(10000, "JPY")).toBe(67);
  });
});

describe("isSupportedCurrency", () => {
  it("recognizes known currencies", () => {
    expect(isSupportedCurrency("USD")).toBe(true);
    expect(isSupportedCurrency("EUR")).toBe(true);
    expect(isSupportedCurrency("GBP")).toBe(true);
  });

  it("rejects unknown currencies", () => {
    expect(isSupportedCurrency("XYZ")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isSupportedCurrency("usd")).toBe(true);
    expect(isSupportedCurrency("eur")).toBe(true);
  });
});

// ── Region Mapping ──

describe("normalizeCountry", () => {
  it("normalizes full names to codes", () => {
    expect(normalizeCountry("United States")).toBe("US");
    expect(normalizeCountry("united kingdom")).toBe("GB");
    expect(normalizeCountry("Germany")).toBe("DE");
    expect(normalizeCountry("Japan")).toBe("JP");
  });

  it("normalizes shorthand codes", () => {
    expect(normalizeCountry("usa")).toBe("US");
    expect(normalizeCountry("uk")).toBe("GB");
    expect(normalizeCountry("au")).toBe("AU");
  });

  it("handles 'Global' / 'Worldwide'", () => {
    expect(normalizeCountry("Global")).toBe("Global");
    expect(normalizeCountry("worldwide")).toBe("Global");
    expect(normalizeCountry("international")).toBe("Global");
  });

  it("falls back to first 2 chars uppercased for unknown", () => {
    expect(normalizeCountry("Brazil")).toBe("BR");
    expect(normalizeCountry("mx")).toBe("MX");
  });
});

describe("normalizeCountries", () => {
  it("deduplicates normalized results", () => {
    const result = normalizeCountries(["usa", "US", "United States"]);
    expect(result).toEqual(["US"]);
  });

  it("normalizes all entries", () => {
    const result = normalizeCountries(["uk", "de", "worldwide"]);
    expect(result).toContain("GB");
    expect(result).toContain("DE");
    expect(result).toContain("Global");
  });
});

// ── Denomination Extraction ──

describe("extractDenomination", () => {
  it("extracts dollar denominations", () => {
    expect(extractDenomination("Steam $50 Gift Card")).toBe("50");
    expect(extractDenomination("Apple Gift Card $25.00")).toBe("25.00");
  });

  it("extracts euro denominations", () => {
    expect(extractDenomination("PlayStation Store €25")).toBe("25");
  });

  it("extracts pound denominations", () => {
    expect(extractDenomination("Netflix £15")).toBe("15");
  });

  it("extracts currency-suffix denominations", () => {
    expect(extractDenomination("50 USD Steam")).toBe("50");
    expect(extractDenomination("25 EUR gift card")).toBe("25");
  });

  it("returns null when no denomination found", () => {
    expect(extractDenomination("Xbox Gift Card")).toBeNull();
    expect(extractDenomination("")).toBeNull();
  });
});

// ── Title Normalization ──

describe("normalizeTitle", () => {
  it("builds a clean title with denomination", () => {
    expect(normalizeTitle("messy - steam card!!!", "Steam", "50", "USD")).toBe(
      "Steam Gift Card $50",
    );
  });

  it("builds title without denomination", () => {
    expect(normalizeTitle("apple stuff", "Apple", null, "USD")).toBe(
      "Apple Gift Card",
    );
  });

  it("uses correct currency symbol", () => {
    expect(normalizeTitle("card", "Netflix", "15", "EUR")).toBe(
      "Netflix Gift Card €15",
    );
    expect(normalizeTitle("card", "Amazon", "20", "GBP")).toBe(
      "Amazon Gift Card £20",
    );
  });

  it("falls back to currency code for non-standard currencies", () => {
    expect(normalizeTitle("card", "Steam", "50", "CAD")).toBe(
      "Steam Gift Card CAD 50",
    );
  });
});

// ── Full Pipeline ──

describe("normalizeOffer", () => {
  const baseRaw: RawOffer = {
    externalId: "test-123",
    originalTitle: "Steam Wallet $50 Gift Card - USA",
    externalUrl: "https://example.com/steam-50",
    rawBrandName: "Steam Wallet",
    faceValueCents: 5000,
    askingPriceCents: 4500,
    feeTotalCents: 100,
    currency: "USD",
    denomination: null,
    countryRedeemable: ["usa", "US"],
    sellerName: "TestSeller",
    sellerRating: 0.95,
    hasBuyerProtection: true,
    rawSnapshot: { test: true },
  };

  it("resolves brand slug", () => {
    const result = normalizeOffer(baseRaw);
    expect(result.brandSlug).toBe("steam");
  });

  it("extracts denomination from title", () => {
    const result = normalizeOffer(baseRaw);
    expect(result.denomination).toBe("50");
  });

  it("converts to USD", () => {
    const result = normalizeOffer(baseRaw);
    expect(result.currency).toBe("USD");
    expect(result.faceValueCents).toBe(5000);
    expect(result.askingPriceCents).toBe(4500);
  });

  it("computes effective price = asking + fees", () => {
    const result = normalizeOffer(baseRaw);
    expect(result.effectivePriceCents).toBe(4600); // 4500 + 100
  });

  it("computes discount percentage", () => {
    const result = normalizeOffer(baseRaw);
    // (5000 - 4600) / 5000 = 0.08
    expect(result.effectiveDiscountPct).toBe(0.08);
  });

  it("normalizes and deduplicates country codes", () => {
    const result = normalizeOffer(baseRaw);
    expect(result.countryRedeemable).toEqual(["US"]);
  });

  it("handles EUR conversion", () => {
    const eurOffer: RawOffer = {
      ...baseRaw,
      currency: "EUR",
      faceValueCents: 2500,
      askingPriceCents: 2200,
      feeTotalCents: 50,
    };
    const result = normalizeOffer(eurOffer);
    expect(result.currency).toBe("USD");
    expect(result.faceValueCents).toBe(2700); // 2500 * 1.08
    expect(result.askingPriceCents).toBe(2376); // 2200 * 1.08
    expect(result.effectivePriceCents).toBe(2430); // 2376 + 54
  });

  it("preserves raw snapshot", () => {
    const result = normalizeOffer(baseRaw);
    expect(result.rawSnapshot).toEqual({ test: true });
  });

  it("accepts brandNameOverride for display", () => {
    const result = normalizeOffer(baseRaw, "STEAM");
    expect(result.normalizedTitle).toContain("STEAM");
  });
});
