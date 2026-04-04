"use client";

import { useState, useTransition } from "react";
import { Bell, Trash2, Loader2, CheckCircle } from "lucide-react";

interface AlertRow {
  id: number;
  brandId: number | null;
  category: string | null;
  targetDiscountPct: number | null;
  region: string | null;
  deliveryChannel: string;
  isActive: boolean;
  lastSentAt: string | null;
  createdAt: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AlertManager() {
  const [email, setEmail] = useState("");
  const [alerts, setAlerts] = useState<AlertRow[] | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadAlerts(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return;
    setLoadState("loading");
    setLoadError("");

    try {
      const res = await fetch(`/api/alerts?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        setLoadState("error");
        setLoadError(data.error ?? "Failed to load alerts.");
        return;
      }
      setAlerts((data.alerts as AlertRow[]).filter((a) => a.isActive));
      setLoadState("done");
    } catch {
      setLoadState("error");
      setLoadError("Network error. Please try again.");
    }
  }

  function deleteAlert(id: number) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setAlerts((prev) => prev?.filter((a) => a.id !== id) ?? null);
        }
      } finally {
        setDeletingId(null);
      }
    });
  }

  function describeAlert(alert: AlertRow): string {
    const parts: string[] = [];
    if (alert.targetDiscountPct != null) {
      parts.push(`${(alert.targetDiscountPct * 100).toFixed(0)}%+ off`);
    } else {
      parts.push("any discount");
    }
    if (alert.region) parts.push(alert.region);
    return parts.join(", ");
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-surface-900">Manage your alerts</h2>
      <p className="mt-1 text-sm text-surface-500">
        Enter your email to see and delete your active alerts.
      </p>

      <form onSubmit={loadAlerts} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 rounded-lg border border-surface-300 px-3 py-2 text-sm placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="submit"
          disabled={loadState === "loading"}
          className="rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 disabled:opacity-50"
        >
          {loadState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Look up"
          )}
        </button>
      </form>

      {loadState === "error" && (
        <p className="mt-3 text-sm text-red-600">{loadError}</p>
      )}

      {loadState === "done" && alerts !== null && (
        <div className="mt-4">
          {alerts.length === 0 ? (
            <p className="text-sm text-surface-500">No active alerts found for {email}.</p>
          ) : (
            <>
              <p className="mb-3 text-xs text-surface-400">
                {alerts.length} active alert{alerts.length !== 1 ? "s" : ""} — free tier allows up to 5
              </p>
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
                      <span className="text-sm text-surface-700">
                        {describeAlert(alert)}
                      </span>
                      {alert.lastSentAt && (
                        <span className="flex items-center gap-0.5 text-xs text-deal-600">
                          <CheckCircle className="h-3 w-3" />
                          Fired
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      disabled={deletingId === alert.id || isPending}
                      aria-label="Delete alert"
                      className="ml-2 rounded p-1 text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    >
                      {deletingId === alert.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
