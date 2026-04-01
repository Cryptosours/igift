import Link from "next/link";
import {
  Search,
  Bell,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { getDeals, getCategories } from "@/lib/data";
import { sampleDeals, categories as sampleCategories } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let deals = sampleDeals;
  let categories = sampleCategories;
  try {
    const [dbDeals, dbCategories] = await Promise.all([
      getDeals({ limit: 6 }),
      getCategories(),
    ]);
    if (dbDeals.length > 0) deals = dbDeals;
    if (dbCategories.length > 0) categories = dbCategories;
  } catch {
    // DB unavailable — use sample data
  }
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-800/50 px-4 py-1.5 text-sm text-brand-200">
              <ShieldCheck className="h-4 w-4" />
              Trust-scored deal intelligence
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              The real price.
              <br />
              <span className="text-deal-400">The real deal.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-200">
              We discover, verify, and rank the best deals on gift cards, digital
              credits, and vouchers — so you know exactly what you&apos;re getting,
              where it works, and whether it&apos;s worth it.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/deals"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-900 shadow-lg transition-all hover:bg-brand-50 sm:w-auto"
              >
                <Search className="h-4 w-4" />
                Browse Verified Deals
              </Link>
              <Link
                href="/alerts"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-400/30 bg-brand-800/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700/50 sm:w-auto"
              >
                <Bell className="h-4 w-4" />
                Set a Price Alert
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "15+", label: "Verified Sources" },
              { value: "2-Score", label: "Deal + Confidence" },
              { value: "24/7", label: "Price Monitoring" },
              { value: "100%", label: "Fee Transparency" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-xs text-brand-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-b border-surface-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-surface-900">
              Not just discounts. Verified deal intelligence.
            </h2>
            <p className="mt-2 text-sm text-surface-500">
              We go beyond listing prices — we compute what you actually pay and
              whether it&apos;s actually good.
            </p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TrendingUp,
                title: "Effective Price",
                body: "We factor in fees, membership costs, payment surcharges, and denomination constraints — not just the sticker price.",
              },
              {
                icon: BarChart3,
                title: "Historical Context",
                body: "Every deal is scored against its own price history. Know if today's price is truly a deal or just normal.",
              },
              {
                icon: Globe,
                title: "Region Fit",
                body: "Region locks and account restrictions can make a 'cheap' card useless. We check compatibility before you buy.",
              },
              {
                icon: ShieldCheck,
                title: "Trust Scoring",
                body: "Sources are classified Green / Yellow / Red based on authorization, buyer protection, and fraud signals.",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                  <feature.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-surface-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-500">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Deals ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-900">
                Top Verified Deals
              </h2>
              <p className="mt-1 text-sm text-surface-500">
                Ranked by deal quality score and confidence. Updated continuously.
              </p>
            </div>
            <Link
              href="/deals"
              className="hidden items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 sm:inline-flex"
            >
              View all deals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {sampleDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/deals"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600"
            >
              View all deals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="border-t border-surface-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900">
            Browse by Category
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Find verified deals across all major digital value categories.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4 transition-all hover:border-brand-300 hover:bg-white hover:shadow-sm"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-surface-900">
                      {cat.name}
                    </h3>
                    <span className="price-display text-xs text-surface-400">
                      {cat.dealCount} deals
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-surface-500">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Trust RealDeal ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl font-bold text-surface-900">
                  Why trust RealDeal?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-surface-600">
                  Gift card markets are noisy. Discounts aren&apos;t always real.
                  Region restrictions can make a deal worthless. We built
                  RealDeal to be the verification layer the market is missing.
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    "Two-score system: Deal Quality + Confidence, shown separately",
                    "Green / Yellow / Red trust classification on every source",
                    "Effective price includes all fees, not just the listing price",
                    "Region and account compatibility checked before ranking",
                    "Open methodology — we explain exactly how every deal is scored",
                    "We never hold funds, sell cards, or process payments",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-surface-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-deal-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-brand-200/50 bg-white p-6">
                <h3 className="text-sm font-semibold text-surface-900">
                  Set up a free price alert
                </h3>
                <p className="mt-1 text-xs text-surface-500">
                  Get notified when a verified deal drops to your target price.
                </p>
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Brand or product (e.g., Steam $50)"
                    className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                    Create Alert
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-surface-400">
                  Free tier includes 3 active alerts. No spam, ever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
