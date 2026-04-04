import { NextRequest, NextResponse } from "next/server";
import { buildAffiliateUrl, getClickTarget, logClick } from "@/lib/affiliate";

// Rate limiting: max 30 click-throughs per IP per minute (simple in-memory, resets on restart)
// For production scale, use Redis or Upstash. This covers the MVP case.
const clickRateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = clickRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    clickRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 30;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const { offerId: offerIdStr } = await params;
  const offerId = parseInt(offerIdStr, 10);

  if (isNaN(offerId) || offerId <= 0) {
    return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
  }

  // IP extraction (Cloudflare passes CF-Connecting-IP; fall back to X-Forwarded-For)
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Fetch offer + source affiliate config
  const target = await getClickTarget(offerId);

  if (!target) {
    // Offer not found / suppressed — redirect to home rather than 404
    return NextResponse.redirect(new URL("/deals", request.url), 302);
  }

  // Build the destination URL with affiliate tracking params
  const destinationUrl = buildAffiliateUrl(
    target.externalUrl,
    target.affiliateNetwork,
    target.affiliateProgramId,
  );

  // Log click fire-and-forget (never blocks redirect)
  logClick({
    offerId: target.offerId,
    sourceId: target.sourceId,
    brandId: target.brandId,
    destinationUrl,
    affiliateNetwork: target.affiliateNetwork,
    affiliateProgramId: target.affiliateProgramId,
    referer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
    ip,
  });

  // 302 redirect to the affiliate URL
  // Use 302 (not 301) so browser doesn't cache — prices and URLs change
  return NextResponse.redirect(destinationUrl, {
    status: 302,
    headers: {
      // Prevent the affiliate site from seeing our full URL in the Referer header
      "Referrer-Policy": "no-referrer",
    },
  });
}
