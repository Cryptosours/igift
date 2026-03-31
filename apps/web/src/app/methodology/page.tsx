import type { Metadata } from "next";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How RealDeal verifies, scores, and ranks digital value deals. Our dual-score system, trust zones, and verification process explained.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">
        How We Score Deals
      </h1>
      <p className="mt-3 text-base leading-relaxed text-surface-600">
        RealDeal uses a transparent, two-score verification system. We don&apos;t
        just show discounts — we verify them against reference prices, check
        region compatibility, account for fees, and assess source
        trustworthiness.
      </p>

      {/* Deal Quality Score */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-surface-900">
          1. Deal Quality Score (0–100)
        </h2>
        <p className="mt-2 text-sm text-surface-600">
          Measures how good the deal actually is, considering all costs and context.
        </p>
        <div className="mt-4 rounded-lg border border-surface-200 bg-surface-50 p-4">
          <pre className="price-display text-xs text-surface-700 overflow-x-auto">{`DealQuality =
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

      {/* Confidence Score */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-surface-900">
          2. Confidence Score (0–100)
        </h2>
        <p className="mt-2 text-sm text-surface-600">
          Measures how much we trust our own data about this deal. A high deal
          score with low confidence means &quot;looks great but we&apos;re not sure.&quot;
        </p>
        <div className="mt-4 rounded-lg border border-surface-200 bg-surface-50 p-4">
          <pre className="price-display text-xs text-surface-700 overflow-x-auto">{`Confidence =
  0.30 × ReferencePriceConf  (quality of baseline price data)
+ 0.20 × DataFreshness       (how recent the check was)
+ 0.20 × SourceReliability   (track record of this source)
+ 0.15 × DuplicateConsistency (multiple sources agree)
+ 0.15 × FraudLowRisk        (no anomaly flags)`}</pre>
        </div>
      </section>

      {/* Trust Zones */}
      <section id="trust" className="mt-10">
        <h2 className="text-xl font-bold text-surface-900">
          3. Trust Zones
        </h2>
        <p className="mt-2 text-sm text-surface-600">
          Every source is classified into a trust zone based on authorization,
          buyer protection, and fraud signals.
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex gap-4 rounded-lg border border-deal-200 bg-deal-50 p-4">
            <ShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-deal-600" />
            <div>
              <h3 className="font-semibold text-deal-800">Green — Verified Source</h3>
              <p className="mt-1 text-sm text-deal-700">
                Authorized retailers, official promotional offers, and verified
                B2B catalog integrations. Lowest fraud risk. Strongest buyer
                protection.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-lg border border-alert-200 bg-alert-50 p-4">
            <ShieldAlert className="mt-0.5 h-6 w-6 flex-shrink-0 text-alert-600" />
            <div>
              <h3 className="font-semibold text-alert-800">Yellow — Marketplace</h3>
              <p className="mt-1 text-sm text-alert-700">
                Reputable secondary marketplaces with buyer protection. Higher
                discount potential, but also higher risk of region-incompatible
                or invalid codes. We apply enhanced scoring.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <ShieldX className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Red — Not Listed</h3>
              <p className="mt-1 text-sm text-red-700">
                Account resale, credential-linked products, and sources without
                meaningful buyer protection are excluded from RealDeal entirely.
                We do not list them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Effective Price */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-surface-900">
          4. Effective Price Calculation
        </h2>
        <p className="mt-2 text-sm text-surface-600">
          The &quot;effective price&quot; shown on every deal includes all known costs:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-surface-600">
          <li>Listing price</li>
          <li>+ Platform / marketplace fees</li>
          <li>+ Payment method surcharges</li>
          <li>+ Membership cost allocation (if applicable)</li>
          <li>= Effective price, converted to your currency</li>
        </ul>
      </section>

      {/* Affiliate Disclosure */}
      <section className="mt-10 rounded-lg border border-surface-200 bg-surface-50 p-6">
        <h2 className="text-lg font-bold text-surface-900">
          Affiliate Disclosure
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-surface-600">
          RealDeal earns affiliate commissions when you click through to a
          seller and make a purchase. This does not affect our scoring or
          ranking — deals are ranked purely by their computed deal quality and
          confidence scores. Sponsored placements, if any, are always clearly
          labeled.
        </p>
      </section>
    </div>
  );
}
