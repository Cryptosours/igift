"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

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
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={watched ? `Remove ${brandSlug} from watchlist` : `Add ${brandSlug} to watchlist`}
      title={watched ? "Remove from watchlist" : "Save to watchlist"}
      className={[
        "inline-flex items-center justify-center rounded-xl p-2 transition-all",
        "hover:scale-110 active:scale-95 disabled:opacity-50",
        watched
          ? "bg-brand-50 text-brand-600 hover:bg-brand-100"
          : "bg-surface-100 text-surface-400 hover:bg-surface-200 hover:text-surface-600",
        className,
      ].join(" ")}
    >
      <Heart
        className="h-4 w-4"
        fill={watched ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}
