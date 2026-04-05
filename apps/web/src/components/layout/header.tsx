"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Heart,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Tag,
  Store,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SearchBar } from "@/components/ui/search-bar";
import { Logo } from "@/components/ui/logo";

const navigation = [
  { name: "Deals", href: "/deals", icon: TrendingUp },
  { name: "Hist. Lows", href: "/historical-lows", icon: TrendingDown },
  { name: "Brands", href: "/brands", icon: Tag },
  { name: "Categories", href: "/categories", icon: Store },
  { name: "Sources", href: "/sources", icon: ShieldCheck },
  { name: "Methodology", href: "/methodology", icon: BookOpen },
];

const mobileOnlyNav = [
  { name: "Watchlist", href: "/watchlist", icon: Heart },
  { name: "Price Alerts", href: "/alerts", icon: Bell },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export function Header() {
  const pathname = usePathname();
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
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={[
                    "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "text-brand-700 bg-brand-50/80"
                      : "text-surface-500 hover:text-surface-900 hover:bg-surface-100/80",
                  ].join(" ")}
                >
                  <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-brand-500" : ""}`} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-brand-600"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </Link>
              );
            })}
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
              className="hidden sm:flex rounded-lg p-2 text-surface-400 transition-all hover:bg-surface-100 hover:text-surface-700"
              aria-label="Manage alerts"
            >
              <Bell className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/dashboard"
              className="hidden sm:flex rounded-lg p-2 text-surface-400 transition-all hover:bg-surface-100 hover:text-surface-700"
              aria-label="My dashboard"
              title="My Dashboard"
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
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
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-surface-200/60"
            >
              <div className="py-3">
                <Suspense>
                  <SearchBar variant="compact" autoFocus placeholder="Search brands, deals, stores..." />
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-surface-200/60 md:hidden"
            >
              <div className="flex flex-col gap-1 py-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={[
                        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-surface-600 hover:bg-surface-100",
                      ].join(" ")}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-brand-500" : "text-surface-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}

                <div className="my-2 border-t border-surface-100 sm:hidden" />
                {mobileOnlyNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={[
                        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:hidden",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-surface-600 hover:bg-surface-100",
                      ].join(" ")}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-brand-500" : "text-surface-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
