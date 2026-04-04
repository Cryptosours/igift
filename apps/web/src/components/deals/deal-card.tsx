import Link from "next/link";
import { ExternalLink, Clock, MapPin } from "lucide-react";
import { TrustBadge } from "@/components/ui/trust-badge";
import { DealScore } from "@/components/ui/deal-score";

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
}

export function DealCard({ deal }: { deal: DealCardProps }) {
  const discount = Math.round(deal.effectiveDiscount * 100);

  return (
    <div className="group relative rounded-2xl border border-surface-200 bg-white p-5 card-hover hover:border-brand-200">
      {/* Historical Low Badge */}
      {deal.historicalLow && (
        <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm shadow-brand-600/25">
          Historical Low
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left: Brand + Deal Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/brands/${deal.brandSlug}`}
              className="text-xs font-medium text-surface-400 transition-colors hover:text-brand-600"
            >
              {deal.brand}
            </Link>
            <TrustBadge zone={deal.trustZone} />
          </div>

          <h3 className="mt-1.5 text-base font-semibold text-surface-900 leading-tight group-hover:text-brand-700 transition-colors">
            {deal.title}
          </h3>

          {/* Price Row — data-forward */}
          <div className="mt-3 flex items-baseline gap-3">
            <span className="price-display text-2xl font-bold text-deal-600">
              {deal.currency}
              {deal.effectivePrice.toFixed(2)}
            </span>
            <span className="price-display text-sm text-surface-300 line-through">
              {deal.currency}
              {deal.faceValue.toFixed(2)}
            </span>
            <span className="inline-flex items-center rounded-lg bg-deal-50 px-2 py-0.5 text-xs font-bold text-deal-700 border border-deal-100">
              -{discount}%
            </span>
          </div>

          {/* Meta Row */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {deal.region}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {deal.lastVerified}
            </span>
            <span className="text-surface-300">via {deal.sourceName}</span>
          </div>
        </div>

        {/* Right: Score + CTA */}
        <div className="flex flex-col items-end gap-2.5">
          <DealScore score={deal.dealScore} />
          <a
            href={`/api/click/${deal.id}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.97]"
          >
            View Deal
            <ExternalLink className="h-3 w-3" />
          </a>
          <div className="flex items-center gap-1">
            <div className="h-1 w-1 rounded-full bg-surface-300" />
            <span className="price-display text-[10px] text-surface-400">
              {deal.confidenceScore}% conf
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
