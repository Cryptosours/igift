import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Globe, ShieldCheck, TrendingUp } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { sampleDeals } from "@/lib/sample-data";

// Brand data — will be from DB later
const brandData: Record<
  string,
  { name: string; category: string; regions: string[]; avgDiscount: number; description: string }
> = {
  apple: { name: "Apple", category: "App Stores", regions: ["US", "EU", "UK", "AU", "Global"], avgDiscount: 12, description: "App Store & iTunes gift cards for apps, games, music, movies, and iCloud storage." },
  steam: { name: "Steam", category: "Gaming", regions: ["US", "EU", "Global"], avgDiscount: 10, description: "Steam Wallet gift cards for games, DLC, in-game items, and Steam Community Market." },
  netflix: { name: "Netflix", category: "Streaming", regions: ["US", "EU", "UK", "Global"], avgDiscount: 14, description: "Netflix gift cards for streaming subscriptions across all plan tiers." },
  playstation: { name: "PlayStation", category: "Gaming", regions: ["US", "EU", "UK"], avgDiscount: 15, description: "PlayStation Store gift cards for PS5 and PS4 games, add-ons, and PS Plus subscriptions." },
  "google-play": { name: "Google Play", category: "App Stores", regions: ["US", "EU", "Global"], avgDiscount: 9, description: "Google Play gift cards for Android apps, games, movies, books, and subscriptions." },
  amazon: { name: "Amazon", category: "Retail", regions: ["US", "UK", "DE", "FR"], avgDiscount: 6, description: "Amazon gift cards redeemable for millions of items on region-specific Amazon stores." },
  xbox: { name: "Xbox", category: "Gaming", regions: ["US", "EU", "UK", "Global"], avgDiscount: 11, description: "Xbox gift cards for games, Game Pass subscriptions, and Microsoft Store purchases." },
  spotify: { name: "Spotify", category: "Streaming", regions: ["US", "EU", "UK", "Global"], avgDiscount: 13, description: "Spotify Premium gift cards for ad-free music streaming subscriptions." },
  nintendo: { name: "Nintendo", category: "Gaming", regions: ["US", "EU", "JP"], avgDiscount: 8, description: "Nintendo eShop gift cards for Switch games, DLC, and Nintendo Switch Online." },
  uber: { name: "Uber", category: "Travel", regions: ["US", "UK"], avgDiscount: 10, description: "Uber gift cards for rides and Uber Eats food delivery." },
  doordash: { name: "DoorDash", category: "Food & Dining", regions: ["US"], avgDiscount: 12, description: "DoorDash gift cards for food delivery from local restaurants." },
  "disney-plus": { name: "Disney+", category: "Streaming", regions: ["US", "EU", "UK", "Global"], avgDiscount: 11, description: "Disney+ gift cards for streaming Disney, Pixar, Marvel, Star Wars, and National Geographic." },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return Object.keys(brandData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandData[slug];
  if (!brand) return { title: "Brand Not Found" };
  return {
    title: `${brand.name} Gift Card Deals — Best Verified Prices`,
    description: `Compare verified ${brand.name} gift card deals across trusted sources. Average ${brand.avgDiscount}% off with region compatibility and trust scoring.`,
  };
}

function BrandJsonLd({ brand, deals }: { brand: { name: string; description: string; category: string }; deals: typeof sampleDeals }) {
  // JSON-LD with only hardcoded/controlled values — no user input
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brand.name} Gift Card`,
    description: brand.description,
    category: brand.category,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: deals.length > 0 ? Math.min(...deals.map((d) => d.effectivePrice)) : 0,
      highPrice: deals.length > 0 ? Math.max(...deals.map((d) => d.faceValue)) : 0,
      priceCurrency: "USD",
      offerCount: deals.length,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;
  const brand = brandData[slug];

  if (!brand) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-surface-900">Brand not found</h1>
        <Link href="/brands" className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700">
          Browse all brands
        </Link>
      </div>
    );
  }

  const brandDeals = sampleDeals.filter((d) => d.brandSlug === slug);
  const displayDeals = brandDeals.length > 0 ? brandDeals : sampleDeals.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/brands"
        className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        All Brands
      </Link>

      <div className="mt-4 rounded-xl border border-surface-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-surface-900">{brand.name}</h1>
              <span className="rounded-md bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600">
                {brand.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-surface-500">{brand.description}</p>
          </div>
          <div className="text-center">
            <div className="price-display text-2xl font-bold text-deal-600">~{brand.avgDiscount}%</div>
            <div className="text-xs text-surface-400">Avg. Discount</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-surface-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Globe className="h-3.5 w-3.5" />
            Regions: {brand.regions.join(", ")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <ShieldCheck className="h-3.5 w-3.5 text-deal-600" />
            Verified sources available
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <TrendingUp className="h-3.5 w-3.5" />
            {displayDeals.length} active deals
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-surface-900">
        Current Deals for {brand.name}
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {displayDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      <BrandJsonLd brand={brand} deals={displayDeals} />
    </div>
  );
}
