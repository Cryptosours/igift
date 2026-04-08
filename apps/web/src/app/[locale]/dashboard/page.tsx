import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  Heart,
  Bell,
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
  Zap,
  Target,
  Flame,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { getWatchlist, getDashboardStats } from "@/lib/data";
import { DealCard } from "@/components/deals/deal-card";
import { LazyAlertManager as AlertManager } from "@/components/alerts/lazy-alert-manager";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "My Dashboard | iGift",
  description:
    "Your personal deal intelligence hub — watchlist, alerts, and deal activity in one place.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const t = await getTranslations("DashboardPage");
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("igift_session")?.value;

  const [watchlist, marketStats] = await Promise.all([
    getWatchlist(sessionId),
    getDashboardStats(),
  ]);

  // Derived metrics — computed from watchlist data, no extra DB queries
  const dealsAvailable = watchlist.filter((w) => w.bestDeal !== null).length;
  const hasWatchlist = watchlist.length > 0;

  const bestDeals = watchlist
    .map((w) => w.bestDeal)
    .filter((d): d is NonNullable<typeof d> => d !== null);

  const savingsTotal = bestDeals.reduce(
    (sum, d) => sum + (d.faceValue - d.effectivePrice),
    0,
  );

  const historicalLowsInWatchlist = bestDeals.filter((d) => d.historicalLow).length;

  const topOpportunity = bestDeals.reduce<(typeof bestDeals)[0] | null>((best, d) => {
    if (!best || d.dealScore > best.dealScore) return d;
    return best;
  }, null);

  const quickLinks = [
    { label: t("qlBrowseDeals"), href: "/deals" },
    { label: t("qlAllBrands"), href: "/brands" },
    { label: t("qlMyWatchlist"), href: "/watchlist" },
    { label: t("qlSetAlerts"), href: "/alerts" },
    { label: t("qlHowScoresWork"), href: "/methodology" },
  ];

  const snapshotItems = [
    {
      label: t("brandsTrackedLabel"),
      value: String(watchlist.length),
      active: watchlist.length > 0,
    },
    {
      label: t("liveDealsLabel"),
      value: `${dealsAvailable} of ${watchlist.length}`,
      active: dealsAvailable > 0,
    },
    {
      label: t("savingsAvailable"),
      value: `$${savingsTotal.toFixed(2)}`,
      active: savingsTotal > 0,
    },
    {
      label: t("atHistoricalLowLabel"),
      value: String(historicalLowsInWatchlist),
      active: historicalLowsInWatchlist > 0,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <FadeIn>
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-brand-500" />
            <span className="data-label text-brand-600">{t("label")}</span>
          </div>
          <h1 className="mt-1 heading-display text-3xl text-surface-900">{t("heading")}</h1>
          <p className="mt-2 text-sm text-surface-500">
            {t("description")}
          </p>
        </div>
      </FadeIn>

      {/* ── Market Pulse strip ── */}
      <FadeIn delay={0.05}>
        <div className="mb-6 rounded-2xl border border-surface-200 bg-gradient-to-r from-surface-950 to-surface-900 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-1.5 w-1.5 rounded-full bg-deal-400 animate-pulse" />
            <span className="data-label text-surface-400">{t("marketPulse")}</span>
            <span className="data-label text-surface-600 ml-auto">{t("updatedContinuously")}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="price-display text-xl font-bold text-white">
                +{marketStats.newIn24h}
              </div>
              <div className="mt-0.5 text-xs text-surface-500">{t("newDealsToday")}</div>
            </div>
            <div>
              <div className="price-display text-xl font-bold text-deal-400">
                {marketStats.historicalLowsTotal}
              </div>
              <div className="mt-0.5 text-xs text-surface-500">{t("atHistoricalLow")}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-brand-300">
                {marketStats.topCategory}
              </div>
              <div className="mt-0.5 text-xs text-surface-500">{t("topCategoryNow")}</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Stats row ── */}
      <StaggerContainer className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Watched brands */}
        <StaggerItem>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-brand-50 p-2">
                <Heart className="h-4 w-4 text-brand-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-surface-500">
                {t("watching")}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-surface-900">{watchlist.length}</p>
            <p className="mt-0.5 text-xs text-surface-400">
              {t("brandsTracked")}
            </p>
          </div>
        </StaggerItem>

        {/* Live deals */}
        <StaggerItem>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-deal-50 p-2">
                <TrendingUp className="h-4 w-4 text-deal-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-surface-500">
                {t("liveDeals")}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-surface-900">{dealsAvailable}</p>
            <p className="mt-0.5 text-xs text-surface-400">
              {watchlist.length === 0
                ? t("noBrandsWatched")
                : t("ofWatched", { count: watchlist.length })}
            </p>
          </div>
        </StaggerItem>

        {/* Savings opportunity */}
        <StaggerItem>
          <div className="rounded-2xl border border-deal-100 bg-deal-50/50 p-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-deal-100 p-2">
                <Zap className="h-4 w-4 text-deal-600" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-deal-600">
                {t("savings")}
              </span>
            </div>
            <p className="mt-3 price-display text-2xl font-bold text-deal-700">
              ${savingsTotal.toFixed(2)}
            </p>
            <p className="mt-0.5 text-xs text-deal-500">
              {dealsAvailable > 0 ? t("availableRightNow") : t("noLiveDealsYet")}
            </p>
          </div>
        </StaggerItem>

        {/* Historical lows in watchlist */}
        <StaggerItem>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-alert-50 p-2">
                <Flame className="h-4 w-4 text-alert-500" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-surface-500">
                {t("histLows")}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-surface-900">{historicalLowsInWatchlist}</p>
            <p className="mt-0.5 text-xs text-surface-400">{t("inYourWatchlist")}</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Top Opportunity ── */}
      {topOpportunity && (
        <FadeIn delay={0.1}>
          <div className="mb-8 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-semibold text-brand-800">{t("topOpportunity")}</span>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                  Score {topOpportunity.dealScore}
                </span>
              </div>
              <span className="text-xs text-brand-500">{t("highestInWatchlist")}</span>
            </div>
            <DealCard deal={topOpportunity} />
          </div>
        </FadeIn>
      )}

      {/* ── Main two-column layout ── */}
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Left: Watchlist */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-surface-900">
              <Heart className="h-4 w-4 text-brand-500" />
              {t("allWatchedBrands")}
            </h2>
            <Link href="/deals" className="text-xs text-brand-600 hover:underline">
              {t("browseAllDeals")} →
            </Link>
          </div>

          {hasWatchlist ? (
            <div className="space-y-6">
              {watchlist.map(({ slug, name, bestDeal }) => (
                <div key={slug}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/brands/${slug}`}
                        className="text-sm font-semibold text-surface-700 transition-colors hover:text-brand-600"
                      >
                        {name}
                      </Link>
                      {bestDeal?.historicalLow && (
                        <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-700">
                          {t("histLowBadge")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/alerts?brand=${slug}`}
                        className="text-xs text-surface-400 transition-colors hover:text-brand-600"
                      >
                        {t("setAlert")} →
                      </Link>
                    </div>
                  </div>

                  {bestDeal ? (
                    <DealCard deal={bestDeal} />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50 p-5 text-center">
                      <p className="text-sm text-surface-400">{t("noActiveDealsFor", { name })}</p>
                      <Link
                        href={`/alerts?brand=${slug}`}
                        className="mt-1 text-xs text-brand-600 hover:underline"
                      >
                        {t("getNotified")} →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 py-16 text-center">
              <Heart className="mb-4 h-10 w-10 text-surface-300" />
              <p className="text-sm font-medium text-surface-600">{t("noBrandsWatched2")}</p>
              <p className="mt-1 max-w-xs text-xs text-surface-400">
                {t("noBrandsWatchedBody")}
              </p>
              <Link
                href="/deals"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {t("browseAllDeals")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* Right: Alerts + quick stats */}
        <aside className="space-y-6">
          {/* Alerts panel */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-alert-600" />
              <h2 className="text-base font-semibold text-surface-900">{t("priceAlerts")}</h2>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-white p-5">
              <AlertManager />
              <div className="mt-4 border-t border-surface-100 pt-4 text-center">
                <Link href="/alerts" className="text-xs text-brand-600 hover:underline">
                  {t("createNewAlert")} →
                </Link>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-surface-400">
              {t("freeTierNote")}
            </p>
          </div>

          {/* Intelligence summary */}
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-surface-400" />
              <h3 className="text-sm font-semibold text-surface-900">{t("watchlistSnapshot")}</h3>
            </div>
            <ul className="space-y-2.5">
              {snapshotItems.map(({ label, value, active }) => (
                <li key={label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-surface-500">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${active ? "text-deal-500" : "text-surface-300"}`}
                    />
                    {label}
                  </span>
                  <span className={`price-display font-semibold ${active ? "text-surface-900" : "text-surface-400"}`}>
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
              {t("quickLinks")}
            </h3>
            <div className="space-y-1">
              {quickLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-surface-600 transition-colors hover:bg-white hover:text-brand-600"
                >
                  {label}
                  <ArrowRight className="h-3 w-3 text-surface-300" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
