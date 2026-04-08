import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Zap, ShieldCheck, BookOpen, Terminal, ArrowRight, Globe, Key } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Developer API | iGift",
  description:
    "Read-only REST API for gift card deal data. Access live trust-scored deals, brand metadata, and pricing analytics programmatically.",
};

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/deals",
    descriptionKey: "endpointDeals" as const,
    params: [
      { name: "category", type: "string", description: "Filter: gaming | app_stores | streaming | retail | food_dining | travel | telecom" },
      { name: "trust_zone", type: "string", description: "Filter: green (default for free) | yellow | red" },
      { name: "region", type: "string", description: "ISO country code — e.g. US, GB, CA" },
      { name: "min_score", type: "number", description: "Minimum deal score 0–100" },
      { name: "limit", type: "number", description: "Max results: 1–100 (free) | 1–200 (pro). Default 50" },
      { name: "cursor", type: "string", description: "Pagination cursor from previous response meta.nextCursor" },
    ],
  },
  {
    method: "GET",
    path: "/api/v1/brands",
    descriptionKey: "endpointBrands" as const,
    params: [
      { name: "category", type: "string", description: "Filter by category" },
      { name: "limit", type: "number", description: "Max results: 1–200. Default 100" },
      { name: "cursor", type: "string", description: "Pagination cursor" },
    ],
  },
  {
    method: "GET",
    path: "/api/v1/brands/:slug",
    descriptionKey: "endpointBrandSlug" as const,
    params: [
      { name: "slug", type: "path", description: "Brand slug e.g. amazon, google-play, steam" },
    ],
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    descriptionKey: "endpointStats" as const,
    params: [],
  },
];

