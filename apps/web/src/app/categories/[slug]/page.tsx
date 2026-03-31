import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { sampleDeals, categories } from "@/lib/sample-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "Category Not Found" };
  return {
    title: `${cat.name} Gift Card Deals — Verified & Ranked`,
    description: `Browse verified ${cat.name.toLowerCase()} gift card deals. ${cat.description}. Trust-scored with region compatibility.`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);

  if (!cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-surface-900">
          Category not found
        </h1>
        <Link
          href="/categories"
          className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700"
        >
          Browse all categories
        </Link>
      </div>
    );
  }

  // Placeholder: show all sample deals for any category
  const displayDeals = sampleDeals;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        All Categories
      </Link>

      {/* Category Header */}
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cat.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{cat.name}</h1>
            <p className="text-sm text-surface-500">{cat.description}</p>
          </div>
        </div>
        <p className="mt-2 price-display text-sm text-surface-400">
          {cat.dealCount} verified deals across trusted sources
        </p>
      </div>

      {/* Deals */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {displayDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
