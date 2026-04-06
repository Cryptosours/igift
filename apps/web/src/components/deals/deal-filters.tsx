"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { SearchBar } from "@/components/ui/search-bar";
import { DealCard } from "@/components/deals/deal-card";
import type { DealCardProps } from "@/components/deals/deal-card";
import { REGIONS, SELECTABLE_REGIONS } from "@/lib/regions";

const TOGGLE_FILTERS = [
  { key: "greenOnly", label: "Green Sources Only" },
  { key: "historicalLows", label: "Historical Lows" },
] as const;

interface DealFiltersProps {
  initialDeals: DealCardProps[];
  /** Pre-selected region from locale detection (e.g. "EU" for German users) */
  defaultRegion?: string;
}

function DealFiltersInner({ initialDeals, defaultRegion }: DealFiltersProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const regionParam = searchParams.get("region");

  const resolvedDefault = regionParam ?? defaultRegion ?? "All Regions";

  const [searchResults, setSearchResults] = useState<DealCardProps[] | null>(null);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeRegion, setActiveRegion] = useState<string>(resolvedDefault);
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const handleResults = useCallback((deals: unknown[], query: string) => {
    if (!query) {
      setSearchResults(null);
      setActiveQuery("");
    } else {
      setSearchResults(deals as DealCardProps[]);
      setActiveQuery(query);
    }
  }, []);

  const handleToggle = useCallback((key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const baseDeals = searchResults ?? initialDeals;

  const filteredDeals = useMemo(() => {
    let result = baseDeals;

    if (activeRegion !== "All Regions") {
      result = result.filter(
        (d) =>
          d.region.toLowerCase() === activeRegion.toLowerCase() ||
          d.region.toLowerCase() === "global",
      );
    }

    if (toggles.greenOnly) {
      result = result.filter((d) => d.trustZone === "green");
    }

    if (toggles.historicalLows) {
      result = result.filter((d) => d.historicalLow);
    }

    return result;
  }, [baseDeals, activeRegion, toggles]);

  const isSearching = activeQuery.length > 0;
  const hasActiveFilters =
    activeRegion !== "All Regions" || Object.values(toggles).some(Boolean);

  return (
    <>
      {/* Region filter pills + toggle filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        {/* All Regions pill */}
        <button
          onClick={() => setActiveRegion("All Regions")}
          className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
            activeRegion === "All Regions"
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-surface-200 bg-white text-surface-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          }`}
        >
          All Regions
        </button>

        {/* Per-region pills with flag emoji */}
        {SELECTABLE_REGIONS.map((code) => {
          const r = REGIONS[code];
          return (
            <button
              key={code}
              onClick={() => setActiveRegion(code)}
              className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
                activeRegion === code
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-surface-200 bg-white text-surface-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              <span className="mr-1">{r.flag}</span>
              {code}
            </button>
          );
        })}

        <span className="border-l border-surface-200 mx-1" />

        {/* Toggle filters */}
        {TOGGLE_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleToggle(key)}
            className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
              toggles[key]
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-surface-200 bg-white text-surface-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mt-4">
        <Suspense>
          <SearchBar
            variant="expanded"
            autoFocus={!!initialQuery}
            onResults={handleResults}
          />
        </Suspense>
      </div>

      {/* Active filter status */}
      {(isSearching || hasActiveFilters) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-surface-500">
          <Search className="h-4 w-4" />
          <span>
            {filteredDeals.length} result{filteredDeals.length !== 1 ? "s" : ""}
            {isSearching && (
              <>
                {" "}for{" "}
                <span className="font-medium text-surface-700">
                  &quot;{activeQuery}&quot;
                </span>
              </>
            )}
            {hasActiveFilters && !isSearching && " matching filters"}
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setActiveRegion(defaultRegion ?? "All Regions");
                setToggles({});
              }}
              className="ml-1 text-xs text-brand-600 hover:text-brand-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Deal Grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {filteredDeals.length > 0 ? (
          filteredDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        ) : (
          <motion.div
            className="col-span-2 flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Search className="h-12 w-12 text-surface-300" />
            <p className="mt-4 text-lg font-medium text-surface-700">
              {isSearching
                ? `No deals found for "${activeQuery}"`
                : "No deals match your filters"}
            </p>
            <p className="mt-1 text-sm text-surface-500">
              {isSearching
                ? "Try a different search term, like a brand name or category."
                : "Try adjusting your filters or clearing them."}
            </p>
          </motion.div>
        )}
      </div>
    </>
  );
}

export function DealFilters(props: DealFiltersProps) {
  return (
    <Suspense>
      <DealFiltersInner {...props} />
    </Suspense>
  );
}
