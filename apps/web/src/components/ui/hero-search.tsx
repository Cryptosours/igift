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
      <div className="flex items-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 focus-within:bg-white/15 focus-within:border-white/40 transition-colors">
        <Search className="h-5 w-5 shrink-0 text-brand-300" aria-hidden="true" />
        <label htmlFor="hero-search" className="sr-only">Search deals</label>
        <input
          id="hero-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Steam, Netflix, Apple..."
          className="ml-3 w-full bg-transparent text-white placeholder:text-brand-300/70 outline-none text-base"
        />
        <button
          type="submit"
          className="shrink-0 ml-2 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
        >
          Search
        </button>
      </div>
    </form>
  );
}
