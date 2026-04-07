/**
 * Cookie Consent Manager
 *
 * GDPR-compliant consent management with 3 tiers:
 * - necessary: always on (session, CSRF, theme preference)
 * - analytics: Google Analytics, Sentry session replay (opt-in)
 * - marketing: Google AdSense, retargeting (opt-in)
 *
 * Stores consent as a JSON cookie. Scripts are blocked until consent is given.
 */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentPreferences {
  necessary: true; // always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  timestamp: number; // when consent was given/updated
}

const CONSENT_COOKIE = "igift-consent";
const CONSENT_VERSION = 1;
// Consent expires after 6 months (GDPR best practice)
const CONSENT_MAX_AGE_DAYS = 180;

/** Default: only necessary cookies allowed */
export const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
};

/** Read consent from cookie (browser only) */
export function getConsent(): ConsentPreferences | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));

  if (!cookie) return null;

  try {
    const value = decodeURIComponent(cookie.split("=")[1]);
    const parsed = JSON.parse(value);

    // Validate shape
    if (
      typeof parsed.necessary === "boolean" &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean" &&
      typeof parsed.timestamp === "number"
    ) {
      return { ...parsed, necessary: true }; // enforce necessary=true
    }
    return null;
  } catch {
    return null;
  }
}

/** Save consent preferences to cookie */
export function setConsent(prefs: Omit<ConsentPreferences, "necessary" | "timestamp">): void {
  if (typeof document === "undefined") return;

  const consent: ConsentPreferences = {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    timestamp: Date.now(),
  };

  const value = encodeURIComponent(JSON.stringify({ ...consent, v: CONSENT_VERSION }));
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

  // Dispatch custom event so analytics/marketing scripts can activate
  window.dispatchEvent(new CustomEvent("consent-updated", { detail: consent }));
}

/** Check if a specific consent category is granted */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const consent = getConsent();
  if (!consent) return false;
  return consent[category] === true;
}

/** Accept all categories */
export function acceptAll(): void {
  setConsent({ analytics: true, marketing: true });
}

/** Reject all optional categories (necessary stays on) */
export function rejectAll(): void {
  setConsent({ analytics: false, marketing: false });
}

/** Check if user has made a consent choice (banner should show if not) */
export function hasConsentChoice(): boolean {
  return getConsent() !== null;
}
