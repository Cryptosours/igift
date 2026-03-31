import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RealDeal — Verified Digital Value Deals",
    template: "%s | RealDeal",
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
    siteName: "RealDeal",
    title: "RealDeal — Verified Digital Value Deals",
    description:
      "Trust-scored deal intelligence for gift cards, digital credits, and vouchers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RealDeal — Verified Digital Value Deals",
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
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-surface-50 text-surface-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
