import type { Metadata } from "next";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { getDeals } from "@/lib/data";
import { sampleDeals } from "@/lib/sample-data";
import { DealSearch } from "@/components/deals/deal-search";

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
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            All Verified Deals
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            {deals.length} deals from 15+ verified sources, updated
            continuously.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-50">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-50">
            <ArrowUpDown className="h-4 w-4" />
            Sort by Score
          </button>
        </div>
      </div>

      {/* Filter Pills (placeholder) */}
      <div className="mt-4 flex flex-wrap gap-2">
        {["All Regions", "US", "EU", "Global"].map((filter) => (
          <button
            key={filter}
            className="rounded-full border border-surface-200 px-3 py-1 text-xs font-medium text-surface-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {filter}
          </button>
        ))}
        <span className="border-l border-surface-200 mx-1" />
        {["Green Sources Only", "Historical Lows", "No Membership Required"].map(
          (filter) => (
            <button
              key={filter}
              className="rounded-full border border-surface-200 px-3 py-1 text-xs font-medium text-surface-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {filter}
            </button>
          ),
        )}
      </div>

      {/* Search + Deal Grid */}
      <DealSearch initialDeals={deals} />
    </div>
  );
}
