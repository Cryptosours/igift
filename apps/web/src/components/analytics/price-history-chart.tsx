"use client";

/**
 * PriceHistoryChart — 90-day price trend for a single brand.
 *
 * Renders a smooth area chart (effective price) with a secondary
 * discount % line on the right Y-axis. Both axes shown on desktop,
 * simplified to price-only on mobile.
 *
 * Uses Recharts ComposedChart for dual-axis support.
 * Fully client-side to keep the parent page server-rendered.
 */

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PricePoint } from "@/lib/data";

interface Props {
  data: PricePoint[];
  currency?: string;
  /** Optional — renders a dashed reference line at the all-time low price */
  allTimeLowCents?: number;
}

function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Custom tooltip component
function ChartTooltip({
  active,
  payload,
  label,
  currency = "USD",
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  currency?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  const pricePayload = payload.find((p) => p.name === "Price");
  const discountPayload = payload.find((p) => p.name === "Discount");

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-100 px-3.5 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-surface-500">{formatDate(label)}</p>
      {pricePayload && (
        <p className="price-display text-sm font-bold text-surface-900">
          {formatPrice(pricePayload.value, currency)}
        </p>
      )}
      {discountPayload && (
        <p className="text-xs font-semibold text-deal-600">
          {discountPayload.value.toFixed(1)}% off
        </p>
      )}
    </div>
  );
}

export function PriceHistoryChart({ data, currency = "USD", allTimeLowCents }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-surface-200">
        <p className="text-sm text-surface-400">No price history available yet.</p>
      </div>
    );
  }

  // Build chart-friendly data array
  const chartData = data.map((p) => ({
    date: p.date,
    priceCents: p.priceCents,
    discountPct: Number(p.discountPct.toFixed(1)),
  }));

  const prices = chartData.map((d) => d.priceCents);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  // Add 10% padding on Y-axis so the line isn't flush with edges
  const yMin = Math.floor((minPrice * 0.9) / 100) * 100;
  const yMax = Math.ceil((maxPrice * 1.1) / 100) * 100;

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 36, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c15f3c" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#c15f3c" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />

          {/* Left axis — price in dollars */}
          <YAxis
            yAxisId="price"
            orientation="left"
            domain={[yMin, yMax]}
            tickFormatter={(v: number) => `$${(v / 100).toFixed(0)}`}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={44}
          />

          {/* Right axis — discount % */}
          <YAxis
            yAxisId="discount"
            orientation="right"
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11, fill: "#10b981" }}
            tickLine={false}
            axisLine={false}
            width={36}
          />

          <Tooltip
            content={<ChartTooltip currency={currency} />}
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
          />

          {/* All-time low reference line */}
          {allTimeLowCents && (
            <ReferenceLine
              yAxisId="price"
              y={allTimeLowCents}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "All-time low",
                position: "insideTopLeft",
                fontSize: 10,
                fill: "#10b981",
              }}
            />
          )}

          {/* Price area — primary series */}
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="priceCents"
            name="Price"
            stroke="#c15f3c"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#c15f3c", strokeWidth: 0 }}
          />

          {/* Discount line — secondary series */}
          <Line
            yAxisId="discount"
            type="monotone"
            dataKey="discountPct"
            name="Discount"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="0"
            activeDot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
