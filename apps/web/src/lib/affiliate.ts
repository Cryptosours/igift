import { createHash } from "crypto";
import { db } from "@/db";
import { affiliateClicks, brands, offers, sources } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// ── Affiliate URL Builder ──
// Maps affiliate network slugs to URL construction functions.
// When we sign up for an affiliate program, add the network slug here
// and set affiliateNetwork + affiliateProgramId on the source row.
//
// Two types of builders:
// - Sync builders: simple URL param appending (most networks)
// - Async builders: require server-side API calls (Admitad deeplink)

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

// ── Admitad Deeplink (async) ──
// Admitad requires a server-side OAuth + deeplink API call.
// Ad space ID for igift.app: 2931240

const ADMITAD_AD_SPACE_ID = "2931240";

let admitadTokenCache: { token: string; expiresAt: number } | null = null;

async function getAdmitadToken(): Promise<string> {
  if (admitadTokenCache && Date.now() < admitadTokenCache.expiresAt) {
    return admitadTokenCache.token;
  }

  const base64Header = process.env.ADMITAD_BASE64_HEADER;
  const clientId = process.env.ADMITAD_CLIENT_ID;
  if (!base64Header || !clientId) {
    throw new Error("Admitad credentials not configured");
  }

  const resp = await fetch("https://api.admitad.com/token/", {
    method: "POST",
    headers: {
      Authorization: `Basic ${base64Header}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${clientId}&scope=deeplink_generator advcampaigns_for_website statistics`,
  });

  if (!resp.ok) {
    throw new Error(`Admitad token request failed: ${resp.status}`);
  }

  const data = await resp.json();
  admitadTokenCache = {
    token: data.access_token,
    // Refresh 1 hour before actual expiry for safety
    expiresAt: Date.now() + (data.expires_in - 3600) * 1000,
  };
  return data.access_token;
}

/** Generate an Admitad tracking link via their deeplink API.
 *  programId = Admitad campaign ID (e.g. "24298" for Kinguin WW).
 *  subId = our internal offer ID for conversion attribution. */
async function buildAdmitadDeeplink(
  productUrl: string,
  programId: string,
  subId?: string,
): Promise<string> {
  const token = await getAdmitadToken();
  const params = new URLSearchParams({
    ulp: productUrl,
    ...(subId && { subid: subId }),
  });

  const resp = await fetch(
    `https://api.admitad.com/deeplink/${ADMITAD_AD_SPACE_ID}/advcampaign/${programId}/?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!resp.ok) {
    console.error(`[affiliate] Admitad deeplink failed: ${resp.status}`);
    // Fallback: return raw URL with utm tracking
    return appendParam(productUrl, "utm_source", "igift");
  }

  const data = await resp.json();
  return data[0]?.raw_link ?? data.link ?? appendParam(productUrl, "utm_source", "igift");
}

/** Build the outbound affiliate URL for a source.
 *  Returns the raw externalUrl if no affiliate program is configured.
 *  Now async to support Admitad deeplink API calls. */
export async function buildAffiliateUrl(
  externalUrl: string,
  affiliateNetwork: string | null,
  affiliateProgramId: string | null,
  offerId?: number,
): Promise<string> {
  if (!affiliateNetwork || !affiliateProgramId) {
    // No affiliate config: add at minimum a utm_source for analytics
    return appendParam(externalUrl, "utm_source", "igift");
  }

  // Admitad requires a server-side API call for deeplinks
  if (affiliateNetwork === "admitad") {
    try {
      return await buildAdmitadDeeplink(
        externalUrl,
        affiliateProgramId,
        offerId?.toString(),
      );
    } catch (err) {
      console.error("[affiliate] Admitad deeplink error:", err);
      return appendParam(externalUrl, "utm_source", "igift");
    }
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
  brandSlug: string | null;
  effectiveDiscountPct: number | null;
  externalUrl: string;
  sourceUrl: string;
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
      brandSlug: brands.slug,
      effectiveDiscountPct: offers.effectiveDiscountPct,
      externalUrl: offers.externalUrl,
      sourceUrl: sources.url,
      status: offers.status,
      affiliateNetwork: sources.affiliateNetwork,
      affiliateProgramId: sources.affiliateProgramId,
    })
    .from(offers)
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .leftJoin(brands, eq(offers.brandId, brands.id))
    .where(eq(offers.id, offerId))
    .limit(1);

  if (!row || row.status === "suppressed" || row.status === "expired") {
    return null;
  }

  return {
    offerId: row.offerId,
    sourceId: row.sourceId,
    brandId: row.brandId,
    brandSlug: row.brandSlug ?? null,
    effectiveDiscountPct: row.effectiveDiscountPct ?? null,
    externalUrl: row.externalUrl,
    sourceUrl: row.sourceUrl,
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
