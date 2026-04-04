"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import {
  Search,
  Bell,
  Heart,
  Menu,
  X,
  TrendingUp,
  Tag,
  Store,
  BookOpen,
} from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { Logo } from "@/components/ui/logo";

const navigation = [
  { name: "Deals", href: "/deals", icon: TrendingUp },
  { name: "Brands", href: "/brands", icon: Tag },
  { name: "Categories", href: "/categories", icon: Store },
  { name: "Methodology", href: "/methodology", icon: BookOpen },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200/60 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-surface-500 transition-all hover:text-surface-900 hover:bg-surface-100/80"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <button
              className="rounded-lg p-2 text-surface-400 transition-all hover:bg-surface-100 hover:text-surface-700"
              aria-label="Search deals"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              {searchOpen ? <X className="h-4.5 w-4.5" /> : <Search className="h-4.5 w-4.5" />}
            </button>
            <Link
              href="/watchlist"
              className="rounded-lg p-2 text-surface-400 transition-all hover:bg-surface-100 hover:text-surface-700"
              aria-label="My watchlist"
              title="My Watchlist"
            >
              <Heart className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/alerts"
              className="rounded-lg p-2 text-surface-400 transition-all hover:bg-surface-100 hover:text-surface-700"
              aria-label="Manage alerts"
            >
              <Bell className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/alerts"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.98]"
            >
              <Bell className="h-3.5 w-3.5" />
              Set Alert
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="rounded-lg p-2 text-surface-400 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar (expandable) */}
        {searchOpen && (
          <div className="animate-fade-up border-t border-surface-200/60 py-3">
            <Suspense>
              <SearchBar variant="compact" autoFocus placeholder="Search brands, deals, stores..." />
            </Suspense>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="animate-fade-up border-t border-surface-200/60 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4 text-surface-400" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
