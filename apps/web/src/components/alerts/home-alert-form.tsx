"use client";

import { useState, useTransition } from "react";
import { Zap, Check, AlertCircle } from "lucide-react";

export function HomeAlertForm() {
  const [brand, setBrand] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "limit">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || !email.trim()) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            brandSlug: brand.trim().toLowerCase().replace(/\s+/g, "-"),
          }),
        });

        if (res.ok) {
          setStatus("success");
          setBrand("");
          setEmail("");
        } else if (res.status === 402) {
          setStatus("limit");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-alert-400" />
        <h3 className="text-base font-semibold text-white">Free price alerts</h3>
      </div>
      <p className="text-sm text-surface-500">
        Get notified when a verified deal drops to your target price.
      </p>
      <div className="mt-5 space-y-3">
        <input
          type="text"
          value={brand}
          onChange={(e) => { setBrand(e.target.value); setStatus("idle"); }}
          placeholder="Brand or product (e.g., Steam)"
          className="w-full rounded-xl border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="your@email.com"
          required
          className="w-full rounded-xl border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !brand.trim() || !email.trim()}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating..." : "Create Alert"}
        </button>
      </div>

      {status === "success" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-deal-400">
          <Check className="h-3.5 w-3.5" />
          Alert created! We&apos;ll notify you when a deal appears.
        </p>
      )}
      {status === "limit" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-alert-400">
          <AlertCircle className="h-3.5 w-3.5" />
          Free tier limit reached (5 alerts). Manage alerts to free a slot.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          Something went wrong. Please try again.
        </p>
      )}

      <p className="mt-4 text-[10px] text-surface-600">
        Free tier includes up to 5 active alerts. No spam, ever.
      </p>
    </form>
  );
}
