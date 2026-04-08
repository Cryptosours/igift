"use client";

import { useState } from "react";
import { Info } from "lucide-react";

/**
 * SponsoredBadge — FTC-compliant disclosure label for paid placements.
 *
 * Shown on every sponsored deal card and featured brand card.
 * Clicking the info icon shows a tooltip explaining the relationship.
 * No CSS tricks to make it subtle — it must be clearly visible.
 */
export function SponsoredBadge() {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-1 rounded-md border border-alert-200 bg-alert-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-alert-700">
        Sponsored
      </span>
      <button
        type="button"
        aria-label="What does Sponsored mean?"
        onClick={() => setShowTip((v) => !v)}
        onBlur={() => setShowTip(false)}
        className="rounded p-0.5 text-alert-400 hover:text-alert-600 focus:outline-none"
      >
        <Info className="h-3 w-3" />
      </button>
      {showTip && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-surface-200 bg-surface-100 p-3 shadow-lg text-xs text-surface-600 leading-relaxed">
          This brand paid for a featured position on iGift. All deal data —
          prices, scores, and trust ratings — remain unaltered. Sponsored
          placement only affects listing order.
        </div>
      )}
    </div>
  );
}
