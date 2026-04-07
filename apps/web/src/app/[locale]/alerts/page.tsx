import type { Metadata } from "next";
import { Bell, Zap, Shield, Mail, CheckCircle } from "lucide-react";
import { AlertForm } from "@/components/alerts/alert-form";
import { LazyAlertManager as AlertManager } from "@/components/alerts/lazy-alert-manager";
import { db } from "@/db";
import { userAlerts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Price Alerts",
  description: "Set up verified price alerts for gift cards and digital credits. Get notified when deals hit your target price.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ brand?: string; unsubscribe?: string }>;
};

export default async function AlertsPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialBrand = params.brand?.trim().toLowerCase() ?? "";
  const unsubscribeId = params.unsubscribe ? Number(params.unsubscribe) : null;

  // Server-side unsubscribe: deactivate the alert if valid ID
  let unsubscribeResult: "success" | "not_found" | null = null;
  if (unsubscribeId && !isNaN(unsubscribeId)) {
    const result = await db
      .update(userAlerts)
      .set({ isActive: false })
      .where(eq(userAlerts.id, unsubscribeId))
      .returning({ id: userAlerts.id });
    unsubscribeResult = result.length > 0 ? "success" : "not_found";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-600/20">
          <Bell className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-5 heading-display text-3xl text-surface-900">
          Price Alerts
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-surface-500 leading-relaxed">
          Get notified when verified deals drop to your target price.
          Only deals that pass our trust and verification checks.
        </p>
      </div>

      {/* Unsubscribe confirmation */}
      {unsubscribeResult === "success" && (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-deal-200 bg-deal-50 px-5 py-4">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-deal-600" />
          <div>
            <p className="text-sm font-medium text-deal-800">Alert cancelled</p>
            <p className="mt-0.5 text-xs text-deal-600">You won&apos;t receive any more notifications for this alert.</p>
          </div>
        </div>
      )}
      {unsubscribeResult === "not_found" && (
        <div className="mt-8 rounded-xl border border-surface-200 bg-surface-50 px-5 py-4">
          <p className="text-sm text-surface-500">Alert not found — it may have already been cancelled.</p>
        </div>
      )}

      {/* Features */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "Instant Alerts",
            body: "Email notification within minutes of a verified price drop.",
            accent: "from-alert-500 to-alert-600",
          },
          {
            icon: Shield,
            title: "Trust-Filtered",
            body: "Only Green and Yellow zone deals. No unverified sources.",
            accent: "from-deal-500 to-deal-600",
          },
          {
            icon: Mail,
            title: "No Spam",
            body: "Alerts only when your criteria are met. Unsubscribe anytime.",
            accent: "from-brand-500 to-brand-600",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-surface-200 bg-white p-5 text-center card-hover">
            <div className={`mx-auto inline-flex rounded-xl bg-gradient-to-br ${f.accent} p-2.5 shadow-sm`}>
              <f.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-surface-900">{f.title}</h3>
            <p className="mt-1 text-xs text-surface-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

      {/* Alert Form */}
      <div className="mt-10">
        <AlertForm initialBrand={initialBrand} />
      </div>

      {/* Alert Manager */}
      <div className="mt-6">
        <AlertManager />
      </div>

      {/* Free tier note */}
      <p className="mt-6 text-center text-xs text-surface-400">
        Free tier includes up to 5 active alerts · 24-hour delivery cooldown between repeat notifications
      </p>
    </div>
  );
}
