import type { Metadata } from "next";
import { Bell, Zap, Shield, Mail } from "lucide-react";
import { AlertForm } from "@/components/alerts/alert-form";

export const metadata: Metadata = {
  title: "Price Alerts",
  description: "Set up verified price alerts for gift cards and digital credits. Get notified when deals hit your target price.",
};

export default function AlertsPage() {
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
        <AlertForm />
      </div>
    </div>
  );
}
