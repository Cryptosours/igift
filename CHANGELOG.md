# Changelog

## [4.5.0] — 2026-04-07

### Added
- **Performance audit** (Task 5.12) — bundle analysis + TTFB measurement
  - Shared JS: 218KB (Sentry 124KB, React 37KB, React DOM 54KB)
  - TTFB: 15–34ms across all routes (excellent)
  - Recharts (121KB) confirmed page-specific, not shared
  - No critical performance issues found
- **Accessibility audit** (Task 5.13) — comprehensive a11y hardening
  - Skip-to-content link in root layout with keyboard-visible focus styling
  - Explicit `htmlFor`/`id` label associations on all form inputs (8 inputs fixed)
  - `aria-pressed` on filter toggle buttons, `aria-label` on DealScore
  - `role="alert"` on form success/error messages for screen reader announcements
  - `role="search"` on all search forms, `aria-hidden` on decorative icons
  - `eslint-plugin-jsx-a11y` (recommended ruleset) for automated a11y enforcement
- **Phase 5 complete** — all 14 quality & hardening tasks finished

---

## [4.4.0] — 2026-04-07

### Added
- **Sentry error tracking** — full `@sentry/nextjs` v10 integration (client, server, edge)
- Instrumentation hook for automatic error capture at server startup
- Error boundaries now report to Sentry alongside console.error
- DSN-ready: all code wired, conditional on `SENTRY_DSN` env var
- Docker Compose passes `SENTRY_DSN` to web container
- CSP updated with `*.ingest.sentry.io` in connect-src

---

## [4.3.0] — 2026-04-07

### Added
- **Clustering engine tests** (18 tests) — cluster key normalization, agreement bonuses, confidence capping
- **Alert matcher tests** (25 tests) — 4-filter matching (brand, category, discount, region), cooldown, title fallback
- Total test count: 189 (up from 146)

---

## [4.2.0] — 2026-04-07

### Added
- **API route integration tests** (36 tests) covering deals, brands, search, ingest, complaints, click, admin health
- Chainable Drizzle ORM mock pattern for DB-free route testing
- Total test count: 146 (up from 110)

---

## [4.1.0] — 2026-04-07

### Added
- **CI/CD pipeline** (Task 5.14): `.github/workflows/ci.yml` — lint + test + build on every push to main and PR. Postgres 16 service, npm + turborepo cache. First run: all green.
- **Adapter unit tests** (Task 5.7 — 21 tests): `adapters.test.ts` — bitrefill (7 tests), dundle (5 tests), raise (6 tests). Mocked fetch with HTML fixtures, fake timers for polite delays. Tests: dryRun, parsing, discounts, OutOfStock filtering, HTTP errors, fallback parsers.
- **Phase 5** added to `PRODUCTION_PLAN.md` (14 tasks, 8 DONE).

### Fixed
- `package-lock.json` missing `@swc/helpers@0.5.21` — caused `npm ci` failure in Docker build. Regenerated lock file.

### Infrastructure
- **VPS deploy**: All 6 pending commits deployed. `igift-web` container rebuilt and running latest code. Resolved Docker project-name mismatch (`realdeal` vs `igift`).

## [4.0.0] — 2026-04-06

### Added
- **Phase 5: Quality & Production Hardening**
  - **Error boundaries**: `app/[locale]/error.tsx` (branded error page within app shell) + `app/global-error.tsx` (standalone HTML for root layout failures)
  - **Vitest testing infrastructure**: `vitest.config.ts`, `test`/`test:watch` scripts, path alias support
  - **Scoring engine tests** (30 tests): deal quality score, confidence score, scoreOffer pipeline, label helpers, suppression rules, fraud penalty, historical low detection
  - **Normalization pipeline tests** (39 tests): brand resolution, FX conversion, region mapping, denomination extraction, title normalization, full pipeline
  - **Regions module tests** (20 tests): config completeness, getRegion, formatRegionPrice, regionFromCurrency, locale mapping

### Fixed
- **Empty brand slug bug**: `resolveBrandSlug("")` incorrectly matched to a brand via partial match (`"apple".includes("") === true`). Added guard for empty/whitespace-only input.

