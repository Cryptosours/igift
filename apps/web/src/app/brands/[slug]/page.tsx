import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Globe, ShieldCheck, TrendingUp } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { getBrandBySlug } from "@/lib/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const brand = await getBrandBySlug(slug);
    if (!brand) return { title: "Brand Not Found" };
    return {
      title: `${brand.name} Gift Card Deals — Best Verified Prices`,
      description: `Compare verified ${brand.name} gift card deals across trusted sources. Average ${brand.avgDiscount}% off with region compatibility and trust scoring.`,
    };
  } catch {
    return { title: "Brand Not Found" };
  }
}

function BrandJsonLd({
  brand,
  deals,
}: {
  brand: { name: string; description: string; category: string };
  deals: { effectivePrice: number; faceValue: number }[];
}) {
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

  let brand;
  try {
    brand = await getBrandBySlug(slug);
  } catch {
    // DB unavailable
  }

  if (!brand) {
    notFound();
  }

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
            {brand.deals.length} active deals
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-surface-900">
        Current Deals for {brand.name}
      </h2>
      {brand.deals.length > 0 ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {brand.deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-surface-500">
          No active deals found for {brand.name} right now. Check back soon or{" "}
          <Link href="/alerts" className="text-brand-600 hover:text-brand-700">
            set up an alert
          </Link>
          .
        </p>
      )}

      <BrandJsonLd brand={brand} deals={brand.deals} />
    </div>
  );
}
