import { PageHeaderSkeleton } from "@/components/skeletons/page-header-skeleton";

function CategoryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-100 p-6">
      <div className="flex items-start justify-between">
        <div
          className="h-12 w-12 rounded-xl bg-surface-200"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.8s ease-in-out infinite",
          }}
        />
        <div className="h-4 w-4 rounded bg-surface-200" />
      </div>
      <div
        className="mt-4 h-5 w-28 rounded-md bg-surface-200"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
      <div
        className="mt-2 h-3 w-40 rounded-md bg-surface-200"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
      <div
        className="mt-3 h-4 w-24 rounded-md bg-surface-200"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
