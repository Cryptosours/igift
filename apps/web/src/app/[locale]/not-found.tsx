import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
        <SearchX className="h-10 w-10 text-brand-400" />
      </div>

      <h1 className="mt-6 heading-display text-3xl text-surface-900">
        Page not found
      </h1>

      <p className="mt-3 text-sm text-surface-500 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Try browsing deals or brands instead.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-100 px-5 py-2.5 text-sm font-semibold text-surface-700 shadow-sm transition-colors hover:border-brand-200 hover:text-brand-700"
        >
          Browse Deals
        </Link>
      </div>

      <p className="mt-12 text-xs text-surface-300">
        Error 404
      </p>
    </div>
  );
}
