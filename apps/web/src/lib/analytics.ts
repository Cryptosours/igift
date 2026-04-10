/**
 * GA4 Analytics Utilities
 *
 * Two paths:
 *  - Server-side events (API routes) → GA4 Measurement Protocol
 *  - Client-side events (React pages) → window.gtag (declared as global)
 *
 * Both paths no-op when NEXT_PUBLIC_GA_MEASUREMENT_ID is not set.
 * Set GA4_API_SECRET on the server for Measurement Protocol auth.
 *
 * Env vars:
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID — GA4 Measurement ID (G-XXXXXXXXXX)
 *   GA4_API_SECRET — API secret from GA4 > Data Streams > Measurement Protocol
 */

// ── Constants ────────────────────────────────────────────────────────────────

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const API_SECRET = process.env.GA4_API_SECRET;
const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";

// ── Client-side (browser) ─────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a GA4 custom event from the browser.
 * Safe to call during SSR — bails if window is not defined.
 */
export function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === "undefined") return;
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", eventName, params);
}

// Convenience wrappers ─────────────────────────────────────────────────────────

export function trackBrandView(brandSlug: string, brandName: string): void {
  trackEvent("brand_view", { brand_slug: brandSlug, brand_name: brandName });
}

export function trackAlertSignup(brandSlug: string | null, channel: string): void {
  trackEvent("alert_signup", {
    brand_slug: brandSlug ?? "all",
    delivery_channel: channel,
  });
}

export function trackDealClick(offerId: number, brandSlug: string, discountPct: number): void {
  trackEvent("deal_click", {
    offer_id: offerId,
    brand_slug: brandSlug,
    discount_pct: Math.round(discountPct * 100),
  });
}

// ── Server-side (Measurement Protocol) ───────────────────────────────────────

interface MpEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Send a GA4 event from a server-side API route via the Measurement Protocol.
 * Requires GA4_API_SECRET in addition to NEXT_PUBLIC_GA_MEASUREMENT_ID.
 *
 * clientId: a stable anonymous identifier for the user session (e.g. from a
 * cookie or the GA4 _ga cookie value). Falls back to "server" if unknown.
 */
export async function trackServerEvent(
  event: MpEvent,
  clientId = "server",
): Promise<void> {
  if (!MEASUREMENT_ID || !API_SECRET) return;

  try {
    await fetch(
      `${MP_ENDPOINT}?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(API_SECRET)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: event.name, params: event.params ?? {} }],
        }),
      },
    );
  } catch {
    // Non-critical — analytics failure must never break the user flow.
  }
}

/**
 * Track a deal click from the /api/click/[offerId] server route.
 */
export async function trackServerDealClick(opts: {
  offerId: number;
  brandSlug: string;
  discountPct: number;
  clientId?: string;
}): Promise<void> {
  await trackServerEvent(
    {
      name: "deal_click",
      params: {
        offer_id: opts.offerId,
        brand_slug: opts.brandSlug,
        discount_pct: Math.round(opts.discountPct * 100),
      },
    },
    opts.clientId,
  );
}
