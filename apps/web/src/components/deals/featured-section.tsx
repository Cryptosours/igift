import type { DealCardProps } from "./deal-card";
import { DealCard } from "./deal-card";
import { SponsoredBadge } from "@/components/ui/sponsored-badge";

interface FeaturedPlacement {
  placementId: number;
  brandSlug: string;
  brandName: string;
  brandCategory: string;
  bestDeal: DealCardProps | null;
}

interface FeaturedSectionProps {
  placements: FeaturedPlacement[];
}

/**
 * FeaturedSection — renders sponsored deal cards above organic results.
 *
 * Only mounts when at least one active placement exists with a live deal.
 * Every card carries a SponsoredBadge. The section header names it "Featured"
 * alongside the Sponsored badge so there's no ambiguity.
 */
export function FeaturedSection({ placements }: FeaturedSectionProps) {
  const withDeals = placements.filter((p) => p.bestDeal !== null);
  if (withDeals.length === 0) return null;

  return (
    <section aria-label="Sponsored featured deals" className="mt-8">
      {/* Section header */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
          Featured
        </span>
        <SponsoredBadge />
        <div className="flex-1 border-t border-surface-100" />
      </div>

      {/* Deal cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {withDeals.map((p) => (
          <div
            key={p.placementId}
            className="relative rounded-2xl border border-alert-200 bg-white ring-1 ring-alert-100"
          >
            {/* Amber top accent line */}
            <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-alert-400 to-alert-300" />
            <div className="pt-1">
              <DealCard deal={p.bestDeal!} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
