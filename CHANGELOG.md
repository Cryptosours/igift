# Changelog

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
