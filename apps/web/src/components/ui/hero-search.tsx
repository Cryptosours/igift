"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/deals?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/deals");
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Search deals" className="relative">
      <div className="flex items-center rounded-xl bg-surface-900/10 backdrop-blur-sm border border-surface-700/30 px-4 py-3 focus-within:bg-surface-900/15 focus-within:border-surface-600/40 transition-colors">
        <Search className="h-5 w-5 shrink-0 text-brand-300" aria-hidden="true" />
        <label htmlFor="hero-search" className="sr-only">Search deals</label>
        <input
          id="hero-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Steam, Netflix, Apple..."
          className="ml-3 w-full bg-transparent text-surface-900 placeholder:text-surface-500 outline-none text-base"
        />
        <button
          type="submit"
          className="shrink-0 ml-2 rounded-lg bg-surface-0 px-4 py-1.5 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Search
        </button>
      </div>
    </form>
  );
}
