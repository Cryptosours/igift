import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Zap, ShieldCheck, BookOpen, Terminal, ArrowRight, Globe, Key } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

export const metadata: Metadata = {
  title: "Developer API | iGift",
  description:
    "Read-only REST API for gift card deal data. Access live trust-scored deals, brand metadata, and pricing analytics programmatically.",
};

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/deals",
    description: "List active deals, sorted by deal score",
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
    description: "List all active brands with offer counts",
    params: [
      { name: "category", type: "string", description: "Filter by category" },
      { name: "limit", type: "number", description: "Max results: 1–200. Default 100" },
      { name: "cursor", type: "string", description: "Pagination cursor" },
    ],
  },
  {
    method: "GET",
    path: "/api/v1/brands/:slug",
    description: "Single brand with all its current active offers",
    params: [
      { name: "slug", type: "path", description: "Brand slug e.g. amazon, google-play, steam" },
    ],
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    description: "Platform statistics: total active deals, brands, historical lows, by-category breakdown",
    params: [],
  },
];

const TIERS = [
  {
    name: "Free",
    price: "Free",
    limit: "100 requests / hour",
    features: ["Green-zone deals only (by default)", "Up to 100 results per request", "All 4 endpoints", "/api/v1/stats included"],
    cta: "Request a key",
    href: "mailto:api@igift.app?subject=API Key Request — Free Tier",
  },
  {
    name: "Pro",
    price: "Contact us",
    limit: "1,000 requests / hour",
    features: ["All trust zones (green, yellow, red)", "Up to 200 results per request", "Priority support", "Webhook delivery (coming soon)"],
    cta: "Contact sales",
    href: "mailto:api@igift.app?subject=API Key Request — Pro Tier",
    highlight: true,
  },
];

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Hero */}
      <FadeIn>
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1">
            <Code2 className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">B2B API</span>
          </div>
          <h1 className="heading-display text-4xl font-bold text-surface-900 sm:text-5xl">
            iGift Deal Intelligence API
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-surface-500">
            Access live trust-scored gift card deals, brand data, and pricing analytics programmatically.
            REST · JSON · Read-only.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:api@igift.app?subject=API Key Request"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Key className="h-4 w-4" />
              Request API Key
            </a>
            <a
              href="#endpoints"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-surface-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <BookOpen className="h-4 w-4" />
              View Endpoints
            </a>
          </div>
        </div>
      </FadeIn>

      {/* Quick start */}
      <FadeIn delay={0.05}>
        <div className="mb-14 rounded-2xl border border-surface-200 bg-surface-950 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-semibold text-surface-300">Quick start — one command</span>
          </div>
          <pre className="overflow-x-auto text-sm text-deal-300">
{`curl https://igift.app/api/v1/deals \\
  -H "X-API-Key: igift_live_<your_key>" \\
  -G --data-urlencode "category=gaming" \\
     --data-urlencode "limit=10"`}
          </pre>
          <div className="mt-4 border-t border-surface-800 pt-4">
            <p className="text-xs text-surface-500">
              Response envelope: <code className="text-surface-300">{"{ data: [...], meta: { count, limit, hasMore, nextCursor } }"}</code>
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Features */}
      <StaggerContainer className="mb-14 grid gap-4 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Trust-scored", body: "Every deal carries a Deal Quality Score (0–100) and Confidence Score. Green zone = verified sellers only." },
          { icon: Zap, title: "Live data", body: "Deals refreshed from source adapters every 6 hours. isHistoricalLow flag when price hits an all-time low." },
          { icon: Globe, title: "Multi-region", body: "Filter by region (US, GB, CA, AU, …). countryRedeemable array on every offer." },
        ].map(({ icon: Icon, title, body }) => (
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
          <h2 className="mb-4 text-xl font-bold text-surface-900">Authentication</h2>
          <div className="rounded-2xl border border-surface-200 bg-white p-6 text-sm">
            <p className="text-surface-600 mb-4">
              Pass your API key in every request via the <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-xs">X-API-Key</code> header
              (or <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-xs">Authorization: Bearer &lt;key&gt;</code>).
            </p>
            <div className="rounded-xl bg-surface-950 p-4">
              <pre className="text-xs text-deal-300">{`# Header
X-API-Key: igift_live_<your_key>

# Or Bearer
Authorization: Bearer igift_live_<your_key>`}</pre>
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-surface-500">
              <li>• Keys are prefixed <code className="font-mono">igift_live_</code> followed by 64 hex characters</li>
              <li>• Keys are shown once at creation — store them securely</li>
              <li>• Rate limit headers are returned on every response: <code className="font-mono">X-RateLimit-Limit</code>, <code className="font-mono">X-RateLimit-Remaining</code>, <code className="font-mono">X-RateLimit-Reset</code></li>
              <li>• Exceeded limit → HTTP 429 with <code className="font-mono">Retry-After</code> header</li>
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* Endpoints */}
      <FadeIn delay={0.12}>
        <section id="endpoints" className="mb-14">
          <h2 className="mb-6 text-xl font-bold text-surface-900">Endpoints</h2>
          <div className="space-y-4">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="rounded-2xl border border-surface-200 bg-white">
                <div className="flex items-center gap-3 border-b border-surface-100 px-5 py-3.5">
                  <span className="rounded-lg bg-deal-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-deal-700">
                    {ep.method}
                  </span>
                  <code className="text-sm font-semibold text-surface-900">{ep.path}</code>
                  <span className="ml-auto text-xs text-surface-400">{ep.description}</span>
                </div>
                {ep.params.length > 0 && (
                  <div className="px-5 py-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-surface-400">
                          <th className="pb-2 pr-4 font-medium">Parameter</th>
                          <th className="pb-2 pr-4 font-medium">Type</th>
                          <th className="pb-2 font-medium">Description</th>
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
          <h2 className="mb-2 text-xl font-bold text-surface-900">Plans</h2>
          <p className="mb-6 text-sm text-surface-500">
            All plans are read-only. We never expose affiliate URLs via the API — visit{" "}
            <Link href="/deals" className="text-brand-600 hover:underline">igift.app/deals</Link> for click-outs.
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
                      Recommended
                    </span>
                  )}
                </div>
                <p className="mb-1 price-display text-2xl font-bold text-surface-900">{tier.price}</p>
                <p className="mb-4 text-xs text-surface-400">{tier.limit}</p>
                <ul className="mb-6 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-surface-600">
                      <span className="mt-0.5 text-deal-500">✓</span>
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
          <h2 className="mb-4 text-xl font-bold text-surface-900">Response format</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-surface-200 bg-surface-950 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Success</p>
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
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Error</p>
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
          <h2 className="text-xl font-bold text-surface-900">Ready to integrate?</h2>
          <p className="mt-2 text-sm text-surface-500">
            Email us with your use case and we&apos;ll issue a key within 24 hours.
          </p>
          <a
            href="mailto:api@igift.app?subject=API Key Request"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Key className="h-4 w-4" />
            Request API Access
          </a>
          <p className="mt-4 text-xs text-surface-400">
            Questions?{" "}
            <a href="mailto:api@igift.app" className="text-brand-600 hover:underline">
              api@igift.app
            </a>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
