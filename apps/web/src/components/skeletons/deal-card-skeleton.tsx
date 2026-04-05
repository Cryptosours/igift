/**
 * Skeleton placeholder that mirrors DealCard dimensions.
 * Uses CSS shimmer animation from globals.css.
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

export function DealCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        {/* Left column */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Bone className="h-3 w-16" />
            <Bone className="h-4 w-12 rounded-full" />
          </div>
          <Bone className="mt-2 h-5 w-48" />
          <div className="mt-3 flex items-baseline gap-3">
            <Bone className="h-7 w-20" />
            <Bone className="h-4 w-14" />
            <Bone className="h-5 w-10 rounded-lg" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Bone className="h-3 w-14" />
            <Bone className="h-3 w-20" />
            <Bone className="h-3 w-16" />
          </div>
        </div>
        {/* Right column */}
        <div className="flex flex-col items-end gap-2.5">
          <Bone className="h-8 w-10 rounded-xl" />
          <Bone className="h-8 w-24 rounded-xl" />
          <Bone className="h-2 w-14" />
        </div>
      </div>
    </div>
  );
}
