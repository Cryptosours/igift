import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "iGift privacy policy. How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-surface-500">
        Last updated: March 31, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-surface-600">
        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            1. What We Collect
          </h2>
          <p className="mt-2">We collect minimal data:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Email address</strong> — only if you sign up for price
              alerts
            </li>
            <li>
              <strong>Alert preferences</strong> — brands, categories, regions,
              and target prices you configure
            </li>
            <li>
              <strong>Usage analytics</strong> — anonymous page views, click
              patterns, and feature usage (via PostHog or similar)
            </li>
            <li>
              <strong>Device and browser information</strong> — standard HTTP
              headers for analytics and security
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            2. What We Do NOT Collect
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Gift card codes, redemption codes, or credentials</li>
            <li>Payment information (we do not process payments)</li>
            <li>
              Account credentials for third-party platforms
            </li>
            <li>
              Personal financial information beyond what you voluntarily provide
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            3. How We Use Your Data
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>To deliver price alerts you have configured</li>
            <li>To improve our deal verification and ranking algorithms</li>
            <li>To understand usage patterns and improve the product</li>
            <li>To prevent abuse and maintain platform security</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> sell your personal data to third parties.
            We do <strong>not</strong> share your email address with advertisers
            or deal sources.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            4. Cookies and Tracking
          </h2>
          <p className="mt-2">
            We use essential cookies for site functionality and analytics
            cookies to understand usage patterns. We do not use advertising
            tracking cookies. You can disable cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            5. Third-Party Links
          </h2>
          <p className="mt-2">
            iGift contains affiliate links to third-party sellers. When you
            click these links, you are subject to the privacy policies of those
            third-party sites. We are not responsible for their data practices.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            6. Data Retention
          </h2>
          <p className="mt-2">
            Alert preferences are retained as long as your alerts are active.
            You can delete your alerts and associated email at any time by
            using the unsubscribe link in any alert email. Analytics data is
            retained in aggregate form and is not linked to individual users
            after 90 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            7. Your Rights
          </h2>
          <p className="mt-2">You have the right to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Request a copy of any personal data we hold about you</li>
            <li>Request deletion of your personal data</li>
            <li>Opt out of analytics tracking</li>
            <li>Unsubscribe from alerts at any time</li>
          </ul>
          <p className="mt-2">
            Contact{" "}
            <span className="font-medium text-brand-600">
              privacy@igift.app
            </span>{" "}
            for any data requests.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            8. Security
          </h2>
          <p className="mt-2">
            We use industry-standard security measures including HTTPS
            encryption, secure hosting, and access controls. We never store
            gift card codes or payment credentials.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-900">
            9. Changes
          </h2>
          <p className="mt-2">
            We may update this policy. We will notify alert subscribers of
            material changes via email.
          </p>
        </section>
      </div>
    </div>
  );
}
