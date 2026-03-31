import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const footerLinks = {
  Product: [
    { name: "Deals", href: "/deals" },
    { name: "Brands", href: "/brands" },
    { name: "Categories", href: "/categories" },
    { name: "Price Alerts", href: "/alerts" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Methodology", href: "/methodology" },
    { name: "Trust & Safety", href: "/methodology#trust" },
    { name: "Contact", href: "/about#contact" },
  ],
  Legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Affiliate Disclosure", href: "/disclosure" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-surface-900">
                Real<span className="text-brand-600">Deal</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-surface-500">
              Trust-scored deal intelligence for digital gift cards, credits,
              and vouchers. We verify so you don&apos;t have to guess.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-surface-900">
                {heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-500 transition-colors hover:text-brand-600"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-surface-200 pt-6">
          <p className="text-center text-xs text-surface-400">
            &copy; {new Date().getFullYear()} RealDeal. We are a deal
            discovery and verification platform. We do not sell gift cards,
            hold funds, or process payments. Prices shown are sourced from
            third-party sellers and may change.{" "}
            <Link href="/disclosure" className="underline hover:text-brand-600">
              Affiliate disclosure
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
