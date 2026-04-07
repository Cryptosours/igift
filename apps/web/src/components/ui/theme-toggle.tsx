"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/components/layout/theme-provider";

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const cycle: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];

  const next = () => {
    const idx = cycle.indexOf(theme);
    setTheme(cycle[(idx + 1) % cycle.length]);
  };

  return (
    <button
      onClick={next}
      className="rounded-lg p-2 text-surface-400 transition-all hover:bg-surface-100 hover:text-surface-700"
      aria-label={`Theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.15 }}
          className="block"
        >
          <Icon className="h-4.5 w-4.5" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
