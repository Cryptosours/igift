import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Globe, ShieldCheck, TrendingUp } from "lucide-react";
import { DealCard } from "@/components/deals/deal-card";
import { WatchButton } from "@/components/ui/watch-button";
import { ShareButton, SocialShareLinks } from "@/components/ui/share-button";
import { BrandAvatar } from "@/components/ui/brand-avatar";
import { getBrandBySlug, getWatchedSlugs, getPriceHistory } from "@/lib/data";
import { PriceHistoryChart } from "@/components/analytics/price-history-chart";
import { notFound } from "next/navigation";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

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

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("igift_session")?.value;
  const [watchedSlugs, priceHistory] = await Promise.all([
    getWatchedSlugs(sessionId),
    getPriceHistory(brand.id, { days: 90 }),
  ]);
  const isWatched = watchedSlugs.has(slug);

  // Compute all-time low from historical data to show as reference line
  const allTimeLowCents = priceHistory.length > 0
    ? Math.min(...priceHistory.map((p) => p.priceCents))
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/brands"
        className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        All Brands
      </Link>

      <FadeIn>
        <div className="mt-4 rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <BrandAvatar name={brand.name} slug={slug} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-surface-900">{brand.name}</h1>
                <span className="rounded-md bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600">
                  {brand.category}
                </span>
              </div>
              <p className="mt-1 text-sm text-surface-500">{brand.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="price-display text-2xl font-bold text-deal-600">~{brand.avgDiscount}%</div>
              <div className="text-xs text-surface-400">Avg. Discount</div>
            </div>
            <WatchButton brandSlug={slug} initialWatched={isWatched} />
            <ShareButton
              title={`${brand.name} Gift Card Deals — iGift`}
              text={`Check out ${brand.name} gift card deals with up to ~${brand.avgDiscount}% off from verified sources.`}
              url={`https://igift.app/en/brands/${slug}`}
            />
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
          <div className="ml-auto">
            <SocialShareLinks
              title={`${brand.name} Gift Card Deals — iGift`}
              url={`https://igift.app/en/brands/${slug}`}
            />
          </div>
        </div>
      </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h2 className="mt-8 text-lg font-bold text-surface-900">
          Current Deals for {brand.name}
        </h2>
      </FadeIn>
      {brand.deals.length > 0 ? (
        <StaggerContainer className="mt-4 grid gap-4 lg:grid-cols-2">
          {brand.deals.map((deal) => (
            <StaggerItem key={deal.id}>
              <DealCard deal={deal} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <FadeIn delay={0.15}>
          <p className="mt-4 text-sm text-surface-500">
            No active deals found for {brand.name} right now. Check back soon or{" "}
            <Link href="/alerts" className="text-brand-600 hover:text-brand-700">
              set up an alert
            </Link>
            .
          </p>
        </FadeIn>
      )}

      {/* Price History Chart */}
      <FadeIn delay={0.18}>
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-surface-900">90-Day Price Trend</h2>
              <p className="mt-0.5 text-xs text-surface-400">
                Daily best price · Indigo = effective price · Green = discount %
              </p>
            </div>
            {allTimeLowCents && (
              <div className="rounded-xl border border-deal-200 bg-deal-50 px-3 py-1.5 text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-deal-600">All-time low</p>
                <p className="price-display text-sm font-bold text-deal-700">
                  ${(allTimeLowCents / 100).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <PriceHistoryChart
              data={priceHistory}
              allTimeLowCents={allTimeLowCents}
            />
          </div>
        </div>
      </FadeIn>

      <BrandJsonLd brand={brand} deals={brand.deals} />
    </div>
  );
}
