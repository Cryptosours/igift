# RealDeal — Session Log

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
1. Wire frontend pages to use API data instead of sample data
2. Build first real source adapter (Bitrefill affiliate feed or similar)
3. Build normalization pipeline
4. Admin moderation queue
5. Domain setup (Cloudflare DNS)