### Changed
- **Removed sample-data fallback** from home page, deals page, categories page, and search API. Pages now render empty states when DB is unavailable instead of showing fake data.

### Dependencies
- `vitest ^4.1.2` (dev)
- `@vitejs/plugin-react ^6.0.1` (dev)

## [3.3.0] — 2026-04-06

### Added
- **Task 2.5 — LLM-assisted multilingual title normalization**
  - **`src/lib/ingest/title-normalizer.ts`** — two-stage pipeline: rule-based first (fast/free), Claude claude-haiku-4-5 LLM fallback for low-confidence titles; `PRODUCT_TYPE_MAP` covers EN/DE/FR/ES/IT/NL/PT/PL/SV synonyms; `CURRENCY_PATTERNS` handles $, €, £, A$, suffix forms; `detectLanguage()` heuristic; `normalizeOfferTitle()` async main entry; only calls LLM when `ANTHROPIC_API_KEY` is set
- **Task 2.6 — LLM-assisted category mapping**
  - Same `title-normalizer.ts` module: `CATEGORY_SLUG_MAP` covers EN/DE/FR/ES multilingual category names → canonical slugs; `mapCategory()` with LLM fallback for unmapped categories; output validated against allowed slug enum
  - **`POST /api/admin/normalize`** — admin API to trigger batch re-normalization; `scope: titles|categories|all`; `limit` param; `dryRun` flag; ADMIN_API_KEY protected; updates `offers.normalizedTitle` and `brands.category`; returns `llmAvailable` flag
- **Task 2.7 — Merchant complaint workflow**
  - **`POST /api/complaints`** — public endpoint to submit data quality reports; types: `incorrect_price`, `wrong_brand`, `expired`, `region_mismatch`, `low_quality`, `other`; validation of offerId, description (10–1000 chars), optional reporterEmail; stored in `moderationCases` with `caseType: complaint:{type}` for admin review; Cloudflare rate-limited
  - Anthropic SDK `@anthropic-ai/sdk ^0.82.0` added to web dependencies
  - Build: ✓ 0 errors · 0 lint warnings

## [3.2.0] — 2026-04-06

### Added
- **Task 4.6 — EU, UK, AU region support**
  - **`src/lib/regions.ts`** — canonical region registry: US, EU, UK, AU, Global; each with `flag` emoji, `currency`, `symbol`, `displayName`, `countryCodes`; `formatRegionPrice()` (Intl.NumberFormat locale-aware), `regionFromCurrency()`, `LOCALE_TO_REGION` map, `getRegion()` helper
  - **`deal-filters.tsx`** — updated from hardcoded 4-item array to `SELECTABLE_REGIONS` from config; flag emoji + region code in each filter pill; `defaultRegion` prop passed from server; `?region=` URL param support; Clear Filters resets to `defaultRegion`
  - **`deal-card.tsx`** — region display updated from raw text to `{flag} {displayName}` from region config
  - **`deals/page.tsx`** — reads `getLocale()` and maps via `LOCALE_TO_REGION` to pre-select `defaultRegion` (German locale → EU filter suggestion)
  - Build: ✓ 0 errors · 0 lint warnings

## [3.1.0] — 2026-04-06

### Added
- **Task 4.5 — de-DE language support (next-intl v4.9.0)**
  - **`[locale]` routing architecture** — all front-end pages now live under `app/[locale]/`; English serves at `/` (no prefix), German at `/de/`; API routes and admin remain untouched
  - **`src/i18n/routing.ts`** — `defineRouting({ locales: ['en','de'], defaultLocale: 'en', localePrefix: 'as-needed' })`
  - **`src/i18n/request.ts`** — `getRequestConfig` loads the correct message bundle for each request; validates locale, falls back to `'en'`
  - **`messages/en.json`** + **`messages/de.json`** — 60+ strings across `Navigation`, `Footer`, `Home`, `Common`, and `Metadata` namespaces
  - **`next.config.ts`** — wrapped with `createNextIntlPlugin('./src/i18n/request.ts')`
  - **`middleware.ts`** — next-intl `createMiddleware(routing)` merged with existing session cookie logic; API routes excluded from matcher
  - **`app/layout.tsx`** — root HTML shell now async; reads `getLocale()` to set dynamic `lang` attribute
  - **`app/[locale]/layout.tsx`** — app shell layout: `NextIntlClientProvider` + `MotionProvider` + `Header` + `PageTransition` + `Footer`; locale validated with `hasLocale()`; per-locale `generateMetadata`
  - **Header** — converted nav items and aria-labels to `useTranslations('Navigation')` (client component)
  - **Footer** — converted section headings, link names, tagline, copyright, and disclaimer to `getTranslations('Footer')` (server component, now async)
  - Build: ✓ 0 errors · 0 lint warnings · all 16 front-end routes under `[locale]/` · middleware 45.3 kB

