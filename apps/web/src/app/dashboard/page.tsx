import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Heart, Bell, TrendingUp, ArrowRight, LayoutDashboard } from "lucide-react";
import { getWatchlist } from "@/lib/data";
import { DealCard } from "@/components/deals/deal-card";
import { AlertManager } from "@/components/alerts/alert-manager";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

export const metadata: Metadata = {
  title: "My Dashboard | iGift",
  description:
    "Your personal deal intelligence hub — watchlist, alerts, and deal activity in one place.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("igift_session")?.value;
  const watchlist = await getWatchlist(sessionId);

  const dealsAvailable = watchlist.filter((w) => w.bestDeal !== null).length;
  const hasWatchlist = watchlist.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <FadeIn>
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-brand-500" />
            <span className="data-label text-brand-600">Power User Hub</span>
          </div>
          <h1 className="mt-1 heading-display text-3xl text-surface-900">My Dashboard</h1>
          <p className="mt-2 text-sm text-surface-500">
            Watchlist, alerts, and deal activity — all in one place.
          </p>
        </div>
      </FadeIn>

      {/* Stats row */}
      <StaggerContainer className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Watched brands */}
        <StaggerItem>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-brand-50 p-2">
                <Heart className="h-4 w-4 text-brand-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-surface-500">
                Watching
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-surface-900">{watchlist.length}</p>
            <p className="mt-0.5 text-xs text-surface-400">
              brand{watchlist.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
        </StaggerItem>

        {/* Live deals for watched brands */}
        <StaggerItem>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-deal-50 p-2">
                <TrendingUp className="h-4 w-4 text-deal-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-surface-500">
                Live Deals
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-surface-900">{dealsAvailable}</p>
            <p className="mt-0.5 text-xs text-surface-400">
              {watchlist.length === 0
                ? "no brands watched"
                : `of ${watchlist.length} watched brand${watchlist.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </StaggerItem>

        {/* Alerts prompt */}
        <StaggerItem>
          <div className="col-span-2 rounded-2xl border border-alert-200 bg-alert-50 p-5 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-alert-100 p-2">
                <Bell className="h-4 w-4 text-alert-600" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-alert-700">
                Alerts
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-alert-800">Enter your email below</p>
            <p className="mt-0.5 text-xs text-alert-600">to view and manage your active alerts</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Main two-column layout */}
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* ── Left: Watchlist ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-surface-900">
              <Heart className="h-4 w-4 text-brand-500" />
              Watchlist
            </h2>
            <Link href="/deals" className="text-xs text-brand-600 hover:underline">
              Browse all deals →
            </Link>
          </div>

          {hasWatchlist ? (
            <div className="space-y-6">
              {watchlist.map(({ slug, name, bestDeal }) => (
                <div key={slug}>
                  <div className="mb-2 flex items-center justify-between">
                    <Link
                      href={`/brands/${slug}`}
                      className="text-sm font-semibold text-surface-700 transition-colors hover:text-brand-600"
                    >
                      {name}
                    </Link>
                    <Link
                      href={`/alerts?brand=${slug}`}
                      className="text-xs text-surface-400 transition-colors hover:text-brand-600"
                    >
                      Set alert →
                    </Link>
                  </div>

                  {bestDeal ? (
                    <DealCard deal={bestDeal} />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50 p-5 text-center">
                      <p className="text-sm text-surface-400">No active deals for {name} right now.</p>
                      <Link
                        href={`/alerts?brand=${slug}`}
                        className="mt-1 text-xs text-brand-600 hover:underline"
                      >
                        Get notified when a deal appears →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 py-16 text-center">
              <Heart className="mb-4 h-10 w-10 text-surface-300" />
              <p className="text-sm font-medium text-surface-600">No brands watched yet</p>
              <p className="mt-1 max-w-xs text-xs text-surface-400">
                Hit the heart icon on any deal card or brand page to track it here.
              </p>
              <Link
                href="/deals"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Browse Deals
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* ── Right: Alerts panel ── */}
        <aside>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-alert-600" />
            <h2 className="text-base font-semibold text-surface-900">Price Alerts</h2>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <AlertManager />
            <div className="mt-4 border-t border-surface-100 pt-4 text-center">
              <Link href="/alerts" className="text-xs text-brand-600 hover:underline">
                Create a new alert →
              </Link>
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-surface-400">
            Free tier: up to 5 active alerts · 24-hour delivery cooldown
          </p>
        </aside>
      </div>
    </div>
  );
}
