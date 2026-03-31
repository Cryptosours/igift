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
    <div className="group relative rounded-xl border border-surface-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md">
      {/* Historical Low Badge */}
      {deal.historicalLow && (
        <div className="absolute -top-2.5 left-3 rounded-md bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
          Historical Low
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Left: Brand + Deal Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/brands/${deal.brandSlug}`}
              className="text-sm font-medium text-surface-500 hover:text-brand-600"
            >
              {deal.brand}
            </Link>
            <TrustBadge zone={deal.trustZone} />
          </div>

          <h3 className="mt-1 text-base font-semibold text-surface-900 leading-tight">
            {deal.title}
          </h3>

          {/* Price Row */}
          <div className="mt-2.5 flex items-baseline gap-3">
            <span className="price-display text-xl font-bold text-deal-600">
              {deal.currency}
              {deal.effectivePrice.toFixed(2)}
            </span>
            <span className="price-display text-sm text-surface-400 line-through">
              {deal.currency}
              {deal.faceValue.toFixed(2)}
            </span>
            <span className="rounded-md bg-deal-50 px-1.5 py-0.5 text-xs font-bold text-deal-700">
              -{discount}%
            </span>
          </div>

          {/* Meta Row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {deal.region}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {deal.lastVerified}
            </span>
            <span>via {deal.sourceName}</span>
          </div>
        </div>

        {/* Right: Score + CTA */}
        <div className="flex flex-col items-end gap-2">
          <DealScore score={deal.dealScore} />
          <a
            href={deal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            View Deal
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-[10px] text-surface-400">
            Confidence: {deal.confidenceScore}%
          </span>
        </div>
      </div>
    </div>
  );
}