export default async function DevelopersPage() {
  const t = await getTranslations("DevelopersPage");

  const TIERS = [
    {
      name: t("planFreeName"),
      price: t("planFreePrice"),
      limit: t("planFreeLimit"),
      features: [t("planFreeFeature1"), t("planFreeFeature2"), t("planFreeFeature3"), t("planFreeFeature4")],
      cta: t("planFreeCta"),
      href: "mailto:api@igift.app?subject=API Key Request — Free Tier",
    },
    {
      name: t("planProName"),
      price: t("planProPrice"),
      limit: t("planProLimit"),
      features: [t("planProFeature1"), t("planProFeature2"), t("planProFeature3"), t("planProFeature4")],
      cta: t("planProCta"),
      href: "mailto:api@igift.app?subject=API Key Request — Pro Tier",
      highlight: true,
    },
  ];

  const FEATURES = [
    { icon: ShieldCheck, title: t("featureTrustScoredTitle"), body: t("featureTrustScoredBody") },
    { icon: Zap, title: t("featureLiveDataTitle"), body: t("featureLiveDataBody") },
    { icon: Globe, title: t("featureMultiRegionTitle"), body: t("featureMultiRegionBody") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Hero */}
      <FadeIn>
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1">
            <Code2 className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">{t("badge")}</span>
          </div>
          <h1 className="heading-display text-4xl font-bold text-surface-900 sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-surface-500">
            {t("description")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:api@igift.app?subject=API Key Request"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Key className="h-4 w-4" />
              {t("requestApiKey")}
            </a>
            <a
              href="#endpoints"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-surface-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <BookOpen className="h-4 w-4" />
              {t("viewEndpoints")}
            </a>
          </div>
        </div>
      </FadeIn>

      {/* Quick start */}
      <FadeIn delay={0.05}>
        <div className="mb-14 rounded-2xl border border-surface-200 bg-surface-950 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-semibold text-surface-300">{t("quickStartLabel")}</span>
          </div>
          <pre className="overflow-x-auto text-sm text-deal-300">
{`curl https://igift.app/api/v1/deals \\
  -H "X-API-Key: igift_live_<your_key>" \\
  -G --data-urlencode "category=gaming" \\
     --data-urlencode "limit=10"`}
          </pre>
          <div className="mt-4 border-t border-surface-800 pt-4">
            <p className="text-xs text-surface-500">
              {t("responseEnvelopeLabel")} <code className="text-surface-300">{"{ data: [...], meta: { count, limit, hasMore, nextCursor } }"}</code>
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Features */}
      <StaggerContainer className="mb-14 grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <StaggerItem key={title}>
            <div className="rounded-2xl border border-surface-200 bg-white p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
                <Icon className="h-4.5 w-4.5 text-brand-600" />
              </div>
              <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
              <p className="mt-1 text-xs text-surface-500">{body}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Authentication */}
      <FadeIn delay={0.1}>
        <section className="mb-14">
          <h2 className="mb-4 text-xl font-bold text-surface-900">{t("authHeading")}</h2>
          <div className="rounded-2xl border border-surface-200 bg-white p-6 text-sm">
            <p className="text-surface-600 mb-4">
              {t("authDescription", {
                xApiKeyHeader: "X-API-Key",
                authBearerHeader: "Authorization: Bearer <key>",
              })}
            </p>
            <div className="rounded-xl bg-surface-950 p-4">
              <pre className="text-xs text-deal-300">{`# Header
X-API-Key: igift_live_<your_key>

# Or Bearer
Authorization: Bearer igift_live_<your_key>`}</pre>
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-surface-500">
              <li>• {t("authNote1", { prefix: "igift_live_" })}</li>
              <li>• {t("authNote2")}</li>
              <li>• {t("authNote3", { limitHeader: "X-RateLimit-Limit", remainingHeader: "X-RateLimit-Remaining", resetHeader: "X-RateLimit-Reset" })}</li>
              <li>• {t("authNote4", { retryHeader: "Retry-After" })}</li>
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* Endpoints */}
      <FadeIn delay={0.12}>
        <section id="endpoints" className="mb-14">
          <h2 className="mb-6 text-xl font-bold text-surface-900">{t("endpointsHeading")}</h2>
          <div className="space-y-4">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="rounded-2xl border border-surface-200 bg-white">
                <div className="flex items-center gap-3 border-b border-surface-100 px-5 py-3.5">
                  <span className="rounded-lg bg-deal-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-deal-700">
                    {ep.method}
                  </span>
                  <code className="text-sm font-semibold text-surface-900">{ep.path}</code>
                  <span className="ml-auto text-xs text-surface-400">{t(ep.descriptionKey)}</span>
                </div>
                {ep.params.length > 0 && (
                  <div className="px-5 py-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-surface-400">
                          <th className="pb-2 pr-4 font-medium">{t("parameterLabel")}</th>
                          <th className="pb-2 pr-4 font-medium">{t("typeLabel")}</th>
                          <th className="pb-2 font-medium">{t("descriptionLabel")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-50">
                        {ep.params.map((p) => (
                          <tr key={p.name}>
                            <td className="py-2 pr-4">
                              <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-surface-800">{p.name}</code>
                            </td>
                            <td className="py-2 pr-4 text-surface-400">{p.type}</td>
                            <td className="py-2 text-surface-500">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Pricing */}
      <FadeIn delay={0.14}>
        <section className="mb-14">
          <h2 className="mb-2 text-xl font-bold text-surface-900">{t("plansHeading")}</h2>
          <p className="mb-6 text-sm text-surface-500">
            {t.rich("plansDescription", {
              link: () => <Link href="/deals" className="text-brand-600 hover:underline">igift.app/deals</Link>,
            })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={[
                  "rounded-2xl border p-6",
                  tier.highlight
                    ? "border-brand-300 bg-gradient-to-br from-brand-50 to-white"
                    : "border-surface-200 bg-white",
                ].join(" ")}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-base font-bold text-surface-900">{tier.name}</h3>
                  {tier.highlight && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      {t("recommended")}
                    </span>
                  )}
                </div>
                <p className="mb-1 price-display text-2xl font-bold text-surface-900">{tier.price}</p>
                <p className="mb-4 text-xs text-surface-400">{tier.limit}</p>
                <ul className="mb-6 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-surface-600">
                      <span className="mt-0.5 text-deal-500">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  className={[
                    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                    tier.highlight
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-surface-200 bg-surface-50 text-surface-700 hover:bg-white hover:border-brand-300 hover:text-brand-700",
                  ].join(" ")}
                >
                  {tier.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Rate limit response example */}
      <FadeIn delay={0.16}>
        <section className="mb-14">
          <h2 className="mb-4 text-xl font-bold text-surface-900">{t("responseFormatHeading")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-surface-200 bg-surface-950 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">{t("successLabel")}</p>
              <pre className="overflow-x-auto text-xs text-deal-300">{`{
  "data": [
    {
      "id": 42,
      "title": "Amazon Gift Card $50",
      "brand": "Amazon",
      "brandSlug": "amazon",
      "category": "retail",
      "faceValueCents": 5000,
      "effectivePriceCents": 4250,
      "currency": "USD",
      "discountPct": 15.0,
      "dealScore": 82,
      "confidenceScore": 91,
      "finalScore": 86,
      "trustZone": "green",
      "isHistoricalLow": false,
      "lastSeenAt": "2026-04-05T..."
    }
  ],
  "meta": {
    "count": 1,
    "limit": 50,
    "hasMore": true,
    "nextCursor": 42,
    "tier": "free"
  }
}`}</pre>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-surface-950 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">{t("errorLabel")}</p>
              <pre className="overflow-x-auto text-xs text-alert-300">{`// 401 — missing or invalid key
{
  "error": "invalid_api_key",
  "message": "API key not found or revoked."
}

// 429 — rate limit
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit of 100 req/hour exceeded.",
  "retryAfterSeconds": 1847
}

// HTTP headers on 429:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1744000000
Retry-After: 1847`}</pre>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <FadeIn delay={0.18}>
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 text-center">
          <h2 className="text-xl font-bold text-surface-900">{t("ctaHeading")}</h2>
          <p className="mt-2 text-sm text-surface-500">
            {t("ctaDescription")}
          </p>
          <a
            href="mailto:api@igift.app?subject=API Key Request"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Key className="h-4 w-4" />
            {t("ctaButton")}
          </a>
          <p className="mt-4 text-xs text-surface-400">
            {t("ctaQuestions")}{" "}
            <a href="mailto:api@igift.app" className="text-brand-600 hover:underline">
              api@igift.app
            </a>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
