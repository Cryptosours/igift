import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Heart, ArrowRight, Bell, TrendingUp } from "lucide-react";
import { getWatchlist } from "@/lib/data";
import { DealCard } from "@/components/deals/deal-card";

export const metadata: Metadata = {
  title: "My Watchlist",
  description: "Brands you're tracking — see their best current deals at a glance.",
};

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("igift_session")?.value;
  const watchlist = await getWatchlist(sessionId);

  // Empty state
  if (watchlist.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="data-label text-brand-600">Watchlist</span>
          <h1 className="mt-1 heading-display text-3xl text-surface-900">My Watchlist</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100">
            <Heart className="h-10 w-10 text-surface-300" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-surface-900">No saved brands yet</h2>
          <p className="mt-2 max-w-sm text-sm text-surface-500">
            Hit the heart icon on any deal card or brand page to track it here. We&apos;ll show
            you the best current deal for each brand you follow.
          </p>
          <Link
            href="/deals"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
          >
            Browse Deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="data-label text-brand-600">Watchlist</span>
          <h1 className="mt-1 heading-display text-3xl text-surface-900">My Watchlist</h1>
          <p className="mt-2 text-sm text-surface-500">
            {watchlist.length} brand{watchlist.length !== 1 ? "s" : ""} tracked — best current deals shown below.
          </p>
        </div>
        <Link
          href="/alerts"
          className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-600 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <Bell className="h-4 w-4" />
          Set Price Alerts
        </Link>
      </div>

      {/* Watchlist Grid */}
      <div className="mt-8 space-y-8">
        {watchlist.map(({ slug, name, bestDeal }) => (
          <div key={slug}>
            {/* Brand header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-500" />
                <Link
                  href={`/brands/${slug}`}
                  className="text-sm font-semibold text-surface-700 hover:text-brand-600 transition-colors"
                >
                  {name}
                </Link>
              </div>
              <Link
                href={`/brands/${slug}`}
                className="text-xs text-surface-400 hover:text-brand-600 transition-colors"
              >
                All {name} deals →
              </Link>
            </div>

            {/* Best deal */}
            {bestDeal ? (
              <DealCard deal={bestDeal} />
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50 p-6 text-center">
                <p className="text-sm text-surface-400">No active deals for {name} right now.</p>
                <Link href="/alerts" className="mt-2 text-xs text-brand-600 hover:underline">
                  Set an alert to be notified when a deal appears →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center">
        <p className="text-sm font-medium text-brand-800">Want instant notifications?</p>
        <p className="mt-1 text-xs text-brand-600">
          Set a price alert and we&apos;ll email you when a watched brand hits your target discount.
        </p>
        <Link
          href="/alerts"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <Bell className="h-3.5 w-3.5" />
          Set Alert
        </Link>
      </div>
    </div>
  );
}
