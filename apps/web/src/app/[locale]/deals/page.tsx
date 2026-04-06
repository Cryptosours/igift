import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { getDeals, getWatchedSlugs, getFeaturedPlacements } from "@/lib/data";
import { DealFilters } from "@/components/deals/deal-filters";
import { FeaturedSection } from "@/components/deals/featured-section";
import { FadeIn } from "@/components/ui/fade-in";
import { LOCALE_TO_REGION } from "@/lib/regions";

export const metadata: Metadata = {
  title: "All Verified Deals",
  description:
    "Browse all verified gift card and digital credit deals, ranked by our dual deal quality and confidence scoring system.",
};

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const locale = await getLocale();

  let deals: Awaited<ReturnType<typeof getDeals>> = [];
  try {
    deals = await getDeals({ limit: 50 });
  } catch {
    // DB unavailable — render with empty deal list
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

  // Suggest a region filter based on the active locale (e.g. German → EU)
  const defaultRegion = LOCALE_TO_REGION[locale];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <FadeIn>
        <div>
          <span className="data-label text-brand-600">Deals</span>
          <h1 className="mt-1 heading-display text-3xl text-surface-900">
            All verified deals
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            {deals.length} deals from verified sources, updated continuously.
          </p>
        </div>
      </FadeIn>

      {/* Sponsored Featured Deals */}
      {featuredPlacements.length > 0 && (
        <FeaturedSection placements={featuredPlacements} />
      )}

      {/* Filters + Search + Deal Grid */}
      <DealFilters initialDeals={deals} defaultRegion={defaultRegion} />
    </div>
  );
}
