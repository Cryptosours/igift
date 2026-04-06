import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { getDeals, getCategoryBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: "Category Not Found" };
  return {
    title: `${cat.name} Gift Card Deals — Verified & Ranked`,
    description: `Browse verified ${cat.name.toLowerCase()} gift card deals. ${cat.description}. Trust-scored with region compatibility.`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);

  if (!cat) {
    notFound();
  }

  let deals: Awaited<ReturnType<typeof getDeals>> = [];
  try {
    deals = await getDeals({ category: slug, limit: 50 });
  } catch {
    // DB unavailable
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        All Categories
      </Link>

      <FadeIn>
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{cat.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">{cat.name}</h1>
              <p className="text-sm text-surface-500">{cat.description}</p>
            </div>
          </div>
          <p className="mt-2 price-display text-sm text-surface-400">
            {deals.length} verified deals across trusted sources
          </p>
        </div>
      </FadeIn>

      {deals.length > 0 ? (
        <StaggerContainer className="mt-6 grid gap-4 lg:grid-cols-2">
          {deals.map((deal) => (
            <StaggerItem key={deal.id}>
              <DealCard deal={deal} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <FadeIn delay={0.1}>
          <p className="mt-6 text-sm text-surface-500">
            No active deals in this category right now. Check back soon or{" "}
            <Link href="/alerts" className="text-brand-600 hover:text-brand-700">
              set up an alert
            </Link>
            .
          </p>
        </FadeIn>
      )}
    </div>
  );
}
