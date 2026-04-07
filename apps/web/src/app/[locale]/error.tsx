"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[iGift] Page error:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>

      <h1 className="mt-6 heading-display text-3xl text-surface-900">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-sm text-sm text-surface-500">
        We hit an unexpected error loading this page. You can try again or head
        back to the homepage.
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-xs text-surface-300">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-surface-700 shadow-sm transition-colors hover:border-brand-200 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
