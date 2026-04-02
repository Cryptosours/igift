/**
 * Source Adapter Types
 *
 * Every source adapter implements the SourceAdapter interface.
 * Adapters are thin: fetch + parse into RawOffer[].
 * Business logic (scoring, dedup, suppression) lives in the pipeline.
 */

/** Raw offer as extracted from a source, before normalization */
export interface RawOffer {
  /** Source-specific unique identifier for dedup */
  externalId: string;
  /** Original listing title as displayed on source */
  originalTitle: string;
  /** Direct URL to the offer on the source */
  externalUrl: string;
  /** Brand name as listed on source (may be messy — normalization resolves this) */
  rawBrandName: string;
  /** Face value in the source's currency (smallest unit, e.g. cents) */
  faceValueCents: number;
  /** Asking/sale price in smallest unit */
  askingPriceCents: number;
  /** Known fees in smallest unit (0 if no fees or unknown) */
  feeTotalCents: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Denomination label if available (e.g. "$50", "€25") */
  denomination: string | null;
  /** Countries where the card is redeemable (ISO 3166-1 alpha-2) */
  countryRedeemable: string[];
  /** Seller name if marketplace */
  sellerName: string | null;
  /** Seller rating 0-1 if available */
  sellerRating: number | null;
  /** Whether the source provides buyer protection for this offer */
  hasBuyerProtection: boolean;
  /** Raw snapshot of the source data (for audit/dispute) */
  rawSnapshot: Record<string, unknown>;
}

/** Configuration for a source adapter */
export interface AdapterConfig {
  /** Source slug (matches sources table) */
  sourceSlug: string;
  /** Whether to actually fetch or just return cached/mock data */
  dryRun?: boolean;
  /** Request timeout in ms */
  timeoutMs?: number;
}

/** Result from a source adapter fetch */
export interface AdapterResult {
  sourceSlug: string;
  offers: RawOffer[];
  fetchedAt: Date;
  /** Duration of the fetch in ms */
  durationMs: number;
  /** Errors encountered (non-fatal — some offers may still be returned) */
  warnings: string[];
  /** If true, the entire fetch failed */
  failed: boolean;
  failureReason?: string;
}

/** Interface that every source adapter must implement */
export interface SourceAdapter {
  /** Human-readable name */
  name: string;
  /** Must match a source slug in the sources table */
  sourceSlug: string;
  /** Fetch current offers from this source */
  fetchOffers(config?: Partial<AdapterConfig>): Promise<AdapterResult>;
}
