# Blocked Adapters — API & Affiliate Access Research

> Researched: 2026-04-09
> Status: Findings documented, no applications submitted yet

---

## Summary

All 4 blocked adapters (G2A, CDKeys/Loaded, OffGamers, GiftCardGranny) use aggressive anti-bot protection that prevents public page scraping. Each has a legitimate data access path — affiliate programs and/or merchant APIs — but none provide free, unauthenticated product data APIs.

| Vendor | Block Reason | Best Access Path | Effort | Priority |
|--------|-------------|-----------------|--------|----------|
| **G2A** | 177s timeout, anti-bot | G2A Goldmine affiliate (5% rev share) | Low — signup is self-service | High |
| **CDKeys/Loaded** | Rebranded, 403 Cloudflare | Awin affiliate (#30147) + "Super Affiliate" API | Medium — Awin approval + API request | High |
| **OffGamers** | All fetches fail, anti-bot | OffGamers affiliate program | Medium — manual application | Medium |
| **GiftCardGranny** | Aggressive 403 on all pages | Partner/affiliate API | High — no public program found | Low |

---

## Detailed Findings

### 1. G2A (g2a.com)

**Current status:** Adapter built for 15 products, all fetches fail with 177-second timeouts.

**Access paths:**
- **G2A Goldmine** — Self-service referral/affiliate program. Earn ~5% commission on referred sales. Provides referral links but NOT a product data feed.
- **G2A Integration API** — Exists for sellers/merchants to manage their listings programmatically. Requires a G2A seller account. Not intended for price comparison or data aggregation.
- **No public product data API** — G2A does not offer a free product search or pricing API for third parties.

**Recommended approach:**
1. Sign up for G2A Goldmine to get affiliate status
2. Request data feed access through the affiliate relationship
3. If no feed available, explore the seller API as a read-only data source (may require a nominal seller account)

**Revenue potential:** 5% commission on referred purchases

---

### 2. CDKeys / Loaded.com (cdkeys.com → loaded.com)

**Current status:** Adapter built for 24 products. Site rebranded from CDKeys to Loaded.com. All pages return 403 behind Cloudflare.

**Access paths:**
- **Awin affiliate network** — CDKeys/Loaded is listed as advertiser #30147 on Awin. Standard affiliate program with referral links.
- **"Super Affiliate" API** — Available through INRDeals partnership tier. Provides product data feeds and real-time pricing. Requires higher traffic thresholds.
- **No public API** — Loaded.com does not offer a self-service product data API.

**Recommended approach:**
1. Apply to Awin network (if not already a member)
2. Apply for CDKeys/Loaded advertiser (#30147)
3. Once approved, request product data feed access
4. If basic affiliate doesn't include feeds, escalate to "Super Affiliate" tier

**Revenue potential:** Standard affiliate commission (typically 3-8%)

---

### 3. OffGamers (offgamers.com)

**Current status:** Adapter built for 17 products. All product page fetches fail due to anti-bot protection.

**Access paths:**
- **OffGamers affiliate program** — Manual application process through their website. Provides referral links and potentially a product catalog.
- **No public API documented** — No developer docs or public API found.

**Recommended approach:**
1. Apply through OffGamers affiliate program page
2. Request product data access upon approval
3. Lower priority — OffGamers has significant product overlap with Dundle and Bitrefill

**Revenue potential:** Unknown commission structure until application

---

### 4. Gift Card Granny (giftcardgranny.com)

**Current status:** Adapter built for 13 products. Aggressive anti-bot protection returns 403 on all pages.

**Access paths:**
- **No public affiliate program found** — Gift Card Granny appears to operate as a comparison aggregator themselves, similar to iGift's model.
- **Partnership/API** — Would require direct business development contact.
- **Competitor overlap** — As a gift card comparison site, their data would be secondary (they aggregate from the same sources we already index).

**Recommended approach:**
1. Deprioritize — high effort, low incremental value since they aggregate from sources we already track
2. If pursued, reach out directly for a data partnership
3. Consider monitoring their social/blog for any developer program announcements

**Revenue potential:** Likely none — they are a competitor, not a vendor

---

## Also Researched (Active Adapters — Enhancement)

### Kinguin (kinguin.net) — Currently Active

**Access paths:**
- **Affiliate program** — Available on Awin and Admitad networks
- **No public product data API** — Kinguin does not offer a REST API for product search
- **Current adapter works** — Public page scraping is functional with 41 products tracked

**Action:** Apply for affiliate program to earn commission on referrals. No API needed since scraping works.

### Eneba (eneba.com) — Currently Active

**Access paths:**
- **GraphQL API** — Exists but restricted to merchants/sellers for inventory management
- **Separate affiliate program** — Standard referral commission
- **Current adapter works** — Public page scraping is functional with 37 products tracked

**Action:** Apply for affiliate program. GraphQL API not useful for our read-only use case unless we get partner access.

---

## Action Items

1. **Immediate (self-service):**
   - [ ] Sign up for G2A Goldmine affiliate program
   - [ ] Apply to Awin network for CDKeys/Loaded (#30147)
   - [ ] Apply for Kinguin affiliate on Awin/Admitad
   - [ ] Apply for Eneba affiliate program

2. **Short-term (manual applications):**
   - [ ] Apply for OffGamers affiliate program
   - [ ] Request product data feeds from G2A Goldmine

3. **Deprioritized:**
   - [ ] Gift Card Granny — only pursue if they launch a developer/partner program

---

*This research supports PRODUCTION_PLAN.md tasks 11.9, 12.4, and 12.5.*
