import { BrandCardSkeleton } from "@/components/skeletons/brand-card-skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header-skeleton";

export default function BrandsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <BrandCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
