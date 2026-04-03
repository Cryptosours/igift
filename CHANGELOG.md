# Changelog

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
- Nginx: igift.app config with SSL (was HTTP-only to realdeal.deals)

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
- Deploy script (scripts/deploy.sh) for rsync + Docker VPS deployment
- VPS user 'realdeal' with SSH key auth and Docker access
- Nginx reverse proxy on VPS (port 80 -> container 3200)

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
