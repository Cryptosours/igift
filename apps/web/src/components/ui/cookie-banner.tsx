"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Cookie, Settings, Check, X } from "lucide-react";
import {
  hasConsentChoice,
  acceptAll,
  rejectAll,
  setConsent,
  getConsent,
  type ConsentPreferences,
} from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    // Small delay so it doesn't fight with page load animations
    const timer = setTimeout(() => {
      if (!hasConsentChoice()) {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    rejectAll();
    setVisible(false);
  }, []);

  const handleSavePrefs = useCallback(() => {
    setConsent({ analytics: prefs.analytics, marketing: prefs.marketing });
    setVisible(false);
  }, [prefs]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          role="dialog"
          aria-label="Cookie consent"
          aria-modal="false"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-surface-200 bg-surface-0 p-5 shadow-xl md:p-6">
            {!showSettings ? (
              /* ── Simple View ── */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-semibold text-surface-900">
                      We value your privacy
                    </h2>
                    <p className="mt-1 text-sm text-surface-600">
                      We use cookies to improve your experience, analyze traffic, and show relevant
                      content. You can accept all, reject optional cookies, or customize your
                      preferences.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-surface-0 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Reject Optional
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-surface-500 transition-colors hover:text-surface-700"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Customize
                  </button>
                </div>

                <p className="text-xs text-surface-400">
                  See our{" "}
                  <Link href="/privacy" className="underline hover:text-brand-600">
                    Privacy Policy
                  </Link>{" "}
                  for details.
                </p>
              </div>
            ) : (
              /* ── Settings View ── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-surface-900">Cookie Preferences</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Back
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Necessary — always on */}
                  <label className="flex items-center justify-between rounded-lg border border-surface-200 p-3">
                    <div>
                      <span className="text-sm font-medium text-surface-900">Necessary</span>
                      <p className="text-xs text-surface-500">
                        Essential for the site to work. Theme, session, security.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="h-4 w-4 rounded accent-brand-600"
                      aria-label="Necessary cookies (always enabled)"
                    />
                  </label>

                  {/* Analytics */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-surface-200 p-3 transition-colors hover:bg-surface-50">
                    <div>
                      <span className="text-sm font-medium text-surface-900">Analytics</span>
                      <p className="text-xs text-surface-500">
                        Help us understand how you use the site. Google Analytics, error tracking.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.analytics}
                      onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                      className="h-4 w-4 rounded accent-brand-600"
                      aria-label="Analytics cookies"
                    />
                  </label>

                  {/* Marketing */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-surface-200 p-3 transition-colors hover:bg-surface-50">
                    <div>
                      <span className="text-sm font-medium text-surface-900">Marketing</span>
                      <p className="text-xs text-surface-500">
                        Relevant ads and sponsored content. Google AdSense.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.marketing}
                      onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                      className="h-4 w-4 rounded accent-brand-600"
                      aria-label="Marketing cookies"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSavePrefs}
                  className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                >
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Small floating button to re-open cookie settings.
 * Shows in footer area after consent has been given.
 */
export function CookieSettingsButton() {
  const [hasChoice, setHasChoice] = useState(false);

  useEffect(() => {
    setHasChoice(hasConsentChoice());
    const handler = () => setHasChoice(true);
    window.addEventListener("consent-updated", handler);
    return () => window.removeEventListener("consent-updated", handler);
  }, []);

  if (!hasChoice) return null;

  return (
    <button
      onClick={() => {
        // Reset cookie to re-show banner
        document.cookie = "igift-consent=; path=/; max-age=0";
        window.location.reload();
      }}
      className="inline-flex items-center gap-1.5 text-xs text-surface-400 transition-colors hover:text-surface-600"
      aria-label="Manage cookie preferences"
    >
      <Cookie className="h-3.5 w-3.5" aria-hidden="true" />
      Cookie Settings
    </button>
  );
}
