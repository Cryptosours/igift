"use client";

import Link from "next/link";
import { ExternalLink, Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { TrustBadge } from "@/components/ui/trust-badge";
import { DealScore } from "@/components/ui/deal-score";
import { WatchButton } from "@/components/ui/watch-button";
import { getRegion } from "@/lib/regions";

export interface DealCardProps {
  id: string;
  brand: string;
  brandSlug: string;
  title: string;
  faceValue: number;
  effectivePrice: number;
  currency: string;
  effectiveDiscount: number;
  dealScore: number;
  confidenceScore: number;
  trustZone: "green" | "yellow" | "red";
  sourceName: string;
  sourceUrl: string;
  region: string;
  lastVerified: string;
  historicalLow: boolean;
  initialWatched?: boolean;
}

export function DealCard({ deal }: { deal: DealCardProps }) {
  const t = useTranslations("DealCard");
  const discount = Math.round(deal.effectiveDiscount * 100);
  const regionConfig = getRegion(deal.region);

  return (
    <motion.div
      className="group relative rounded-2xl border border-surface-200 bg-surface-100 p-5 hover:border-brand-200"
      whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08), 0 10px 15px -3px rgba(0,0,0,0.12), 0 0 0 1px rgba(193,95,60,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Historical Low Badge */}
      {deal.historicalLow && (
        <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm shadow-brand-600/25">
          {t("historicalLow")}
        </div>
      )}

      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left: Brand + Deal Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/brands/${deal.brandSlug}`}
              className="text-xs font-medium text-surface-400 transition-colors hover:text-brand-600 truncate"
            >
              {deal.brand}
            </Link>
            <TrustBadge zone={deal.trustZone} />
          </div>

          <h3 className="mt-1.5 text-sm sm:text-base font-semibold text-surface-900 leading-tight group-hover:text-brand-700 transition-colors line-clamp-2">
            {deal.title}
          </h3>

          {/* Price Row — data-forward */}
          <div className="mt-3 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="price-display text-xl sm:text-2xl font-bold text-deal-600">
              {deal.currency}
              {deal.effectivePrice.toFixed(2)}
            </span>
            <span className="price-display text-xs sm:text-sm text-surface-300 line-through">
              {deal.currency}
              {deal.faceValue.toFixed(2)}
            </span>
            <span className="inline-flex items-center rounded-lg bg-deal-50 px-2 py-0.5 text-xs font-bold text-deal-700 border border-deal-100">
              -{discount}%
            </span>
          </div>

          {/* Meta Row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{regionConfig.flag}</span>
              {regionConfig.displayName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {deal.lastVerified}
            </span>
            <span className="hidden sm:inline text-surface-300">{t("via", { source: deal.sourceName })}</span>
          </div>
        </div>

        {/* Right: Score + CTA */}
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <div className="flex items-center gap-1.5">
            <WatchButton brandSlug={deal.brandSlug} initialWatched={deal.initialWatched} />
            <DealScore score={deal.dealScore} />
          </div>
          <motion.a
            href={`/api/click/${deal.id}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 hover:shadow-md"
            whileTap={{ scale: 0.97 }}
          >
            {t("viewDeal")}
            <ExternalLink className="h-3 w-3" />
          </motion.a>
          <div className="flex items-center gap-1">
            <div className="h-1 w-1 rounded-full bg-surface-300" />
            <span className="price-display text-[10px] text-surface-400">
              {t("confidence", { score: deal.confidenceScore })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
