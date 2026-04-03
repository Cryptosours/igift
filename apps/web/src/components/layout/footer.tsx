import Link from "next/link";
import { Logo } from "@/components/ui/logo";

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
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="group">
              <Logo size="sm" showSubtitle={false} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-surface-500">
              Trust-scored deal intelligence for digital gift cards, credits,
              and vouchers.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="data-label text-surface-400">
                {heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
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

        <div className="mt-12 border-t border-surface-100 pt-6">
          <p className="text-center text-xs text-surface-400 leading-relaxed">
            &copy; {new Date().getFullYear()} iGift. Deal discovery and verification platform.
            We do not sell gift cards, hold funds, or process payments. Prices sourced from
            third-party sellers and may change.{" "}
            <Link href="/disclosure" className="underline underline-offset-2 hover:text-brand-600">
              Affiliate disclosure
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
