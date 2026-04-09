import { PageHeaderSkeleton } from "@/components/skeletons/page-header-skeleton";

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-100 p-5">
      <div
        className="h-3 w-20 rounded-md bg-surface-200"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
      <div
        className="mt-3 h-8 w-16 rounded-md bg-surface-200"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
      <div
        className="mt-2 h-3 w-28 rounded-md bg-surface-200"
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

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />

      {/* Stats row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* Content area placeholder */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-2xl border border-surface-200 bg-surface-100" />
        <div className="h-64 rounded-2xl border border-surface-200 bg-surface-100" />
      </div>
    </div>
  );
}
