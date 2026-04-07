"use client";

import dynamic from "next/dynamic";

/**
 * Thin client wrapper for lazy-loading AlertManager.
 * Keeps the alerts/dashboard pages' initial JS small.
 */
const AlertManager = dynamic(
  () =>
    import("@/components/alerts/alert-manager").then(
      (m) => m.AlertManager,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-24 items-center justify-center text-xs text-surface-400">
        Loading alerts…
      </div>
    ),
  },
);

export function LazyAlertManager() {
  return <AlertManager />;
}
