/**
 * /admin — Moderation Queue
 *
 * Server Component that queries the database directly.
 * Shows open moderation cases and flagged offers.
 */

import { db } from "@/db";
import {
  moderationCases,
  offers,
  sources,
  brands,
} from "@/db/schema";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { getHealthReport, type SourceHealth, type HealthStatus } from "@/lib/health";
import { getRevalidationReport, type RevalidationReport } from "@/lib/revalidation";

export const dynamic = "force-dynamic";

// ── Data Fetching ──

async function getStatusSummary() {
  const rows = await db
    .select({
      status: moderationCases.status,
      count: count(),
    })
    .from(moderationCases)
    .groupBy(moderationCases.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.count])) as Record<string, number>;
}

async function getOpenCases() {
  return db
    .select({
      id: moderationCases.id,
      caseType: moderationCases.caseType,
      description: moderationCases.description,
      status: moderationCases.status,
      createdAt: moderationCases.createdAt,
      offerId: moderationCases.offerId,
      offerTitle: offers.originalTitle,
      offerDiscount: offers.effectiveDiscountPct,
      offerTrustZone: offers.trustZone,
      sourceName: sources.name,
      brandName: brands.name,
    })
    .from(moderationCases)
    .leftJoin(offers, eq(moderationCases.offerId, offers.id))
    .leftJoin(sources, eq(moderationCases.sourceId, sources.id))
    .leftJoin(brands, eq(offers.brandId, brands.id))
    .where(eq(moderationCases.status, "open"))
    .orderBy(desc(moderationCases.createdAt))
    .limit(100);
}

async function getFlaggedOffers() {
  return db
    .select({
      id: offers.id,
      title: offers.originalTitle,
      effectiveDiscountPct: offers.effectiveDiscountPct,
      dealQualityScore: offers.dealQualityScore,
      confidenceScore: offers.confidenceScore,
      trustZone: offers.trustZone,
      suppressionReason: offers.suppressionReason,
      lastSeenAt: offers.lastSeenAt,
      brandName: brands.name,
      sourceName: sources.name,
      sourceSlug: sources.slug,
    })
    .from(offers)
    .innerJoin(brands, eq(offers.brandId, brands.id))
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .where(eq(offers.status, "pending_review"))
    .orderBy(desc(offers.updatedAt))
    .limit(50);
}

async function getRecentResolved() {
  return db
    .select({
      id: moderationCases.id,
      caseType: moderationCases.caseType,
      resolution: moderationCases.resolution,
      resolvedAt: moderationCases.resolvedAt,
      offerTitle: offers.originalTitle,
      sourceName: sources.name,
    })
    .from(moderationCases)
    .leftJoin(offers, eq(moderationCases.offerId, offers.id))
    .leftJoin(sources, eq(moderationCases.sourceId, sources.id))
    .where(eq(moderationCases.status, "resolved"))
    .orderBy(desc(moderationCases.resolvedAt))
    .limit(20);
}

// ── Helpers ──

