import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse verified digital value deals by category — gaming, streaming, app stores, retail, food, and travel.",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-surface-900">Categories</h1>
      <p className="mt-1 text-sm text-surface-500">
        Browse verified deals across all major digital value categories.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group rounded-xl border border-surface-200 bg-white p-6 transition-all hover:border-brand-300 hover:shadow-md"
          >
            <span className="text-4xl">{cat.icon}</span>
            <h2 className="mt-4 text-lg font-semibold text-surface-900">
              {cat.name}
            </h2>
            <p className="mt-1 text-sm text-surface-500">{cat.description}</p>
            <p className="mt-3 price-display text-sm font-medium text-brand-600">
              {cat.dealCount} verified deals
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
