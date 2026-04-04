import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  serial,
  real,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ── Enums ──

export const trustZoneEnum = pgEnum("trust_zone", ["green", "yellow", "red"]);

export const sourceTypeEnum = pgEnum("source_type", [
  "official_api",
  "affiliate_feed",
  "authorized_reseller",
  "marketplace_resale",
  "crypto_store",
  "deal_community",
  "public_page",
]);

export const offerStatusEnum = pgEnum("offer_status", [
  "active",
  "stale",
  "suppressed",
  "expired",
  "pending_review",
]);

export const categoryEnum = pgEnum("category", [
  "gaming",
  "app_stores",
  "streaming",
  "retail",
  "food_dining",
  "travel",
  "telecom",
  "other",
]);

// ── Sources ──
// A source is a website, API, or feed that provides deal data.

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull(),
  trustZone: trustZoneEnum("trust_zone").notNull().default("yellow"),
  isActive: boolean("is_active").notNull().default(true),
  // Data access metadata
  refreshIntervalMinutes: integer("refresh_interval_minutes").notNull().default(60),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
  fetchSuccessRate: real("fetch_success_rate").default(1.0),
  // Trust signals
  hasBuyerProtection: boolean("has_buyer_protection").notNull().default(false),
  hasRefundPolicy: boolean("has_refund_policy").notNull().default(false),
  // Compliance
  contractNotes: text("contract_notes"),
  allowedFields: jsonb("allowed_fields"),
  // Affiliate
  affiliateNetwork: text("affiliate_network"),
  affiliateProgramId: text("affiliate_program_id"),
  // Meta
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Brands ──
// A brand is a canonical gift card issuer (Apple, Steam, Netflix, etc.)

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: categoryEnum("category").notNull().default("other"),
  description: text("description"),
  // Aliases for matching messy source data
  aliases: jsonb("aliases").$type<string[]>().default([]),
  // Region info
  regionsSupported: jsonb("regions_supported").$type<string[]>().default([]),
  // Meta
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Offers ──
// An offer is a specific deal from a source for a brand at a point in time.
// ALL monetary values are in CENTS (integer) to avoid floating-point issues.

