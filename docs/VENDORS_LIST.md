# iGift — Vendors List (Data Sources)

> Complete inventory of all sources iGift indexes, scrapes, or pulls deal data from.
> Last updated: 2026-04-08

---

## Active Adapters (Live Pipeline)

These sources have working adapters and are actively fetched during each ingestion cycle (every 2 hours via cron).

| # | Vendor | URL | Trust Zone | Type | Method | Categories | Adapter File |
|---|--------|-----|------------|------|--------|------------|--------------|
| 1 | **Bitrefill** | bitrefill.com | Yellow | Crypto Store | API/Public Pages | Gaming, streaming, retail, telecom | `adapters/bitrefill.ts` |
| 2 | **Dundle** | dundle.com | Green | Authorized Reseller | Public Pages | Gaming, streaming, apps, retail | `adapters/dundle.ts` |
| 3 | **Raise (GCX)** | gcx.raise.com | Yellow | Marketplace | Public Pages | Retail, dining, entertainment | `adapters/raise.ts` |
| 4 | **Gameflip** | gameflip.com | Yellow | Marketplace | Public Pages | Gaming (Steam, Xbox, PSN, Nintendo) | `adapters/gameflip.ts` |
| 5 | **BuySellVouchers** | buysellvouchers.com | Yellow | P2P Marketplace | Public Pages | Gaming, streaming, retail, apps | `adapters/buysellvouchers.ts` |

**Last live ingest**: 202 offers upserted from 4 working sources, 22 deal clusters detected.

---

## Blocked Adapters (Need API/Affiliate Access)

These adapters are built but disabled due to anti-bot protection or site changes. Each needs affiliate/API partnership to reactivate.

| # | Vendor | URL | Trust Zone | Block Reason | Path to Fix |
|---|--------|-----|------------|-------------|-------------|
| 6 | **CDKeys** (now Loaded.com) | cdkeys.com / loaded.com | Green | Rebranded to Loaded.com. 403 behind Cloudflare | Affiliate API partnership |
| 7 | **Eneba** | eneba.com | Yellow | SPA — prices loaded client-side only | Affiliate API (affiliate.eneba.com) |
| 8 | **G2A** | g2a.com | Yellow | 177s timeout, all fetches fail (anti-bot) | G2A Goldmine affiliate API |
| 9 | **Kinguin** | kinguin.net | Yellow | All product fetches failing (anti-bot) | Kinguin affiliate API |
| 10 | **OffGamers** | offgamers.com | Yellow | All product fetches fail (anti-bot) | OffGamers affiliate program |
| 11 | **Gift Card Granny** | giftcardgranny.com | Green | All pages 403 (aggressive anti-bot) | Partner/affiliate API |

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

| Category | Count | Status |
|----------|-------|--------|
| Active (live pipeline) | 5 | Fetching every 2h |
| Blocked (need API) | 6 | Adapters built, disabled |
| Catalog (manual) | 9 | Data curated, awaiting DB wiring |
| **Total vendors** | **20** | |

## Trust Zone Distribution

| Zone | Count | Description |
|------|-------|-------------|
| Green (Verified) | 12 | Authorized retailers, official stores |
| Yellow (Marketplace) | 8 | Reputable secondary markets with buyer protection |
| Red (Excluded) | 0 | None indexed — per policy |

## Brands Covered

22 brands seeded in production DB: Amazon, Apple, Disney+, eBay, Google Play, Netflix, Nintendo, PlayStation, Spotify, Steam, Uber, Xbox, and more across gaming, streaming, retail, food/delivery, and app store categories.

---

*Adapter source code: `apps/web/src/lib/ingest/adapters/`*
*Orchestrator: `apps/web/src/lib/ingest/orchestrator.ts`*
*Seed data: `apps/web/src/db/seed.ts`*