### Fixed
- `sources/page.tsx` — `<a href="/methodology">` → `<Link>`
- `admin/layout.tsx` — remaining `<a href="/admin">` and `<a href="/admin/sources">` → `<Link>`

## [3.0.0] — 2026-04-05

### Added
- Merchant/source scorecards — Task 4.4 complete
  - **`getAllSourceScorecards()` / `getSourceScorecardBySlug()`** in `lib/data.ts`
    - Drizzle join of `sources` + `offers` for live aggregate stats (offer count, brands, avg/best discount, ATL count)
    - `computeTrustScore()`: trust zone (40pts) + buyer protection (20pts) + refund policy (15pts) + fetch reliability (25pts) = 0–100
    - `computeHealthStatus()`: healthy / degraded / unhealthy / unknown from staleness factor and success rate
  - **`/sources` listing page** — ISR 30m, two zone sections (green/yellow), summary stats banner, methodology callout
  - **`/sources/[slug]` detail page** — SSG with `generateStaticParams`, trust score ring, score breakdown table, live stats grid, buyer protection panel, data freshness section, deals CTA
  - **`SourceCard` component** — animated trust-score bar (Framer Motion), stagger entrance, zone-color badges, health indicator, stats grid
  - **`GET /api/v1/sources`** — ISR 30m, returns full scorecard array + meta summary counts
  - **Header nav** — "Sources" link added with `ShieldCheck` icon
  - **Footer** — "Source Directory" link added to Product column
  - Build: ✓ 0 type errors · `/sources` (ISR 30m) · `/sources/[slug]` (SSG) · `/api/v1/sources` (ISR 30m)

## [2.9.0] — 2026-04-05

### Added
- Partner feed expansion — 10 new sources, 6 new brands (task 4.2)
  - **5 new live HTML source adapters** (parse waterfall: JSON-LD → data attrs → regex):
    - `cdkeys.ts` — CDKeys.com (green zone, authorized reseller, Trustpilot 4.4/5) · 23 SKUs tracked
    - `eneba.ts` — Eneba.com (yellow zone, EU marketplace) · 15 SKUs, prefers `__NEXT_DATA__` JSON
    - `offgamers.ts` — OffGamers.com (yellow zone, Asian marketplace) · 16 SKUs
    - `g2a.ts` — G2A.com (yellow zone, `hasBuyerProtection: false` by default) · 14 SKUs
    - `kinguin.ts` — Kinguin.net (yellow zone, Polish marketplace) · 17 SKUs
  - **5 new catalog sources** (manual verification, green zone):
    - Best Buy, Target, Newegg, Walmart, GameStop — 13 new catalog entries
  - **6 new brands**: Roblox, Valorant, Twitch, EA Play, PlayStation Plus, Razer Gold
  - DB migration `0003_expand_sources_brands.sql` — INSERT 10 new sources + 6 brands
  - `seed.ts` updated with all 20 new sources/brands for local dev
  - Orchestrator: all 5 new live adapters registered in `getRegisteredAdapters()`
  - `adapters/index.ts`: full exports for all new adapters + catalog entries

### Fixed
- `metadataBase` warning in root layout — set to `https://igift.app` to resolve OG image URL resolution
- Total source count: 6 live + 4 catalog → 11 live + 9 catalog (20 total)

## [2.8.0] — 2026-04-05

