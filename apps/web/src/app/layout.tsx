import { Inter, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import Script from "next/script";
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
        {/* Theme FOUC prevention — static inline, no user input */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("igift-theme");if(t==="light"||(t==="system"&&!matchMedia("(prefers-color-scheme:dark)").matches)){return}document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-0 text-surface-900 font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        {/* Google Analytics — beforeInteractive injects into SSR HTML head.
            External src-only scripts: no dangerouslySetInnerHTML needed.
            ga-init.js contains: dataLayer init + gtag function + config call. */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="beforeInteractive"
            />
            <Script src="/ga-init.js" strategy="beforeInteractive" />
          </>
        )}
      </body>
    </html>
  );
}
