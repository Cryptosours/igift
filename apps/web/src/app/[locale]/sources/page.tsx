import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAllSourceScorecards } from "@/lib/data";
import { SourceCard } from "@/components/sources/source-card";
import { ShieldCheck, TrendingUp, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Source Directory | iGift",
  description:
    "Explore every gift card source iGift monitors — ranked by trust score, buyer protection, refund policies, and live data quality.",
  openGraph: {
    title: "Source Directory | iGift",
    description: "Trust-scored scorecards for every source iGift monitors.",
    url: "https://igift.app/sources",
  },
};

// Revalidate every 30 minutes — source health can change but isn't real-time
export const revalidate = 1800;

export default async function SourcesPage() {
  const t = await getTranslations("SourcesPage");
  const sources = await getAllSourceScorecards();

  // Sort by trust score desc (already ordered in getAllSourceScorecards, but make it explicit)
  const ranked = [...sources].sort((a, b) => b.trustScore - a.trustScore);

  const greenCount = ranked.filter((s) => s.trustZone === "green").length;
  const yellowCount = ranked.filter((s) => s.trustZone === "yellow").length;
  const totalOffers = ranked.reduce((sum, s) => sum + s.activeOfferCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Store className="h-5 w-5 text-brand-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            {t("label")}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-surface-500 leading-relaxed">
          {t("description")}
        </p>

        {/* Summary stats */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-100 px-4 py-2.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-deal-500" />
            <span className="font-semibold text-surface-900">{greenCount}</span>
            <span className="text-surface-500">{t("greenZoneSources")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-100 px-4 py-2.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-alert-500" />
            <span className="font-semibold text-surface-900">{yellowCount}</span>
            <span className="text-surface-500">{t("yellowZoneSources")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-100 px-4 py-2.5 text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-brand-500" />
            <span className="font-semibold text-surface-900">{totalOffers.toLocaleString()}</span>
            <span className="text-surface-500">{t("activeOffers")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-100 px-4 py-2.5 text-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-deal-500" />
            <span className="font-semibold text-surface-900">
              {ranked.filter((s) => s.hasBuyerProtection).length}
            </span>
            <span className="text-surface-500">{t("withBuyerProtection")}</span>
          </div>
        </div>
      </div>

      {/* Green Zone Section */}
      {greenCount > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-deal-500" />
            <h2 className="text-base font-semibold text-surface-900">{t("greenZone")}</h2>
            <span className="rounded-full bg-deal-50 px-2 py-0.5 text-xs font-medium text-deal-700">
              {t("greenZoneBadge")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ranked
              .filter((s) => s.trustZone === "green")
              .map((source, i) => (
                <SourceCard key={source.slug} source={source} rank={i + 1} />
              ))}
          </div>
        </section>
      )}

      {/* Yellow Zone Section */}
      {yellowCount > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-alert-500" />
            <h2 className="text-base font-semibold text-surface-900">{t("yellowZone")}</h2>
            <span className="rounded-full bg-alert-50 px-2 py-0.5 text-xs font-medium text-alert-700">
              {t("yellowZoneBadge")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ranked
              .filter((s) => s.trustZone === "yellow")
              .map((source, i) => (
                <SourceCard
                  key={source.slug}
                  source={source}
                  rank={greenCount + i + 1}
                />
              ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {ranked.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Store className="mb-4 h-12 w-12 text-surface-200" />
          <p className="text-lg font-semibold text-surface-500">{t("noSources")}</p>
          <p className="mt-1 text-sm text-surface-400">
            {t("noSourcesHint")}{" "}
            <code className="rounded bg-surface-100 px-1.5 py-0.5 text-xs font-mono">
              npx tsx apps/web/src/db/seed.ts
            </code>{" "}
            to populate sources.
          </p>
        </div>
      )}

      {/* Trust methodology callout */}
      <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 px-6 py-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <h3 className="text-sm font-semibold text-brand-900">{t("trustMethodologyTitle")}</h3>
            <p className="mt-1 text-sm text-brand-700 leading-relaxed">
              {t("trustMethodologyBody")}
            </p>
            <Link
              href="/methodology#sources"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 underline underline-offset-2"
            >
              {t("readMethodology")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
