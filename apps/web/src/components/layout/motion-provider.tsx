"use client";

import { MotionConfig } from "motion/react";

/**
 * Wraps the app in Framer Motion's MotionConfig to globally respect
 * prefers-reduced-motion. All motion.* components inside this provider
 * will automatically disable animations when the user's OS setting is on.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
