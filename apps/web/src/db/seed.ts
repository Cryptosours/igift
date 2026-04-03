import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sources, brands, offers, priceHistory } from "./schema";
import { scoreOffer } from "../lib/scoring";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://igift:igift@localhost:5432/igift";

async function seed() {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("Seeding iGift database...");

  // ── Sources ──
  const [costco, paypalGifts, bitrefill, cardcash, gcx, dundle, eGifter, , , ] =
    await db
      .insert(sources)
      .values([
        {
          name: "Costco",
          slug: "costco",
          url: "https://www.costco.com/gift-cards.html",
          sourceType: "authorized_reseller",
          trustZone: "green",
          hasBuyerProtection: true,
          hasRefundPolicy: true,
          refreshIntervalMinutes: 120,
          contractNotes: "Public product pages. Membership required for purchase.",
        },
        {
          name: "PayPal Digital Gifts",
          slug: "paypal-digital-gifts",
          url: "https://www.paypal.com/us/gifts",
          sourceType: "official_api",
          trustZone: "green",
          hasBuyerProtection: true,
          hasRefundPolicy: true,
          refreshIntervalMinutes: 60,
        },
        {
          name: "Bitrefill",
          slug: "bitrefill",
          url: "https://www.bitrefill.com",
          sourceType: "crypto_store",
          trustZone: "yellow",
          hasBuyerProtection: true,
          hasRefundPolicy: false,
          refreshIntervalMinutes: 30,
          affiliateNetwork: "Bitrefill Affiliate",
          contractNotes: "Affiliate program available. Crypto checkout.",
        },
        {
          name: "CardCash",
          slug: "cardcash",
          url: "https://www.cardcash.com",
          sourceType: "marketplace_resale",
          trustZone: "yellow",
          hasBuyerProtection: true,
          hasRefundPolicy: true,
          refreshIntervalMinutes: 60,
          contractNotes: "Secondary marketplace. 45-day buyer guarantee.",
        },
        {
          name: "GCX",
          slug: "gcx",
          url: "https://gcx.raise.com",
          sourceType: "marketplace_resale",
          trustZone: "yellow",
          hasBuyerProtection: true,
          hasRefundPolicy: true,
          refreshIntervalMinutes: 60,
          contractNotes: "Marketplace. 10% platform fee on savings.",
        },
        {
          name: "dundle",
          slug: "dundle",
          url: "https://www.dundle.com",
          sourceType: "authorized_reseller",
          trustZone: "green",
          hasBuyerProtection: true,
          hasRefundPolicy: false,
          refreshIntervalMinutes: 120,
        },
        {
          name: "eGifter",
          slug: "egifter",
          url: "https://www.egifter.com",
          sourceType: "authorized_reseller",
          trustZone: "green",
          hasBuyerProtection: true,
          hasRefundPolicy: true,
          refreshIntervalMinutes: 120,
          contractNotes: "Official retailer. Flash sales available.",
        },
        {
          name: "Gift Card Granny",
          slug: "giftcardgranny",
          url: "https://www.giftcardgranny.com",
          sourceType: "authorized_reseller",
          trustZone: "green",
          hasBuyerProtection: true,
          hasRefundPolicy: true,
          refreshIntervalMinutes: 120,
          contractNotes: "Aggregator/comparison site. Links to trusted retailers.",
        },
        {
          name: "Gameflip",
          slug: "gameflip",
          url: "https://gameflip.com",
          sourceType: "marketplace_resale",
          trustZone: "yellow",
          hasBuyerProtection: true,
          hasRefundPolicy: true,
          refreshIntervalMinutes: 60,
          contractNotes: "Gaming-focused marketplace. Buyer protection program.",
        },
        {
          name: "BuySellVouchers",
          slug: "buysellvouchers",
          url: "https://www.buysellvouchers.com",
          sourceType: "marketplace_resale",
          trustZone: "yellow",
          hasBuyerProtection: true,
          hasRefundPolicy: false,
          refreshIntervalMinutes: 60,
          contractNotes: "P2P gift card marketplace. 10+ year history, 650K+ monthly tx. 0.5% buyer fee.",
        },
      ])
      .returning();

  console.log(`  Seeded ${10} sources`);

  // ── Brands ──
  const brandRows = await db
    .insert(brands)
    .values([
      { name: "Apple", slug: "apple", category: "app_stores", description: "App Store & iTunes gift cards", regionsSupported: ["US", "EU", "UK", "AU", "CA", "JP"] },
      { name: "Steam", slug: "steam", category: "gaming", description: "Steam Wallet gift cards", regionsSupported: ["US", "EU", "UK", "Global"] },
      { name: "Netflix", slug: "netflix", category: "streaming", description: "Netflix subscription gift cards", regionsSupported: ["US", "EU", "UK", "AU", "Global"] },
      { name: "PlayStation", slug: "playstation", category: "gaming", description: "PlayStation Store gift cards", regionsSupported: ["US", "EU", "UK", "JP"] },
      { name: "Google Play", slug: "google-play", category: "app_stores", description: "Google Play gift cards", regionsSupported: ["US", "EU", "UK", "AU", "Global"] },
      { name: "Amazon", slug: "amazon", category: "retail", description: "Amazon gift cards", regionsSupported: ["US", "UK", "DE", "FR", "CA", "JP"] },
      { name: "Xbox", slug: "xbox", category: "gaming", description: "Xbox gift cards & Game Pass", regionsSupported: ["US", "EU", "UK", "Global"] },
      { name: "Spotify", slug: "spotify", category: "streaming", description: "Spotify Premium gift cards", regionsSupported: ["US", "EU", "UK", "Global"] },
      { name: "Nintendo", slug: "nintendo", category: "gaming", description: "Nintendo eShop gift cards", regionsSupported: ["US", "EU", "JP"] },
      { name: "Uber", slug: "uber", category: "travel", description: "Uber & Uber Eats gift cards", regionsSupported: ["US", "UK", "AU"] },
      { name: "DoorDash", slug: "doordash", category: "food_dining", description: "DoorDash gift cards", regionsSupported: ["US", "CA"] },
      { name: "Disney+", slug: "disney-plus", category: "streaming", description: "Disney+ subscription gift cards", regionsSupported: ["US", "EU", "UK", "AU", "Global"] },
      { name: "eBay", slug: "ebay", category: "retail", description: "eBay gift cards", regionsSupported: ["US"] },
    ])
    .returning();

  console.log(`  Seeded ${brandRows.length} brands`);

  // ── Offers ──
  // Realistic deals with scoring
  const offerData: Array<{
    sourceIdx: number;
    brandIdx: number;
    title: string;
    faceValueCents: number;
    askingPriceCents: number;
    feeCents: number;
    currency: string;
    countries: string[];
    url: string;
  }> = [
    { sourceIdx: 0, brandIdx: 0, title: "Apple Gift Card $100", faceValueCents: 10000, askingPriceCents: 8450, feeCents: 0, currency: "USD", countries: ["US"], url: "https://www.costco.com/apple-gift-card-100.html" },
    { sourceIdx: 0, brandIdx: 0, title: "Apple Gift Card $50", faceValueCents: 5000, askingPriceCents: 4250, feeCents: 0, currency: "USD", countries: ["US"], url: "https://www.costco.com/apple-gift-card-50.html" },
    { sourceIdx: 1, brandIdx: 1, title: "Steam Wallet Card $50", faceValueCents: 5000, askingPriceCents: 4375, feeCents: 0, currency: "USD", countries: ["US", "EU", "Global"], url: "https://www.paypal.com/us/gifts/steam-50" },
    { sourceIdx: 1, brandIdx: 1, title: "Steam Wallet Card $20", faceValueCents: 2000, askingPriceCents: 1800, feeCents: 0, currency: "USD", countries: ["US", "EU", "Global"], url: "https://www.paypal.com/us/gifts/steam-20" },
    { sourceIdx: 2, brandIdx: 2, title: "Netflix Gift Card $60", faceValueCents: 6000, askingPriceCents: 5040, feeCents: 0, currency: "USD", countries: ["US", "Global"], url: "https://www.bitrefill.com/buy/netflix-usa/" },
    { sourceIdx: 2, brandIdx: 4, title: "Google Play $50", faceValueCents: 5000, askingPriceCents: 4400, feeCents: 0, currency: "USD", countries: ["US", "Global"], url: "https://www.bitrefill.com/buy/google-play-usa/" },
    { sourceIdx: 3, brandIdx: 3, title: "PlayStation Store $75", faceValueCents: 7500, askingPriceCents: 6225, feeCents: 0, currency: "USD", countries: ["US"], url: "https://www.cardcash.com/buy-playstation-store-gift-cards/" },
    { sourceIdx: 3, brandIdx: 5, title: "Amazon Gift Card $200", faceValueCents: 20000, askingPriceCents: 18500, feeCents: 0, currency: "USD", countries: ["US"], url: "https://www.cardcash.com/buy-amazon-gift-cards/" },
    { sourceIdx: 4, brandIdx: 5, title: "Amazon Gift Card $100", faceValueCents: 10000, askingPriceCents: 9400, feeCents: 60, currency: "USD", countries: ["US"], url: "https://gcx.raise.com/buy/amazon" },
    { sourceIdx: 5, brandIdx: 6, title: "Xbox Gift Card $50", faceValueCents: 5000, askingPriceCents: 4450, feeCents: 0, currency: "USD", countries: ["US", "EU", "Global"], url: "https://www.dundle.com/us/xbox-gift-card/" },
    { sourceIdx: 5, brandIdx: 7, title: "Spotify Premium $30", faceValueCents: 3000, askingPriceCents: 2610, feeCents: 0, currency: "USD", countries: ["US", "EU", "Global"], url: "https://www.dundle.com/us/spotify-gift-card/" },
    { sourceIdx: 6, brandIdx: 8, title: "Nintendo eShop $35", faceValueCents: 3500, askingPriceCents: 3150, feeCents: 0, currency: "USD", countries: ["US"], url: "https://www.egifter.com/giftcards/nintendo-eshop" },
    { sourceIdx: 6, brandIdx: 11, title: "Disney+ Gift Card $50", faceValueCents: 5000, askingPriceCents: 4350, feeCents: 0, currency: "USD", countries: ["US", "Global"], url: "https://www.egifter.com/giftcards/disney-plus" },
    { sourceIdx: 2, brandIdx: 9, title: "Uber Gift Card $50", faceValueCents: 5000, askingPriceCents: 4500, feeCents: 0, currency: "USD", countries: ["US"], url: "https://www.bitrefill.com/buy/uber-usa/" },
    { sourceIdx: 6, brandIdx: 10, title: "DoorDash Gift Card $50", faceValueCents: 5000, askingPriceCents: 4400, feeCents: 0, currency: "USD", countries: ["US"], url: "https://www.egifter.com/giftcards/doordash" },
  ];

  const sourceArr = [costco, paypalGifts, bitrefill, cardcash, gcx, dundle, eGifter];
  const insertedOffers = [];

  for (const o of offerData) {
    const source = sourceArr[o.sourceIdx];
    const brand = brandRows[o.brandIdx];
    const effectiveCents = o.askingPriceCents + o.feeCents;
    const discountPct = (o.faceValueCents - effectiveCents) / o.faceValueCents;

    const scoring = scoreOffer({
      effectivePriceCents: effectiveCents,
      faceValueCents: o.faceValueCents,
      historicalMedianCents: Math.round(o.faceValueCents * 0.93),
      historicalLowCents: Math.round(o.faceValueCents * 0.82),
      feesKnown: true,
      feeBreakdownAvailable: o.feeCents > 0,
      regionCompatible: true,
      accountRegionRequired: null,
      trustZone: source.trustZone as "green" | "yellow",
      sellerRating: source.trustZone === "green" ? 0.95 : 0.8,
      hasBuyerProtection: source.hasBuyerProtection,
      hasRefundPolicy: source.hasRefundPolicy,
      lastSeenMinutesAgo: Math.floor(Math.random() * 60),
      lastVerifiedMinutesAgo: Math.floor(Math.random() * 120),
      dataSource: source.sourceType === "official_api" ? "official_api" : "affiliate_feed",
      duplicateSourcesAgree: 1,
      totalSources: 2,
      discountPctFromFace: discountPct,
      abnormallyDeep: false,
    });

    const [inserted] = await db
      .insert(offers)
      .values({
        sourceId: source.id,
        brandId: brand.id,
        originalTitle: o.title,
        normalizedTitle: o.title,
        externalUrl: o.url,
        faceValueCents: o.faceValueCents,
        askingPriceCents: o.askingPriceCents,
        feeTotalCents: o.feeCents,
        effectivePriceCents: effectiveCents,
        currency: o.currency,
        effectiveDiscountPct: Math.round(discountPct * 10000) / 10000,
        countryRedeemable: o.countries,
        trustZone: source.trustZone as "green" | "yellow",
        buyerProtectionLevel: source.hasBuyerProtection ? "full" : "none",
        dealQualityScore: scoring.dealQualityScore,
        confidenceScore: scoring.confidenceScore,
        finalScore: scoring.finalScore,
        isHistoricalLow: scoring.isHistoricalLow,
        status: scoring.suppressionReason ? "suppressed" : "active",
        suppressionReason: scoring.suppressionReason,
        provenance: source.sourceType === "official_api" ? "api" : "feed",
      })
      .returning();

    insertedOffers.push(inserted);

    // Add price history entry
    await db.insert(priceHistory).values({
      brandId: brand.id,
      sourceId: source.id,
      denomination: o.title.match(/\$(\d+)/)?.[1] ?? null,
      currency: o.currency,
      country: o.countries[0],
      effectivePriceCents: effectiveCents,
      faceValueCents: o.faceValueCents,
      effectiveDiscountPct: discountPct,
    });
  }

  console.log(`  Seeded ${insertedOffers.length} offers with scores`);
  console.log(`  Seeded ${insertedOffers.length} price history entries`);
  console.log("Done!");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
