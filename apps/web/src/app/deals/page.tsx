import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { getDeals, getWatchedSlugs, getFeaturedPlacements } from "@/lib/data";
import { sampleDeals } from "@/lib/sample-data";
import { DealSearch } from "@/components/deals/deal-search";
import { FeaturedSection } from "@/components/deals/featured-section";

export const metadata: Metadata = {
  title: "All Verified Deals",
  description:
    "Browse all verified gift card and digital credit deals, ranked by our dual deal quality and confidence scoring system.",
};

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  let deals = sampleDeals;
  try {
    const dbDeals = await getDeals({ limit: 50 });
    if (dbDeals.length > 0) deals = dbDeals;
  } catch {
    // DB unavailable — use sample data
  }

  // Enrich deals with watchlist state for this session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("igift_session")?.value;
  const watchedSlugs = await getWatchedSlugs(sessionId);
  if (watchedSlugs.size > 0) {
    deals = deals.map((d) => ({ ...d, initialWatched: watchedSlugs.has(d.brandSlug) }));
  }

  // Load active sponsored placements (empty array if none / DB unavailable)
  const featuredPlacements = await getFeaturedPlacements("featured_deal");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="data-label text-brand-600">Deals</span>
          <h1 className="mt-1 heading-display text-3xl text-surface-900">
            All verified deals
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            {deals.length} deals from 15+ verified sources, updated continuously.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3.5 py-2 text-sm font-medium text-surface-600 transition-all hover:border-surface-300 hover:bg-surface-50 hover:shadow-sm">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3.5 py-2 text-sm font-medium text-surface-600 transition-all hover:border-surface-300 hover:bg-surface-50 hover:shadow-sm">
            <ArrowUpDown className="h-4 w-4" />
            Sort by Score
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        {["All Regions", "US", "EU", "Global"].map((filter) => (
          <button
            key={filter}
            className="rounded-full border border-surface-200 bg-white px-3.5 py-1 text-xs font-medium text-surface-500 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {filter}
          </button>
        ))}
        <span className="border-l border-surface-200 mx-1" />
        {["Green Sources Only", "Historical Lows", "No Membership Required"].map(
          (filter) => (
            <button
              key={filter}
              className="rounded-full border border-surface-200 bg-white px-3.5 py-1 text-xs font-medium text-surface-500 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {filter}
            </button>
          ),
        )}
      </div>

      {/* Sponsored Featured Deals */}
      {featuredPlacements.length > 0 && (
        <FeaturedSection placements={featuredPlacements} />
      )}

      {/* Search + Deal Grid */}
      <DealSearch initialDeals={deals} />
    </div>
  );
}
