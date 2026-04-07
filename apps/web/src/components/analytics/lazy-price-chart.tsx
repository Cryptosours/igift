"use client";

import dynamic from "next/dynamic";
import type { PricePoint } from "@/lib/data";

/**
 * Thin client-side wrapper that dynamically loads PriceHistoryChart.
 *
 * Recharts is ~45 kB gzipped — by splitting it into a separate chunk
 * and deferring with ssr: false, the brand detail page's initial
 * First Load JS stays small. The chart loads after hydration when the
 * user scrolls down to the price history section.
 */
const PriceHistoryChart = dynamic(
  () =>
    import("@/components/analytics/price-history-chart").then(
      (m) => m.PriceHistoryChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-xs text-surface-400">
        Loading chart…
      </div>
    ),
  },
);

export function LazyPriceChart({
  data,
  allTimeLowCents,
}: {
  data: PricePoint[];
  allTimeLowCents?: number;
}) {
  return <PriceHistoryChart data={data} allTimeLowCents={allTimeLowCents} />;
}
