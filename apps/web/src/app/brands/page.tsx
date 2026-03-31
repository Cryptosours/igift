import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse verified deals by brand. Find the best prices on gift cards from Apple, Steam, Netflix, Amazon, and more.",
};

const brands = [
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

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-surface-900">Brands</h1>
      <p className="mt-1 text-sm text-surface-500">
        Browse all brands with verified deals across sources and regions.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brands/${brand.slug}`}
            className="rounded-xl border border-surface-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-surface-900">
                {brand.name}
              </h2>
              <span className="rounded-md bg-deal-50 px-1.5 py-0.5 text-xs font-bold text-deal-700">
                ~{brand.avgDiscount}% off
              </span>
            </div>
            <p className="mt-1 text-xs text-surface-500">{brand.category}</p>
            <p className="mt-2 price-display text-xs text-surface-400">
              {brand.dealCount} active deals
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
