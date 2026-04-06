import { describe, it, expect } from "vitest";
import {
  REGIONS,
  SELECTABLE_REGIONS,
  LOCALE_TO_REGION,
  getRegion,
  formatRegionPrice,
  regionFromCurrency,
} from "./regions";

describe("REGIONS config", () => {
  it("has all 5 regions", () => {
    expect(Object.keys(REGIONS)).toHaveLength(5);
    expect(Object.keys(REGIONS)).toEqual(
      expect.arrayContaining(["US", "EU", "UK", "AU", "Global"]),
    );
  });

  it("every region has required fields", () => {
    for (const config of Object.values(REGIONS)) {
      expect(config.code).toBeTruthy();
      expect(config.displayName).toBeTruthy();
      expect(config.flag).toBeTruthy();
      expect(config.currency).toBeTruthy();
      expect(config.symbol).toBeTruthy();
      expect(Array.isArray(config.countryCodes)).toBe(true);
    }
  });

  it("EU includes Germany", () => {
    expect(REGIONS.EU.countryCodes).toContain("DE");
  });

  it("Global has empty country codes", () => {
    expect(REGIONS.Global.countryCodes).toHaveLength(0);
  });
});

describe("SELECTABLE_REGIONS", () => {
  it("excludes Global", () => {
    expect(SELECTABLE_REGIONS).not.toContain("Global");
  });

  it("includes US, EU, UK, AU", () => {
    expect(SELECTABLE_REGIONS).toEqual(["US", "EU", "UK", "AU"]);
  });
});

describe("LOCALE_TO_REGION", () => {
  it("maps en to US", () => {
    expect(LOCALE_TO_REGION.en).toBe("US");
  });

  it("maps de to EU", () => {
    expect(LOCALE_TO_REGION.de).toBe("EU");
  });
});

describe("getRegion", () => {
  it("returns the correct region for known codes", () => {
    expect(getRegion("US").displayName).toBe("United States");
    expect(getRegion("EU").currency).toBe("EUR");
    expect(getRegion("UK").symbol).toBe("£");
  });

  it("falls back to Global for unknown codes", () => {
    expect(getRegion("ZZ")).toEqual(REGIONS.Global);
    expect(getRegion("")).toEqual(REGIONS.Global);
  });
});

describe("formatRegionPrice", () => {
  it("formats USD in English locale", () => {
    const result = formatRegionPrice(1999, "USD", "en");
    expect(result).toContain("19.99");
    expect(result).toContain("$");
  });

  it("formats EUR in German locale", () => {
    const result = formatRegionPrice(1999, "EUR", "de");
    // German formatting uses comma for decimal
    expect(result).toContain("19,99");
    expect(result).toContain("€");
  });

  it("handles zero cents", () => {
    const result = formatRegionPrice(0, "USD");
    expect(result).toContain("0.00");
  });

  it("defaults to en locale", () => {
    const result = formatRegionPrice(5000, "GBP");
    expect(result).toContain("50.00");
    expect(result).toContain("£");
  });
});

describe("regionFromCurrency", () => {
  it("maps USD to US", () => {
    expect(regionFromCurrency("USD")).toBe("US");
  });

  it("maps EUR to EU", () => {
    expect(regionFromCurrency("EUR")).toBe("EU");
  });

  it("maps GBP to UK", () => {
    expect(regionFromCurrency("GBP")).toBe("UK");
  });

  it("maps AUD to AU", () => {
    expect(regionFromCurrency("AUD")).toBe("AU");
  });

  it("returns Global for unknown", () => {
    expect(regionFromCurrency("JPY")).toBe("Global");
    expect(regionFromCurrency("XYZ")).toBe("Global");
  });

  it("is case-insensitive", () => {
    expect(regionFromCurrency("usd")).toBe("US");
    expect(regionFromCurrency("eur")).toBe("EU");
  });
});
