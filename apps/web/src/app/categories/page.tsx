import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/data";
import { categories as sampleCategories } from "@/lib/sample-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse verified digital value deals by category — gaming, streaming, app stores, retail, food, and travel.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories = sampleCategories;
  try {
    const dbCategories = await getCategories();
    if (dbCategories.length > 0) categories = dbCategories;
  } catch {
    // DB unavailable — use sample data
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <FadeIn>
        <span className="data-label text-brand-600">Categories</span>
        <h1 className="mt-1 heading-display text-3xl text-surface-900">
          Browse by category
        </h1>
        <p className="mt-2 text-sm text-surface-500">
          Verified deals across all major digital value categories.
        </p>
      </FadeIn>

      <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <StaggerItem key={cat.slug}>
            <Link
              href={`/categories/${cat.slug}`}
              className="group block rounded-2xl border border-surface-200 bg-white p-6 card-hover hover:border-brand-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition-transform group-hover:scale-110">
                  {cat.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-surface-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
                {cat.name}
              </h2>
              <p className="mt-1 text-sm text-surface-500">{cat.description}</p>
              <p className="mt-3 price-display text-sm font-semibold text-brand-600">
                {cat.dealCount} verified deals
              </p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