function timeAgo(date: Date | null): string {
  if (!date) return "—";
  const ms = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const caseTypeLabels: Record<string, { label: string; color: string }> = {
  suspicious_discount: { label: "Suspicious Discount", color: "bg-red-100 text-red-800" },
  new_source: { label: "New Source", color: "bg-blue-100 text-blue-800" },
  missing_region: { label: "Missing Region", color: "bg-yellow-100 text-yellow-800" },
  stale_data: { label: "Stale Data", color: "bg-gray-100 text-gray-800" },
  manual_report: { label: "Manual Report", color: "bg-purple-100 text-purple-800" },
  fraud_report: { label: "Fraud Report", color: "bg-red-200 text-red-900" },
  price_anomaly: { label: "Price Anomaly", color: "bg-orange-100 text-orange-800" },
  invalid_code: { label: "Invalid Code", color: "bg-red-100 text-red-700" },
  merchant_complaint: { label: "Merchant Complaint", color: "bg-pink-100 text-pink-800" },
};

const trustZoneColors: Record<string, string> = {
  green: "text-green-600",
  yellow: "text-yellow-600",
  red: "text-red-600",
};

function healthStatusStyle(status: HealthStatus): string {
  switch (status) {
    case "healthy": return "bg-green-100 text-green-800";
    case "degraded": return "bg-yellow-100 text-yellow-800";
    case "unhealthy": return "bg-red-100 text-red-800";
    case "unknown": return "bg-gray-100 text-gray-600";
  }
}

// ── Page Component ──

export default async function AdminModerationPage() {
  let summary: Record<string, number> = {};
  let openCases: Awaited<ReturnType<typeof getOpenCases>> = [];
  let flaggedOffers: Awaited<ReturnType<typeof getFlaggedOffers>> = [];
  let recentResolved: Awaited<ReturnType<typeof getRecentResolved>> = [];
  let healthReport: Awaited<ReturnType<typeof getHealthReport>> | null = null;
  let revalidationReport: RevalidationReport | null = null;

  try {
    [summary, openCases, flaggedOffers, recentResolved, healthReport, revalidationReport] = await Promise.all([
      getStatusSummary(),
      getOpenCases(),
      getFlaggedOffers(),
      getRecentResolved(),
      getHealthReport(),
      getRevalidationReport(),
    ]);
  } catch {
    return (
      <div className="text-red-600 p-8">
        <h1 className="text-xl font-bold mb-2">Database Connection Error</h1>
        <p>Could not connect to the database. Make sure PostgreSQL is running.</p>
      </div>
    );
  }

  const totalOpen = summary.open ?? 0;
  const totalResolved = summary.resolved ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Moderation Queue</h1>
        <p className="text-surface-500 text-sm mt-1">
          Review flagged offers, resolve cases, and manage data quality.
        </p>
      </div>

      {/* Source Health Dashboard */}
      {healthReport && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-800">
              Source Health
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${healthStatusStyle(healthReport.overall)}`}>
                {healthReport.overall.toUpperCase()}
              </span>
            </h2>
            <div className="flex gap-2 text-xs text-surface-400">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> {healthReport.summary.healthy} healthy</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> {healthReport.summary.degraded} degraded</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> {healthReport.summary.unhealthy} unhealthy</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400" /> {healthReport.summary.unknown} unknown</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Trust</th>
                  <th className="px-4 py-3 text-left">Freshness</th>
                  <th className="px-4 py-3 text-left">SLA</th>
                  <th className="px-4 py-3 text-left">Success Rate</th>
                  <th className="px-4 py-3 text-left">Offers</th>
                  <th className="px-4 py-3 text-left">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {healthReport.sources.map((s) => (
                  <tr key={s.slug} className={`hover:bg-surface-50 ${s.isStale ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-surface-800">{s.name}</div>
                      <div className="text-xs text-surface-400 font-mono">{s.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${healthStatusStyle(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${trustZoneColors[s.trustZone] ?? ""}`}>
                        {s.trustZone}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {s.minutesSinceSuccess !== null ? `${s.minutesSinceSuccess}m ago` : "never"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {s.slaMinutes}m
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.successRate >= 0.8 ? "bg-green-500" : s.successRate >= 0.5 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${Math.round(s.successRate * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{(s.successRate * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.activeOfferCount}</td>
                    <td className="px-4 py-3 text-xs text-surface-500 max-w-[250px] truncate">
                      {s.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Offer Lifecycle / Revalidation */}
      {revalidationReport && (
        <section>
          <h2 className="text-lg font-semibold text-surface-800 mb-4">Offer Lifecycle</h2>
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-surface-500 text-xs uppercase tracking-wider">Active</div>
              <div className="text-3xl font-bold mt-1 text-green-600">{revalidationReport.statusCounts.active}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-surface-500 text-xs uppercase tracking-wider">Stale</div>
              <div className="text-3xl font-bold mt-1 text-yellow-600">{revalidationReport.statusCounts.stale}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-surface-500 text-xs uppercase tracking-wider">Expired</div>
              <div className="text-3xl font-bold mt-1 text-red-600">{revalidationReport.statusCounts.expired}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-surface-500 text-xs uppercase tracking-wider">At Risk</div>
              <div className="text-3xl font-bold mt-1 text-orange-600">{revalidationReport.atRiskCount}</div>
              <div className="text-xs text-surface-400 mt-1">&gt;50% through SLA</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-surface-500 text-xs uppercase tracking-wider">Cleanup</div>
              <div className="text-3xl font-bold mt-1 text-surface-400">{revalidationReport.cleanupCandidates}</div>
              <div className="text-xs text-surface-400 mt-1">30+ days unseen</div>
            </div>
          </div>

          {/* Per-source staleness breakdown */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-right">Active</th>
                  <th className="px-4 py-3 text-right">Stale</th>
                  <th className="px-4 py-3 text-right">Expired</th>
                  <th className="px-4 py-3 text-right">Oldest Unseen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {revalidationReport.sourceStaleness.map((s) => (
                  <tr key={s.sourceSlug} className="hover:bg-surface-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-surface-800">{s.sourceName}</div>
                      <div className="text-xs text-surface-400 font-mono">{s.sourceSlug}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-green-600">{s.activeOffers}</td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-600">{s.staleOffers}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">{s.expiredOffers}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-surface-500">
                      {s.oldestLastSeenMinutes != null
                        ? s.oldestLastSeenMinutes < 60
                          ? `${s.oldestLastSeenMinutes}m`
                          : s.oldestLastSeenMinutes < 1440
                            ? `${Math.round(s.oldestLastSeenMinutes / 60)}h`
                            : `${Math.round(s.oldestLastSeenMinutes / 1440)}d`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Moderation Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="Open Cases" value={totalOpen} color="text-red-600" />
        <SummaryCard label="Flagged Offers" value={flaggedOffers.length} color="text-yellow-600" />
        <SummaryCard label="Resolved" value={totalResolved} color="text-green-600" />
        <SummaryCard
          label="Total Cases"
          value={totalOpen + totalResolved + (summary.dismissed ?? 0)}
          color="text-surface-600"
        />
      </div>

      {/* Open Cases Table */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">
          Open Cases ({openCases.length})
        </h2>
        {openCases.length === 0 ? (
          <EmptyState message="No open moderation cases. The queue is clean." />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Offer</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Trust</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {openCases.map((c) => {
                  const typeInfo = caseTypeLabels[c.caseType] ?? {
                    label: c.caseType,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr key={c.id} className="hover:bg-surface-50">
                      <td className="px-4 py-3 font-mono text-xs">#{c.id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-surface-800 truncate max-w-[200px]">
                          {c.offerTitle ?? "—"}
                        </div>
                        {c.brandName && (
                          <div className="text-xs text-surface-400">{c.brandName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-surface-600">{c.sourceName ?? "—"}</td>
                      <td className="px-4 py-3 font-mono">
                        {c.offerDiscount != null
                          ? `${(c.offerDiscount * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${trustZoneColors[c.offerTrustZone ?? ""] ?? ""}`}>
                          {c.offerTrustZone ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-surface-400 text-xs">
                        {timeAgo(c.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Flagged Offers */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">
          Flagged Offers — Pending Review ({flaggedOffers.length})
        </h2>
        {flaggedOffers.length === 0 ? (
          <EmptyState message="No offers pending review." />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Offer</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Quality</th>
                  <th className="px-4 py-3 text-left">Confidence</th>
                  <th className="px-4 py-3 text-left">Trust</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {flaggedOffers.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-surface-800 truncate max-w-[180px] block">
                        {o.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-600">{o.brandName}</td>
                    <td className="px-4 py-3 text-surface-600">{o.sourceName}</td>
                    <td className="px-4 py-3 font-mono">
                      {(o.effectiveDiscountPct * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono">{o.dealQualityScore ?? "—"}</td>
                    <td className="px-4 py-3 font-mono">{o.confidenceScore ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${trustZoneColors[o.trustZone]}`}>
                        {o.trustZone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500 max-w-[200px] truncate">
                      {o.suppressionReason ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recently Resolved */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">
          Recently Resolved ({recentResolved.length})
        </h2>
        {recentResolved.length === 0 ? (
          <EmptyState message="No resolved cases yet." />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Offer</th>
                  <th className="px-4 py-3 text-left">Resolution</th>
                  <th className="px-4 py-3 text-left">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentResolved.map((c) => {
                  const typeInfo = caseTypeLabels[c.caseType] ?? {
                    label: c.caseType,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr key={c.id} className="hover:bg-surface-50">
                      <td className="px-4 py-3 font-mono text-xs">#{c.id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-surface-700">{c.offerTitle ?? "—"}</td>
                      <td className="px-4 py-3 text-surface-600 text-xs max-w-[250px] truncate">
                        {c.resolution}
                      </td>
                      <td className="px-4 py-3 text-surface-400 text-xs">
                        {timeAgo(c.resolvedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* API Reference */}
      <section className="bg-surface-50 rounded-lg p-6 text-sm text-surface-600">
        <h3 className="font-semibold text-surface-800 mb-2">API Reference</h3>
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div>GET /api/admin/health</div>
          <div className="text-surface-400">Source health report (SLAs, freshness, success rates)</div>
          <div>POST /api/admin/health</div>
          <div className="text-surface-400">Mark offers from stale sources as stale</div>
          <div>GET /api/admin/revalidation</div>
          <div className="text-surface-400">Offer lifecycle report (staleness, expiry, at-risk)</div>
          <div>POST /api/admin/revalidation</div>
          <div className="text-surface-400">Run revalidation cycle (stale + expire offers)</div>
          <div>GET /api/admin/killswitch</div>
          <div className="text-surface-400">Kill switch state (global, per-source, per-category)</div>
          <div>POST /api/admin/killswitch</div>
          <div className="text-surface-400">Execute kill switch (type, action, target, reason)</div>
          <div>GET /api/admin/moderation?status=open</div>
          <div className="text-surface-400">List cases (filter by status, type)</div>
          <div>POST /api/admin/moderation</div>
          <div className="text-surface-400">Create case (caseType, description, offerId)</div>
          <div>PATCH /api/admin/moderation/[id]</div>
          <div className="text-surface-400">Resolve case (action: approve/suppress/dismiss)</div>
          <div>PATCH /api/admin/moderation/offers/[id]</div>
          <div className="text-surface-400">Direct offer action (approve/suppress/mark_stale)</div>
        </div>
        <p className="mt-3 text-xs text-surface-400">
          All endpoints require <code className="bg-surface-200 px-1 rounded">Authorization: Bearer ADMIN_API_KEY</code>
        </p>
      </section>
    </div>
  );
}

// ── Sub-components ──

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-surface-500 text-xs uppercase tracking-wider">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center text-surface-400">
      {message}
    </div>
  );
}
