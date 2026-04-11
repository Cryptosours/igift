import { Inter, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Root layout — required by Next.js; provides html/body with dynamic lang attribute.
 * The app shell (Header, Footer, providers) lives in [locale]/layout.tsx.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Synchronous boot script — runs before ANY async resource loads.
            1. Theme FOUC prevention (reads localStorage, applies dark class)
            2. GA Consent Mode v2 defaults (denied until user accepts)
               Must be synchronous so consent is set before gtag.js can fire events. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("igift-theme");if(t==="light"||(t==="system"&&!matchMedia("(prefers-color-scheme:dark)").matches)){return}document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}})();window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:500});`,
          }}
        />
        {/* Google Analytics — placed in <head> so SSR HTML contains real <script> tags.
            Explicit <head> in root layout bypasses React's hoistable-resource system,
            guaranteeing these appear verbatim in the server-rendered HTML that
            Google's verification crawler reads. */}
        {GA_ID && <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />}
        {GA_ID && <script async src="/ga-init.js" />}
      </head>
      <body className="min-h-screen flex flex-col bg-surface-0 text-surface-900 font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
