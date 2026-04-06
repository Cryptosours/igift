import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How iGift earns revenue through affiliate partnerships and how this does (and does not) affect our deal rankings.",
};

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">
        Affiliate Disclosure
      </h1>
      <p className="mt-2 text-sm text-surface-500">
        Last updated: March 31, 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-surface-600">
        <section className="rounded-lg border border-brand-200 bg-brand-50 p-6">
          <h2 className="text-base font-semibold text-brand-900">
            The Short Version
          </h2>
          <p className="mt-2 text-brand-800">
            iGift earns money when you click through to a seller and buy
            something. This never affects how deals are scored or ranked.
            Sponsored placements are always labeled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            How We Earn Revenue
          </h2>
          <p className="mt-2">
            iGift is a free deal discovery platform. We earn revenue through:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Affiliate commissions</strong> — When you click a
              &quot;View Deal&quot; link and make a purchase at a third-party
              seller, we may earn a commission from that seller. This costs you
              nothing extra.
            </li>
            <li>
              <strong>Premium subscriptions</strong> (planned) — Enhanced alerts
              and pro features for power users.
            </li>
            <li>
              <strong>Sponsored placements</strong> (planned) — Clearly labeled
              promotional positions. These will never be mixed with organic
              rankings.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            What This Does NOT Affect
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Deal Quality Scores</strong> are computed algorithmically
              based on effective price, historical context, region fit, and
              source trust — not affiliate revenue potential
            </li>
            <li>
              <strong>Confidence Scores</strong> reflect data quality and
              verification strength — not commercial relationships
            </li>
            <li>
              <strong>Trust zone classifications</strong> (Green/Yellow/Red) are
              based on source authorization and buyer protection — not whether
              we have an affiliate relationship
            </li>
            <li>
              <strong>Ranking order</strong> is determined by the final
              composite score — affiliate relationships do not boost or demote
              deals
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            How to Identify Affiliate Links
          </h2>
          <p className="mt-2">
            Every outbound link on iGift that leads to a third-party seller
            may be an affiliate link. These links are marked with the{" "}
            <ExternalLink className="inline h-3 w-3" /> icon and open in a new
            tab. The link URL may contain tracking parameters that identify
            iGift as the referral source.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            Our Commitment
          </h2>
          <p className="mt-2">
            We believe that transparency about our business model is essential
            to the trust we ask you to place in our deal verification. If our
            scoring ever fails to match reality, it undermines our entire
            value proposition — not just our credibility but our revenue. Our
            commercial incentive is alignment: the better our recommendations,
            the more you trust and use iGift, the more affiliate revenue we
            earn. We have no incentive to mislead.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            Questions?
          </h2>
          <p className="mt-2">
            Contact{" "}
            <span className="font-medium text-brand-600">
              hello@igift.app
            </span>{" "}
            with any questions about our affiliate relationships or scoring
            methodology.
          </p>
        </section>
      </div>
    </div>
  );
}