export const offers = pgTable(
  "offers",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id").notNull().references(() => sources.id),
    brandId: integer("brand_id").notNull().references(() => brands.id),
    // Original listing data
    originalTitle: text("original_title").notNull(),
    normalizedTitle: text("normalized_title"),
    externalUrl: text("external_url").notNull(),
    externalId: text("external_id"),
    // Pricing — ALL IN CENTS
    faceValueCents: integer("face_value_cents").notNull(),
    askingPriceCents: integer("asking_price_cents").notNull(),
    feeTotalCents: integer("fee_total_cents").notNull().default(0),
    effectivePriceCents: integer("effective_price_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    denomination: text("denomination"),
    // Discount
    effectiveDiscountPct: real("effective_discount_pct").notNull(),
    // Region and compatibility
    countryRedeemable: jsonb("country_redeemable").$type<string[]>().default([]),
    accountRegionRequired: text("account_region_required"),
    resaleRestrictionFlag: boolean("resale_restriction_flag").notNull().default(false),
    // Source trust (inherited + offer-specific)
    trustZone: trustZoneEnum("trust_zone").notNull(),
    buyerProtectionLevel: text("buyer_protection_level"),
    sellerRating: real("seller_rating"),
    sellerName: text("seller_name"),
    // Scoring — dual score system
    dealQualityScore: integer("deal_quality_score"),
    confidenceScore: integer("confidence_score"),
    finalScore: real("final_score"),
    // Status and freshness
    status: offerStatusEnum("status").notNull().default("active"),
    suppressionReason: text("suppression_reason"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    isHistoricalLow: boolean("is_historical_low").notNull().default(false),
    // Payment info
    paymentMethods: jsonb("payment_methods").$type<string[]>(),
    // Meta
    provenance: text("provenance").notNull().default("manual"),
    rawSnapshot: jsonb("raw_snapshot"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_offers_brand").on(table.brandId),
    index("idx_offers_source").on(table.sourceId),
    index("idx_offers_status").on(table.status),
    index("idx_offers_score").on(table.finalScore),
    index("idx_offers_trust_zone").on(table.trustZone),
    uniqueIndex("idx_offers_external").on(table.sourceId, table.externalId),
  ],
);

// ── Price History ──
// Tracks effective price over time for each offer key (brand + denomination + region + source).

export const priceHistory = pgTable(
  "price_history",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").notNull().references(() => brands.id),
    sourceId: integer("source_id").notNull().references(() => sources.id),
    denomination: text("denomination"),
    currency: text("currency").notNull().default("USD"),
    country: text("country"),
    effectivePriceCents: integer("effective_price_cents").notNull(),
    faceValueCents: integer("face_value_cents").notNull(),
    effectiveDiscountPct: real("effective_discount_pct").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_ph_brand_denom").on(table.brandId, table.denomination, table.currency),
    index("idx_ph_recorded").on(table.recordedAt),
  ],
);

// ── User Alerts ──
// Price alert subscriptions.

export const userAlerts = pgTable("user_alerts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  brandId: integer("brand_id").references(() => brands.id),
  category: categoryEnum("category"),
  targetDiscountPct: real("target_discount_pct"),
  region: text("region"),
  deliveryChannel: text("delivery_channel").notNull().default("email"),
  isActive: boolean("is_active").notNull().default(true),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Source Requests ──
// Users can request tracking of new sources/brands.

export const sourceRequests = pgTable("source_requests", {
  id: serial("id").primaryKey(),
  requestedUrl: text("requested_url"),
  requestedBrand: text("requested_brand"),
  requestedRegion: text("requested_region"),
  requesterEmail: text("requester_email"),
  status: text("status").notNull().default("pending"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Moderation Cases ──
// For fraud reports, invalid code reports, merchant complaints.

export const moderationCases = pgTable("moderation_cases", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").references(() => offers.id),
  sourceId: integer("source_id").references(() => sources.id),
  caseType: text("case_type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

// ── Affiliate Clicks ──
// Tracks every outbound click for attribution and analytics.
// IP is stored as a SHA-256 hash (never raw) for privacy compliance.

export const affiliateClicks = pgTable(
  "affiliate_clicks",
  {
    id: serial("id").primaryKey(),
    offerId: integer("offer_id").references(() => offers.id),
    sourceId: integer("source_id").references(() => sources.id),
    brandId: integer("brand_id").references(() => brands.id),
    // Attribution context
    referrerPage: text("referrer_page"), // /deals, /brands/steam, /categories/gaming, etc.
    userAgentHash: text("user_agent_hash"), // hashed for fingerprinting without storing raw UA
    ipHash: text("ip_hash"), // SHA-256 hashed IP — never raw
    // The URL the user was sent to
    destinationUrl: text("destination_url"),
    // Affiliate context at time of click
    affiliateNetwork: text("affiliate_network"),
    affiliateProgramId: text("affiliate_program_id"),
    clickedAt: timestamp("clicked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_clicks_offer").on(table.offerId),
    index("idx_clicks_source").on(table.sourceId),
    index("idx_clicks_clicked_at").on(table.clickedAt),
  ],
);

// ── Watchlist Items ──
// Anonymous session-based brand watchlist. Session ID is a UUID cookie set on first visit.

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    brandId: integer("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_watchlist_session_brand").on(table.sessionId, table.brandId),
    index("idx_watchlist_session").on(table.sessionId),
  ],
);

// ── Sponsored Placements ──
// Brands can purchase a featured placement in deal/brand listings.
// We boost POSITION only — never scores, never trust data.
// All sponsored items carry mandatory "Sponsored" disclosure (FTC compliance).

export const placementTypeEnum = pgEnum("placement_type", [
  "featured_deal",   // top of /deals listing
  "featured_brand",  // featured row on /brands listing
]);

export const sponsoredPlacements = pgTable("sponsored_placements", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  placementType: placementTypeEnum("placement_type").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Type exports for application use ──

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type PriceHistoryRecord = typeof priceHistory.$inferSelect;
export type UserAlert = typeof userAlerts.$inferSelect;
export type SourceRequest = typeof sourceRequests.$inferSelect;
export type ModerationCase = typeof moderationCases.$inferSelect;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type SponsoredPlacement = typeof sponsoredPlacements.$inferSelect;
