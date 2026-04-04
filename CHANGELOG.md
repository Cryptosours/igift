# Changelog

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
