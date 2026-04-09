import { createHash } from "crypto";
import { db } from "@/db";
import { affiliateClicks, offers, sources } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// ── Affiliate URL Builder ──
// Maps affiliate network slugs to URL construction functions.
// When we sign up for an affiliate program, add the network slug here
// and set affiliateNetwork + affiliateProgramId on the source row.

type UrlBuilder = (baseUrl: string, programId: string) => string;

const AFFILIATE_BUILDERS: Record<string, UrlBuilder> = {
  bitrefill: (url, id) => appendParam(url, "ref", id),
  dundle: (url, id) => appendParam(url, "affCode", id),
  raise: (url, id) => appendParam(url, "rfsn", id),
  giftcardgranny: (url, id) => appendParam(url, "aff", id),
  gameflip: (url, id) => appendParam(url, "referral", id),
  buysellvouchers: (url, id) => appendParam(url, "ref", id),
  g2a_goldmine: (url, id) => appendParam(url, "ref", id),
  // Generic: appends utm_source=igift for any unknown network with an ID
  generic: (url, id) => appendParam(appendParam(url, "utm_source", "igift"), "aff_id", id),
};

function appendParam(url: string, key: string, value: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

/** Build the outbound affiliate URL for a source.
 *  Returns the raw externalUrl if no affiliate program is configured. */
export function buildAffiliateUrl(
  externalUrl: string,
  affiliateNetwork: string | null,
  affiliateProgramId: string | null,
): string {
  if (!affiliateNetwork || !affiliateProgramId) {
    // No affiliate config: add at minimum a utm_source for analytics
    return appendParam(externalUrl, "utm_source", "igift");
  }

  const builder = AFFILIATE_BUILDERS[affiliateNetwork] ?? AFFILIATE_BUILDERS.generic;
  const withAffiliate = builder(externalUrl, affiliateProgramId);
  // Always tag with utm_source so Google Analytics/etc. can attribute traffic
  return appendParam(withAffiliate, "utm_source", "igift");
}

// ── Privacy Helpers ──

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Extract a normalised page path from a full Referer header URL.
 *  e.g. "https://igift.app/brands/steam?q=foo" → "/brands/steam" */
function extractRefererPage(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname;
  } catch {
    return referer.slice(0, 255); // keep raw but cap length
  }
}

// ── Click Logger ──

export interface ClickContext {
  offerId: number;
  destinationUrl: string;
  affiliateNetwork: string | null;
  affiliateProgramId: string | null;
  sourceId: number;
  brandId: number;
  referer: string | null;
  userAgent: string | null;
  ip: string | null;
}

/** Log an outbound click to the affiliate_clicks table.
 *  Fire-and-forget — errors are caught so they never block the redirect. */
export async function logClick(ctx: ClickContext): Promise<void> {
  try {
    await db.insert(affiliateClicks).values({
      offerId: ctx.offerId,
      sourceId: ctx.sourceId,
      brandId: ctx.brandId,
      referrerPage: extractRefererPage(ctx.referer),
      userAgentHash: ctx.userAgent ? sha256(ctx.userAgent) : null,
      ipHash: ctx.ip ? sha256(ctx.ip) : null,
      destinationUrl: ctx.destinationUrl,
      affiliateNetwork: ctx.affiliateNetwork,
      affiliateProgramId: ctx.affiliateProgramId,
    });
  } catch (err) {
    // Never let a logging failure block the redirect
    console.error("[affiliate] Click log failed:", err);
  }
}

// ── Offer Lookup ──

export interface ClickTarget {
  offerId: number;
  sourceId: number;
  brandId: number;
  externalUrl: string;
  affiliateNetwork: string | null;
  affiliateProgramId: string | null;
}

/** Fetch the data needed to build the affiliate redirect for a given offer ID.
 *  Returns null if the offer doesn't exist or is suppressed. */
export async function getClickTarget(offerId: number): Promise<ClickTarget | null> {
  const [row] = await db
    .select({
      offerId: offers.id,
      sourceId: offers.sourceId,
      brandId: offers.brandId,
      externalUrl: offers.externalUrl,
      status: offers.status,
      affiliateNetwork: sources.affiliateNetwork,
      affiliateProgramId: sources.affiliateProgramId,
    })
    .from(offers)
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .where(eq(offers.id, offerId))
    .limit(1);

  if (!row || row.status === "suppressed" || row.status === "expired") {
    return null;
  }

  return {
    offerId: row.offerId,
    sourceId: row.sourceId,
    brandId: row.brandId,
    externalUrl: row.externalUrl,
    affiliateNetwork: row.affiliateNetwork,
    affiliateProgramId: row.affiliateProgramId,
  };
}

// ── Click Stats ──

/** Total clicks, grouped by source or brand, for admin dashboard. */
export async function getClickStats(): Promise<{
  total: number;
  last24h: number;
  last7d: number;
  topSources: { sourceId: number; sourceName: string; clicks: number }[];
}> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalResult = await db.execute<{ total: string }>(sql`
    SELECT COUNT(*) AS total FROM affiliate_clicks
  `);
  const last24hResult = await db.execute<{ total: string }>(sql`
    SELECT COUNT(*) AS total FROM affiliate_clicks WHERE clicked_at >= ${yesterday}
  `);
  const last7dResult = await db.execute<{ total: string }>(sql`
    SELECT COUNT(*) AS total FROM affiliate_clicks WHERE clicked_at >= ${lastWeek}
  `);
  const topSourcesResult = await db.execute<{
    source_id: number;
    source_name: string;
    clicks: string;
  }>(sql`
    SELECT ac.source_id, s.name AS source_name, COUNT(*) AS clicks
    FROM affiliate_clicks ac
    JOIN sources s ON s.id = ac.source_id
    WHERE ac.clicked_at >= ${lastWeek}
    GROUP BY ac.source_id, s.name
    ORDER BY clicks DESC
    LIMIT 5
  `);

  const totalRow =
    Array.isArray(totalResult) && totalResult.length > 0 ? totalResult[0] : null;
  const last24hRow =
    Array.isArray(last24hResult) && last24hResult.length > 0 ? last24hResult[0] : null;
  const last7dRow =
    Array.isArray(last7dResult) && last7dResult.length > 0 ? last7dResult[0] : null;
  const topSources = Array.isArray(topSourcesResult) ? topSourcesResult : [];

  return {
    total: Number((totalRow as { total?: string } | null)?.total ?? 0),
    last24h: Number((last24hRow as { total?: string } | null)?.total ?? 0),
    last7d: Number((last7dRow as { total?: string } | null)?.total ?? 0),
    topSources: topSources.map((r) => {
      const row = r as { source_id: number; source_name: string; clicks: string };
      return {
        sourceId: row.source_id,
        sourceName: row.source_name,
        clicks: Number(row.clicks),
      };
    }),
  };
}
