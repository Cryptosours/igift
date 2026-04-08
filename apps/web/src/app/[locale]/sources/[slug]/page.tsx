import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
  ArrowLeft,
  Activity,
  Tag,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAllSourceScorecards, getSourceScorecardBySlug } from "@/lib/data";

// Pre-generate paths for all known sources at build time
export async function generateStaticParams() {
  const sources = await getAllSourceScorecards();
  return sources.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = await getSourceScorecardBySlug(slug);
  if (!source) return { title: "Source Not Found | iGift" };
  return {
    title: `${source.name} Review — Trust Score ${source.trustScore}/100 | iGift`,
    description: `iGift trust scorecard for ${source.name}: ${source.trustZone} zone, ${source.activeOfferCount} active offers, buyer protection ${source.hasBuyerProtection ? "included" : "not available"}.`,
    openGraph: {
      title: `${source.name} | iGift Source Scorecard`,
      url: `https://igift.app/sources/${slug}`,
    },
  };
}

export const revalidate = 1800;

const ZONE_STYLES = {
  green: { bg: "bg-deal-50", text: "text-deal-700", border: "border-deal-200", badgeBg: "bg-deal-500", bar: "bg-deal-500" },
  yellow: { bg: "bg-alert-50", text: "text-alert-700", border: "border-alert-200", badgeBg: "bg-alert-500", bar: "bg-alert-500" },
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badgeBg: "bg-red-500", bar: "bg-red-500" },
} as const;

const HEALTH_STYLES = {
  healthy: { color: "text-deal-600", dot: "bg-deal-500" },
  degraded: { color: "text-alert-600", dot: "bg-alert-500" },
  unhealthy: { color: "text-red-600", dot: "bg-red-500" },
  unknown: { color: "text-surface-400", dot: "bg-surface-300" },
} as const;

const ZONE_LABEL_KEYS = { green: "zoneGreen", yellow: "zoneYellow", red: "zoneRed" } as const;
const ZONE_DESC_KEYS = { green: "zoneGreenDesc", yellow: "zoneYellowDesc", red: "zoneRedDesc" } as const;
const HEALTH_LABEL_KEYS = { healthy: "healthHealthy", degraded: "healthDegraded", unhealthy: "healthUnhealthy", unknown: "healthUnknown" } as const;
const TYPE_LABEL_KEYS: Record<string, string> = {
  official_issuer: "typeOfficialIssuer",
  authorized_reseller: "typeAuthorizedReseller",
  marketplace_resale: "typeMarketplaceResale",
  aggregator: "typeAggregator",
  catalog_only: "typeCatalogOnly",
};