### Added
- Historical analytics and trend pages (task 4.3)
  - `PriceHistoryChart` client component (`src/components/analytics/price-history-chart.tsx`)
    - Recharts `ComposedChart` with dual Y-axes: effective price (left, indigo area) + discount % (right, green line)
    - All-time low reference line, custom tooltip, empty-state fallback
  - `/historical-lows` page: SEO-optimised grid of brands currently at all-time low prices
    - Fetches via `getHistoricalLowBrands()` (joins `brands` + `offers WHERE isHistoricalLow = true`)
    - Category emoji badges, price/discount display, CTA → `/alerts`
  - 90-day price trend section on each `/brands/[slug]` detail page
    - Parallel fetch via `Promise.all([getWatchedSlugs, getPriceHistory])`
    - All-time low badge in page header
  - `GET /api/v1/brands/:slug/history` B2B endpoint
    - Free tier: max 90 days · Pro tier: max 365 days
    - Query params: `days`, `denomination`
    - Returns `{ data: PricePoint[], meta: { allTimeLowCents, days, points, tier, maxDays } }`
  - `getPriceHistory()` in `lib/data.ts`: daily-aggregated price series via `DATE_TRUNC('day') + MIN()`
  - `getHistoricalLowBrands()` in `lib/data.ts`: brands at all-time lows with best-offer details
  - `getBrandBySlug()` now exposes `id` field (required for price history lookup)
  - Header nav: "Hist. Lows" link · Footer: "Historical Lows" in Product section

## [2.7.0] — 2026-04-05

### Added
- B2B API product (task 4.1)
  - `api_keys` table in DB schema with SHA-256 key hashing, tier enum (free/pro), rolling rate-limit counters
  - Migration: `0002_add_api_keys.sql`
  - Auth middleware: `src/app/api/v1/auth.ts` — extracts key from `X-API-Key` or `Authorization: Bearer`, hashes, validates, enforces rolling 1-hour rate window via DB
  - `GET /api/v1/deals` — paginated active deals with filters (category, trust_zone, region, min_score, cursor)
  - `GET /api/v1/brands` — paginated active brands with active offer counts
  - `GET /api/v1/brands/[slug]` — single brand with all current active offers
  - `GET /api/v1/stats` — platform statistics (total active offers, brands, historical lows, by-category breakdown)
  - `GET|POST|DELETE /api/admin/api-keys` — admin key management; POST returns raw key once (never stored again)
  - `/developers` page — public API documentation with quick-start curl example, endpoint reference, auth guide, error examples, pricing plans
  - Footer: "API for Developers" link added to Company section

## [2.6.0] — 2026-04-05

### Added
- Pro dashboard for power users (task 3.5)
  - **Market Pulse strip**: live market-wide stats — new deals in last 24h, total active historical lows, top category by deal count
  - **Savings Opportunity widget**: aggregate potential savings across watchlist best deals, computed server-side
  - **Savings stat card**: `$X.XX available right now` derived from watchlist deals, zero extra DB queries
  - **Historical Lows stat card**: count of watched brands currently at all-time best price
  - **Top Opportunity callout**: automatically surfaces highest deal-score item from user's watchlist
  - **Watchlist Snapshot panel**: concise 4-line summary (brands, live deals, savings, hist. lows) with green/gray indicators
  - **Quick Links sidebar**: 5-link jump navigation to all key pages
  - `getDashboardStats()` in `lib/data.ts`: parallel queries for `newIn24h`, `historicalLowsTotal`, `topCategory` with graceful fallback
  - Historical Low badge per brand row in watchlist section

## [2.5.0] — 2026-04-05

### Added
- Constitution audit: UI/UX upgrade across all pages (session 15)
  - Active nav indicator: `usePathname` + `layoutId` animated spring underline
  - Dynamic hero stats wired to PostgreSQL via `getHeroStats()`
  - `HomeAlertForm` client component wired to `/api/alerts` with `useTransition`
  - `FadeIn` / `StaggerContainer` / `StaggerItem` animations on all pages (categories, brands, deals, dashboard, watchlist, about)
  - Footer: GitHub + X social links with `nofollow`, Dashboard nav item, responsive two-column bottom bar
  - Loading skeletons: `/deals`, `/brands`, `/categories`, `/dashboard`
  - `DealCard` mobile responsive at 320px: `flex-wrap` prices, `line-clamp-2` title, hidden source on small screens, `shrink-0` right column
  - Header: hides Bell/Dashboard icons below `sm` breakpoint; adds Watchlist, Price Alerts, Dashboard to mobile nav dropdown
  - New components: `FadeIn`, `BrandAvatar`, `MotionProvider`, `PageTransition`, `HomeAlertForm`, `DealFilters`
  - New pages: `/dashboard`, `/not-found`
  - Removed `scroll-reveal.tsx` (superseded by `fade-in`)

