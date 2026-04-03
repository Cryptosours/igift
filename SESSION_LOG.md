# RealDeal — Session Log

## Session 8 — 2026-04-03 — Search + Health Monitoring (Phase 1 Complete → Phase 2 Start)

### What Was Done
- Evaluated search solutions: Meilisearch vs Postgres FTS vs client-side
  - Chose Postgres ILIKE search for V1 — zero infrastructure, instant consistency
  - Clear upgrade path to Meilisearch when volume demands it (100K+ offers)
- Built `searchDeals()` function in data layer with multi-field ILIKE matching (title, brand, source, category)
- Built `/api/search` API route with query param, fallback to sample data search
- Built `SearchBar` component — dual variant (compact for header, expanded for page), 300ms debounce, inline results
- Built `DealSearch` client component — wraps deals grid with live search, empty state, result count
- Built `HeroSearch` component — search bar in home page hero, navigates to `/deals?q=...`
- Wired header search icon to toggle expandable search bar
- Updated deals page to use `DealSearch` with `?q=` URL param support
- Build passes cleanly; deals page bundle: 3.98 kB First Load JS (was 169 B)

### Key Decisions
- **Postgres over Meilisearch**: At current scale (<1000 offers), adding a Docker service for search is over-engineering. ILIKE across indexed columns is fast enough. Meilisearch upgrade path documented in ADR.
- **Application-layer search**: Since dev mode uses sample data fallback (no running Postgres), search also falls back to client-side filtering of sample data. This makes the feature testable without Docker.
- **URL-shareable search**: `/deals?q=steam` is bookmarkable/shareable. SearchBar reads from URL params on mount and syncs state bidirectionally.

### Files Changed
- `apps/web/src/lib/data.ts` — added `searchDeals()` function, imported `or`/`ilike`
- `apps/web/src/app/api/search/route.ts` — NEW search API
- `apps/web/src/components/ui/search-bar.tsx` — NEW dual-variant search bar
- `apps/web/src/components/ui/hero-search.tsx` — NEW home page search
- `apps/web/src/components/deals/deal-search.tsx` — NEW search-aware deal grid
- `apps/web/src/app/deals/page.tsx` — integrated DealSearch component
- `apps/web/src/app/page.tsx` — added HeroSearch to hero section
- `apps/web/src/components/layout/header.tsx` — search icon toggles expandable search bar
- `PRODUCTION_PLAN.md` — marked 1.12 as DONE
- `CHANGELOG.md` — added search entry
- `SESSION_LOG.md` — this entry

### Task 2.1 — Parser Health Monitoring + Freshness SLAs
- Built `lib/health.ts` — health computation module:
  - Derives health status per source from existing DB fields (no new tables)
  - 4 statuses: healthy / degraded / unhealthy / unknown
  - SLA based on `refreshIntervalMinutes` with 1.5x degraded / 2x stale multipliers
  - Success rate thresholds: <80% degraded, <50% unhealthy
  - `markStaleOffers()` — auto-marks active offers from stale sources
- Built `/api/admin/health` API (GET: report, POST: mark stale)
- Added Source Health dashboard to admin page — table with status badges, freshness, SLA, success rate bars, offer counts
- Updated orchestrator:
  - Computes rolling success rate (exponential moving average, α=0.2) after each run
  - Auto-marks stale offers at end of pipeline
  - Reports `staleMarked` count in ingestion results

### Files Changed (Task 2.1)
- `apps/web/src/lib/health.ts` — NEW health computation module
- `apps/web/src/app/api/admin/health/route.ts` — NEW health API endpoint
- `apps/web/src/app/admin/page.tsx` — added Source Health dashboard section
- `apps/web/src/lib/ingest/orchestrator.ts` — rolling success rate, auto-stale marking
- `apps/web/src/app/api/ingest/route.ts` — added staleMarked to response

### Production Plan Status
- Phase 0: 27/27 DONE
- Phase 1: 15/15 DONE — PHASE COMPLETE
- Phase 2: 1/8 DONE (2.1 health monitoring)
- Phase 3: 0/5

