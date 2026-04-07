# iGift — Production Plan

## Phase 0: Genesis (Current)
> Goal: Scaffold, design system, core pages, governance, knowledge base.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 0.1 | Scaffold Turborepo + Next.js monorepo | DONE | Architect | Critical |
| 0.2 | Define design system (tokens, colors, typography) | DONE | Designer | Critical |
| 0.3 | Build layout (header, footer, navigation) | DONE | Builder | Critical |
| 0.4 | Build home page with hero, deals, categories, trust section | DONE | Builder | Critical |
| 0.5 | Build deals listing page with filters | DONE | Builder | Critical |
| 0.6 | Build brands listing page | DONE | Builder | Critical |
| 0.7 | Build categories page | DONE | Builder | Critical |
| 0.8 | Build methodology page (scoring explanation) | DONE | Builder | Critical |
| 0.9 | Build alerts page with form | DONE | Builder | Critical |
| 0.10 | Build about page | DONE | Builder | Critical |
| 0.11 | Create CLAUDE.md, PROJECT_RULES.md | DONE | Architect | Critical |
| 0.12 | Create PRODUCTION_PLAN.md | DONE | Architect | Critical |
| 0.13 | Create KB files (brief, vision, architecture) | DONE | Architect | Critical |
| 0.14 | Set up Notion project hub | DONE | Operator | High |
| 0.15 | Git init, first commit, push to GitHub | DONE | Operator | Critical |
| 0.16 | Create legal pages (terms, privacy, disclosure) | DONE | Builder | High |
| 0.17 | Add SEO foundation (robots.txt, sitemap, JSON-LD) | DONE | SEO | High |
| 0.18 | Copy research docs into docs/research/ | DONE | Operator | Medium |
| 0.19 | Build dynamic brand detail pages (/brands/[slug]) | DONE | Builder | High |
| 0.20 | Build dynamic category detail pages (/categories/[slug]) | DONE | Builder | High |
| 0.21 | Docker build + deploy to VPS | DONE | Operator | High |
| 0.22 | Create deploy user with SSH key | DONE | Operator | High |
| 0.23 | Configure Nginx reverse proxy | DONE | Operator | High |
| 0.24 | Domain setup (igift.app) + Cloudflare DNS | DONE | Operator | Critical |
| 0.25 | Security hardening: Cloudflare WAF, Origin CA, SSL Full Strict | DONE | Operator | Critical |
| 0.26 | Security hardening: VPS firewall (UFW), SSH, fail2ban | DONE | Operator | Critical |
| 0.27 | Security hardening: Next.js security headers, CSP, strong API keys | DONE | Operator | Critical |

### Genesis Quality Gates
- [x] Project installs, builds, and runs without errors
- [x] At least one build passes, linting clean
- [x] Home page renders with real content
- [x] Navigation exists with all planned routes
- [x] Design system tokens defined
- [x] CLAUDE.md complete enough for any agent to start working
- [x] Production plan has full phase breakdown
- [x] KB initialized, session log started
- [x] Git repo created and pushed
- [x] Deployed to VPS and serving HTTP 200

---

## Phase 1: Data Foundation (V0.1 — Next)
> Goal: Canonical data model, first source adapters, normalization pipeline, scoring engine v1.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 1.1 | Define canonical schemas (Source, Brand, Offer, PriceHistory, etc.) | DONE | Architect | Critical |
| 1.2 | Set up PostgreSQL + Drizzle ORM | DONE | Builder | Critical |
| 1.3 | Build source registry and onboarding workflow | DONE | Builder | Critical |
| 1.4 | Implement first 3 API/feed source adapters | DONE | Builder | Critical |
| 1.5 | Build normalization pipeline (FX, region, denomination) | DONE | Builder | Critical |
| 1.6 | Build price-history storage and tracking | DONE | Builder | High |
| 1.7 | Build ranking/scoring engine v1 (DealQuality + Confidence) | DONE | Builder | Critical |
| 1.8 | Build hard suppression rules (red zone, region-incompatible) | DONE | Builder | Critical |
| 1.9 | Wire real data to frontend pages | DONE | Builder | High |
| 1.10 | Build admin moderation queue (basic) | DONE | Builder | High |
| 1.11 | Implement 3 more source adapters (public pages) | DONE | Builder | Medium |
| 1.11b | Add BuySellVouchers adapter (user-requested) | DONE | Builder | Medium |
| 1.12 | Add search (Postgres FTS + search UI) | DONE | Builder | Medium |
| 1.13 | Build API routes (deals, brands, brands/[slug]) | DONE | Builder | Critical |
| 1.14 | Seed database with realistic scored data | DONE | Builder | High |

---

