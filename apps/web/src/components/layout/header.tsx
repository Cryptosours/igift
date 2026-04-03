"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import {
  Search,
  Bell,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  Tag,
  Store,
  BookOpen,
} from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";

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
    <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-surface-900">
              Real<span className="text-brand-600">Deal</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
              aria-label="Search deals"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <Link
              href="/alerts"
              className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
              aria-label="Manage alerts"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/alerts"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Bell className="h-4 w-4" />
              Set Alert
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="rounded-lg p-2 text-surface-500 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar (expandable) */}
        {searchOpen && (
          <div className="border-t border-surface-200 py-3">
            <Suspense>
              <SearchBar variant="compact" autoFocus placeholder="Search brands, deals, stores..." />
            </Suspense>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="border-t border-surface-200 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
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