---

## Session 7 — 2026-04-03 — New Source Adapters + BuySellVouchers

### What Was Done
- Initialized persistent memory system for cross-session context
- Audited ~250+ installed skills — identified key categories for RealDeal (security, devops, frontend, SEO, planning)
- Confirmed Monday.com MCP is NOT connected (only Notion and Linear available)
- Built 3 new source adapters (Task 1.11):
  - **Raise/GCX adapter** (`raise.ts`): marketplace parser, JSON-LD + regex fallback, yellow zone, 12 tracked products
  - **Gift Card Granny adapter** (`giftcardgranny.ts`): aggregator parser, 3-strategy extraction (JSON-LD, price pairs, discount synthesis), green zone, 12 tracked products
  - **Gameflip adapter** (`gameflip.ts`): gaming marketplace parser, JSON-LD ItemList + Product + listing fallback, yellow zone, 10 tracked products
- Built **BuySellVouchers adapter** (Task 1.11b, user-requested):
  - **BSV adapter** (`buysellvouchers.ts`): P2P marketplace parser, 3-strategy extraction (listing pattern, price-discount, simple fallback), seller rating tier mapping (Beginner→Legend), 0.5% buyer fee, yellow zone, 12 tracked products
  - Added BSV source to seed data (yellow, marketplace_resale)
  - Added eBay brand to seed data (new brand tracked by BSV)
  - Added eBay brand aliases to normalize.ts
- Registered all 4 new adapters in orchestrator and adapter index
- Added 2+1 new sources to seed data (Gift Card Granny, Gameflip, BuySellVouchers)
- Added 14+3 brand name aliases in normalize.ts
- Build passes cleanly

### Key Decisions
- Chose Raise/GCX, Gift Card Granny, Gameflip as the 3 new sources because:
  - GCX was already seeded in DB but had no adapter
  - GCG is a green-zone aggregator providing cross-source price comparison data
  - Gameflip fills the gaming niche with marketplace discounts
- BuySellVouchers added per user request — P2P marketplace with 10+ year history, 650K+ monthly tx
  - BSV is Next.js-based with __next_f payloads (no JSON-LD), required custom regex strategies
  - Classified as yellow zone with buyer protection
- All adapters follow the same pattern: TRACKED_PRODUCTS → sequential fetch → HTML parse → RawOffer[]
- Each adapter has multiple parsing strategies (JSON-LD first, regex fallback)
- Polite delays between requests (500-1000ms) to respect rate limits

### Files Changed
- `apps/web/src/lib/ingest/adapters/raise.ts` — NEW
- `apps/web/src/lib/ingest/adapters/giftcardgranny.ts` — NEW
- `apps/web/src/lib/ingest/adapters/gameflip.ts` — NEW
- `apps/web/src/lib/ingest/adapters/buysellvouchers.ts` — NEW
- `apps/web/src/lib/ingest/adapters/index.ts` — added 4 new exports
- `apps/web/src/lib/ingest/orchestrator.ts` — registered 4 new adapters
- `apps/web/src/lib/ingest/normalize.ts` — added 17 brand aliases (14 + 3 eBay)
- `apps/web/src/db/seed.ts` — added Gift Card Granny, Gameflip, BuySellVouchers sources + eBay brand
- `PRODUCTION_PLAN.md` — marked 1.11 DONE, added 1.11b DONE
- `CHANGELOG.md` — updated v0.8.0-adapters entry
- `SESSION_LOG.md` — this entry

### Production Plan Status
- Phase 0: 27/27 DONE ✅
- Phase 1: 14/15 DONE (only 1.12 Search remains)
- Phase 2: 0/8
- Phase 3: 0/5

---

## Session 1 — 2026-03-31 — Genesis

