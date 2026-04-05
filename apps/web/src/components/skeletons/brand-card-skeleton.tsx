/**
 * Skeleton placeholder that mirrors brand card dimensions on /brands.
 */

function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-surface-200 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

export function BrandCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div
            className="h-10 w-10 shrink-0 rounded-xl bg-surface-200"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.8s ease-in-out infinite",
            }}
          />
          <div>
            <Bone className="h-4 w-24" />
            <Bone className="mt-1.5 h-3 w-16" />
          </div>
        </div>
        <Bone className="h-5 w-10 rounded-lg" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Bone className="h-3 w-20" />
        <Bone className="h-3.5 w-3.5 rounded-full" />
      </div>
    </div>
  );
}
