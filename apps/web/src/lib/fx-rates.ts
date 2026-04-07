/**
 * Live FX Rate Provider
 *
 * Fetches exchange rates from exchangerate-api.com (free tier: 1500 req/month).
 * Caches rates in memory with configurable TTL.
 * Falls back to static rates if the API is unreachable.
 *
 * Usage:
 *   const rate = await getRate("EUR");  // 1.08 (EUR → USD)
 *   const rates = await getAllRates();  // full map
 */

// ── Static fallbacks (last known good rates, updated 2026-04-07) ──

export const STATIC_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.26,
  CAD: 0.74,
  AUD: 0.65,
  JPY: 0.0067,
  CHF: 1.12,
  SEK: 0.096,
  NOK: 0.094,
  DKK: 0.145,
  BRL: 0.20,
  MXN: 0.058,
  INR: 0.012,
};

// ── Cache ──

interface RateCache {
  rates: Record<string, number>;
  fetchedAt: number; // epoch ms
  source: "live" | "static";
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours (matches cron interval)

let cache: RateCache | null = null;

/** Force-clear the cache (useful for tests) */
export function clearRateCache(): void {
  cache = null;
}

/** Check if the cached rates are still fresh */
function isCacheFresh(): boolean {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

// ── API Fetch ──

const API_BASE = "https://open.er-api.com/v6/latest/USD";

interface ApiResponse {
  result: string;
  rates: Record<string, number>;
}

/**
 * Fetch live rates from the free ExchangeRate API.
 * Returns a map of currency → USD multiplier (inverted from API's USD-base).
 */
async function fetchLiveRates(): Promise<Record<string, number>> {
  const res = await fetch(API_BASE, {
    signal: AbortSignal.timeout(5000), // 5s timeout
  });

  if (!res.ok) {
    throw new Error(`FX API returned ${res.status}`);
  }

  const data: ApiResponse = await res.json();

  if (data.result !== "success" || !data.rates) {
    throw new Error("FX API returned unexpected format");
  }

  // API returns rates FROM USD, e.g. { EUR: 0.925, GBP: 0.794 }
  // We need rates TO USD, e.g. { EUR: 1.08, GBP: 1.26 }
  const toUsd: Record<string, number> = {};
  for (const [currency, fromUsdRate] of Object.entries(data.rates)) {
    if (fromUsdRate > 0) {
      toUsd[currency] = 1 / fromUsdRate;
    }
  }
  toUsd["USD"] = 1.0;

  return toUsd;
}

// ── Public API ──

/**
 * Get all FX rates (currency → USD multiplier).
 * Fetches live rates if cache is stale, falls back to static on failure.
 */
export async function getAllRates(): Promise<{ rates: Record<string, number>; source: "live" | "static" }> {
  if (isCacheFresh() && cache) {
    return { rates: cache.rates, source: cache.source };
  }

  try {
    const rates = await fetchLiveRates();
    cache = { rates, fetchedAt: Date.now(), source: "live" };
    return { rates, source: "live" };
  } catch (error) {
    console.warn("[FX] Live rate fetch failed, using static fallback:", error);
    cache = { rates: STATIC_RATES, fetchedAt: Date.now(), source: "static" };
    return { rates: STATIC_RATES, source: "static" };
  }
}

/** Get the USD multiplier for a single currency */
export async function getRate(currency: string): Promise<number | null> {
  const { rates } = await getAllRates();
  return rates[currency.toUpperCase()] ?? null;
}

/** Check if a currency is supported (in either live or static rates) */
export async function isCurrencySupported(currency: string): Promise<boolean> {
  const { rates } = await getAllRates();
  return currency.toUpperCase() in rates;
}