## [2.4.0] — 2026-04-04

### Added
- Sponsored placement system with strict FTC labeling (task 3.3)
  - `sponsored_placements` table: brand FK, `placement_type` enum (`featured_deal` | `featured_brand`), start/end timestamps, isActive flag
  - `getFeaturedPlacements(type)`: server-side query returning active placements with brand's best organic deal (position only — scores/trust data untouched)
  - `SponsoredBadge`: amber disclosure pill + tooltip explaining paid placement (FTC-compliant, no visual downplaying)
  - `FeaturedSection`: amber-accented deal card grid shown above organic results on `/deals` when active `featured_deal` sponsorships exist
  - `/brands` page: amber-accented featured brands row above organic brand grid when active `featured_brand` sponsorships exist
  - `/api/admin/sponsorships`: GET (list all), POST (create — brandSlug, placementType, startsAt, endsAt), PATCH (update isActive/endsAt/notes)
  - Admin dashboard: Sponsorships panel with Live/Scheduled/Expired/Inactive status per row
  - Migration applied on VPS; table live in production

---

## [2.3.0] — 2026-04-04

### Added
- Premium alerts tier — management, free-tier cap, unsubscribe flow (task 3.2)
  - Free tier cap: 5 active alerts per email enforced server-side; 402 `ALERT_LIMIT_REACHED` with user-facing message
  - `AlertManager` component: email-based alert lookup, active alert list with delete buttons, `useTransition` non-blocking deletes, "Fired" indicator when `lastSentAt` is set
  - `AlertForm` now accepts `initialBrand` prop — pre-fills brand input when `?brand=<slug>` is in URL
  - `/alerts` page rewritten as server component: reads `?unsubscribe=<id>` and deactivates alert without JS; reads `?brand=` and passes to `AlertForm`
  - Watchlist page wires alert CTAs: brand-level Bell icon → `/alerts?brand=<slug>`, empty-deal fallback → `/alerts?brand=<slug>`
  - Free tier note: "Free tier includes up to 5 active alerts · 24-hour delivery cooldown"

---

## [2.2.0] — 2026-04-04

### Added
- Anonymous session-based watchlist (task 3.4)
  - `watchlist_items` table: session_id + brand_id unique pairs, cascades on brand delete
  - `middleware.ts`: mints `igift_session` UUID cookie on first visit (Edge Runtime, httpOnly, 1-year TTL)
  - `/api/watchlist`: GET / POST / DELETE — idempotent, session-scoped
  - `WatchButton` component: Heart icon toggle with `useTransition` for non-blocking UX
  - `/watchlist` page: empty state + best-deal-per-brand view with alert CTA
  - Header Heart icon links to `/watchlist`
  - DealCard and brand pages enriched with server-read `initialWatched` state
- Ingestion cron schedule
  - `scripts/ingest-cron.sh`: authenticated API call, timestamped log output
  - VPS crontab: runs `POST /api/ingest` every 6 hours

---

## [2.1.0] — 2026-04-04

### Added
- Affiliate click tracking system (task 3.1)
  - `affiliate_clicks` table: offer/source/brand FKs, privacy-hashed IP/UA, destination URL, network, timestamps
  - `/api/click/[offerId]`: rate-limited (30/IP/min) 302 affiliate redirect with fire-and-forget logging
  - `/lib/affiliate.ts`: per-network URL builder, SHA-256 privacy hashing, click stats aggregation
  - `/api/admin/clicks`: authenticated stats endpoint (total, 24h, 7d, top 5 sources by network)
  - Admin dashboard: Click Attribution panel + API reference entries
- DealCard "View Deal" CTA now routes through `/api/click/` for attribution tracking

---

## [2.0.0] — 2026-04-04

### Changed
- **Full rebrand**: RealDeal → iGift across entire codebase (package names, configs, UI, docs, KB)
- Deploy script: hardcoded VPS credentials → env vars with fail-closed `${VAR:?}` syntax
- Docker Compose: credentials use env var interpolation from .env
- Deploy script preserves .env on rsync and sources it before docker compose

