import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "RealDeal is a deal intelligence platform for digital gift cards, credits, and vouchers. Learn about our mission and methodology.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">About RealDeal</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-surface-600">
        <p>
          RealDeal is a deal intelligence platform built to solve a clear
          problem: gift cards, prepaid credits, vouchers, and similar digital
          value products are sold across many websites, but buyers have no
          reliable way to know which offers are truly good, usable, and safe.
        </p>
        <p>
          We are <strong>not</strong> a marketplace. We do not sell gift cards,
          hold funds, or process payments. We are a discovery, verification, and
          ranking engine — a trust layer that sits between buyers and the
          fragmented world of digital value deals.
        </p>
        <p>
          Every deal on RealDeal is scored using our dual-score system: a{" "}
          <strong>Deal Quality Score</strong> that measures how good the deal
          actually is (including all fees, region fit, and historical context),
          and a <strong>Confidence Score</strong> that measures how much we trust
          our own data about it. Both scores are shown to you separately —
          because a great-looking deal with low confidence is not a deal you
          should trust.
        </p>
      </div>

      <div id="contact" className="mt-12 rounded-xl border border-surface-200 bg-surface-50 p-6">
        <h2 className="text-lg font-semibold text-surface-900">Contact</h2>
        <p className="mt-2 text-sm text-surface-500">
          For business inquiries, source partnerships, or corrections, reach us
          at{" "}
          <span className="font-medium text-brand-600">hello@realdeal.deals</span>.
        </p>
        <p className="mt-2 text-sm text-surface-500">
          Read our full{" "}
          <Link href="/methodology" className="font-medium text-brand-600 underline">
            scoring methodology
          </Link>{" "}
          to understand how deals are ranked.
        </p>
      </div>
    </div>
  );
}
