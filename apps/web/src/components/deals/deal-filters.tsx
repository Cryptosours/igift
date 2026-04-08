"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { SearchBar } from "@/components/ui/search-bar";
import { DealCard } from "@/components/deals/deal-card";
import type { DealCardProps } from "@/components/deals/deal-card";
import { REGIONS, SELECTABLE_REGIONS } from "@/lib/regions";

interface DealFiltersProps {
  initialDeals: DealCardProps[];
  /** Pre-selected region from locale detection (e.g. "EU" for German users) */
  defaultRegion?: string;
}

function DealFiltersInner({ initialDeals, defaultRegion }: DealFiltersProps) {
  const t = useTranslations("DealFilters");
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const regionParam = searchParams.get("region");

  const allRegionsLabel = t("allRegions");
  const resolvedDefault = regionParam ?? defaultRegion ?? allRegionsLabel;

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

    if (activeRegion !== allRegionsLabel) {
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

  const toggleFilters = [
    { key: "greenOnly", label: t("greenSourcesOnly") },
    { key: "historicalLows", label: t("historicalLows") },
  ] as const;

  const isSearching = activeQuery.length > 0;
  const hasActiveFilters =
    activeRegion !== allRegionsLabel || Object.values(toggles).some(Boolean);

  return (
    <>
      {/* Region filter pills + toggle filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        {/* All Regions pill */}
        <button
          onClick={() => setActiveRegion(allRegionsLabel)}
          aria-pressed={activeRegion === allRegionsLabel}
          className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
            activeRegion === allRegionsLabel
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-surface-200 bg-white text-surface-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          }`}
        >
          {allRegionsLabel}
        </button>

        {/* Per-region pills with flag emoji */}
        {SELECTABLE_REGIONS.map((code) => {
          const r = REGIONS[code];
          return (
            <button
              key={code}
              onClick={() => setActiveRegion(code)}
              aria-pressed={activeRegion === code}
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
        {toggleFilters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleToggle(key)}
            aria-pressed={!!toggles[key]}
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
            {t("resultCount", { count: filteredDeals.length })}
            {isSearching && (
              <>
                {" "}{t("forQuery", { query: activeQuery })}
              </>
            )}
            {hasActiveFilters && !isSearching && ` ${t("matchingFilters")}`}
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setActiveRegion(defaultRegion ?? allRegionsLabel);
                setToggles({});
              }}
              className="ml-1 text-xs text-brand-600 hover:text-brand-700 transition-colors"
            >
              {t("clearFilters")}
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
                ? t("noDealsSearch", { query: activeQuery })
                : t("noDealsFilter")}
            </p>
            <p className="mt-1 text-sm text-surface-500">
              {isSearching
                ? t("noDealsSearchHint")
                : t("noDealsFilterHint")}
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