### Added
- Custom SVG logo (gift box on 24×24 grid)
- CSS-only scroll reveal animations (IntersectionObserver + keyframes)
- Open source files: LICENSE (MIT), README.md, SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, .env.example

### Security
- Git history scrubbed of all sensitive data (VPS IP, SSH key path, credential paths)
- API keys and database password rotated
- GitHub repo renamed and made public (Cryptosours/igift)

---

## [1.4.0-killswitch] — 2026-04-03

### Added
- Source kill switch system (`lib/killswitch.ts`) — 3-level operational safety controls
- Per-source kill switch: disables source + suppresses all active offers
- Per-category kill switch: suppresses all active offers in a category (runtime state)
- Global kill switch: halts entire ingestion pipeline (runtime state)
- `/api/admin/killswitch` endpoint — GET for state, POST to execute actions
- Orchestrator checks global kill switch before running

### Changed
- Admin API Reference updated with kill switch endpoints
- Task 2.8 marked DONE

---

## [1.3.0-clustering] — 2026-04-03

### Added
- Duplicate clustering engine (`lib/clustering.ts`) — groups same product from different sources
- Cluster key: `brandSlug:denomination:currency` — identifies duplicate offers across sources
- Confidence boost: +5 per agreeing source (max +15) when prices within 5% threshold
- `getClusterForOffer()` — frontend API to get all sources for a specific product
- Clustering integrated into orchestrator as step 7 (runs after revalidation)

### Changed
- Ingestion pipeline now has 8 steps: fetch → normalize → score → upsert → stale-mark → revalidate → cluster → alert
- Ingestion API response includes `clustering` stats (clustersFound, offersUpdated, confidenceBoosts)
- Task 2.3 marked DONE

---

## [1.2.0-alerts] — 2026-04-03

### Added
- Alert matching engine (`lib/alerts/matcher.ts`) — matches user alerts to eligible offers by brand, category, discount, region
- Email delivery service (`lib/alerts/email.ts`) — Resend REST API transport with HTML+text templates, dev console fallback
- Alert orchestrator (`lib/alerts/index.ts`) — coordinates matching, delivery, and sent-marking after ingestion
- `/api/alerts` endpoint — POST to create alert, GET to list by email, DELETE to deactivate
- Interactive AlertForm client component — replaces static form on /alerts page with API-connected form
- 24-hour cooldown per alert to prevent spam
- Email templates with deal card, trust zone indicator, unsubscribe link
- Alert processing integrated into ingestion pipeline (step 7: match + deliver after upsert)

### Changed
- Alerts page now uses interactive `AlertForm` client component (was static)
- Orchestrator runs alert processing after revalidation, scoped to upserted offer IDs
- Ingestion API response includes `alerts` stats (matched, delivered, failed)
- Task 2.4 marked DONE

---

## [1.1.0-phase2] — 2026-04-03

### Added
- Offer revalidation module (`lib/revalidation.ts`) — per-offer staleness detection and expiry lifecycle
- `/api/admin/revalidation` endpoint — GET for lifecycle report, POST to trigger revalidation cycle
- Offer Lifecycle dashboard on admin page — active/stale/expired/at-risk/cleanup counts, per-source breakdown
- Automatic offer staleness: offers not seen within 3x source refresh interval marked stale
- Automatic offer expiry: stale offers unseen for 7+ days marked expired
- At-risk detection: offers past 50% of their SLA window flagged in dashboard
- Cleanup candidate tracking: offers unseen for 30+ days identified for future removal

### Changed
- Orchestrator now runs revalidation after each ingestion cycle (step 6)
- Ingestion API response includes `revalidation` stats (staleMarked, expiredMarked, activeOffers)
- Task 2.2 marked DONE

---

## [1.0.0-phase2] — 2026-04-03

### Added
- Parser health monitoring module (`lib/health.ts`) with freshness SLAs and success rate thresholds
- `/api/admin/health` endpoint — GET for health report, POST to mark stale offers
- Source Health dashboard on admin page — status badges, freshness indicators, SLA tracking, success rate bars
- Rolling success rate computation in orchestrator (exponential moving average, α=0.2)
- Auto-stale marking: pipeline marks offers from unhealthy sources after each run

