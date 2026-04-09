"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  /** Compact mode for header, expanded mode for page */
  variant?: "compact" | "expanded";
  /** Placeholder text */
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Callback when search results change (for inline results) */
  onResults?: (deals: unknown[], query: string) => void;
}

export function SearchBar({
  variant = "expanded",
  placeholder = "Search deals, brands, or stores...",
  autoFocus = false,
  onResults,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Sync URL param → state on navigation
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Debounced inline search (when onResults is provided)
  useEffect(() => {
    if (!onResults) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      onResults([], "");
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=50`);
        const data = await res.json();
        onResults(data.deals ?? [], data.query ?? query);
      } catch {
        onResults([], query);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, onResults]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/deals?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
    if (onResults) onResults([], "");
    // If on deals page with ?q=, navigate back to clean deals
    if (searchParams.has("q")) {
      router.push("/deals");
    }
  }

  const isCompact = variant === "compact";

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Search deals" className={isCompact ? "relative" : "relative w-full"}>
      <div
        className={`flex items-center rounded-lg border transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 ${
          isCompact
            ? "border-surface-200 bg-surface-50 px-2.5 py-1.5"
            : "border-surface-300 bg-surface-100 px-3 py-2.5 shadow-sm"
        }`}
      >
        {isSearching ? (
          <Loader2 className={`shrink-0 animate-spin text-brand-500 ${isCompact ? "h-4 w-4" : "h-5 w-5"}`} aria-hidden="true" />
        ) : (
          <Search className={`shrink-0 text-surface-400 ${isCompact ? "h-4 w-4" : "h-5 w-5"}`} aria-hidden="true" />
        )}
        <label htmlFor={isCompact ? "search-compact" : "search-expanded"} className="sr-only">Search deals</label>
        <input
          ref={inputRef}
          id={isCompact ? "search-compact" : "search-expanded"}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus} // eslint-disable-line jsx-a11y/no-autofocus
          className={`w-full bg-transparent outline-none placeholder:text-surface-400 ${
            isCompact
              ? "ml-2 text-sm min-w-[180px]"
              : "ml-3 text-base"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded p-0.5 text-surface-400 transition-colors hover:text-surface-600"
            aria-label="Clear search"
          >
            <X className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        )}
      </div>
    </form>
  );
}
