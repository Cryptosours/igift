# iGift — Vendors List (Data Sources)

> Complete inventory of all sources iGift indexes, scrapes, or pulls deal data from.
> Last updated: 2026-04-09

---

## Active Adapters (Live Pipeline)

These sources have working adapters and are actively fetched during each ingestion cycle (every 2 hours via cron).

| # | Vendor | URL | Trust Zone | Type | Products Tracked | Method | Adapter File |
|---|--------|-----|------------|------|-----------------|--------|--------------|
| 1 | **Bitrefill** | bitrefill.com | Yellow | Crypto Store | 32 | API/Public Pages | `adapters/bitrefill.ts` |
| 2 | **Dundle** | dundle.com | Green | Authorized Reseller | 28 | Public Pages | `adapters/dundle.ts` |
| 3 | **Raise (GCX)** | gcx.raise.com | Yellow | Marketplace | 19 | Public Pages | `adapters/raise.ts` |
| 4 | **Gameflip** | gameflip.com | Yellow | Marketplace | 11 | Public Pages | `adapters/gameflip.ts` |
| 5 | **BuySellVouchers** | buysellvouchers.com | Yellow | P2P Marketplace | 48 | API/Public Pages | `adapters/buysellvouchers.ts` |
| 6 | **Eneba** | eneba.com | Yellow | Marketplace | 37 | Public Pages | `adapters/eneba.ts` |
| 7 | **Kinguin** | kinguin.net | Yellow | Marketplace | 41 | Public Pages | `adapters/kinguin.ts` |

**Total active products tracked: 216**

---

## Blocked Adapters (Need API/Affiliate Access)

These adapters are built but disabled due to anti-bot protection or site changes. Each needs affiliate/API partnership to reactivate.

| # | Vendor | URL | Trust Zone | Products Built | Block Reason | Path to Fix |
|---|--------|-----|------------|---------------|-------------|-------------|
| 8 | **CDKeys** (now Loaded.com) | cdkeys.com / loaded.com | Green | 24 | Rebranded to Loaded.com. 403 behind Cloudflare | Affiliate API partnership |
| 9 | **G2A** | g2a.com | Yellow | 15 | 177s timeout, all fetches fail (anti-bot) | G2A Goldmine affiliate API |
| 10 | **OffGamers** | offgamers.com | Yellow | 17 | All product fetches fail (anti-bot) | OffGamers affiliate program |
| 11 | **Gift Card Granny** | giftcardgranny.com | Green | 13 | All pages 403 (aggressive anti-bot) | Partner/affiliate API |

---

## Catalog Sources (Manual — Awaiting DB Entries)

These sources have catalog adapters with manually curated deal data. They are built but not yet wired into the orchestrator (Task 8.12: need DB source entries).

| # | Vendor | URL | Trust Zone | Type | Notes |
|---|--------|-----|------------|------|-------|
| 12 | **Costco** | costco.com/gift-cards.html | Green | Authorized Reseller | Membership required. Apple, Netflix, Xbox deals manually verified |
| 13 | **eGifter** | egifter.com | Green | Authorized Reseller | Flash sales. Official retailer |
| 14 | **CardCash** | cardcash.com | Yellow | Secondary Marketplace | 45-day buyer guarantee |
| 15 | **PayPal Digital Gifts** | paypal.com/us/gifts | Green | Official | Direct from PayPal |
| 16 | **Best Buy** | bestbuy.com | Green | Authorized Reseller | Major US retailer |
| 17 | **Target** | target.com | Green | Authorized Reseller | Major US retailer |
| 18 | **Newegg** | newegg.com | Green | Authorized Reseller | Electronics/gaming focus |
| 19 | **Walmart** | walmart.com | Green | Authorized Reseller | Major US retailer |
| 20 | **GameStop** | gamestop.com | Green | Authorized Reseller | Gaming focus |

---

## Summary

| Category | Count | Products | Status |
|----------|-------|----------|--------|
| Active (live pipeline) | 7 | 216 | Fetching every 2h |
| Blocked (need API) | 4 | 69 | Adapters built, disabled |
| Catalog (manual) | 9 | — | Data curated, awaiting DB wiring |
| **Total vendors** | **20** | **285+** | |

## Trust Zone Distribution

| Zone | Count | Description |
|------|-------|-------------|
| Green (Verified) | 10 | Authorized retailers, official stores |
| Yellow (Marketplace) | 10 | Reputable secondary markets with buyer protection |
| Red (Excluded) | 0 | None indexed — per policy |

## Brands Covered

26 brands seeded in production DB: Amazon, Apple, Disney+, eBay, Fortnite, Free Fire, Google Play, Netflix, Nintendo, PlayStation, PUBG, Riot Access, Spotify, Steam, Uber, Xbox, and more across gaming, streaming, retail, food/delivery, and app store categories.

## Phase 11 Expansion (2026-04-08)

Major adapter scale-up:
- BuySellVouchers V2: 48 products, 7 currencies, pagination, 1% fee correction
- Eneba: expanded from 15 → 37 products, re-enabled in orchestrator
- Kinguin: expanded from 17 → 41 products, re-enabled in orchestrator
- Bitrefill: expanded from 12 → 32 products (added gaming + EU/UK)
- Dundle: expanded from 11 → 28 products (added gaming + EU/UK)
- Raise: expanded from 12 → 19 products (added gaming + retail)
- 4 new brands added: Fortnite, PUBG, Free Fire, Riot Access

## Phase 13 Pricing Integrity (2026-04-09)

All offers now pass through overpriced filtering at both ingestion and query time. Offers where effectivePrice > faceValue (after FX conversion) are never shown. "iGift, the real discount."

---

*Adapter source code: `apps/web/src/lib/ingest/adapters/`*
*Orchestrator: `apps/web/src/lib/ingest/orchestrator.ts`*
*Seed data: `apps/web/src/db/seed.ts`*