### What Was Done
- Read and synthesized two comprehensive research reports (ChatGPT deep research)
- Defined tech stack: Turborepo + Next.js 15 + TypeScript + Tailwind CSS 4
- Scaffolded monorepo structure (apps/web, packages/*, services/*, infra/, data/, docs/, kb/)
- Built design system with custom tokens (@theme): brand colors, deal colors, alert colors, trust zone colors, typography scale, spacing grid
- Built core layout: sticky header with navigation + mobile hamburger, footer with link columns and affiliate disclosure
- Built home page: hero section, how-it-works grid, top deals section with DealCard component, category browser, trust explanation with alert signup form
- Built DealCard component with: effective price, face value strikethrough, discount badge, trust badge, deal score, confidence score, region/freshness meta, external link CTA
- Built TrustBadge component (Green/Yellow/Red with shield icons)
- Built DealScore component (gradient pills: Excellent/Good/Fair/Weak)
- Built 7 pages: home, deals, brands, categories, methodology, alerts, about
- All pages have unique title/description metadata and OG tags
- Created governance: CLAUDE.md, PROJECT_RULES.md, PRODUCTION_PLAN.md
- Created KB: PROJECT_BRIEF.md, PRODUCT_VISION.md, ARCHITECTURE_DECISIONS.md
- Build passes cleanly: all 7 pages statically rendered, 0 errors, ~102kB First Load JS

### Decisions Made
- Turborepo over Nx (lighter, sufficient for our needs)
- Next.js 15 over Astro (SSR + React ecosystem + Vercel)
- Drizzle ORM planned over Prisma (SQL-first, lighter runtime)
- Inter + JetBrains Mono fonts (clean + tabular numbers for prices)
- Dual scoring system (Deal Quality + Confidence shown separately)
- Green/Yellow/Red trust zones as primary trust UX
- Publisher/referral model only in V1

### Lessons
- Interactive CLI tools (create-turbo, create-next-app) fail in non-TTY environments — manual scaffolding is cleaner and gives more control
- Tailwind CSS 4 @theme syntax works well for design tokens as CSS custom properties

### State
- Build: passes
- Pages: 7/7 rendering
- Design system: defined and applied
- Data: sample/placeholder (6 mock deals, 6 categories, 12 brands)
- Backend: not started (Phase 1)
- Deployment: not started

### Next Session Priorities
1. ~~Initialize git, create GitHub repo, push~~ DONE Session 2
2. ~~Set up Notion project management hub~~ DONE Session 1
3. ~~Legal pages (terms, privacy, disclosure)~~ DONE Session 2
4. ~~SEO foundation (robots.txt, sitemap, JSON-LD)~~ DONE Session 2
5. Begin Phase 1: canonical data schemas

---

## Session 2 — 2026-03-31 — Legal, SEO, Dynamic Pages, VPS Deploy

### What Was Done
- Created legal pages: Terms of Service, Privacy Policy, Affiliate Disclosure
- SEO: robots.txt, dynamic sitemap.ts (auto-generates for all brands/categories), JSON-LD on brand pages
- Built dynamic brand detail pages (/brands/[slug]) — 12 brands with descriptions, regions, avg discount, deals
- Built dynamic category detail pages (/categories/[slug]) — 6 categories with deal grids
- Created VPS user `realdeal` on REDACTED_IP with password and SSH key auth (docker group)
- SSH key generated and stored at `${DEPLOY_SSH_KEY}`
- Multi-stage Dockerfile: deps -> builder -> runner (standalone Next.js, ~102kB)
- docker-compose.yml: container on localhost:3200, health check, auto-restart
- Deploy script (scripts/deploy.sh): rsync + SSH Docker rebuild
- Nginx reverse proxy: port 80 -> localhost:3200 on VPS
- Deployed and verified: HTTP 200, 114KB response, 32 static pages
- Updated all credentials in [CREDENTIALS_DIR]/ (CREDENTIAL_INDEX.md + all-credentials.local)
- Pushed to GitHub (Cryptosours/RealDeal)
- Updated Notion with 22 tasks, board/timeline/dashboard views

### Decisions Made
- Port 3200 (3100 was occupied by another project on VPS)
- Standalone Next.js output for minimal Docker image
- Nginx reverse proxy (not Caddy) — consistent with existing VPS setup

### State
- Build: passes (32 pages, 0 errors)
- Pages: 13 routes (+ 12 brand slugs + 6 category slugs = ~31 total pages)
- Deploy: live on VPS at http://REDACTED_IP (via Nginx)
- GitHub: up to date (2 commits on main)
- Notion: synced
- Data: still sample/placeholder
- Backend: not started (Phase 1)

### Next Session Priorities
1. ~~Define canonical schemas with Drizzle ORM~~ DONE Session 3
2. ~~Set up PostgreSQL on VPS~~ DONE Session 3
3. Build first 3 source adapters (API/feed)
4. Build normalization pipeline
5. Wire real data to frontend pages (replace sample data with API calls)

---

## Session 3 — 2026-04-01 — Phase 1 Data Foundation

### What Was Done
- Defined canonical schemas with Drizzle ORM: 7 tables (sources, brands, offers, price_history, user_alerts, source_requests, moderation_cases)
- All monetary values as integers (cents), timestamps UTC, currency ISO 4217
- Built scoring engine v1 implementing the dual-score system from research:
  - Deal Quality Score: price edge, historical advantage, fee transparency, region fit, seller trust, buyer protection, freshness
  - Confidence Score: reference price confidence, data freshness, source reliability, duplicate consistency, fraud risk
  - Hard suppression: red zone excluded, region-incompatible capped at 30
- Built API routes: GET /api/deals, GET /api/brands, GET /api/brands/[slug]
- Added PostgreSQL 16 to docker-compose with persistent volume
- Created seed script with 7 sources, 12 brands, 15 scored offers, 15 price history entries
- Deployed to VPS: DB container running, schema pushed, data seeded, web rebuilt
- API verified: /api/deals returns 15 scored offers, /api/brands returns 12 brands

### Decisions Made
- Port 5433 for PostgreSQL host mapping (5432 internal) to avoid conflicts
- Seed data uses realistic sources (Costco, PayPal, Bitrefill, CardCash, GCX, dundle, eGifter)
- Scoring engine produces sensible rankings: green-zone sources with real discounts rank highest (Disney+ $50 at 66.07, Apple $100 at 66.00)

### Lessons
- drizzle-kit push with --force is needed for empty databases
- Docker compose host port mapping (5433:5432) means tools on host use 5433, containers use service name:5432

### State
- Build: passes (32+ static pages + 3 API routes)
- DB: PostgreSQL 16 with 7 tables, 7 sources, 12 brands, 15 offers, 15 price history
- API: serving real scored data
- VPS: both containers running (db + web)
- Frontend: still using sample data (needs API wiring)

### Next Session Priorities
1. ~~Wire frontend pages to use API data instead of sample data~~ DONE Session 4
2. Build first real source adapter (Bitrefill affiliate feed or similar)
3. Build normalization pipeline
4. Admin moderation queue
5. Domain setup (Cloudflare DNS)

---

## Session 4 — 2026-04-01 — Wire Frontend to Real Data

### What Was Done
- Created data access layer (`src/lib/data.ts`) with centralized DB query functions
  - `getDeals()`: fetches active offers with brand/source joins, transforms cents→dollars into DealCardProps
  - `getBrands()`: fetches brands with deal counts and avg discount from DB
  - `getBrandBySlug()`: fetches single brand with all its offers
  - `getCategories()`: aggregates categories from brands table with deal counts
  - `getCategoryBySlug()`: maps URL slugs to category enum values and display metadata
- Wired all 6 data-driven pages to use DB queries:
  - Home page (`/`): top 6 deals + category counts from DB
  - Deals listing (`/deals`): all active offers sorted by finalScore
  - Brands listing (`/brands`): real deal counts and avg discounts
  - Brand detail (`/brands/[slug]`): fully dynamic with `notFound()` for missing slugs
  - Categories listing (`/categories`): real deal counts per category
  - Category detail (`/categories/[slug]`): offers filtered by category
- All pages fall back gracefully to sample data when DB is unavailable
- Build passes cleanly, deployed to VPS, verified all pages render real data

### Decisions Made
- Direct DB queries in Server Components instead of fetching API routes (faster, no HTTP round-trip)
- Keep sample data as fallback for local dev without DB
- Switched data pages from static to `force-dynamic` rendering (data changes frequently)
- Removed `generateStaticParams` from brand/category pages (DB may not be available at build time)

### Lessons
- TypeScript requires explicit type annotations for variables initialized in try/catch blocks
- Category enum values (`app_stores`) differ from URL slugs (`app-stores`) — need a bidirectional mapping

### State
- Build: passes (10 static + 7 dynamic routes)
- Frontend: all data pages render from PostgreSQL
- API: still functional for external/client-side use
- VPS: deployed and verified
- Sample data: retained as fallback, no longer primary

### Next Session Priorities
1. ~~Build first real source adapter (Bitrefill affiliate feed or similar) (task 1.4)~~ DONE Session 5
2. ~~Build normalization pipeline (FX, region, denomination) (task 1.5)~~ DONE Session 5
3. ~~Build source registry and onboarding workflow (task 1.3)~~ DONE Session 5
4. Admin moderation queue (task 1.10)
5. Domain purchase + Cloudflare DNS setup (human action)

---

## Session 5 — 2026-04-02 — Ingestion Pipeline (Tasks 1.3, 1.4, 1.5)

### What Was Done
- Built complete ingestion pipeline: adapters → normalization → scoring → upsert
- **Source Adapter System** (`src/lib/ingest/`):
  - `types.ts`: RawOffer, AdapterConfig, AdapterResult, SourceAdapter interfaces
  - `normalize.ts`: Brand alias resolution (50+ aliases → 12 brands), static FX conversion (13 currencies → USD), country normalization (ISO 3166-1), denomination extraction from titles, title normalization
  - `adapters/bitrefill.ts`: Live HTML parser for 12 Bitrefill product pages — extracts denominations and USD prices from TanStack Query dehydrated state, sequential fetching with 500ms rate-limit delay
  - `adapters/dundle.ts`: Live HTML parser for 11 dundle products — JSON-LD extraction with regex fallback, face-value reference pricing (green zone)
  - `adapters/catalog.ts`: Configured catalog adapter for sources that block automated access (Costco, eGifter, CardCash, PayPal) — 11 manually curated entries with provenance: "manual", documented migration path to live APIs
  - `adapters/index.ts`: Barrel export for all adapters
- **Ingestion Orchestrator** (`src/lib/ingest/orchestrator.ts`):
  - Loads source + brand maps from DB for slug resolution
  - Iterates adapters → fetch → normalize → score → upsert pipeline
  - Idempotent upserts via (sourceId, externalId) composite key
  - Records price history for every offer
  - Updates source metadata (lastFetchedAt, lastSuccessAt) on success
  - Supports single-source filtering and dry-run mode
- **Admin Source API** (`/api/admin/sources`):
  - GET: List all sources with offer counts
  - POST: Register new source with validation (name, slug, url, sourceType, trustZone required)
  - PATCH `/api/admin/sources/[slug]`: Update allowed fields with trust-zone validation
  - DELETE `/api/admin/sources/[slug]`: Soft-delete (sets isActive: false)
  - Auth via ADMIN_API_KEY Bearer token
- **Ingest Trigger API** (`/api/ingest`):
  - POST: Triggers full pipeline with auth, returns structured results per source
  - GET: Returns pipeline documentation
  - Supports `?source=slug` filter and `?dryRun=true`
- Deployed to VPS, ran full pipeline: **165 offers upserted across 6 sources in 26 seconds**
  - Bitrefill: 42 offers (7/12 products succeeded)
  - dundle: 112 offers (7/11 products succeeded)
  - Catalog: 11 manual entries (Costco 3, eGifter 4, CardCash 2, PayPal 2)
  - Total in DB: 180 offers across 7 sources

### Decisions Made
- Three-tier adapter strategy: live HTML parsing (Bitrefill, dundle), configured catalog (blocked sources), future API feeds (affiliate partnerships)
- Static FX rates in V1 (13 currencies hardcoded) — will move to live rates in Phase 2
- Catalog adapter uses `provenance: "manual"` which penalizes confidence score (correctly signals lower data freshness)
- Sequential fetching with delays for live adapters (respect rate limits)
- Admin API uses allowlist for updatable fields (security by default)

### Lessons
- Most gift card retailers (CardCash, eGifter, Raise) return 403/404 to automated requests — live parsing is unreliable for most sources, making the catalog adapter essential
- Bitrefill embeds pricing in TanStack Query dehydrated state, not JSON-LD — required custom regex parser
- dundle sells at face value (no discount) but is valuable as green-zone reference pricing for scoring comparisons
- Idempotent upserts prevent duplicate offers on re-runs while keeping data fresh

### State
- Build: passes
- DB: 180 offers, 7 sources, 12 brands, 180+ price history entries
- Pipeline: operational (POST /api/ingest triggers full fetch → normalize → score → upsert)
- Admin API: functional (CRUD for sources)
- VPS: deployed and verified
- Frontend: rendering real ingested data

### Next Session Priorities
1. ~~Build admin moderation queue (task 1.10)~~ DONE Session 5 (continued)
2. Implement 3 more source adapters (task 1.11) — research additional green/yellow zone sources
3. Add search (task 1.12)
4. Domain purchase + Cloudflare DNS setup (human action)
5. Fix 404 adapter URLs (Bitrefill PlayStation/Disney+, dundle Apple/Xbox/PlayStation/Nintendo)

---

## Session 5b — 2026-04-02 — Admin Moderation Queue (Task 1.10)

### What Was Done
- Built complete admin moderation system:
  - **Moderation API** (`/api/admin/moderation`): List/create/resolve cases with filtering (status, type), pagination, status summary counts
  - **Case management** (`/api/admin/moderation/[id]`): Resolve with actions (approve → active, suppress → suppressed, dismiss → active, reopen)
  - **Offer actions** (`/api/admin/moderation/offers/[id]`): Direct offer status changes with auto-resolution of linked open cases
  - **Shared auth** (`/api/admin/auth.ts`): Extracted Bearer token auth from source routes, reused across all admin endpoints
- **Auto-flagging system** (`src/lib/ingest/flagging.ts`):
  - Suspicious discount: >35% for all sources, >25% for non-green zone
  - Missing region data: flags offers with no countryRedeemable (rule #6 violation)
  - Low confidence: confidence score <40 triggers review
  - New source sampling: first-run sources get one sample offer flagged for verification
  - Integrated into orchestrator: flags create moderation cases and set offers to pending_review
- **Admin UI** (`/admin`): Server-rendered moderation dashboard with:
  - Status summary cards (open, flagged, resolved, total)
  - Open cases table with type badges, offer details, discount, trust zone, age
  - Flagged offers table (pending_review status)
  - Recently resolved cases log
  - API reference section
  - Own layout (dark nav bar, no public header/footer, noindex/nofollow)
- Deployed to VPS, pipeline tested with flagging (0 flagged = correct, no anomalies in current data)

### Decisions Made
- Flagging thresholds: 35% general, 25% for non-green (gift cards rarely exceed these legitimately)
- First-run flag is sampled (1 offer per source per run) to avoid flooding the queue
- Auto-resolve linked cases when offer is approved/suppressed via direct action
- Admin UI is read-only for now — actions require API calls (Client Components for action buttons will come in Phase 2)

### State
- Build: passes (21 routes total — 10 static + 11 dynamic)
- Phase 1: 12/14 tasks complete (1.11 and 1.12 remaining)
- DB: 180 offers, 7 sources, 0 moderation cases (clean queue)
- VPS: deployed and verified
- GitHub: pushed (commits edbc6ee + upcoming docs commit)

---

## Session 6 — 2026-04-03 — Security Hardening (igift.app)

### What Was Done
- **Cloudflare Security** (zone: `1c06fe3b38ba965ca399c44fde188b34`):
  - SSL: Full (Strict) with Origin CA certificate (expires 2041)
  - HSTS: 6 months max-age, includeSubDomains, preload, nosniff
  - TLS 1.3 with 0-RTT enabled, minimum TLS 1.2
  - Always HTTPS, automatic HTTPS rewrites, opportunistic encryption
  - Security level: High, browser integrity check, email obfuscation
  - Server-side excludes enabled
  - Challenge TTL: 30 minutes
  - WAF custom ruleset (3 rules):
    1. Block /admin, /api/admin, /api/ingest from public IPs
    2. Challenge POST requests to public API endpoints
    3. Block common scanner paths (.env, .git, wp-admin, phpmyadmin, xmlrpc)
  - Cache purged after config changes
- **VPS Security** (REDACTED_IP):
  - UFW firewall: default deny incoming, SSH open, HTTP/HTTPS restricted to Cloudflare IPv4+IPv6 ranges only (15 IPv4 + 7 IPv6 subnets)
  - SSH hardened: PermitRootLogin no, MaxAuthTries 3, MaxSessions 5, LoginGraceTime 30s, X11Forwarding off, AllowTcpForwarding off
  - fail2ban installed: SSH (7200s ban), nginx-http-auth, nginx-botsearch (86400s ban), nginx-badbots (86400s ban)
  - Nginx hardened: igift.app config with Origin CA SSL, TLS 1.2/1.3 only, strong cipher suite, security headers, rate limiting (10r/s with burst 20), blocked sensitive paths, server tokens off, 10MB request limit
  - Nginx default_server removed (was conflicting with freexstudio.com config)
  - Origin CA certificate installed at /etc/nginx/ssl/igift.app/
- **Application Security** (Next.js):
  - Security headers via next.config.ts: CSP, HSTS, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, X-XSS-Protection, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control
  - CSP: default-src 'self', frame-ancestors 'none', form-action 'self'
  - poweredByHeader: false (hides X-Powered-By: Next.js)
  - Admin API keys replaced: 64-char hex keys deployed to /opt/igift/.env
  - docker-compose.yml updated to read keys from .env file
- **Credentials updated**: zone ID, API keys, Origin CA cert location added to all-credentials.local

### Decisions Made
- Full (Strict) SSL over Flexible: end-to-end encryption between CF and origin, prevents MITM
- WAF rules block admin paths at the edge before traffic reaches origin
- UFW restricts HTTP/HTTPS to Cloudflare IPs only — direct IP access blocked
- Next.js handles app-level security headers (CSP, Permissions-Policy), nginx adds transport-level headers
- 64-char hex API keys (256-bit entropy) replace default "dev-admin-key"/"dev-ingest-key"

### Lessons
- Heredoc-within-heredoc over SSH mangles content — SCP config files instead
- Nginx configs with `default_server` conflict when multiple sites exist — only one config should be default
- Cloudflare page rules API requires zone-scoped permissions, not account-level tokens
- Bot Fight Mode requires paid Cloudflare plan (free tier gets basic bot protection)

### State
- Build: passes
- Security: 3-layer hardening live (Cloudflare → nginx → Next.js)
- Site: https://igift.app returns HTTP 200 with all security headers
- VPS: firewall active, SSH hardened, fail2ban running
- Phase 1: 12/14 tasks complete (1.11 and 1.12 remaining)

### Next Session Priorities
1. Set up Monday.com project board
2. Sync Notion with latest progress
3. Task 1.11: Implement 3 more source adapters
4. Task 1.12: Add search
5. Fix 404 adapter URLs (Bitrefill/dundle)
