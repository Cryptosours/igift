"use client";

/**
 * ConsentSync — Runs once on mount for returning visitors.
 *
 * When a user has already made a consent choice (cookie exists), this
 * component immediately calls gtag('consent', 'update', ...) so GA
 * doesn't have to wait 500ms before sending data.
 *
 * For new visitors (no cookie), the cookie banner handles the update
 * when they make their choice. No UI rendered.
 */

import { useEffect } from "react";
import { getConsent, syncGAConsent } from "@/lib/consent";

export function ConsentSync() {
  useEffect(() => {
    const existing = getConsent();
    if (existing) {
      syncGAConsent({ analytics: existing.analytics, marketing: existing.marketing });
    }
  }, []);

  return null;
}
