"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { hasConsent } from "@/lib/consent";

/**
 * Google AdSense integration — consent-aware.
 *
 * Only loads AdSense script after user accepts marketing cookies.
 * Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in env (format: "ca-pub-XXXXXXXXXX").
 *
 * Usage:
 *   <AdUnit slot="1234567890" format="auto" />
 *   <AdUnit slot="1234567890" format="rectangle" className="my-4" />
 */

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/** Load the AdSense script once when marketing consent is given */
export function AdSenseScript() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (hasConsent("marketing")) setAllowed(true);

    const handler = () => {
      if (hasConsent("marketing")) setAllowed(true);
    };
    window.addEventListener("consent-updated", handler);
    return () => window.removeEventListener("consent-updated", handler);
  }, []);

  if (!ADSENSE_ID || !allowed) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

/** Individual ad slot — self-contained, consent-aware */
export function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const [allowed, setAllowed] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    if (hasConsent("marketing")) setAllowed(true);

    const handler = () => {
      if (hasConsent("marketing")) setAllowed(true);
    };
    window.addEventListener("consent-updated", handler);
    return () => window.removeEventListener("consent-updated", handler);
  }, []);

  // Push the ad once the script is loaded and consent given
  useEffect(() => {
    if (!allowed || !ADSENSE_ID || pushed.current) return;

    try {
      // @ts-expect-error — adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet — will retry on next render
    }
  }, [allowed]);

  if (!ADSENSE_ID || !allowed) return null;

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      <p className="mt-1 text-center text-[10px] text-surface-300">
        Advertisement
      </p>
    </div>
  );
}
