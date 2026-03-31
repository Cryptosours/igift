import { clsx } from "clsx";

function getScoreConfig(score: number) {
  if (score >= 85) return { label: "Excellent", className: "score-excellent text-white" };
  if (score >= 70) return { label: "Good", className: "score-good text-white" };
  if (score >= 50) return { label: "Fair", className: "score-fair text-white" };
  return { label: "Weak", className: "score-poor text-white" };
}

export function DealScore({ score }: { score: number }) {
  const config = getScoreConfig(score);

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1",
        config.className,
      )}
    >
      <span className="price-display text-sm font-bold">{score}</span>
      <span className="text-xs font-medium opacity-90">{config.label}</span>
    </div>
  );
}
