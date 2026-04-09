import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllRates, getRate, isCurrencySupported, clearRateCache, STATIC_RATES } from "./fx-rates";

beforeEach(() => {
  clearRateCache();
  vi.restoreAllMocks();
});

describe("getAllRates", () => {
  it("falls back to static rates when API is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    const { rates, source } = await getAllRates();
    expect(source).toBe("static");
    expect(rates.USD).toBe(1.0);
    expect(rates.EUR).toBe(1.08);
  });

  it("returns live rates on successful API response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        rates: { USD: 1, EUR: 0.925, GBP: 0.794, JPY: 149.5 },
      }),
    } as Response);

    const { rates, source } = await getAllRates();
    expect(source).toBe("live");
    expect(rates.USD).toBe(1.0);
    // EUR: 1/0.925 ≈ 1.081
    expect(rates.EUR).toBeCloseTo(1.081, 2);
    // GBP: 1/0.794 ≈ 1.259
    expect(rates.GBP).toBeCloseTo(1.259, 2);
    // JPY: 1/149.5 ≈ 0.00669
    expect(rates.JPY).toBeCloseTo(0.00669, 4);
  });

  it("falls back to static rates on non-200 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { rates, source } = await getAllRates();
    expect(source).toBe("static");
    expect(rates).toEqual(STATIC_RATES);
  });

  it("falls back on malformed API response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ result: "error" }),
    } as Response);

    const { source } = await getAllRates();
    expect(source).toBe("static");
  });

  it("caches results across calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success",
        rates: { USD: 1, EUR: 0.925 },
      }),
    } as Response);

    await getAllRates();
    await getAllRates();
    await getAllRates();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe("getRate", () => {
  it("returns rate for known currency", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const rate = await getRate("EUR");
    expect(rate).toBe(1.08);
  });

  it("returns null for unknown currency", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const rate = await getRate("XYZ");
    expect(rate).toBeNull();
  });

  it("is case-insensitive", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const rate = await getRate("eur");
    expect(rate).toBe(1.08);
  });
});

describe("isCurrencySupported", () => {
  it("returns true for supported currencies", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    expect(await isCurrencySupported("USD")).toBe(true);
    expect(await isCurrencySupported("EUR")).toBe(true);
  });

  it("returns false for unsupported currencies", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    expect(await isCurrencySupported("DOGE")).toBe(false);
  });
});
