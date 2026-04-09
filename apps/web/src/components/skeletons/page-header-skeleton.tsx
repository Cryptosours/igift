/**
 * Skeleton for the standard page header pattern:
 * data-label + heading + description line.
 */

function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-surface-200 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, var(--shimmer-highlight, rgba(255,255,255,0.4)) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

export function PageHeaderSkeleton() {
  return (
    <div>
      <Bone className="h-2.5 w-14" />
      <Bone className="mt-2 h-8 w-56" />
      <Bone className="mt-3 h-4 w-80" />
    </div>
  );
}
