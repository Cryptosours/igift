import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "RealDeal terms of service. We are a deal discovery and verification platform — not a marketplace or payment processor.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-surface-500">
        Last updated: March 31, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-surface-600">
        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            1. What RealDeal Is
          </h2>
          <p className="mt-2">
            RealDeal (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates a
            deal discovery, verification, and ranking platform for digital value
            products including gift cards, digital credits, and vouchers. We are
            a <strong>publisher and referral platform</strong>. We do not sell
            gift cards, hold funds, process payments, or act as a marketplace
            or escrow service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            2. No Warranty on Third-Party Deals
          </h2>
          <p className="mt-2">
            Deals listed on RealDeal are sourced from third-party sellers,
            marketplaces, and authorized retailers. We verify deal data to the
            best of our ability using our scoring methodology, but we{" "}
            <strong>do not guarantee</strong> the accuracy, availability,
            validity, or usability of any deal, gift card code, or digital
            credit listed on our platform. Prices, availability, and terms may
            change without notice at the original seller&apos;s discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            3. Affiliate Relationships
          </h2>
          <p className="mt-2">
            RealDeal earns affiliate commissions when you click through to a
            third-party seller and make a purchase. These affiliate
            relationships do not affect our deal scoring or ranking algorithms.
            Deals are ranked by computed Deal Quality and Confidence scores.
            Any sponsored or promoted placements are clearly labeled as such.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            4. User Responsibilities
          </h2>
          <p className="mt-2">
            You are responsible for verifying that any deal you pursue is
            compatible with your region, account, and intended use. You are
            responsible for understanding the terms, refund policies, and
            restrictions of the third-party seller before completing a purchase.
            RealDeal is not a party to any transaction between you and a
            third-party seller.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            5. Trust Zone Classifications
          </h2>
          <p className="mt-2">
            Our Green, Yellow, and Red trust zone classifications are
            operator-level assessments based on source authorization, buyer
            protection, and fraud signals. They are not guarantees. A
            &quot;Green&quot; classification means we believe the source is
            authorized and reputable, not that every individual listing is free
            of error or risk.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            6. Price Alerts
          </h2>
          <p className="mt-2">
            Price alerts are provided as a convenience. We do not guarantee
            delivery timing, accuracy of alert triggers, or continued
            availability of any deal referenced in an alert. Free tier alerts
            are limited to 3 active alerts per email address.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            7. Prohibited Uses
          </h2>
          <p className="mt-2">You may not use RealDeal to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Scrape, crawl, or systematically extract data from our platform
            </li>
            <li>Resell or redistribute our deal data or scores</li>
            <li>Submit fraudulent deal reports or abuse our reporting system</li>
            <li>
              Circumvent rate limits or abuse our API (when available)
            </li>
            <li>
              Use our platform to facilitate fraud, money laundering, or any
              illegal activity
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            8. Limitation of Liability
          </h2>
          <p className="mt-2">
            RealDeal is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any losses, damages, or disputes
            arising from your use of our platform or your transactions with
            third-party sellers. Our maximum liability is limited to the
            amount you have paid us directly (if any) in the 12 months
            preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            9. Changes to Terms
          </h2>
          <p className="mt-2">
            We may update these terms at any time. Continued use of RealDeal
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            10. Contact
          </h2>
          <p className="mt-2">
            Questions about these terms? Contact us at{" "}
            <span className="font-medium text-brand-600">
              legal@realdeal.deals
            </span>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
