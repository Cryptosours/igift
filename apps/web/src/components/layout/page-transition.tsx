"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * Wraps page content with AnimatePresence for route-change transitions.
 * Keyed on pathname so each route gets a fresh entrance animation.
 *
 * Note: In Next.js App Router, exit animations are unreliable because
 * React swaps children before AnimatePresence can capture the exit.
 * The entrance animation (fade + subtle Y) is what provides the polish.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
