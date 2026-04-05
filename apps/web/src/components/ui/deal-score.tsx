"use client";

import { clsx } from "clsx";
import { motion } from "motion/react";

function getScoreConfig(score: number) {
  if (score >= 85) return { label: "Excellent", className: "score-excellent text-white", ring: "ring-deal-500/20" };
  if (score >= 70) return { label: "Good", className: "score-good text-white", ring: "ring-deal-400/20" };
  if (score >= 50) return { label: "Fair", className: "score-fair text-white", ring: "ring-alert-400/20" };
  return { label: "Weak", className: "score-poor text-white", ring: "ring-surface-400/20" };
}

export function DealScore({ score }: { score: number }) {
  const config = getScoreConfig(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 ring-2 shadow-sm",
        config.className,
        config.ring,
      )}
    >
      <span className="price-display text-sm font-bold leading-none">{score}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{config.label}</span>
    </motion.div>
  );
}
