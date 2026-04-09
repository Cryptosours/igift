"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ExternalLink, ShieldCheck, Shield } from "lucide-react";
import Link from "next/link";

interface RecentOffer {
  id: string;
  brand: string;
  brandSlug: string;
  title: string;
  faceValue: number;
  effectivePrice: number;
  discount: number;
  currency: string;
  trustZone: "green" | "yellow" | "red";
  source: string;
  region: string;
  lastSeenAt: string | null;
  url: string;
}

const MAX_VISIBLE = 10;
const REVEAL_INTERVAL_MS = 12_000; // New offer every 12 seconds
const REFETCH_INTERVAL_MS = 5 * 60_000; // Re-fetch batch every 5 minutes

export function NewOffersFound() {
  const [visibleOffers, setVisibleOffers] = useState<RecentOffer[]>([]);
  const queueRef = useRef<RecentOffer[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/offers/recent");
      if (!res.ok) return;
      const data: RecentOffer[] = await res.json();
      if (data.length > 0) {
        queueRef.current = [...data];
        setIsLive(true);
      }
    } catch {
      // Network error — keep existing queue
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Periodic re-fetch for fresh data
  useEffect(() => {
    fetchTimerRef.current = setInterval(fetchOffers, REFETCH_INTERVAL_MS);
    return () => {
      if (fetchTimerRef.current) clearInterval(fetchTimerRef.current);
    };
  }, [fetchOffers]);

  // Drip-feed timer: reveal one offer at a time
  useEffect(() => {
    if (!isLive) return;

    // Seed the list with the first offer immediately
    if (visibleOffers.length === 0 && queueRef.current.length > 0) {
      const first = queueRef.current.shift()!;
      setVisibleOffers([first]);
    }

    timerRef.current = setInterval(() => {
      if (queueRef.current.length === 0) return;

      const next = queueRef.current.shift()!;

      setVisibleOffers((prev) => {
        const updated = [next, ...prev];
        // Cap at MAX_VISIBLE — the oldest item will exit via AnimatePresence
        if (updated.length > MAX_VISIBLE) {
          return updated.slice(0, MAX_VISIBLE);
        }
        return updated;
      });
    }, REVEAL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive, visibleOffers.length]);

  // Don't render the section at all if no offers are available
  if (!isLive && visibleOffers.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-t border-surface-200 bg-surface-50 py-16 dark:border-surface-300 dark:bg-surface-50">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[600px] rounded-full bg-deal-500/5 blur-[100px] dark:bg-deal-500/10" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-deal-200 bg-deal-50 px-3 py-1.5 text-xs font-semibold text-deal-700 dark:border-deal-500/20 dark:bg-deal-500/10 dark:text-deal-400">
            <span className="flex h-1.5 w-1.5 rounded-full bg-deal-500 animate-pulse-soft" />
            Live Feed
          </div>
          <h2 className="mt-3 heading-display text-2xl text-surface-900 dark:text-surface-900 sm:text-3xl">
            New Offers Found
          </h2>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Discovering deals across {visibleOffers.length > 0 ? new Set(visibleOffers.map((o) => o.source)).size : "multiple"} sources in real time
          </p>
        </div>

        {/* Rolling list */}
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleOffers.map((offer) => (
              <motion.div
                key={offer.id}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{
                  opacity: { duration: 0.4, ease: "easeOut" },
                  y: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
                  scale: { duration: 0.3, ease: "easeOut" },
                  layout: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
                }}
              >
                <OfferRow offer={offer} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer link */}
        {visibleOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <Link
              href="/deals"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              <Zap className="h-4 w-4" />
              View all deals
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function OfferRow({ offer }: { offer: RecentOffer }) {
  const discountPct = Math.round(offer.discount * 100);
  const TrustIcon = offer.trustZone === "green" ? ShieldCheck : Shield;
  const trustColor =
    offer.trustZone === "green"
      ? "text-green-500 dark:text-green-400"
      : "text-yellow-500 dark:text-yellow-400";

  return (
    <a
      href={offer.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0/90 px-4 py-3 backdrop-blur-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-surface-300 dark:bg-surface-100/80 dark:hover:border-brand-500/30 sm:gap-4 sm:px-5"
    >
      {/* Discount badge */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-deal-50 dark:bg-deal-500/10">
        <span className="price-display text-sm font-bold text-deal-600 dark:text-deal-400">
          {discountPct > 0 ? `-${discountPct}%` : "NEW"}
        </span>
      </div>

      {/* Offer details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-surface-900 dark:text-surface-900">
            {offer.title}
          </span>
          <TrustIcon className={`h-3.5 w-3.5 flex-shrink-0 ${trustColor}`} />
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
          <span>{offer.source}</span>
          <span className="text-surface-300 dark:text-surface-600">|</span>
          <span>{offer.region}</span>
        </div>
      </div>

      {/* Price info */}
      <div className="hidden flex-shrink-0 text-right sm:block">
        <div className="price-display text-sm font-bold text-surface-900 dark:text-surface-900">
          {offer.currency}{offer.effectivePrice.toFixed(2)}
        </div>
        {offer.effectivePrice < offer.faceValue && (
          <div className="text-xs text-surface-400 line-through">
            {offer.currency}{offer.faceValue.toFixed(2)}
          </div>
        )}
      </div>

      {/* External link icon */}
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-surface-300 transition-colors group-hover:text-brand-500 dark:text-surface-600 dark:group-hover:text-brand-400" />
    </a>
  );
}