### Changed
- Orchestrator now updates `fetchSuccessRate` after each adapter run
- Ingestion API response includes `staleMarked` count
- Task 2.1 marked DONE — Phase 2 begun

---

## [0.9.0-search] — 2026-04-03

### Added
- Full-text search across deals, brands, sources, and categories
- `/api/search` endpoint with query, region, and trustZone filters
- SearchBar component (compact + expanded variants) with 300ms debounced search
- HeroSearch on home page — search directly from hero section
- DealSearch component on deals page with inline results, empty state, URL param support
- Header search icon now toggles an expandable search bar

### Changed
- Deals page now uses `DealSearch` wrapper for search-aware grid
- Home page hero now features a search bar above CTA buttons
- Task 1.12 marked DONE — Phase 1 complete (15/15 tasks)

---

## [0.8.0-adapters] — 2026-04-03

### Added
- Raise/GCX adapter: public page parser for gift card marketplace listings (yellow zone)
- Gift Card Granny adapter: aggregator/comparison site parser with multi-strategy extraction (green zone)
- Gameflip adapter: gaming-focused marketplace parser with JSON-LD and listing fallback (yellow zone)
- BuySellVouchers adapter: P2P marketplace parser with seller rating tiers, 3-strategy extraction (yellow zone)
- eBay brand added to seed data and normalize aliases
- 3 new sources in seed data: Gift Card Granny (green), Gameflip (yellow), BuySellVouchers (yellow)
- 17 additional brand name aliases for marketplace listing variations

### Changed
- Adapter registry now exports 9 adapters (was 6): bitrefill, dundle, raise, giftcardgranny, gameflip, buysellvouchers + 4 catalog
- Orchestrator registers all 10 adapters (7 live + 4 catalog)
- Total tracked products across all live adapters: ~58 (12+11+12+12+10+12 minus overlaps)

---

## [0.7.0-security] — 2026-04-03

### Added
- Cloudflare security hardening: HSTS, TLS 1.3+0-RTT, WAF custom rules (admin path blocking, scanner blocking, API challenge), browser integrity check, email obfuscation, Always HTTPS
- Origin CA certificate for igift.app (Full Strict SSL, expires 2041)
- Nginx hardened config: SSL with Origin CA, strong ciphers, rate limiting (10r/s), blocked sensitive paths, security headers
- UFW firewall: HTTP/HTTPS restricted to Cloudflare IPs only (22 subnets)
- SSH hardening: PermitRootLogin no, MaxAuthTries 3, no forwarding
- fail2ban: SSH, nginx-http-auth, nginx-botsearch, nginx-badbots jails
- Next.js security headers: CSP (frame-ancestors none, form-action self), HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control
- Strong admin API keys (256-bit entropy) deployed to production .env

### Changed
- next.config.ts: added security headers and disabled poweredByHeader
- docker-compose.yml: ADMIN_API_KEY and INGEST_API_KEY read from .env file
- Nginx: igift.app config with SSL

### Security
- 3-layer defense: Cloudflare edge → nginx origin → Next.js application
- Admin paths blocked at both Cloudflare WAF and nginx level
- Direct IP access blocked by UFW (only Cloudflare subnets allowed)
- Default admin keys replaced with cryptographically strong secrets

---

## [0.6.0-moderation] — 2026-04-02

### Added
- Admin moderation queue: case management API at /api/admin/moderation
- Individual case resolution at /api/admin/moderation/[id] (approve/suppress/dismiss/reopen)
- Direct offer actions at /api/admin/moderation/offers/[id]
- Auto-flagging system in ingestion pipeline (suspicious discount, missing region, low confidence, new source sampling)
- Admin UI at /admin with server-rendered moderation dashboard
- Admin layout with dark nav bar, noindex/nofollow meta
- Shared admin auth module

### Changed
- Orchestrator now runs flagging after upsert, creates moderation cases and sets offers to pending_review
- Ingestion API response includes totalFlagged and per-source flaggedCount

---

## [0.5.0-ingest] — 2026-04-02

