"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck, ShieldOff, RefreshCw, Tag } from "lucide-react";
import { motion } from "motion/react";
import type { SourceScorecard } from "@/lib/data";

interface SourceCardProps {
  source: SourceScorecard;
  rank: number;
}

const ZONE_CONFIG = {
  green: {
    label: "Green Zone",
    bg: "bg-deal-50",
    text: "text-deal-700",
    border: "border-deal-200",
    dot: "bg-deal-500",
    bar: "bg-deal-500",
  },
  yellow: {
    label: "Yellow Zone",
    bg: "bg-alert-50",
    text: "text-alert-700",
    border: "border-alert-200",
    dot: "bg-alert-500",
    bar: "bg-alert-500",
  },
  red: {
    label: "Red Zone",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
} as const;

const HEALTH_CONFIG = {
  healthy: { label: "Healthy", color: "text-deal-600", dot: "bg-deal-500" },
  degraded: { label: "Degraded", color: "text-alert-600", dot: "bg-alert-500" },
  unhealthy: { label: "Unhealthy", color: "text-red-600", dot: "bg-red-500" },
  unknown: { label: "No Data", color: "text-surface-400", dot: "bg-surface-300" },
} as const;

const TYPE_LABELS: Record<string, string> = {
  official_issuer: "Issuer",
  authorized_reseller: "Authorized",
  marketplace_resale: "Marketplace",
  aggregator: "Aggregator",
  catalog_only: "Catalog",
};

export function SourceCard({ source, rank }: SourceCardProps) {
  const zone = ZONE_CONFIG[source.trustZone];
  const health = HEALTH_CONFIG[source.healthStatus];
  const trustBarWidth = Math.min(100, Math.max(0, source.trustScore));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.04, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08), 0 10px 15px -3px rgba(0,0,0,0.12)" }}
    >
      <Link
        href={`/sources/${source.slug}`}
        className={`block rounded-2xl border bg-surface-100 p-5 transition-colors hover:border-brand-200 ${zone.border}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Rank */}
            <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-surface-200 text-xs font-bold text-surface-500">
              {rank}
            </span>

            {/* Name + Type */}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-surface-900 truncate">{source.name}</h3>
              <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-surface-400">
                  {TYPE_LABELS[source.sourceType] ?? source.sourceType}
                </span>
                {/* Health indicator */}
                <span className={`flex items-center gap-1 text-xs ${health.color}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${health.dot}`} />
                  {health.label}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Zone Badge */}
          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${zone.bg} ${zone.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${zone.dot}`} />
            {zone.label}
          </span>
        </div>

        {/* Trust Score Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-surface-400 uppercase tracking-wider">
              Trust Score
            </span>
            <span className="font-mono text-sm font-bold text-surface-900">{source.trustScore}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-50 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${zone.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${trustBarWidth}%` }}
              transition={{ duration: 0.6, delay: rank * 0.04 + 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-surface-50 px-2 py-2">
            <div className="font-mono text-base font-bold text-surface-900">
              {source.activeOfferCount}
            </div>
            <div className="mt-0.5 text-[10px] text-surface-400">Offers</div>
          </div>
          <div className="rounded-lg bg-surface-50 px-2 py-2">
            <div className="font-mono text-base font-bold text-deal-700">
              {source.avgDiscountPct > 0 ? `${source.avgDiscountPct}%` : "—"}
            </div>
            <div className="mt-0.5 text-[10px] text-surface-400">Avg Off</div>
          </div>
          <div className="rounded-lg bg-surface-50 px-2 py-2">
            <div className="font-mono text-base font-bold text-surface-900">
              {source.uniqueBrandCount}
            </div>
            <div className="mt-0.5 text-[10px] text-surface-400">Brands</div>
          </div>
        </div>

        {/* Protection badges */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {source.hasBuyerProtection ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-deal-50 px-2 py-0.5 text-[10px] font-medium text-deal-700">
              <ShieldCheck className="h-3 w-3" />
              Buyer Protection
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-500">
              <ShieldOff className="h-3 w-3" />
              No Protection
            </span>
          )}
          {source.hasRefundPolicy && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
              <RefreshCw className="h-3 w-3" />
              Refund Policy
            </span>
          )}
          {source.historicalLowCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
              <Tag className="h-3 w-3" />
              {source.historicalLowCount} ATLs
            </span>
          )}
        </div>

        {/* External link hint */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-surface-400 truncate max-w-[140px]">
            {source.url.replace(/^https?:\/\/(www\.)?/, "")}
          </span>
          <ExternalLink className="h-3 w-3 text-surface-300 shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}
