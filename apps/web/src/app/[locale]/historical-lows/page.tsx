import type { Metadata } from "next";
import Link from "next/link";
import { TrendingDown, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { BrandAvatar } from "@/components/ui/brand-avatar";
import { getHistoricalLowBrands } from "@/lib/data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Gift Card Historical Lows — All-Time Best Prices | iGift",
  description:
    "Browse gift cards currently at verified all-time low prices. Trust-scored deals from authorized sellers only — updated every 6 hours.",
};

const CATEGORY_ICONS: Record<string, string> = {
  gaming: "🎮",
  app_stores: "📱",
  streaming: "🎬",
  retail: "🛍️",
  food_dining: "🍔",
  travel: "✈️",
  telecom: "📡",
  other: "🎁",
};

function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function HistoricalLowsPage() {
  const t = await getTranslations("HistoricalLowsPage");
  const brands = await getHistoricalLowBrands();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Hero */}
      <FadeIn>
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-deal-200 bg-deal-50 px-3 py-1">
            <TrendingDown className="h-3.5 w-3.5 text-deal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-deal-700">
              {t("badge")}
            </span>
          </div>
          <h1 className="heading-display text-3xl font-bold text-surface-900 sm:text-4xl">
            {t("heading")}
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-base text-surface-500">
            {t("description")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-deal-500" />
              {t("authorizedOnly")}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-alert-500" />
              {t("brandsAtLows", { count: brands.length })}
            </span>
          </div>
        </div>
      </FadeIn>

      {brands.length === 0 ? (
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-dashed border-surface-200 py-20 text-center">
            <TrendingDown className="mx-auto mb-3 h-8 w-8 text-surface-300" />
            <p className="text-sm text-surface-500">
              {t("noLowsNow")}
            </p>
            <Link
              href="/deals"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {t("browseAllDeals")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <StaggerItem key={brand.id}>
              <Link href={`/brands/${brand.slug}`} className="group block">
                <div className="rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-200 hover:border-deal-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <BrandAvatar name={brand.name} slug={brand.slug} size="md" />
                      <div>
                        <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-700">
                          {brand.name}
                        </h3>
                        <span className="text-xs text-surface-400">
                          {CATEGORY_ICONS[brand.category] ?? "🎁"}{" "}
                          {brand.category.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    {/* Historical Low Badge */}
                    <span className="shrink-0 rounded-full bg-deal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-deal-700">
                      {t("allTimeLow")}
                    </span>
                  </div>

                  {brand.bestDeal && (
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-surface-400">{t("bestCurrentPrice")}</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="price-display text-xl font-bold text-surface-900">
                            {formatPrice(brand.bestDeal.effectivePriceCents, brand.bestDeal.currency)}
                          </span>
                          <span className="text-xs text-surface-400 line-through">
                            {formatPrice(brand.bestDeal.faceValueCents, brand.bestDeal.currency)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-xl bg-deal-500 px-2.5 py-1 text-sm font-bold text-white">
                          -{brand.bestDeal.discountPct.toFixed(0)}%
                        </span>
                        <p className="mt-1 text-xs text-surface-400">
                          Score: {brand.bestDeal.finalScore.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                    {t("viewPriceHistory")}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* CTA */}
      <FadeIn delay={0.2}>
        <div className="mt-14 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-8 text-center">
          <h2 className="text-lg font-bold text-surface-900">
            {t("neverMissLow")}
          </h2>
          <p className="mt-2 text-sm text-surface-500">
            {t("neverMissLowBody")}
          </p>
          <Link
            href="/alerts"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t("setUpAlerts")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
