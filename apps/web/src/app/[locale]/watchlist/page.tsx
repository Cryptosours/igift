import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Heart, ArrowRight, Bell, TrendingUp } from "lucide-react";
import { getWatchlist } from "@/lib/data";
import { DealCard } from "@/components/deals/deal-card";
import { FadeIn } from "@/components/ui/fade-in";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "My Watchlist",
  description: "Brands you're tracking — see their best current deals at a glance.",
};

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const t = await getTranslations("WatchlistPage");
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("igift_session")?.value;
  const watchlist = await getWatchlist(sessionId);

  // Empty state
  if (watchlist.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-8">
            <span className="data-label text-brand-600">{t("label")}</span>
            <h1 className="mt-1 heading-display text-3xl text-surface-900">{t("heading")}</h1>
          </div>
        </FadeIn>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100">
            <Heart className="h-10 w-10 text-surface-300" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-surface-900">{t("noSavedBrands")}</h2>
          <p className="mt-2 max-w-sm text-sm text-surface-500">
            {t("noSavedBrandsBody")}
          </p>
          <Link
            href="/deals"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
          >
            {t("browseDeals")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="data-label text-brand-600">{t("label")}</span>
            <h1 className="mt-1 heading-display text-3xl text-surface-900">{t("heading")}</h1>
            <p className="mt-2 text-sm text-surface-500">
              {t("brandsTracked", { count: watchlist.length })}
            </p>
          </div>
        <Link
          href="/alerts"
          className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-100 px-4 py-2.5 text-sm font-medium text-surface-600 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <Bell className="h-4 w-4" />
          {t("setPriceAlerts")}
        </Link>
      </div>
      </FadeIn>

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
              <div className="flex items-center gap-3">
                <Link
                  href={`/alerts?brand=${slug}`}
                  className="text-xs text-surface-400 hover:text-brand-600 transition-colors"
                  title={`Set alert for ${name}`}
                >
                  <Bell className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/brands/${slug}`}
                  className="text-xs text-surface-400 hover:text-brand-600 transition-colors"
                >
                  {t("allDeals", { name })} →
                </Link>
              </div>
            </div>

            {/* Best deal */}
            {bestDeal ? (
              <DealCard deal={bestDeal} />
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50 p-6 text-center">
                <p className="text-sm text-surface-400">{t("noActiveDealsFor", { name })}</p>
                <Link href={`/alerts?brand=${slug}`} className="mt-2 text-xs text-brand-600 hover:underline">
                  {t("setAlertNotified")} →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center">
        <p className="text-sm font-medium text-brand-800">{t("wantNotifications")}</p>
        <p className="mt-1 text-xs text-brand-600">
          {t("wantNotificationsBody")}
        </p>
        <Link
          href="/alerts"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <Bell className="h-3.5 w-3.5" />
          {t("setAlert")}
        </Link>
      </div>
    </div>
  );
}