function ScoreRow({
  label,
  points,
  max,
  earned,
}: {
  label: string;
  points: number;
  max: number;
  earned: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-100 last:border-0">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${earned ? "bg-deal-500" : "bg-surface-200"}`}
        />
        <span className="text-sm text-surface-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-sm font-semibold ${earned ? "text-surface-900" : "text-surface-300"}`}
        >
          {earned ? points : 0}
        </span>
        <span className="text-xs text-surface-400">/ {max}</span>
      </div>
    </div>
  );
}

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations("SourceDetail");
  const { slug } = await params;
  const source = await getSourceScorecardBySlug(slug);
  if (!source) notFound();

  const zone = ZONE_STYLES[source.trustZone];
  const health = HEALTH_STYLES[source.healthStatus];
  const trustBarWidth = Math.min(100, Math.max(0, source.trustScore));

  // Score breakdown
  const zonePoints = source.trustZone === "green" ? 40 : source.trustZone === "yellow" ? 20 : 0;
  const reliabilityPoints = Math.round(source.fetchSuccessRate * 25);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/sources"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("sourceDirectory")}
      </Link>

      {/* Hero card */}
      <div className={`rounded-2xl border p-6 sm:p-8 ${zone.border} bg-surface-100`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-surface-900 sm:text-3xl">{source.name}</h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${zone.bg} ${zone.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${zone.badgeBg}`} />
                {t(ZONE_LABEL_KEYS[source.trustZone])}
              </span>
            </div>
            <p className="mt-1 text-sm text-surface-500">{t(ZONE_DESC_KEYS[source.trustZone])}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="rounded-lg bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-600">
                {TYPE_LABEL_KEYS[source.sourceType] ? t(TYPE_LABEL_KEYS[source.sourceType]) : source.sourceType}
              </span>
              <span className={`flex items-center gap-1 text-sm font-medium ${health.color}`}>
                <span className={`h-2 w-2 rounded-full ${health.dot}`} />
                {t(HEALTH_LABEL_KEYS[source.healthStatus])}
              </span>
              {!source.isActive && (
                <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                  {t("inactive")}
                </span>
              )}
            </div>
          </div>

          {/* Trust Score ring */}
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-brand-200 bg-brand-50">
              <span className="font-mono text-2xl font-black text-brand-700">
                {source.trustScore}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-brand-500">
                / 100
              </span>
            </div>
            <span className="mt-1.5 text-xs text-surface-400 text-center">{t("trustScore")}</span>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-6">
          <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${zone.bar}`}
              style={{ width: `${trustBarWidth}%` }}
            />
          </div>
        </div>

        {/* Visit source */}
        <div className="mt-4">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-200 transition-colors"
          >
            {source.url.replace(/^https?:\/\/(www\.)?/, "")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Trust Score Breakdown */}
        <div className="rounded-2xl border border-surface-200 bg-surface-100 p-5">
          <h2 className="mb-1 text-sm font-semibold text-surface-900">{t("scoreBreakdown")}</h2>
          <p className="mb-4 text-xs text-surface-400">{t("scoreBreakdownSub")}</p>
          <ScoreRow
            label={t("trustZone")}
            points={zonePoints}
            max={40}
            earned={zonePoints > 0}
          />
          <ScoreRow
            label={t("buyerProtection")}
            points={20}
            max={20}
            earned={source.hasBuyerProtection}
          />
          <ScoreRow
            label={t("refundPolicy")}
            points={15}
            max={15}
            earned={source.hasRefundPolicy}
          />
          <ScoreRow
            label={t("fetchReliability", { pct: Math.round(source.fetchSuccessRate * 100) })}
            points={reliabilityPoints}
            max={25}
            earned={reliabilityPoints > 0}
          />
          <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2">
            <span className="text-sm font-semibold text-surface-700">{t("total")}</span>
            <span className="font-mono text-base font-black text-surface-900">
              {source.trustScore} / 100
            </span>
          </div>
        </div>

        {/* Live Stats */}
        <div className="rounded-2xl border border-surface-200 bg-surface-100 p-5">
          <h2 className="mb-1 text-sm font-semibold text-surface-900">{t("liveStats")}</h2>
          <p className="mb-4 text-xs text-surface-400">{t("liveStatsSub")}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-50 px-3 py-3">
              <div className="font-mono text-xl font-bold text-surface-900">
                {source.activeOfferCount}
              </div>
              <div className="mt-0.5 text-xs text-surface-400">{t("activeOffers")}</div>
            </div>
            <div className="rounded-xl bg-surface-50 px-3 py-3">
              <div className="font-mono text-xl font-bold text-surface-900">
                {source.uniqueBrandCount}
              </div>
              <div className="mt-0.5 text-xs text-surface-400">{t("brandsCovered")}</div>
            </div>
            <div className="rounded-xl bg-deal-50 px-3 py-3">
              <div className="font-mono text-xl font-bold text-deal-700">
                {source.avgDiscountPct > 0 ? `${source.avgDiscountPct}%` : "—"}
              </div>
              <div className="mt-0.5 text-xs text-surface-400">{t("avgDiscount")}</div>
            </div>
            <div className="rounded-xl bg-brand-50 px-3 py-3">
              <div className="font-mono text-xl font-bold text-brand-700">
                {source.bestDiscountPct > 0 ? `${source.bestDiscountPct}%` : "—"}
              </div>
              <div className="mt-0.5 text-xs text-surface-400">{t("bestDiscount")}</div>
            </div>
          </div>
          {source.historicalLowCount > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5">
              <Tag className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">
                {t("allTimeLows", { count: source.historicalLowCount })}
              </span>
            </div>
          )}
        </div>

        {/* Protection Details */}
        <div className="rounded-2xl border border-surface-200 bg-surface-100 p-5">
          <h2 className="mb-4 text-sm font-semibold text-surface-900">{t("buyerProtections")}</h2>
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                source.hasBuyerProtection ? "bg-deal-50" : "bg-surface-50"
              }`}
            >
              {source.hasBuyerProtection ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-deal-600" />
              ) : (
                <ShieldOff className="h-4 w-4 shrink-0 text-surface-400" />
              )}
              <div>
                <div
                  className={`text-sm font-medium ${
                    source.hasBuyerProtection ? "text-deal-800" : "text-surface-500"
                  }`}
                >
                  {t("buyerProtection")}
                </div>
                <div className="text-xs text-surface-400">
                  {source.hasBuyerProtection
                    ? t("buyerProtectionYes")
                    : t("buyerProtectionNo")}
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                source.hasRefundPolicy ? "bg-brand-50" : "bg-surface-50"
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 shrink-0 ${source.hasRefundPolicy ? "text-brand-600" : "text-surface-400"}`}
              />
              <div>
                <div
                  className={`text-sm font-medium ${
                    source.hasRefundPolicy ? "text-brand-800" : "text-surface-500"
                  }`}
                >
                  {t("refundPolicy")}
                </div>
                <div className="text-xs text-surface-400">
                  {source.hasRefundPolicy
                    ? t("refundPolicyYes")
                    : t("refundPolicyNo")}
                </div>
              </div>
            </div>

            {source.affiliateNetwork && (
              <div className="flex items-center gap-3 rounded-xl bg-surface-50 px-3 py-3">
                <TrendingUp className="h-4 w-4 shrink-0 text-surface-400" />
                <div>
                  <div className="text-sm font-medium text-surface-600">{t("affiliateNetwork")}</div>
                  <div className="text-xs text-surface-400">{source.affiliateNetwork}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Freshness */}
        <div className="rounded-2xl border border-surface-200 bg-surface-100 p-5">
          <h2 className="mb-4 text-sm font-semibold text-surface-900">{t("dataFreshness")}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <Activity className="h-3.5 w-3.5 text-surface-400" />
                {t("fetchSuccessRate")}
              </div>
              <span className="font-mono text-sm font-semibold text-surface-900">
                {Math.round(source.fetchSuccessRate * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <Clock className="h-3.5 w-3.5 text-surface-400" />
                {t("refreshSla")}
              </div>
              <span className="font-mono text-sm font-semibold text-surface-900">
                {source.slaMinutes < 60
                  ? `${source.slaMinutes} min`
                  : `${Math.round(source.slaMinutes / 60)}h`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <span className={`h-2 w-2 rounded-full ${health.dot}`} />
                {t("healthStatus")}
              </div>
              <span className={`text-sm font-semibold ${health.color}`}>{t(HEALTH_LABEL_KEYS[source.healthStatus])}</span>
            </div>
            {source.minutesSinceLastSuccess !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-600">{t("lastSuccessfulFetch")}</span>
                <span className="font-mono text-sm text-surface-500">
                  {source.minutesSinceLastSuccess < 60
                    ? `${source.minutesSinceLastSuccess}m ago`
                    : source.minutesSinceLastSuccess < 1440
                    ? `${Math.round(source.minutesSinceLastSuccess / 60)}h ago`
                    : `${Math.round(source.minutesSinceLastSuccess / 1440)}d ago`}
                </span>
              </div>
            )}
            {source.isStale && (
              <div className="rounded-lg bg-alert-50 px-3 py-2 text-xs text-alert-700">
                {t("staleWarning")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA: browse deals */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-brand-100 bg-brand-50 px-6 py-5">
        <div>
          <h3 className="text-sm font-semibold text-brand-900">
            {t("browseDeals", { source: source.name })}
          </h3>
          <p className="mt-0.5 text-xs text-brand-700">
            {source.activeOfferCount > 0
              ? t("activeOffersTracked", { count: source.activeOfferCount })
              : t("noActiveOffers")}
          </p>
        </div>
        <Link
          href={`/deals?source=${source.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shrink-0"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {t("viewDeals")}
        </Link>
      </div>
    </div>
  );
}
