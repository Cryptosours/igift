"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent } from "@/lib/consent";

/**
 * Google Analytics (gtag.js)
 *
 * Consent-aware: only loads if analytics consent has been granted.
 * Listens for consent-updated events to activate after the banner.
 *
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env to enable.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check consent on mount
    if (GA_ID && hasConsent("analytics")) {
      setEnabled(true);
    }

    // Listen for consent changes
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (GA_ID && detail?.analytics) {
        setEnabled(true);
      }
    };

    window.addEventListener("consent-updated", handler);
    return () => window.removeEventListener("consent-updated", handler);
  }, []);

  if (!enabled || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          // Safe: GA_ID is a build-time env var, not user input
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=Lax;Secure',
            });
          `,
        }}
      />
    </>
  );
}
