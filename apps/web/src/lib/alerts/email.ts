/**
 * Email Alert Delivery
 *
 * Sends deal alert emails via Resend REST API (zero dependencies).
 * Configure via env vars:
 *
 *   RESEND_API_KEY — Resend API key (https://resend.com)
 *   EMAIL_FROM — sender address (default: alerts@igift.app)
 *
 * If RESEND_API_KEY is not set, logs emails to console (dev mode).
 */

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

function renderEmailHtml(match: AlertMatch): string {
  const o = match.offer;
  const discountPct = (o.effectiveDiscountPct * 100).toFixed(1);
  const faceValue = formatCents(o.faceValueCents, o.currency);
  const effectivePrice = formatCents(o.effectivePriceCents, o.currency);
  const trustColor = o.trustZone === "green" ? "#22c55e" : "#eab308";
  const trustLabel = o.trustZone === "green" ? "Verified Source" : "Marketplace";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:20px;color:#1e293b;">iGift Deal Alert</h1>
    </div>

    <!-- Deal Card -->
    <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:24px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${trustColor};"></span>
        <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">${trustLabel} &middot; ${o.sourceName}</span>
      </div>

      <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">${o.brandName}</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#475569;">${o.title}</p>

      <div style="display:flex;gap:24px;margin-bottom:16px;">
        <div>
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;">Face Value</div>
          <div style="font-size:16px;font-weight:600;color:#334155;">${faceValue}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;">Your Price</div>
          <div style="font-size:16px;font-weight:600;color:#059669;">${effectivePrice}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;">Discount</div>
          <div style="font-size:16px;font-weight:700;color:#059669;">${discountPct}% off</div>
        </div>
      </div>

      <a href="${o.externalUrl}" rel="noopener noreferrer nofollow" style="display:block;text-align:center;background:#c15f3c;color:#fff;padding:12px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        View Deal &rarr;
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:11px;color:#94a3b8;">
      <p>You're receiving this because you set a price alert on <a href="${SITE_URL}" style="color:#d97757;">iGift</a>.</p>
      <p><a href="${SITE_URL}/alerts" style="color:#d97757;">Manage alerts</a> &middot; <a href="${SITE_URL}/alerts?unsubscribe=${match.alertId}" style="color:#d97757;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`.trim();
}

function renderEmailText(match: AlertMatch): string {
  const o = match.offer;
  const discountPct = (o.effectiveDiscountPct * 100).toFixed(1);
  const faceValue = formatCents(o.faceValueCents, o.currency);
  const effectivePrice = formatCents(o.effectivePriceCents, o.currency);

  return [
    `iGift Deal Alert`,
    ``,
    `${o.brandName} — ${o.title}`,
    `Face Value: ${faceValue}`,
    `Your Price: ${effectivePrice} (${discountPct}% off)`,
    `Source: ${o.sourceName} (${o.trustZone} zone)`,
    ``,
    `View deal: ${o.externalUrl}`,
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
      const html = renderEmailHtml(match);
      const text = renderEmailText(match);

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
