"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WatchButtonProps {
  brandSlug: string;
  initialWatched?: boolean;
  className?: string;
}

export function WatchButton({ brandSlug, initialWatched = false, className = "" }: WatchButtonProps) {
  const [watched, setWatched] = useState(initialWatched);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      try {
        if (watched) {
          await fetch(`/api/watchlist?slug=${encodeURIComponent(brandSlug)}`, { method: "DELETE" });
          setWatched(false);
        } else {
          await fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brandSlug }),
          });
          setWatched(true);
        }
      } catch {
        // silently ignore network errors — UI stays as-is
      }
    });
  }

  return (
    <motion.button
      onClick={toggle}
      disabled={isPending}
      aria-label={watched ? `Remove ${brandSlug} from watchlist` : `Add ${brandSlug} to watchlist`}
      title={watched ? "Remove from watchlist" : "Save to watchlist"}
      className={[
        "inline-flex items-center justify-center rounded-xl p-2 transition-colors",
        "disabled:opacity-50",
        watched
          ? "bg-brand-50 text-brand-600 hover:bg-brand-100"
          : "bg-surface-100 text-surface-400 hover:bg-surface-200 hover:text-surface-600",
        className,
      ].join(" ")}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={watched ? "filled" : "empty"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [1, 1.3, 1], opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <Heart
            className="h-4 w-4"
            fill={watched ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