### Added
- Ingestion pipeline: complete fetch → normalize → score → upsert orchestrator
- Source adapter system: SourceAdapter interface, RawOffer/AdapterResult types
- Bitrefill adapter: live HTML parser for 12 products, TanStack Query dehydrated state extraction
- dundle adapter: live HTML parser for 11 products, JSON-LD + regex fallback
- Configured catalog adapter: manual entries for blocked sources (Costco, eGifter, CardCash, PayPal)
- Normalization pipeline: brand alias resolution (50+ aliases), static FX (13 currencies), country normalization, denomination extraction, title normalization
- Admin Source API: CRUD at /api/admin/sources with auth, validation, soft-delete
- Ingest trigger API: POST /api/ingest with dry-run mode and source filtering
- Price history recording on every upsert

### Changed
- Offers table now populated by live pipeline (180 offers from 7 sources)
- Source metadata updated with lastFetchedAt/lastSuccessAt after pipeline runs

---

## [0.4.0-wired] — 2026-04-01

### Added
- Data access layer (`src/lib/data.ts`): centralized DB query functions with cents-to-dollars transformation
- Category metadata mapping (enum values ↔ URL slugs ↔ display names/icons)

### Changed
- Home page: fetches top 6 deals and category counts from PostgreSQL
- Deals page: fetches all active offers sorted by finalScore from DB
- Brands page: fetches brands with real deal counts and avg discount from DB
- Brand detail pages: fully dynamic, fetches brand + offers from DB, uses `notFound()` for missing slugs
- Categories page: fetches categories with real deal counts from DB
- Category detail page: fetches offers filtered by category from DB
- All data pages switched from static (`○`) to dynamic (`ƒ`) rendering
- Graceful fallback to sample data when DB is unavailable (local dev)

---

## [0.3.0-data] — 2026-04-01

### Added
- Canonical data schemas: 7 PostgreSQL tables via Drizzle ORM (sources, brands, offers, price_history, user_alerts, source_requests, moderation_cases)
- Scoring engine v1: dual Deal Quality Score + Confidence Score with hard suppression rules
- API routes: GET /api/deals, GET /api/brands, GET /api/brands/[slug]
- PostgreSQL 16 container in docker-compose with persistent volume
- Seed script: 7 sources, 12 brands, 15 scored offers, 15 price history entries
- Database connection module (drizzle-orm + postgres.js)

### Changed
- docker-compose.yml: added PostgreSQL service, web depends on db health
- Web container now connects to database for API routes

---

## [0.2.0-deploy] — 2026-03-31

### Added
- Legal pages: Terms of Service, Privacy Policy, Affiliate Disclosure
- SEO: robots.txt, dynamic sitemap.ts, JSON-LD structured data on brand pages
- Dynamic brand detail pages (/brands/[slug]) with 12 brands
- Dynamic category detail pages (/categories/[slug]) with 6 categories
- Docker: multi-stage Dockerfile with standalone Next.js output
- docker-compose.yml with health checks
- Deploy script (scripts/deploy.sh) for rsync + Docker deployment
- Nginx reverse proxy with SSL termination

### Changed
- Next.js config: enabled standalone output for Docker deployment
- Total pages: 31+ (13 static routes + 12 brand + 6 category)

---

## [0.1.0-genesis] — 2026-03-31

### Added
- Turborepo monorepo with Next.js 15 App Router
- Design system: brand/deal/alert color scales, trust zone colors, typography (Inter + JetBrains Mono), 4px spacing grid
- Layout: sticky header with navigation and mobile hamburger, footer with link columns
- Home page: hero, how-it-works, top deals, categories, trust section with alert signup
- Deals page with filter pills and sort controls
- Brands page with brand grid and discount indicators
- Categories page with category cards
- Methodology page with full scoring explanation and trust zone documentation
- Alerts page with alert creation form
- About page with mission statement and contact
- DealCard, TrustBadge, DealScore UI components
- Sample data for 6 deals, 6 categories, 12 brands
- Governance: CLAUDE.md, PROJECT_RULES.md, PRODUCTION_PLAN.md
- KB: PROJECT_BRIEF.md, PRODUCT_VISION.md, ARCHITECTURE_DECISIONS.md (10 ADRs)
- Session log and changelog
