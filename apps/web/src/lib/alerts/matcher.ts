/**
 * Alert Matching Engine
 *
 * After ingestion, matches active user alerts against newly upserted offers.
 * An alert matches an offer when:
 * - Brand matches (or alert has no brand filter = matches all)
 * - Category matches (or alert has no category filter)
 * - Discount meets or exceeds the target (or no target set)
 * - Region matches (or alert has no region filter)
 * - Offer is active and in green/yellow trust zone
 *
 * Rate limiting: each alert can only fire once per 24 hours (lastSentAt check).
 */

import { db } from "@/db";
import { userAlerts, offers, brands, sources } from "@/db/schema";
import { eq, and, or, isNull, lt, sql } from "drizzle-orm";

// ── Types ──

export interface AlertMatch {
  alertId: number;
  email: string;
  deliveryChannel: string;
  offer: {
    id: number;
    title: string;
    brandName: string;
    brandSlug: string;
    sourceName: string;
    effectiveDiscountPct: number;
    faceValueCents: number;
    effectivePriceCents: number;
    currency: string;
    trustZone: string;
    externalUrl: string;
  };
}

// ── Configuration ──

/** Minimum hours between alerts to the same email for the same alert */
const ALERT_COOLDOWN_HOURS = 24;


// ── Matching Logic ──

/**
 * Find all alert-offer matches for offers updated in the current ingestion run.
 * Pass `offerIds` to scope matching to just-upserted offers.
 */
export async function matchAlerts(offerIds?: number[]): Promise<AlertMatch[]> {
  const cooldownThreshold = new Date(Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000);

  // Get all active alerts that haven't fired recently
  const activeAlerts = await db
    .select({
      id: userAlerts.id,
      email: userAlerts.email,
      brandId: userAlerts.brandId,
      category: userAlerts.category,
      targetDiscountPct: userAlerts.targetDiscountPct,
      region: userAlerts.region,
      deliveryChannel: userAlerts.deliveryChannel,
      lastSentAt: userAlerts.lastSentAt,
    })
    .from(userAlerts)
    .where(
      and(
        eq(userAlerts.isActive, true),
        or(
          isNull(userAlerts.lastSentAt),
          lt(userAlerts.lastSentAt, cooldownThreshold),
        ),
      ),
    );

  if (activeAlerts.length === 0) return [];

  // Get eligible offers (active, green/yellow zone)
  const offerConditions = [
    eq(offers.status, "active"),
    or(eq(offers.trustZone, "green"), eq(offers.trustZone, "yellow")),
  ];

  // If scoped to specific offers, add that filter
  if (offerIds && offerIds.length > 0) {
    // Use sql`IN` for the id list
    offerConditions.push(
      sql`${offers.id} IN (${sql.join(offerIds.map((id) => sql`${id}`), sql`, `)})`,
    );
  }

  const eligibleOffers = await db
    .select({
      id: offers.id,
      brandId: offers.brandId,
      title: offers.normalizedTitle,
      originalTitle: offers.originalTitle,
      effectiveDiscountPct: offers.effectiveDiscountPct,
      faceValueCents: offers.faceValueCents,
      effectivePriceCents: offers.effectivePriceCents,
      currency: offers.currency,
      trustZone: offers.trustZone,
      externalUrl: offers.externalUrl,
      countryRedeemable: offers.countryRedeemable,
      brandName: brands.name,
      brandSlug: brands.slug,
      brandCategory: brands.category,
      sourceName: sources.name,
    })
    .from(offers)
    .innerJoin(brands, eq(offers.brandId, brands.id))
    .innerJoin(sources, eq(offers.sourceId, sources.id))
    .where(and(...offerConditions));

  if (eligibleOffers.length === 0) return [];

  // Match alerts to offers
  const matches: AlertMatch[] = [];

  for (const alert of activeAlerts) {
    for (const offer of eligibleOffers) {
      // Brand filter
      if (alert.brandId !== null && alert.brandId !== offer.brandId) continue;

      // Category filter
      if (alert.category !== null && alert.category !== offer.brandCategory) continue;

      // Discount threshold
      if (alert.targetDiscountPct !== null && offer.effectiveDiscountPct < alert.targetDiscountPct) continue;

      // Region filter
      if (alert.region !== null) {
        const redeemable = offer.countryRedeemable as string[] | null;
        if (!redeemable || !redeemable.includes(alert.region)) continue;
      }

      matches.push({
        alertId: alert.id,
        email: alert.email,
        deliveryChannel: alert.deliveryChannel,
        offer: {
          id: offer.id,
          title: offer.title ?? offer.originalTitle,
          brandName: offer.brandName,
          brandSlug: offer.brandSlug,
          sourceName: offer.sourceName,
          effectiveDiscountPct: offer.effectiveDiscountPct,
          faceValueCents: offer.faceValueCents,
          effectivePriceCents: offer.effectivePriceCents,
          currency: offer.currency,
          trustZone: offer.trustZone,
          externalUrl: offer.externalUrl,
        },
      });

      // One match per alert per cycle is enough (best offer wins)
      break;
    }
  }

  return matches;
}

/**
 * Mark alerts as sent (update lastSentAt) after successful delivery.
 */
export async function markAlertsSent(alertIds: number[]): Promise<void> {
  if (alertIds.length === 0) return;

  for (const id of alertIds) {
    await db
      .update(userAlerts)
      .set({ lastSentAt: new Date() })
      .where(eq(userAlerts.id, id));
  }
}
