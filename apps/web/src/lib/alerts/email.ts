/**
 * Email Alert Delivery
 *
 * Sends deal alert emails via Resend REST API.
 * Uses @react-email/render for HTML generation.
 * Configure via env vars:
 *
 *   RESEND_API_KEY — Resend API key (https://resend.com)
 *   EMAIL_FROM — sender address (default: alerts@igift.app)
 *
 * If RESEND_API_KEY is not set, logs emails to console (dev mode).
 */

import * as React from "react";
import { render } from "@react-email/render";
import { AlertEmail } from "@/emails/AlertEmail";
import type { AlertMatch } from "./matcher";

// ── Configuration ──

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "iGift Alerts <alerts@igift.app>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://igift.app";

const isEmailConfigured = Boolean(RESEND_API_KEY);

// ── Types ──

export interface DeliveryResult {
  alertId: number;
  email: string;
  success: boolean;
  error?: string;
}

// ── Email Rendering ──

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

async function renderAlertHtml(match: AlertMatch): Promise<string> {
  const o = match.offer;
  const clickUrl = `${SITE_URL}/api/click/${o.id}`;

  return render(
    React.createElement(AlertEmail, {
      brandName: o.brandName,
      title: o.title,
      faceValue: formatCents(o.faceValueCents, o.currency),
      effectivePrice: formatCents(o.effectivePriceCents, o.currency),
      discountPct: (o.effectiveDiscountPct * 100).toFixed(1),
      sourceName: o.sourceName,
      trustZone: (o.trustZone ?? "yellow") as "green" | "yellow" | "red",
      dealUrl: clickUrl,
      manageUrl: `${SITE_URL}/alerts`,
      unsubscribeUrl: `${SITE_URL}/alerts?unsubscribe=${match.alertId}`,
      siteUrl: SITE_URL,
    }),
  );
}

function renderAlertText(match: AlertMatch): string {
  const o = match.offer;
  const discountPct = (o.effectiveDiscountPct * 100).toFixed(1);
  const faceValue = formatCents(o.faceValueCents, o.currency);
  const effectivePrice = formatCents(o.effectivePriceCents, o.currency);
  const clickUrl = `${SITE_URL}/api/click/${o.id}`;

  return [
    `iGift Deal Alert`,
    ``,
    `${o.brandName} — ${o.title}`,
    `Face Value: ${faceValue}`,
    `Your Price: ${effectivePrice} (${discountPct}% off)`,
    `Source: ${o.sourceName} (${o.trustZone} zone)`,
    ``,
    `View deal: ${clickUrl}`,
    ``,
    `---`,
    `Manage alerts: ${SITE_URL}/alerts`,
    `Unsubscribe: ${SITE_URL}/alerts?unsubscribe=${match.alertId}`,
  ].join("\n");
}

// ── Delivery ──

/**
 * Send alert emails for all matches.
 * Groups matches by email to avoid spamming the same user.
 */
export async function deliverAlertEmails(matches: AlertMatch[]): Promise<DeliveryResult[]> {
  if (matches.length === 0) return [];

  const results: DeliveryResult[] = [];

  // Group by email to send one email per user (with best match)
  const byEmail = new Map<string, AlertMatch>();
  for (const match of matches) {
    // Keep the best discount per email
    const existing = byEmail.get(match.email);
    if (!existing || match.offer.effectiveDiscountPct > existing.offer.effectiveDiscountPct) {
      byEmail.set(match.email, match);
    }
  }

  for (const [email, match] of byEmail) {
    try {
      const subject = `${match.offer.brandName} — ${(match.offer.effectiveDiscountPct * 100).toFixed(0)}% off (iGift Alert)`;
      const html = await renderAlertHtml(match);
      const text = renderAlertText(match);

      if (isEmailConfigured) {
        await sendViaResend({ to: email, subject, html, text });
      } else {
        // Dev mode: log to console
        console.log(`[AlertEmail] Would send to ${email}:`, subject);
        console.log(`[AlertEmail] Text preview:\n${text.slice(0, 200)}...`);
      }

      results.push({ alertId: match.alertId, email, success: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[AlertEmail] Failed for ${email}:`, msg);
      results.push({ alertId: match.alertId, email, success: false, error: msg });
    }
  }

  return results;
}

// ── Resend HTTP Transport ──

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}
