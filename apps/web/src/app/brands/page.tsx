import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrands, getFeaturedPlacements } from "@/lib/data";
import { SponsoredBadge } from "@/components/ui/sponsored-badge";

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse verified deals by brand. Find the best prices on gift cards from Apple, Steam, Netflix, Amazon, and more.",
};

export const dynamic = "force-dynamic";

const fallbackBrands = [
  { name: "Apple", slug: "apple", dealCount: 24, avgDiscount: 12, category: "App Stores" },
  { name: "Steam", slug: "steam", dealCount: 18, avgDiscount: 10, category: "Gaming" },
  { name: "Netflix", slug: "netflix", dealCount: 12, avgDiscount: 14, category: "Streaming" },
  { name: "PlayStation", slug: "playstation", dealCount: 15, avgDiscount: 15, category: "Gaming" },
  { name: "Google Play", slug: "google-play", dealCount: 20, avgDiscount: 9, category: "App Stores" },
  { name: "Amazon", slug: "amazon", dealCount: 31, avgDiscount: 6, category: "Retail" },
  { name: "Xbox", slug: "xbox", dealCount: 14, avgDiscount: 11, category: "Gaming" },
  { name: "Spotify", slug: "spotify", dealCount: 8, avgDiscount: 13, category: "Streaming" },
  { name: "Nintendo", slug: "nintendo", dealCount: 10, avgDiscount: 8, category: "Gaming" },
  { name: "Uber", slug: "uber", dealCount: 7, avgDiscount: 10, category: "Travel" },
  { name: "DoorDash", slug: "doordash", dealCount: 9, avgDiscount: 12, category: "Food & Dining" },
  { name: "Disney+", slug: "disney-plus", dealCount: 6, avgDiscount: 11, category: "Streaming" },
];

export default async function BrandsPage() {
  let brands = fallbackBrands;
  try {
    const dbBrands = await getBrands();
    if (dbBrands.length > 0) {
      brands = dbBrands.map((b) => ({
        name: b.name,
        slug: b.slug,
        dealCount: b.dealCount,
        avgDiscount: b.avgDiscount,
        category: b.category,
      }));
    }
  } catch {
    // DB unavailable — use fallback
  }

  const featuredBrands = await getFeaturedPlacements("featured_brand");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="data-label text-brand-600">Brands</span>
      <h1 className="mt-1 heading-display text-3xl text-surface-900">
        Browse by brand
      </h1>
      <p className="mt-2 text-sm text-surface-500">
        All brands with verified deals across sources and regions.
      </p>

      {/* Sponsored featured brands row */}
      {featuredBrands.length > 0 && (
        <section aria-label="Sponsored featured brands" className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Featured
            </span>
            <SponsoredBadge />
            <div className="flex-1 border-t border-surface-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBrands.map((p) => (
              <Link
                key={p.placementId}
                href={`/brands/${p.brandSlug}`}
                className="group relative rounded-2xl border border-alert-200 bg-white p-5 card-hover hover:border-alert-300 ring-1 ring-alert-100"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-alert-400 to-alert-300" />
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
                      {p.brandName}
                    </h2>
                    <p className="mt-0.5 text-xs text-surface-400">{p.brandCategory}</p>
                  </div>
                  {p.bestDeal && (
                    <span className="inline-flex items-center rounded-lg bg-deal-50 border border-deal-100 px-2 py-0.5 text-xs font-bold text-deal-700">
                      ~{Math.round(p.bestDeal.effectiveDiscount * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-surface-400">
                    {p.bestDeal ? "Best deal available" : "No active deals"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-surface-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brands/${brand.slug}`}
            className="group rounded-2xl border border-surface-200 bg-white p-5 card-hover hover:border-brand-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
                  {brand.name}
                </h2>
                <p className="mt-0.5 text-xs text-surface-400">{brand.category}</p>
              </div>
              <span className="inline-flex items-center rounded-lg bg-deal-50 border border-deal-100 px-2 py-0.5 text-xs font-bold text-deal-700">
                ~{brand.avgDiscount}%
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="price-display text-xs text-surface-400">
                {brand.dealCount} active deals
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-surface-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
