# Decision document: automated digital-value deals platform

## 1. Executive summary

### What the opportunity is

There is a real market for lawful digital-value products online: official and authorized sellers distribute gift cards, top-ups, and prepaid digital credits at scale; B2B suppliers expose APIs for digital rewards and catalog access; and large communities already surface deals in real time. The market is not empty. It is fragmented across authorized retailers and distributors such as Recharge/Coda, dundle, Codashop, OffGamers, Bitrefill and PayPal Digital Gifts; secondary marketplaces such as GCX, CardCash and Gameflip; B2B supply rails such as Tango, Tremendous, Runa, Blackhawk and InComm; and discovery communities such as Slickdeals, Dealabs/Pepper and OzBargain. ([recharge.com](https://www.recharge.com/))

### Whether it is viable

**Viable, but only in a restricted operating model.** The strongest version is **not** a marketplace, escrow layer, or payment intermediary. It is a **data, discovery, verification, and referral platform** focused on green-zone inventory: authorized or clearly lawful digital gift cards, credits, and vouchers, plus a tightly controlled yellow-zone layer for reputable resale marketplaces. That model benefits from existing supplier APIs and partner rails, avoids touching funds, and sidesteps much of the AML, stored-value, and processor risk that appears when you broker or resell value yourself. ([docs.raise.com](https://docs.raise.com/))

### Biggest risks

The main failure modes are not product UX; they are **compliance, source fragility, and monetization quality**. First, many issuers impose region and resale restrictions on gift cards and account credits, so a naive “cheapest code wins” engine will mislead users and accumulate complaints. Second, protected sites increasingly use bot defenses from Cloudflare, Akamai, and DataDome, which makes broad scraping expensive and brittle. Third, processor and marketplace risk rises sharply if you broker stored value, support account resale, or drift into credential-linked gray markets. Fourth, ad-network compatibility degrades quickly if inventory mixes in gambling, adult-linked payment vouchers, misleading listings, or fraud-heavy categories. ([support.google.com](https://support.google.com/googleplay/answer/3422734?hl=en))

### Best business model

The strongest business model is **hybrid affiliate + premium alerts/subscriptions + later B2B/API licensing**, with sponsored placements only after trust controls are mature. Ads are a weak primary model here because the most lucrative long-tail categories are often the least brand-safe, and Shopping/merchant rules also narrow what can be promoted, especially open-loop prepaid cards. A referral layer is materially safer than owning checkout or settlement. ([bitrefill.com](https://www.bitrefill.com/affiliate/?hl=en))

### Strong recommendation

**Proceed with restrictions.**  
Build a **green-zone-only MVP** first: authorized/official or clearly reputable digital gift cards, app-store credits, and game top-ups, with rigorous region-fit and trust labeling. Do **not** start with account resale, open-loop prepaid cards, adult/gambling-linked payment vouchers, or any model that touches customer funds, holds value, or intermediates settlement. The opportunity is real; the full “scrape all websites and rank all digital deals” vision is not the right opening move. ([support.google.com](https://support.google.com/googleplay/answer/3422734?hl=en))

---

## 2. Market map

Below is the practical market structure. **Trust level is my operator inference** based on whether the source is official/authorized, whether it relies on third-party sellers, and whether the underlying category is itself policy-sensitive.

| Category | Examples | Geography / language | Data accessibility | Anti-bot posture | Commercial relevance | Trust level |
|---|---|---|---|---|---|---|
| Authorized digital gift card / prepaid sellers | Recharge/Coda, dundle, Codashop, OffGamers, SEAGM, PayPal Digital Gifts | Global / multilingual; Codashop says 50+ countries; dundle and Bitrefill localize heavily. ([recharge.com](https://www.recharge.com/)) | Public catalogs; some partner/API routes; limited direct structured data. ([docs.raise.com](https://docs.raise.com/)) | Moderate to high on major sites if scraped at scale; assume defenses. ([cloudflare.com](https://www.cloudflare.com/application-services/products/bot-management/)) | High | Higher |
| Crypto-funded digital goods sellers | Bitrefill, Coinsbee | Global / highly localized country pages. ([bitrefill.com](https://www.bitrefill.com/)) | Public catalogs; affiliate exists at Bitrefill. ([bitrefill.com](https://www.bitrefill.com/affiliate/?hl=en)) | Moderate | Medium to high | Medium |
| Secondary gift card marketplaces | GCX, CardCash, Gameflip | Primarily EN/global. ([gcx.raise.com](https://gcx.raise.com/)) | Public listings; inventory churn; seller-level variation. | Moderate to high | High, but noisier | Medium |
| Broad third-party digital marketplaces | G2A, Eneba, G2G | Global / multilingual. ([g2a.com](https://www.g2a.com/)) | Public listings but high heterogeneity. | High | High traffic, high risk | Medium to low |
| B2B digital rewards / distribution rails | Tango, Tremendous, Runa, Blackhawk, InComm, Giftbit, Prezzee | Enterprise/global. ([tangocard.com](https://www.tangocard.com/reward-program-api)) | Best access: APIs, enterprise partnerships, catalog feeds. | Low if partnered | Very high | High |
| Deal communities | Slickdeals, Dealabs, OzBargain, Pepper network brands | US, FR, AU, broader Europe. Pepper says 11 countries. ([play.google.com](https://play.google.com/store/apps/details?hl=en&id=net.slickdeals.android)) | Public pages, RSS-like discovery behavior, noisy but excellent signal for fresh deals. | Low to moderate | High for discovery, not canonical pricing | Medium |
| Regional specialists | Cardtonic (Africa), localized Bitrefill/Codashop/SEAGM pages | Africa, Asia, LatAm, MENA, country pages. ([cardtonic.com](https://cardtonic.com/)) | Mixed; often public catalogs. | Moderate | Useful for regional arbitrage and localization | Medium |
| High-risk adjacent | Account markets, credential-linked listings, manual gifting services | Global | Public listings exist, but underlying activity is often prohibited by issuer/platform rules. ([riotgames.com](https://www.riotgames.com/en/terms-of-service)) | High | High apparent demand, poor risk-adjusted quality | Low |

### Practical takeaways from the map

The market is already sliced into three separate businesses: **distribution**, **resale**, and **discovery**. That separation matters. Distribution businesses optimize catalog depth and compliance; resale businesses optimize spread and liquidation; deal communities optimize discovery velocity. The whitespace is in combining these into a **trust-scored, region-aware discovery layer** without taking custody of value. That is the gap worth pursuing. ([tangocard.com](https://www.tangocard.com/reward-program-api))

---

## 3. Competitive landscape

### Existing businesses closest to the concept

1. **GCX / CardCash / Gameflip**: closest to the “discounted digital-value marketplace” concept. They surface discounted cards and secondary inventory, but they are still transaction-centric marketplaces rather than independent verification engines. GCX explicitly positions itself as a discount gift-card marketplace; Gameflip mixes gift cards with broader digital inventory and highlights buyer protection and seller activity. ([gcx.raise.com](https://gcx.raise.com/))

2. **Recharge/Coda, dundle, Codashop, OffGamers, Bitrefill**: closest to the lawful distribution side. They are strong at catalog, payment methods, region-specific pages, and direct checkout. They are not broad cross-market verifiers. ([recharge.com](https://www.recharge.com/))

3. **Slickdeals / Dealabs / OzBargain / Pepper network**: closest to crowd-powered discovery and ranking. They are strong at surfacing deals quickly, but they do not operate a rigorous structured “real discount” engine for digital-value products specifically. ([play.google.com](https://play.google.com/store/apps/details?hl=en&id=net.slickdeals.android))

4. **Tango / Tremendous / Runa / Blackhawk / InComm**: closest to the supplier layer you would want behind the scenes. These are infrastructure companies, not consumer comparison engines. ([tangocard.com](https://www.tangocard.com/reward-program-api))

### What they do well

They already prove four important things:  
- consumer demand for digital-value products is large and persistent;  
- catalogs can be global and multilingual;  
- enterprise APIs for rewards and digital value exist;  
- community ranking can outperform pure editorial curation for fresh deals. ([nrf.com](https://nrf.com/blog/gift-cards-gain-popularity-as-top-choice-for-holiday-shoppers-in-2025))

### What they do poorly

They leave major operator pain unsolved:  
- **region compatibility** is often buried in fine print;  
- **real discount quality** is inconsistent because face value alone is a bad benchmark;  
- **cross-site comparison** is weak;  
- **resale marketplaces** tend to blend trustworthy and noisy inventory;  
- **gray-market adjacency** weakens brand safety and monetization quality. ([support.google.com](https://support.google.com/googleplay/answer/3422734?hl=en))

### Where the whitespace is

**Inference:** I did not find a scaled consumer product that combines all of the following in one disciplined system:  
1. cross-source aggregation across authorized sellers and reputable resale venues,  
2. rigorous historical and reference-price verification,  
3. region/account compatibility scoring,  
4. fraud and policy risk labeling, and  
5. user-requested source tracking for specific sites, brands, or categories.  
The market is split; your opportunity is to be the **verification and discovery layer**, not another checkout layer. ([gcx.raise.com](https://gcx.raise.com/))

---

## 4. Legality, compliance, and platform-policy risk

### Operator view

This concept becomes dangerous when it stops being a **publisher/referrer** and starts acting like a **merchant, broker, reseller, or facilitator of restricted value flows**. Stripe flags sale of stored value or credits maintained by third parties as a restricted area; PayPal says some stored-value-card activity can require pre-approval or fall into money-service/e-money territory; FinCEN’s prepaid-access rules create AML, recordkeeping, and SAR obligations in parts of this landscape. ([stripe.com](https://stripe.com/en-th/legal/restricted-businesses))

### Scraping / ToS / IP risk

In the U.S., post-*Van Buren* and the Ninth Circuit’s *hiQ* line, scraping **public** data is on firmer ground under the CFAA than scraping authenticated systems. But that is not a blanket green light: contract/ToS claims remain live, and in Europe the sui generis database right can attach where there has been substantial investment in obtaining, verifying, or presenting database contents. In practice, public-page scraping is a **contract and sustainability question**, not just a hacking-law question. ([acslaw.org](https://www.acslaw.org/analysis/acs-journal/2020-2021-acs-supreme-court-review/the-computer-fraud-and-abuse-act-after-van-buren/))

### Ad-network risk

Ad monetization is feasible only if the catalog stays clean. Google’s policies bar misleading or incomplete representations and place restrictions around sensitive verticals such as gambling; Merchant Center also excludes open-loop prepaid gift cards branded by major card issuers from Shopping/free listings. Mixing in risky voucher types or deceptive “discount” claims will degrade approval odds and brand safety. ([support.google.com](https://support.google.com/adspolicy/answer/6020955?hl=en))

### Consumer-protection and scam risk

Gift cards are a scam-heavy category. The FTC explicitly warns about common gift-card fraud patterns and notes that once the code on the back has been shared, it is often already a scam. Card rules also have disclosure and expiry constraints; CFPB rules require at least five years until expiration at sale in many cases and restrict dormancy/inactivity fees. A public-facing ranking engine therefore needs strong fraud warnings and issuer-rule labeling. ([consumer.ftc.gov](https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams))

### Account-resale / credential risk

This is the clearest red zone. Riot prohibits selling, transferring, or sharing accounts or login credentials; Epic bars buying or selling accounts and personal information; Steam states accounts are personal and not transferable. If your platform indexes or monetizes account markets, it inherits not just policy risk but reputational and payment risk. ([riotgames.com](https://www.riotgames.com/en/terms-of-service))

### Opportunity classification

| Zone | Include / exclude | Why |
|---|---|---|
| **Green** | Authorized or official digital gift cards, app-store credits, game top-ups, corporate reward catalog integrations, public editorial deal pages, community leads. | Strongest legal and commercial footing; supplier APIs exist; referral model works; users get real utility. ([tangocard.com](https://www.tangocard.com/reward-program-api)) |
| **Yellow** | Reputable secondary gift-card marketplaces, crypto-funded gift-card stores, region-restricted reseller inventory, tightly labeled payment vouchers. | Monetizable, but higher fraud, policy, and compatibility risk; requires stronger trust labels and manual oversight. ([gcx.raise.com](https://gcx.raise.com/)) |
| **Red** | Account resale, credential-linked inventory, open-loop prepaid cards, any model that holds funds or acts as escrow/market-maker for third-party stored value. | Processor/AML/policy risk spikes; issuer/platform rules often prohibit the underlying activity. ([stripe.com](https://stripe.com/en-th/legal/restricted-businesses)) |

---

## 5. Data acquisition architecture

### Method comparison

| Method | Scalability | Cost | Detection risk | Maintenance | Legal / compliance exposure | Data quality | Verdict |
|---|---|---:|---|---|---|---|---|
| Official APIs | High | Low to medium | Very low | Low | Lowest | Highest | Best first choice. Raise, Tango, Tremendous, Runa all expose programmatic rails. ([docs.raise.com](https://docs.raise.com/)) |
| Affiliate / partner feeds | High | Low | Very low | Low | Low | High if partner is reputable | Best second choice; aligns monetization and access. Bitrefill affiliate is one example. ([bitrefill.com](https://www.bitrefill.com/affiliate/?hl=en)) |
| Direct commercial partnerships | Medium | Medium to high BD cost | Very low | Low | Low | Highest | Ideal for scale, but slower to unlock. Blackhawk/InComm/Runa/Tremendous-style relationships matter. ([runa.io](https://runa.io/)) |
| Public static-page scraping | Medium | Low | Low to medium | Medium | Medium | Medium | Acceptable only for public pages, low-rate fetching, and non-substantial extraction. ([jenner.com](https://www.jenner.com/en/news-insights/publications/client-alert-data-scraping-in-hiq-v-linkedin-the-ninth-circuit-reaffirms-narrow-interpretation-of-cfaa)) |
| Browser automation / headless render | Medium | Medium to high | High | High | Medium to high | Medium to high | Use selectively, only where public rendering is needed; protected sites escalate quickly. ([cloudflare.com](https://www.cloudflare.com/application-services/products/bot-management/)) |
| Login-gated / anti-bot evasive scraping | Low | High | Very high | Very high | High | Variable | Do not build around this. ([cloudflare.com](https://www.cloudflare.com/application-services/products/bot-management/)) |
| Human-in-the-loop enrichment | Low to medium | Medium | None | Medium | Low | High | Good for source onboarding, exception review, scam triage. |
| User-submitted tracking requests | Medium | Low | None | Medium | Low | Variable | Good demand discovery, not canonical pricing. |
| Community-sourced leads | High | Low | Low | Medium | Low | Noisy | Excellent discovery input; poor as sole truth source. ([play.google.com](https://play.google.com/store/apps/details?hl=en&id=net.slickdeals.android)) |

### Recommended acquisition stack

Use a strict preference order:

```text
1. Official API / feed
2. Affiliate / partner data access
3. Public static product pages
4. Selective public browser rendering
5. Human verification for exceptions
6. Never as a core dependency: login scraping, CAPTCHA bypass, anti-bot circumvention
```

That stack is the best trade-off between scale and survivability because the major bot-defense vendors explicitly target scraping, headless automation, and abusive traffic patterns. ([cloudflare.com](https://www.cloudflare.com/application-services/products/bot-management/))

### Lawful alternatives to scraping

The viable alternatives are:  
- supplier APIs and reward/distribution catalogs;  
- affiliate programs and partner feeds;  
- direct BD partnerships;  
- merchant or marketplace public landing pages;  
- community submissions;  
- user requests to track a specific source, followed by a manual review before activation. ([docs.raise.com](https://docs.raise.com/))

---

## 6. “Real discount” verification engine

### Principle

A deal is not “real” just because a listing is below face value. In this category, the true question is:

**What is the user’s landed, usable, policy-compatible value, adjusted for region, trust, age, and fraud probability?**

That matters because issuer terms often limit redemption by country, some cards are not meant for resale, and scams are common. ([support.google.com](https://support.google.com/googleplay/answer/3422734?hl=en))

### Required inputs

1. **Reference price**  
   - Issuer MSRP or face value.  
   - Authorized-seller observed price.  
   - Marketplace rolling median for the same denomination and region.  
   - Last 30/90-day observed median and floor.

2. **Landed price**  
   - Listing price  
   - plus fees  
   - plus payment-method surcharge  
   - converted into user currency  
   - adjusted for denomination variance.

3. **Usability constraints**  
   - region/country fit;  
   - account-country compatibility;  
   - redemption restrictions;  
   - “authorized partner” or “official distributor” flags where available. ([support.google.com](https://support.google.com/googleplay/answer/3422734?hl=en))

4. **Trust and fraud inputs**  
   - marketplace guarantee / refund policy;  
   - seller rating and sales history;  
   - invalid-code complaints;  
   - FTC-style scam heuristics;  
   - suspiciously deep discount anomaly. ([gameflip.com](https://gameflip.com/?srsltid=AfmBOopUeHpvL6GqDe4jJQZ2-DIOg9j0_OkdzxUJhpBQ9TF4MqygupeV))

5. **Freshness signals**  
   - last seen time;  
   - last confirmed availability;  
   - price volatility;  
   - stale-listing half-life by source.

### Recommended scoring model

Use **two scores**, not one.

#### A. Deal quality score (0–100)

```text
DealQuality =
  0.30 * PriceEdge
+ 0.15 * HistoricalAdvantage
+ 0.10 * FeeTransparency
+ 0.10 * RegionFit
+ 0.10 * SellerTrust
+ 0.10 * BuyerProtection
+ 0.10 * Freshness
+ 0.05 * AvailabilityConfidence
```

Where:  
- **PriceEdge** = discount versus best trusted reference price.  
- **HistoricalAdvantage** = percentile versus trailing 30/90-day price history.  
- **RegionFit** = 0 if likely unusable; high only if country/account match is strong.  
- **SellerTrust** = marketplace or merchant reliability.  
- **BuyerProtection** = refund/guarantee strength.  

#### B. Confidence score (0–100)

```text
Confidence =
  0.30 * ReferencePriceConfidence
+ 0.20 * DataFreshnessConfidence
+ 0.20 * SourceReliability
+ 0.15 * DuplicateConsistency
+ 0.15 * FraudLowRisk
```

#### Final ranking score

```text
FinalScore =
  DealQuality * (0.5 + 0.5 * Confidence/100) - PolicyPenalty - FraudPenalty
```

### Hard rules

A listing should be **suppressed** or heavily demoted if:  
- the region is likely incompatible;  
- the underlying product is commonly prohibited for resale;  
- the discount is too extreme relative to source norms;  
- the seller/platform lacks meaningful buyer protection;  
- the page is stale or cannot be revalidated. ([support.google.com](https://support.google.com/googleplay/answer/3422734?hl=en))

### Recommended labels shown to users

- **Verified good deal**  
- **Good price, region-sensitive**  
- **Good price, resale marketplace**  
- **Unclear value, weak confidence**  
- **High risk / likely unusable**  

That UX matters more than a single numeric “deal score.”

---

## 7. Product design

### Product wedge

Build a **digital-value deal intelligence site**, not a store. The site should help users answer:

- Where is the best current price?  
- Is it actually usable for me?  
- Is the source trustworthy?  
- Has this price historically been good?  
- Can I track this brand / site / category going forward?

### Recommended site structure

```text
/
├── deals
├── brands
├── categories
│   ├── gaming gift cards
│   ├── app store credits
│   ├── streaming / entertainment
│   ├── retail gift cards
│   └── mobile top-up / prepaid credits
├── marketplaces
├── source-reviews
├── alerts
├── request-tracking
├── trust-and-safety
└── methodology
```

### Core page types

**1. Deal page**  
Show: price, face value, effective discount, final landed price, region compatibility, seller/platform trust, buyer protection, price history sparkline, and “why this ranked here.” Region and issuer restrictions should be prominent because they materially affect usability. ([support.google.com](https://support.google.com/googleplay/answer/3422734?hl=en))

**2. Brand page**  
Show all current offers for a brand across sources, segmented by region and denomination. This is where programmatic SEO can work.

**3. Vendor / marketplace page**  
Explain whether the source is official, authorized, resale, or mixed; what refund protections exist; and what categories it covers. Gameflip’s buyer-protection framing and marketplace stats are good examples of what users want to understand. ([gameflip.com](https://gameflip.com/?srsltid=AfmBOopUeHpvL6GqDe4jJQZ2-DIOg9j0_OkdzxUJhpBQ9TF4MqygupeV))

**4. Methodology page**  
Explain how the discount score works. This is required for trust and also helps with ad/network scrutiny around misleading pricing claims. ([support.google.com](https://support.google.com/adspolicy/answer/6020955?hl=en))

### User request flow

A user should be able to submit:  
- a specific website,  
- a brand,  
- a product family, or  
- a region-denomination combination.

Flow:  
1. User submits request.  
2. System checks if source already exists.  
3. Source enters onboarding queue.  
4. Human review checks legality, public accessibility, category risk, and commercial relevance.  
5. If approved, parser or feed is added.  
6. User is notified when tracking is live.

This request flow is valuable because it turns users into a source-discovery channel without forcing you to scrape indiscriminately.

### Admin / moderation back office

You need these queues from day one:

- source onboarding queue  
- parser-health failures  
- offer invalidation queue  
- scam / abuse reports  
- merchant takedown / complaint queue  
- trust-score overrides  
- category-risk reclassification queue

### Trust and fraud UX

Add explicit badges:  
- **Official / authorized**  
- **Marketplace resale**  
- **Crypto-funded checkout**  
- **Region-locked**  
- **Use restrictions apply**  
- **Manual verification pending**

That is not decorative. It is risk control.

### Multilingual support

Use a multilingual ingestion pipeline, but **do not** launch with many fully localized frontends. Start with one frontend language and localized content fields underneath. The market already spans localized country/language pages and regional communities, so ingestion should be multilingual even if the UX launches EN-first. ([bitrefill.com](https://www.bitrefill.com/))

### SEO strategy

Programmatic SEO is appropriate **only** for clean, high-intent pages with unique data:

- `[brand] gift card deals`
- `[brand] gift card [country]`
- `[brand] top up [region]`
- `[source] review`
- `[brand] price history`
- `[brand] code region compatibility`

Avoid thin pages and anything that reads like “cheapest everywhere” without caveats. Misleading price claims are both trust and ad-policy liabilities. ([support.google.com](https://support.google.com/adspolicy/answer/6020955?hl=en))

---

## 8. AI and automation architecture

### Recommendation

Use a **hybrid architecture**: deterministic automation for core data operations, bounded LLM usage for messy classification and summarization, and **no full autonomous agent orchestration** in the critical path.

That is the right design because the core work is structured, repetitive, and measurable, while the risky parts are classification, multilingual normalization, and exception handling. Full agents add too much nondeterminism and can create uncontrolled browsing behavior on protected sites. The target environment already contains strong bot defenses that penalize unpredictable automated behavior. ([cloudflare.com](https://www.cloudflare.com/application-services/products/bot-management/))

### What should be deterministic

- fetch scheduling  
- parser execution  
- HTML/JSON extraction  
- FX normalization  
- denomination normalization  
- deduplication  
- price-history updates  
- hard risk rules  
- ranking math  
- alert triggers  
- parser QA checks

### What should use LLMs

- multilingual title normalization  
- category mapping from messy merchant text  
- extracting region restrictions from unstructured copy  
- source review summaries  
- internal moderation triage  
- explaining “why this deal is risky / good” to users in plain language

### Where agents help

Use agents only for **bounded research and onboarding** tasks:

- surveying a new candidate source,  
- drafting a parser template proposal,  
- summarizing terms / restrictions for internal review,  
- generating test cases for extraction.

Every agent output should be reviewed or validated before going live.

### Where agents are unnecessary or harmful

- live price extraction  
- final compliance classification  
- ranking math  
- anti-bot navigation strategy  
- autonomous browsing across unknown sites

These should stay deterministic and human-governed.

### Monitoring, QA, retry, fallback

Implement:  
- parser success-rate thresholds,  
- freshness SLAs by source,  
- field-level anomaly detection,  
- screenshot or DOM diff tests for fragile sources,  
- source kill-switches,  
- revalidation retries before de-indexing,  
- manual-review escalation for suspicious deals.

### Cost and hallucination control

- use rules first, LLMs second;  
- cache normalized outputs;  
- only invoke LLMs on new or low-confidence records;  
- require structured JSON outputs;  
- block publication when confidence is low;  
- log every model-assisted decision for audit.

---

## 9. Infrastructure and systems design

## MVP architecture

```text
[Source adapters]
   ├─ API clients
   ├─ static-page fetchers
   └─ selective render workers
        ↓
[Ingestion queue]
        ↓
[Normalization pipeline]
   ├─ entity resolution
   ├─ FX conversion
   ├─ region mapping
   ├─ denomination normalization
   ├─ trust/risk tagging
   └─ duplicate clustering
        ↓
[Primary stores]
   ├─ Postgres (entities, offers, merchants, rules)
   ├─ Timeseries store / TimescaleDB (price history)
   ├─ Object store (raw HTML/JSON snapshots)
   └─ Search index (Meilisearch/OpenSearch)
        ↓
[Application layer]
   ├─ public site
   ├─ alerts service
   ├─ admin back office
   └─ analytics / observability
```

### Recommended stack

For MVP:  
- **Frontend:** Next.js  
- **Backend API:** FastAPI or TypeScript service layer  
- **DB:** PostgreSQL  
- **Price history:** TimescaleDB extension or separate ClickHouse later  
- **Queue:** Redis Streams / Celery or BullMQ  
- **Browser automation:** Playwright, but only for selected public pages  
- **Object storage:** S3/R2  
- **Search:** Meilisearch for MVP; OpenSearch later  
- **Observability:** OpenTelemetry + Grafana/Loki  
- **Auth/admin:** role-based admin panel  
- **Deploy:** Docker on a single region to start; multi-region read path later

### Scale architecture

At scale, split into:  
- source-specific worker pools,  
- browser-render pool,  
- normalization/event bus,  
- ranking service,  
- alerting service,  
- moderation service,  
- search/index service.

Move from Redis-based queues to Kafka only when volume and reprocessing justify it.

### Security and abuse prevention

- no login scraping  
- no CAPTCHA bypass  
- per-source rate caps  
- source allowlists  
- signed admin actions  
- immutable raw-fetch snapshots for audit  
- abuse reporting and merchant complaint handling  
- category-level kill switches

### Proxy/browser strategy

Only use ordinary public-page fetching and lawful browser rendering where needed. Do not design the business around evading bot defenses; Cloudflare, DataDome, and Akamai all explicitly target scraping and headless abuse, and that becomes a permanent cost sink. ([cloudflare.com](https://www.cloudflare.com/application-services/products/bot-management/))

### Internationalization

Store:  
- source locale,  
- card currency,  
- redemption country,  
- UI language,  
- normalized English title,  
- original title,  
- region-compatibility rules.

That data model matters more than frontend translation.

---

## 10. Monetization and business model

### Evaluation

| Model | Strength | Weakness | Verdict |
|---|---|---|---|
| Display ads | Easy to add later | Weak early economics; brand-safety and policy sensitivity in gray categories | Secondary only |
| Google Ads / AdSense | Can work for clean editorial inventory | Misrepresentation, gambling, and risky voucher categories reduce safety; Merchant Center excludes open-loop prepaid cards from Shopping/free listings | Use cautiously, not as core. ([support.google.com](https://support.google.com/adspolicy/answer/6020955?hl=en)) |
| Affiliate revenue | Strong fit for referral/discovery model; aligned with user intent | Coverage gaps; some merchants won’t have good programs | Best early primary |
| Subscriptions | Good for power users and professional buyers | Needs clear recurring value | Strong second layer |
| Premium alerts | High willingness-to-pay if latency and accuracy are real | Must keep false positives low | Strong |
| Sponsored listings | Possible once traffic exists | Trust conflict if not clearly labeled | Add later with strict separation |
| B2B / API access | Attractive long-term moat | Requires very clean data and enterprise-grade SLAs | Strong later |
| Arbitrage intelligence | Potentially valuable | Can drift into gray tactics, region-circumvention, and merchant hostility | Only as a constrained B2B layer |

### Best model

**Best model: affiliate + premium alerts/subscriptions first, B2B/API later.**  
This matches the safest operating posture: you are a discovery and verification layer, not the merchant of record. It is also supported by the fact that this ecosystem already has affiliate and marketplace-like patterns, such as Bitrefill’s affiliate program and PayPal Digital Gifts acting as a marketplace layer without owning the retailer transaction itself. ([bitrefill.com](https://www.bitrefill.com/affiliate/?hl=en))

### Likely blockers

- inconsistent affiliate availability across vendors,  
- poor EPC until traffic is meaningful,  
- merchant complaints if your rankings embarrass direct sellers,  
- policy issues if you mix clean and gray categories,  
- user trust collapse if invalid / region-incompatible deals leak through.

### Strong recommendation

Do **not** build an ads-first content site. Build a **trusted deal intelligence product** with monetization layered in this order:

```text
1. Affiliate click-outs
2. Premium watchlists / alerts
3. Team / pro subscription tier
4. Sponsored placements with strict ad labeling
5. B2B data/API licensing
```

---

## 11. Financial model

### Important note

The model below is **assumption-based**, not an observed market average. It is intended for operator planning.

### MVP cost estimate

#### Lean founder-built MVP
- Engineering and product build: primarily founder time  
- Infra/tools: **$600–$1,500/month**
- Legal/compliance review: **$3,000–$15,000 one-off**
- Design/content/tooling/monitoring: **$300–$1,000/month**
- Optional contractor help: **$3,000–$10,000/month**

#### Practical launch envelope
- **Very lean:** $8k–$25k to first useful MVP
- **More robust:** $30k–$80k if you use contractors and heavier QA

### Operating cost drivers

Biggest cost drivers:  
1. browser-rendered sources,  
2. parser maintenance,  
3. moderation and invalidation handling,  
4. multilingual normalization,  
5. SEO/content production,  
6. trust/safety operations.

Protected-source automation is the biggest hidden cost driver because anti-bot vendors are explicitly optimizing against it. ([cloudflare.com](https://www.cloudflare.com/application-services/products/bot-management/))

### Revenue scenario model

Assumptions for illustration:
- outbound click rate on ranked pages: **4% / 6% / 7%**
- blended affiliate earnings per outbound click: **$0.20 / $0.35 / $0.45**
- premium subscribers: modest in low case, meaningful in base/aggressive
- sponsored/API revenue: zero in low case, later add-on in base/aggressive

| Scenario | Monthly sessions | Outbound clicks | Affiliate revenue | Premium / alerts | Sponsored / API | Total |
|---|---:|---:|---:|---:|---:|---:|
| Low | 50,000 | 2,000 | $400 | $200 | $0 | **$600** |
| Base | 250,000 | 15,000 | $5,250 | $2,000 | $1,500 | **$8,750** |
| Aggressive | 1,000,000 | 70,000 | $31,500 | $10,000 | $8,000 | **$49,500** |

### Gross-margin profile

If you stay in the **publisher/referral** lane, gross margins can be high once fixed engineering is amortized. If you drift into browser-heavy scraping, moderation-heavy gray markets, or settlement/broker activity, margins compress quickly.

### Time to break-even

- **Lean, founder-led:** possible around the base scenario if costs stay controlled.  
- **Team-backed / heavier compliance:** likely requires either meaningful SEO scale or a B2B/API line in addition to affiliate traffic.

### What needs validation first

These are the real gating assumptions:
1. Can you get enough green-zone sources with workable referral economics?  
2. Can you keep invalid / unusable deal rates low?  
3. Can you generate repeat usage through alerts and watchlists?  
4. Can you grow organic traffic without falling into thin-page SEO?  
5. Can you avoid merchant and platform complaints?

---

## 12. MVP recommendation

### Best narrow starting wedge

**Start with:**
- gaming gift cards  
- app-store credits  
- streaming / entertainment gift cards  
- selected mobile top-up / prepaid credits  
- only from authorized sellers plus 2–3 reputable resale marketplaces

### Exact scope

**Include**
- 15–25 sources max  
- public pages + partner/API sources only  
- region/currency normalization  
- price history  
- trust labeling  
- user watchlists and alerts  
- request-a-source flow  
- one admin moderation panel

**Exclude**
- account resale  
- credential-linked listings  
- open-loop prepaid cards  
- adult / gambling-linked vouchers  
- direct checkout  
- user-to-user marketplace flows  
- holding funds or escrow  
- “full web scraping of everything”

### Fastest testable version

A usable v1 can be:

- 10–15 sources  
- 3 core categories  
- 1 frontend language  
- 3–5 supported regions  
- daily or hourly refresh depending source  
- email / Telegram / webhook alerts  
- manual moderation for new sources

### Success metrics

- valid-offer rate above **90–92%**  
- freshness SLA met for priority sources  
- outbound CTR above **4%**  
- repeat usage via alerts/watchlists  
- low complaint/takedown rate  
- clear user trust in region-fit labels

### Kill criteria

Kill or pivot if, after an honest test window:
- invalid / unusable offers stay above **15%**,  
- merchant complaints or takedowns are frequent,  
- affiliate economics are too weak,  
- SEO acquisition is too slow for the revenue profile,  
- users do not care about verification enough to return.

---

## 13. Build roadmap

### Phase 0: validation
**Timeline:** 2–4 weeks

**Goals**
- confirm 15–20 candidate sources  
- classify green/yellow/red  
- secure at least some partner/affiliate routes  
- manually compare discount logic on 200–500 offers  
- prove users care about region-fit and trust labels

**Team**
- founder/operator  
- part-time engineer or data contractor  
- light legal/compliance input

### Phase 1: MVP
**Timeline:** 6–8 weeks

**Build**
- source adapters for first 10–15 sources  
- normalized offer schema  
- price-history store  
- ranking engine v1  
- public site with deal / brand / source pages  
- watchlists and alerts  
- admin panel  
- trust-safety labels

### Phase 2: automation hardening
**Timeline:** 6–10 weeks

**Build**
- parser health monitoring  
- automated revalidation  
- duplicate clustering  
- LLM-assisted multilingual normalization  
- merchant complaint workflow  
- better moderation tooling  
- selective browser rendering where justified

### Phase 3: monetization expansion
**Timeline:** 4–8 weeks

**Build**
- affiliate deep links and attribution  
- premium alerts tier  
- sponsored placement system with clear labeling  
- pro dashboards for power users

### Phase 4: scale and defensibility
**Timeline:** ongoing

**Build**
- partner feed expansion  
- enterprise/API product  
- better historical analytics  
- merchant/source scorecards  
- additional languages and regions  
- stronger trust moat through data quality and auditability

### Critical dependencies

- enough green-zone supply  
- source stability  
- clear internal compliance rules  
- disciplined refusal to expand into red-zone categories too early

---

## 14. Codex handoff

## Product summary

Build a **digital-value deals intelligence platform** that discovers, verifies, normalizes, and ranks online deals for lawful digital gift cards, credits, vouchers, and top-ups. The product is a **publisher/referral and alerting platform**, not a merchant, broker, or escrow service.

## System architecture summary

- ingest from APIs, partner feeds, and selected public pages  
- normalize offers by brand, denomination, region, currency, and source  
- store historical prices  
- compute trust/risk labels and ranking scores  
- publish deal pages, brand pages, source pages, and alert feeds  
- provide admin moderation and source-onboarding workflows

## Recommended repo structure

```text
repo/
├── apps/
│   ├── web/                # Next.js frontend
│   ├── admin/              # internal ops UI
│   └── api/                # public/internal API
├── services/
│   ├── ingest/             # source adapters, schedulers
│   ├── normalize/          # schema mapping, FX, region rules
│   ├── ranker/             # scoring engine
│   ├── alerts/             # email/webhook/telegram alerts
│   ├── moderation/         # reports, takedowns, trust ops
│   └── llm-assist/         # bounded classification/summarization only
├── packages/
│   ├── schemas/            # typed offer/source models
│   ├── rules/              # policy + hard suppression rules
│   ├── ui/                 # shared components
│   └── utils/
├── infra/
│   ├── docker/
│   ├── migrations/
│   ├── observability/
│   └── deploy/
├── docs/
│   ├── architecture/
│   ├── compliance/
│   ├── source-onboarding/
│   ├── runbooks/
│   └── scoring-methodology/
└── data/
    ├── source-configs/
    ├── region-rules/
    └── fixtures/
```

## Initial milestones

1. define canonical schemas  
2. implement 5 API/feed sources  
3. implement 5 public-page sources  
4. build normalization and price-history pipeline  
5. build ranker v1  
6. build deal / brand / source pages  
7. build admin moderation queue  
8. add alerts and watchlists  
9. add LLM-assisted exception handling only after deterministic core is stable

## Data model recommendations

### Core entities
- `Source`
- `Merchant`
- `Brand`
- `Product`
- `Offer`
- `OfferSnapshot`
- `RegionRule`
- `SellerProfile`
- `TrustSignal`
- `FraudSignal`
- `PriceHistory`
- `UserWatch`
- `SourceRequest`
- `ModerationCase`

### Key fields on `Offer`
- source_id
- merchant_id
- brand_id
- original_title
- normalized_title
- category
- face_value
- currency
- asking_price
- effective_price
- fee_total
- payment_method
- source_type (`official`, `authorized_reseller`, `marketplace_resale`, `crypto_store`)
- country_redeemable
- account_region_required
- resale_restriction_flag
- buyer_protection_level
- seller_rating
- last_seen_at
- freshness_status
- deal_quality_score
- confidence_score
- final_score
- policy_zone (`green`, `yellow`, `red`)
- suppression_reason

## Services/components to build first

1. source registry and onboarding workflow  
2. ingestion scheduler  
3. normalization engine  
4. ranking engine  
5. raw snapshot archival  
6. admin moderation UI  
7. public listing/search pages  
8. alerting engine

## Compliance guardrails

- do not hold customer funds  
- do not process or resell stored value directly  
- do not index account resale in v1  
- do not scrape behind login  
- do not bypass anti-bot or CAPTCHA systems  
- do not label a deal “verified” unless region-fit and trust checks pass  
- preserve raw evidence for ranking decisions and merchant disputes

## What not to build in v1

- checkout
- wallet
- marketplace settlement
- escrow
- peer-to-peer resale
- account deals
- open-loop prepaid-card support
- full autonomous agent browsing
- multi-language frontend explosion
- proxy-heavy scraping infrastructure

---

## Bottom line

This is **not** a “scrape everything” startup. It is a **trust-scored digital-value discovery business**. In that narrower form, it is commercially plausible and technically buildable. In the broader gray-market form, it becomes a compliance and payment-risk magnet.

**Final call: proceed with restrictions.**  
Build the green-zone intelligence layer first. Avoid becoming the transaction layer.
