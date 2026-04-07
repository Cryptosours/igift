import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/layout/motion-provider";
import { PageTransition } from "@/components/layout/page-transition";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import type { Metadata } from "next";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://igift.app"),
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords: [
      "gift card deals",
      "discounted gift cards",
      "digital credits",
      "verified deals",
      "gift card comparison",
    ],
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      locale: locale === "de" ? "de_DE" : "en_US",
      siteName: "iGift",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: "iGift — Trust-scored deal intelligence",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/og-image.svg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale — send unknown locales to 404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load all messages server-side and pass to client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <MotionProvider>
          <Header />
          <main id="main-content" className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <CookieBanner />
          <GoogleAnalytics />
        </MotionProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
