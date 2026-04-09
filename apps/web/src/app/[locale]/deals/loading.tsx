import { DealCardSkeleton } from "@/components/skeletons/deal-card-skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header-skeleton";

export default function DealsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />

      {/* Filter pills placeholder */}
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-surface-200"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.8s ease-in-out infinite",
            }}
          />
        ))}
      </div>

      {/* Deal cards grid */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
