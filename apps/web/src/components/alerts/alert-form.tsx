"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

interface AlertFormProps {
  initialBrand?: string;
}

export function AlertForm({ initialBrand = "" }: AlertFormProps) {
  const [brand, setBrand] = useState(initialBrand);
  const [targetDiscount, setTargetDiscount] = useState("any");
  const [region, setRegion] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          brand: brand || undefined,
          targetDiscount,
          region: region || undefined,
          channel: "email",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(
          data.code === "ALERT_LIMIT_REACHED"
            ? `You've reached the ${data.limit}-alert free tier limit. Delete an existing alert below to create a new one.`
            : (data.error ?? "Something went wrong. Please try again."),
        );
        return;
      }

      setState("success");
      setMessage("Alert created! We'll email you when a matching deal appears.");
      setBrand("");
      setTargetDiscount("any");
      setRegion("");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-surface-900">
        Create a new alert
      </h2>

      {state === "success" && (
        <div role="alert" className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {state === "error" && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="alert-brand" className="block text-sm font-medium text-surface-700">
            Brand or product
          </label>
          <input
            id="alert-brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Steam, Apple, Netflix (leave empty for all)"
            className="mt-1 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="alert-discount" className="block text-sm font-medium text-surface-700">
              Target discount
            </label>
            <select
              id="alert-discount"
              value={targetDiscount}
              onChange={(e) => setTargetDiscount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="any">Any discount</option>
              <option value="5">5% or more</option>
              <option value="10">10% or more</option>
              <option value="15">15% or more</option>
              <option value="20">20% or more</option>
            </select>
          </div>
          <div>
            <label htmlFor="alert-region" className="block text-sm font-medium text-surface-700">
              Region
            </label>
            <select
              id="alert-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Any region</option>
              <option value="US">US</option>
              <option value="EU">EU</option>
              <option value="UK">UK</option>
              <option value="Global">Global</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="alert-email" className="block text-sm font-medium text-surface-700">
            Email
          </label>
          <input
            id="alert-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="mt-1 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "submitting" ? "Creating..." : "Create Alert"}
        </button>
      </form>
    </div>
  );
}
