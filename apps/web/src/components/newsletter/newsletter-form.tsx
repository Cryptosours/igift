"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Mail, Check, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Inline newsletter signup form for the weekly deal digest.
 *
 * Designed to be placed at the bottom of key pages (home, deals, brands)
 * as a lightweight email capture CTA. No auth required — just email.
 */
export function NewsletterForm({
  className = "",
  variant = "default",
}: {
  className?: string;
  /** "compact" removes the heading and description */
  variant?: "default" | "compact";
}) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "daily">("weekly");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setStatus("loading");
      setErrorMsg("");

      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), frequency }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to subscribe");
        }

        setStatus("success");
        setEmail("");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [email, frequency],
  );

  if (status === "success") {
    return (
      <div
        className={`rounded-xl border border-deal-200 bg-deal-50 p-5 text-center ${className}`}
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-deal-100">
          <Check className="h-5 w-5 text-deal-600" />
        </div>
        <p className="mt-3 text-sm font-medium text-deal-800">
          You&apos;re subscribed!
        </p>
        <p className="mt-1 text-xs text-deal-600">
          Watch your inbox for the {frequency === "daily" ? "daily" : "weekly"} deal digest.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-surface-200 bg-white p-5 ${className}`}
    >
      {variant === "default" && (
        <div className="mb-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
            <Mail className="h-5 w-5 text-brand-600" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-surface-900">
            Deal Digest
          </h3>
          <p className="mt-1 text-xs text-surface-500 leading-relaxed">
            Get the best verified gift card deals delivered to your inbox.
            No spam — unsubscribe anytime.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="you@example.com"
            required
            className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-label="Email address for deal digest"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </button>
        </div>

        {/* Frequency toggle */}
        <div className="flex items-center gap-3 text-xs text-surface-500">
          <span>Frequency:</span>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              name="frequency"
              value="weekly"
              checked={frequency === "weekly"}
              onChange={() => setFrequency("weekly")}
              className="accent-brand-600"
            />
            Weekly
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              name="frequency"
              value="daily"
              checked={frequency === "daily"}
              onChange={() => setFrequency("daily")}
              className="accent-brand-600"
            />
            Daily
          </label>
        </div>

        {status === "error" && (
          <p className="text-xs text-red-600" role="alert">
            {errorMsg}
          </p>
        )}

        <p className="text-[10px] text-surface-400">
          By subscribing you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-surface-600">
            privacy policy
          </Link>
          . We&apos;ll never share your email.
        </p>
      </form>
    </div>
  );
}
