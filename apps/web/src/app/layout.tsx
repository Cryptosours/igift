import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "iGift — Verified Digital Value Deals",
    template: "%s | iGift",
  },
  description:
    "Discover, verify, and compare the best deals on gift cards, digital credits, and vouchers. Trust-scored, region-aware, fee-transparent.",
  keywords: [
    "gift card deals",
    "discounted gift cards",
    "digital credits",
    "verified deals",
    "gift card comparison",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "iGift",
    title: "iGift — Verified Digital Value Deals",
    description:
      "Trust-scored deal intelligence for gift cards, digital credits, and vouchers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iGift — Verified Digital Value Deals",
    description:
      "Trust-scored deal intelligence for gift cards, digital credits, and vouchers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-surface-50 text-surface-900 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
