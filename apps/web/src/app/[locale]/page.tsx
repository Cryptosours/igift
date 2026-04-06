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
  Eye,
  Lock,
} from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { getDeals, getCategories, getHeroStats } from "@/lib/data";
import { HeroSearch } from "@/components/ui/hero-search";
import { HomeAlertForm } from "@/components/alerts/home-alert-form";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let deals: Awaited<ReturnType<typeof getDeals>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  const [heroStats] = await Promise.all([getHeroStats()]);
  try {
    const [dbDeals, dbCategories] = await Promise.all([
      getDeals({ limit: 6 }),
      getCategories(),
    ]);
    deals = dbDeals;
    categories = dbCategories;
  } catch {
    // DB unavailable — pages render with empty sections
  }

  return (
    <>
      {/* ══════════════════════════════════════
          HERO — Editorial, data-forward
          ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-surface-950">
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-deal-500/15 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-brand-400/10 blur-[80px]" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left column — copy */}
            <div>
              {/* Eyebrow */}
              <FadeIn>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-deal-400 animate-pulse-soft" />
                  Live price intelligence
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="mt-6 heading-display text-4xl text-white sm:text-5xl lg:text-[3.5rem]">
                  Stop guessing.
                  <br />
                  <span className="bg-gradient-to-r from-deal-400 to-deal-300 bg-clip-text text-transparent">
                    Start saving.
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-surface-400">
                  We compute the real effective price on gift cards, credits, and
                  vouchers — factoring in fees, region locks, and seller trust — so
                  you never overpay.
                </p>
              </FadeIn>

              {/* Search */}
              <FadeIn delay={0.3}>
                <div className="mt-8 max-w-md">
                  <HeroSearch />
                </div>
              </FadeIn>

              {/* CTA row */}
              <FadeIn delay={0.4}>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/deals"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-surface-900 shadow-lg shadow-white/10 transition-all hover:shadow-xl hover:shadow-white/20 active:scale-[0.98]"
                  >
                    <Search className="h-4 w-4" />
                    Browse All Deals
                  </Link>
                  <Link
                    href="/alerts"
                    className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-800/50 px-5 py-2.5 text-sm font-semibold text-surface-300 transition-all hover:border-surface-600 hover:bg-surface-800 hover:text-white"
                  >
                    <Bell className="h-4 w-4" />
                    Set Price Alert
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right column — live stats dashboard card */}
            <FadeIn delay={0.3} className="hidden lg:block">
              <div className="relative rounded-2xl border border-surface-800 bg-surface-900/80 p-6 shadow-2xl shadow-brand-500/5">
                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-2 w-2 rounded-full bg-deal-400 animate-pulse-soft" />
                    <span className="data-label text-surface-500">Live Market Overview</span>
                  </div>
                  <span className="data-label text-surface-600">Updated continuously</span>
                </div>

                {/* Stats grid */}
                <StaggerContainer className="grid grid-cols-2 gap-4" stagger={0.1}>
                  {[
                    { value: `${heroStats.activeOffers}+`, label: "Active Offers", accent: "text-white" },
                    { value: String(heroStats.verifiedSources), label: "Verified Sources", accent: "text-brand-400" },
                    { value: `-${heroStats.avgDiscount}%`, label: "Avg. Discount", accent: "text-deal-400" },
                    { value: "2-Score", label: "Trust System", accent: "text-alert-400" },
                  ].map((stat) => (
                    <StaggerItem key={stat.label}>
                      <div className="rounded-xl bg-surface-800/60 p-4">
                        <div className={`price-display text-2xl font-bold ${stat.accent}`}>
                          {stat.value}
                        </div>
                        <div className="data-label text-surface-500 mt-1">
                          {stat.label}
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* Mini deal preview */}
                <div className="mt-4 rounded-xl border border-surface-800 bg-surface-950/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-surface-500">Top deal right now</div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        {deals[0]?.brand ?? "Steam"} Gift Card
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="price-display text-lg font-bold text-deal-400">
                        -{Math.round((deals[0]?.effectiveDiscount ?? 0.08) * 100)}%
                      </div>
                      <div className="data-label text-surface-500">verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Trust bar — bottom of hero */}
          <StaggerContainer className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-surface-800 pt-8" stagger={0.06}>
            {[
              { icon: ShieldCheck, text: "Trust-scored sources" },
              { icon: Eye, text: "Fee transparency" },
              { icon: Globe, text: "Region-aware" },
              { icon: Lock, text: "No payment processing" },
            ].map((item) => (
              <StaggerItem key={item.text}>
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <item.icon className="h-4 w-4 text-surface-600" />
                  {item.text}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS — 3-step visual flow
          ══════════════════════════════════════ */}
      <section className="relative border-b border-surface-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center">
              <span className="data-label text-brand-600">How it works</span>
              <h2 className="mt-2 heading-display text-3xl text-surface-900 sm:text-4xl">
                Deal intelligence, not just discounts
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-surface-500">
                We go beyond listing prices. Every deal is computed, verified,
                and scored across four dimensions.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TrendingUp,
                title: "Effective Price",
                body: "Fees, membership costs, payment surcharges, denomination constraints — all factored in. Not just the sticker price.",
                accent: "from-brand-500 to-brand-600",
              },
              {
                icon: BarChart3,
                title: "Price History",
                body: "Every deal scored against its own history. Know if today's price is actually good or just normal.",
                accent: "from-deal-500 to-deal-600",
              },
              {
                icon: Globe,
                title: "Region Fit",
                body: "Region locks and account restrictions can make a cheap card useless. We check before you buy.",
                accent: "from-alert-500 to-alert-600",
              },
              {
                icon: ShieldCheck,
                title: "Trust Score",
                body: "Sources classified Green, Yellow, or Red. Authorization, buyer protection, and fraud signals — all visible.",
                accent: "from-brand-400 to-brand-600",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="group relative rounded-2xl border border-surface-200 bg-surface-50/50 p-6 transition-colors hover:border-surface-300 hover:bg-white hover:shadow-lg hover:shadow-surface-200/50">
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.accent} p-2.5 shadow-sm`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-surface-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-surface-500">
                    {feature.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TOP DEALS — Editorial grid
          ══════════════════════════════════════ */}
      <section className="bg-dots py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between">
              <div>
                <span className="data-label text-deal-600">Top picks</span>
                <h2 className="mt-1 heading-display text-3xl text-surface-900">
                  Best verified deals
                </h2>
                <p className="mt-2 text-sm text-surface-500">
                  Ranked by deal quality and confidence. Updated continuously.
                </p>
              </div>
              <Link
                href="/deals"
                className="hidden items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 sm:inline-flex"
              >
                View all deals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>

          <StaggerContainer className="mt-8 grid gap-4 lg:grid-cols-2">
            {deals.map((deal) => (
              <StaggerItem key={deal.id}>
                <DealCard deal={deal} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/deals"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600"
            >
              View all deals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES — Visual cards with gradients
          ══════════════════════════════════════ */}
      <section className="border-t border-surface-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div>
              <span className="data-label text-brand-600">Categories</span>
              <h2 className="mt-1 heading-display text-3xl text-surface-900">
                Browse by category
              </h2>
              <p className="mt-2 text-sm text-surface-500">
                Find verified deals across all major digital value categories.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {categories.map((cat) => (
              <StaggerItem key={cat.slug}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-surface-200 bg-surface-50/50 p-5 transition-colors hover:border-brand-200 hover:bg-white hover:shadow-lg hover:shadow-surface-200/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition-transform group-hover:scale-110">
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-700">
                        {cat.name}
                      </h3>
                      <span className="price-display text-xs font-medium text-surface-400">
                        {cat.dealCount}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-surface-500">
                      {cat.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST + CTA — Split layout
          ══════════════════════════════════════ */}
      <section className="bg-surface-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <FadeIn>
              <div>
                <span className="data-label text-brand-400">Our promise</span>
                <h2 className="mt-2 heading-display text-3xl text-white sm:text-4xl">
                  Verification you can trust
                </h2>
                <p className="mt-4 text-base leading-relaxed text-surface-400">
                  Gift card markets are noisy. Discounts aren&apos;t always real.
                  Region restrictions can make a deal worthless. We built iGift
                  to be the verification layer the market is missing.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Two-score system: Deal Quality + Confidence, shown separately",
                    "Green / Yellow / Red trust zones on every source",
                    "Effective price includes all fees, not just listing price",
                    "Region and account compatibility checked before ranking",
                    "Open methodology — we explain every score",
                    "We never hold funds, sell cards, or process payments",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-surface-400"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-deal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-2xl border border-surface-800 bg-surface-900 p-8">
                <HomeAlertForm />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
