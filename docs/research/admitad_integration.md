# Admitad Affiliate Network — Integration Guide

> Researched: 2026-04-09
> Status: API connected, credentials stored, no programs joined yet

---

## Account Details

- **Publisher ID:** 2521679
- **Username:** sami_khorasanib9a56
- **Ad Space ID:** 2931240 (igift.app — verified ✅)
- **Ad Space Type:** affiliate_store
- **Credentials:** Stored in credmgr (ADMITAD_CLIENT_ID, ADMITAD_CLIENT_SECRET, ADMITAD_BASE64_HEADER)

---

## API Authentication

**OAuth2 Client Credentials flow:**

```bash
curl -X POST https://api.admitad.com/token/ \
  -H "Authorization: Basic $ADMITAD_BASE64_HEADER" \
  -d "grant_type=client_credentials&client_id=$ADMITAD_CLIENT_ID&scope=advcampaigns advcampaigns_for_website deeplink_generator statistics coupons public_data websites"
```

- Tokens last **7 days** (604,800 seconds)
- Refresh via POST with refresh_token
- Rate limit: **600 requests/minute**

---

## Key Programs to Join

| Program | Admitad ID | Commission | EPC | CR | Cookie | Deeplink | Feed |
|---------|-----------|------------|-----|-----|--------|----------|------|
| **Kinguin WW** | 24298 | ~5% new / 2.5% returning | $2.00 | 3.51% | 30 days | ✅ | ✅ |
| **Eneba** | TBD | Standard CPA | TBD | TBD | TBD | TBD | TBD |

**Action required:** Join programs via Admitad dashboard (API attach endpoint is deprecated/410 Gone).

---

## Revenue Flow

1. User clicks "Get Deal" on iGift deal card
2. iGift calls Admitad deeplink API: `GET /deeplink/{w_id}/advcampaign/{c_id}/?ulp={product_url}&subid={offer_id}`
3. iGift logs click internally + redirects user to Admitad tracking URL
4. Admitad sets attribution cookie (Last Cookie Wins)
5. User purchases on advertiser site → Admitad records conversion
6. Hold period (~65 days for Kinguin) → conversion approved
7. Payout via bank/PayPal/Payoneer (min ~$10-20)

---

## Key API Endpoints

### Deeplink Generator (core for iGift)
```
GET /deeplink/{w_id}/advcampaign/{c_id}/?ulp={product_url}&subid={offer_id}
```
- Pass any product page URL → get tracked affiliate link
- `subid` maps back to iGift's internal offer ID
- Up to 200 URLs per request

### Programs
```
GET /advcampaigns/                           # Browse catalog
GET /advcampaigns/{id}/                      # Program details
GET /advcampaigns/website/{w_id}/            # Connected programs
```

### Statistics
```
GET /statistics/campaigns/                   # By advertiser
GET /statistics/dates/                       # Daily breakdown
GET /statistics/actions/                     # Individual conversions
GET /statistics/sub_ids/                     # By subid (our offer IDs)
```

### Product Feeds
Programs with `show_products_links: true` expose:
- `products_xml_link` — XML product feed URL
- `products_csv_link` — CSV product feed URL
- Contains: product name, price, URL, image, category, availability

### Coupons
```
GET /coupons/website/{w_id}/                 # Active coupons for our ad space
```

---

## Integration Architecture

### affiliate.ts Enhancement
The current `AFFILIATE_BUILDERS` pattern (simple URL param append) won't work for Admitad.
Admitad requires a **server-side API call** to generate the tracking link:

```typescript
// New: admitad builder needs API call
admitad: async (url, programId) => {
  const token = await getAdmitadToken();
  const resp = await fetch(`https://api.admitad.com/deeplink/2931240/advcampaign/${programId}/?ulp=${encodeURIComponent(url)}&subid=${offerId}`);
  const data = await resp.json();
  return data.link;
}
```

This means the affiliate URL builder needs to become **async** for Admitad.

### Token Management
- Cache access_token with TTL (7 days)
- Refresh before expiry
- Store in server memory or Redis

### Click Flow
1. `/api/click/[offerId]` route already exists
2. For Admitad sources: call deeplink API server-side
3. Redirect user to returned tracking URL
4. Log click with subid mapping

---

## Scopes Needed

```
advcampaigns advcampaigns_for_website deeplink_generator statistics
coupons coupons_for_website public_data opt_codes manage_opt_codes
validate_links short_link private_data_balance websites
```

---

## Kinguin WW Rules (Important)

- ❌ Brand bidding PROHIBITED (no "kinguin" keyword in ads)
- ❌ Email/SMS promotion PROHIBITED
- ❌ Unauthorized coupon codes PROHIBITED
- ❌ Browser plugins/extensions on kinguin.net PROHIBITED
- ✅ Comparison shopping / deal aggregation ALLOWED
- ✅ Content/editorial promotion ALLOWED

---

## Next Steps

1. **Join Kinguin WW (#24298)** via Admitad dashboard
2. **Search for Eneba** on Admitad dashboard (may have different name)
3. **Build async deeplink builder** in affiliate.ts
4. **Add token caching** (server-side, 7-day TTL)
5. **Set up postback webhook** for real-time conversion tracking
6. **Ingest Kinguin product feed** once approved
7. **Add Admitad env vars** to VPS .env.local

---

*This research supports PRODUCTION_PLAN.md Phase 14 tasks.*
