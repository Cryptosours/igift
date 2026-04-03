import type { Metadata } from "next";
import { Bell, Zap, Shield, Mail } from "lucide-react";
import { AlertForm } from "@/components/alerts/alert-form";

export const metadata: Metadata = {
  title: "Price Alerts",
  description: "Set up verified price alerts for gift cards and digital credits. Get notified when deals hit your target price.",
};

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
          <Bell className="h-7 w-7 text-brand-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-surface-900">
          Price Alerts
        </h1>
        <p className="mt-2 text-sm text-surface-500">
          Get notified when verified deals drop to your target price.
          We only alert on deals that pass our trust and verification checks.
        </p>
      </div>

      {/* Features */}
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "Instant Alerts",
            body: "Email or Telegram notification within minutes of a verified price drop.",
          },
          {
            icon: Shield,
            title: "Trust-Filtered",
            body: "Only Green and Yellow zone deals. We never alert on unverified sources.",
          },
          {
            icon: Mail,
            title: "No Spam",
            body: "We send alerts only when your criteria are met. Unsubscribe anytime.",
          },
        ].map((f) => (
          <div key={f.title} className="text-center">
            <f.icon className="mx-auto h-6 w-6 text-brand-600" />
            <h3 className="mt-2 text-sm font-semibold text-surface-900">{f.title}</h3>
            <p className="mt-1 text-xs text-surface-500">{f.body}</p>
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
