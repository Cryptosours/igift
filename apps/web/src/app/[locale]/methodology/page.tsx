import type { Metadata } from "next";
import { ShieldCheck, ShieldAlert, ShieldX, Calculator, BarChart3, DollarSign } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How iGift verifies, scores, and ranks digital value deals. Our dual-score system, trust zones, and verification process explained.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn>
        <span className="data-label text-brand-600">Methodology</span>
        <h1 className="mt-1 heading-display text-3xl text-surface-900">
          How We Score Deals
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-surface-600">
          iGift uses a transparent, two-score verification system. We don&apos;t
          just show discounts — we verify them against reference prices, check
          region compatibility, account for fees, and assess source
          trustworthiness.
        </p>
      </FadeIn>

      {/* Deal Quality Score */}
      <FadeIn delay={0.1}>
        <section className="mt-12 rounded-2xl border border-surface-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deal-50">
              <BarChart3 className="h-5 w-5 text-deal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900">
                Deal Quality Score
              </h2>
              <p className="text-xs text-surface-400">0–100 scale</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-600">
            Measures how good the deal actually is, considering all costs and context.
          </p>
          <div className="mt-5 rounded-xl border border-surface-100 bg-surface-50 p-4 overflow-x-auto">
            <pre className="price-display text-xs text-surface-700 leading-relaxed">{`DealQuality =
  0.30 × PriceEdge          (discount vs best reference price)
+ 0.15 × HistoricalAdvantage (percentile vs 30/90-day history)
+ 0.10 × FeeTransparency     (all fees accounted for)
+ 0.10 × RegionFit           (country/account compatibility)
+ 0.10 × SellerTrust         (source reliability rating)
+ 0.10 × BuyerProtection     (refund/guarantee strength)
+ 0.10 × Freshness           (data recency)
+ 0.05 × AvailabilityConf    (stock/availability signals)`}</pre>
          </div>
        </section>
      </FadeIn>

      {/* Confidence Score */}
      <FadeIn delay={0.15}>
        <section className="mt-6 rounded-2xl border border-surface-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <Calculator className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900">
                Confidence Score
              </h2>
              <p className="text-xs text-surface-400">0–100 scale</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-600">
            Measures how much we trust our own data about this deal. A high deal
            score with low confidence means &quot;looks great but we&apos;re not sure.&quot;
          </p>
          <div className="mt-5 rounded-xl border border-surface-100 bg-surface-50 p-4 overflow-x-auto">
            <pre className="price-display text-xs text-surface-700 leading-relaxed">{`Confidence =
  0.30 × ReferencePriceConf  (quality of baseline price data)
+ 0.20 × DataFreshness       (how recent the check was)
+ 0.20 × SourceReliability   (track record of this source)
+ 0.15 × DuplicateConsistency (multiple sources agree)
+ 0.15 × FraudLowRisk        (no anomaly flags)`}</pre>
          </div>
        </section>
      </FadeIn>

      {/* Trust Zones */}
      <FadeIn delay={0.2}>
        <section id="trust" className="mt-12">
          <span className="data-label text-brand-600">Trust System</span>
          <h2 className="mt-1 text-xl font-bold text-surface-900">
            Trust Zones
          </h2>
          <p className="mt-2 text-sm text-surface-600">
            Every source is classified into a trust zone based on authorization,
            buyer protection, and fraud signals.
          </p>
        </section>
      </FadeIn>

      <StaggerContainer className="mt-5 space-y-4" stagger={0.08}>
        <StaggerItem>
          <div className="flex gap-4 rounded-2xl border border-deal-200 bg-deal-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
              <ShieldCheck className="h-5 w-5 text-deal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-deal-800">Green — Verified Source</h3>
              <p className="mt-1 text-sm text-deal-700">
                Authorized retailers, official promotional offers, and verified
                B2B catalog integrations. Lowest fraud risk. Strongest buyer
                protection.
              </p>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="flex gap-4 rounded-2xl border border-alert-200 bg-alert-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
              <ShieldAlert className="h-5 w-5 text-alert-600" />
            </div>
            <div>
              <h3 className="font-semibold text-alert-800">Yellow — Marketplace</h3>
              <p className="mt-1 text-sm text-alert-700">
                Reputable secondary marketplaces with buyer protection. Higher
                discount potential, but also higher risk of region-incompatible
                or invalid codes. We apply enhanced scoring.
              </p>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
              <ShieldX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Red — Not Listed</h3>
              <p className="mt-1 text-sm text-red-700">
                Account resale, credential-linked products, and sources without
                meaningful buyer protection are excluded from iGift entirely.
                We do not list them.
              </p>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Effective Price */}
      <FadeIn delay={0.1}>
        <section className="mt-12 rounded-2xl border border-surface-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alert-50">
              <DollarSign className="h-5 w-5 text-alert-600" />
            </div>
            <h2 className="text-xl font-bold text-surface-900">
              Effective Price Calculation
            </h2>
          </div>
          <p className="mt-3 text-sm text-surface-600">
            The &quot;effective price&quot; shown on every deal includes all known costs:
          </p>
          <div className="mt-4 rounded-xl border border-surface-100 bg-surface-50 p-4">
            <ul className="space-y-2 text-sm text-surface-700">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-surface-400" />
                Listing price
              </li>
              <li className="flex items-center gap-2">
                <span className="price-display text-surface-400">+</span>
                Platform / marketplace fees
              </li>
              <li className="flex items-center gap-2">
                <span className="price-display text-surface-400">+</span>
                Payment method surcharges
              </li>
              <li className="flex items-center gap-2">
                <span className="price-display text-surface-400">+</span>
                Membership cost allocation (if applicable)
              </li>
              <li className="flex items-center gap-2 border-t border-surface-200 pt-2 font-semibold text-deal-700">
                <span className="price-display text-deal-600">=</span>
                Effective price, converted to your currency
              </li>
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* Affiliate Disclosure */}
      <FadeIn delay={0.15}>
        <section className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
          <h2 className="text-lg font-bold text-surface-900">
            Affiliate Disclosure
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-surface-600">
            iGift earns affiliate commissions when you click through to a
            seller and make a purchase. This does not affect our scoring or
            ranking — deals are ranked purely by their computed deal quality and
            confidence scores. Sponsored placements, if any, are always clearly
            labeled.
          </p>
        </section>
      </FadeIn>
    </div>
  );
}
