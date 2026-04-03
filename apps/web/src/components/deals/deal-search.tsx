"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/ui/search-bar";
import { DealCard } from "@/components/deals/deal-card";
import type { DealCardProps } from "@/components/deals/deal-card";
import { Search } from "lucide-react";

interface DealSearchProps {
  initialDeals: DealCardProps[];
}

function DealSearchInner({ initialDeals }: DealSearchProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [searchResults, setSearchResults] = useState<DealCardProps[] | null>(null);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const handleResults = useCallback((deals: unknown[], query: string) => {
    if (!query) {
      setSearchResults(null);
      setActiveQuery("");
    } else {
      setSearchResults(deals as DealCardProps[]);
      setActiveQuery(query);
    }
  }, []);

  const deals = searchResults ?? initialDeals;
  const isSearching = activeQuery.length > 0;

  return (
    <>
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

      {/* Search Status */}
      {isSearching && (
        <div className="mt-3 flex items-center gap-2 text-sm text-surface-500">
          <Search className="h-4 w-4" />
          <span>
            {deals.length} result{deals.length !== 1 ? "s" : ""} for{" "}
            <span className="font-medium text-surface-700">&quot;{activeQuery}&quot;</span>
          </span>
        </div>
      )}

      {/* Deal Grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {deals.length > 0 ? (
          deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        ) : isSearching ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-12 w-12 text-surface-300" />
            <p className="mt-4 text-lg font-medium text-surface-700">
              No deals found for &quot;{activeQuery}&quot;
            </p>
            <p className="mt-1 text-sm text-surface-500">
              Try a different search term, like a brand name or category.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}

export function DealSearch(props: DealSearchProps) {
  return (
    <Suspense>
      <DealSearchInner {...props} />
    </Suspense>
  );
}