## Phase 2: Automation & Hardening (V0.2)
> Goal: Parser health monitoring, automated revalidation, alerts system, LLM-assisted classification.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 2.1 | Parser health monitoring + freshness SLAs | DONE | Builder | Critical |
| 2.2 | Automated offer revalidation and staleness detection | DONE | Builder | Critical |
| 2.3 | Duplicate clustering engine | DONE | Builder | High |
| 2.4 | Email/Telegram alert delivery system | DONE | Builder | Critical |
| 2.5 | LLM-assisted multilingual title normalization | DONE | Builder | Medium |
| 2.6 | LLM-assisted category mapping from messy text | DONE | Builder | Medium |
| 2.7 | Merchant complaint workflow | DONE | Builder | Medium |
| 2.8 | Source kill switches (per-source, per-category, global) | DONE | Builder | High |

---

## Phase 3: Monetization (V0.3)
> Goal: Affiliate deep links, premium alerts, sponsored placements.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 3.1 | Affiliate deep link system with attribution | DONE | Builder | Critical |
| 3.2 | Premium alerts tier (subscription) | DONE | Builder | High |
| 3.3 | Sponsored placement system with strict labeling | DONE | Builder | Medium |
| 3.4 | User accounts and watchlist persistence | DONE | Builder | High |
| 3.5 | Pro dashboard for power users | DONE | Builder | Medium |

---

## Phase 4: Scale & Defensibility (V1.0+)
> Goal: More sources, B2B API, deeper analytics, additional regions/languages.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 4.1 | B2B / API product (read-only deal data API) | DONE | Architect | High |
| 4.2 | Partner feed expansion (10+ new sources) | DONE | Operator | High |
| 4.3 | Historical analytics and trend pages | DONE | Builder | Medium |
| 4.4 | Merchant/source scorecards | DONE | Builder | Medium |
| 4.5 | Additional languages (de-DE) | DONE | Builder | Medium |
| 4.6 | Additional regions (EU, UK, AU) | DONE | Builder | Medium |

---

## Phase 5: Quality & Production Hardening (V1.1)
> Goal: Testing infrastructure, error handling, code quality, monitoring. Close the gap between feature-complete and production-ready.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 5.1 | Error boundaries (error.tsx + global-error.tsx) | DONE | Builder | Critical |
| 5.2 | Remove sample-data fallback — proper empty states | DONE | Builder | Critical |
| 5.3 | Vitest testing infrastructure | DONE | Builder | Critical |
| 5.4 | Scoring engine tests (30 tests) | DONE | Builder | Critical |
| 5.5 | Normalization pipeline tests (39 tests) + empty-brand bug fix | DONE | Builder | Critical |
| 5.6 | Regions module tests (20 tests) | DONE | Builder | High |
| 5.7 | Adapter unit tests (bitrefill, dundle, raise) | DONE | Builder | High |
| 5.8 | API route integration tests (36 tests) | DONE | Builder | High |
| 5.9 | Clustering engine tests (18 tests) | DONE | Builder | Medium |
| 5.10 | Alert matcher tests (25 tests) | DONE | Builder | Medium |
| 5.11 | Error tracking (Sentry) — DSN-ready, awaiting project creation | DONE | Operator | High |
| 5.12 | Performance audit (bundle analysis, TTFB) | DONE | Builder | Medium |
| 5.13 | Accessibility audit (skip-link, labels, ARIA, a11y linting) | DONE | Designer | Medium |
| 5.14 | CI/CD pipeline (GitHub Actions: lint + test + build) | DONE | Operator | High |

---

## Phase 6: Launch Polish & Growth (V1.2)
> Goal: SEO structured data, OG images, component tests, deploy automation, dark mode.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 6.1 | JSON-LD structured data for deals, categories, home (brands done) | DONE | SEO | High |
| 6.2 | Dynamic OG image generation (Next.js ImageResponse) | DONE | Builder | High |
| 6.3 | Frontend component tests (DealCard, DealScore, TrustBadge, DealFilters) | DONE | Builder | High |
| 6.4 | Dark mode (CSS variables + toggle) | DONE | Designer | Medium |
| 6.5 | Deploy latest code to VPS | DONE | Operator | Critical |
| 6.6 | Create Sentry project + set SENTRY_DSN on VPS | TODO | Operator | High |
| 6.7 | Verify VPS env vars (ADMIN_API_KEY, INGEST_API_KEY) after auth hardening | DONE | Operator | Critical |
| 6.8 | npm audit fix (esbuild override + root next-intl cleanup) | DONE | Builder | Medium |
| 6.9 | Automated deploy pipeline (GitHub → VPS on push) | DONE* | Operator | Medium |
| 6.10 | Rate limiter for public API routes (anti-abuse) | DONE | Builder | Medium |
