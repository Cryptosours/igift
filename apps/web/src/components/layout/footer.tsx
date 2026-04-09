import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/logo";
import { CookieSettingsButton } from "@/components/ui/cookie-banner";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations("Footer");

  const footerLinks = {
    [t("Product")]: [
      { name: t("links.deals"), href: "/deals" },
      { name: t("links.historicalLows"), href: "/historical-lows" },
      { name: t("links.brands"), href: "/brands" },
      { name: t("links.categories"), href: "/categories" },
      { name: t("links.sourceDirectory"), href: "/sources" },
      { name: t("links.priceAlerts"), href: "/alerts" },
      { name: t("links.dashboard"), href: "/dashboard" },
    ],
    [t("Company")]: [
      { name: t("links.about"), href: "/about" },
      { name: t("links.methodology"), href: "/methodology" },
      { name: t("links.trustSafety"), href: "/methodology#trust" },
      { name: t("links.apiDevelopers"), href: "/developers" },
      { name: t("links.contact"), href: "/about#contact" },
    ],
    [t("Legal")]: [
      { name: t("links.terms"), href: "/terms" },
      { name: t("links.privacy"), href: "/privacy" },
      { name: t("links.disclosure"), href: "/disclosure" },
    ],
  };

  return (
    <footer className="border-t border-surface-200 bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="group">
              <Logo size="sm" showSubtitle={false} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-surface-500">
              {t("tagline")}
            </p>
            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com/Cryptosours/igift"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
                aria-label="GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/igiftapp"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
                aria-label="X (Twitter)"
              >
                <XIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="data-label text-surface-400">{heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
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

        <div className="mt-12 border-t border-surface-200 pt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-surface-400 leading-relaxed text-center sm:text-left">
            &copy; {new Date().getFullYear()} iGift. {t("copyright")}{" "}
            <Link href="/disclosure" className="underline underline-offset-2 hover:text-brand-600">
              {t("affiliateDisclosure")}
            </Link>
            .
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <CookieSettingsButton />
            <p className="text-xs text-surface-300">{t("priceDisclaimer")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
