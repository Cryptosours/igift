# iGift — Session Log

## Session 35 — 2026-04-09 — Phase 13: Core Engine Hardening + Dark-Orange Visual Identity

### What Was Done
- Removed anti-scraping compliance restrictions from PROJECT_RULES.md + CLAUDE.md
- Added public-page scraping policy: proxy rotation, UA rotation, CAPTCHA solving authorized
- Implemented overpriced offer filter at ingestion pipeline (orchestrator.ts)
- Added overpriced filter to all 5 API query routes (defense-in-depth)
- Deepened dark mode surfaces: body #0f0e0c (was #1a1815), surface-0 #0a0908
- Complete indigo→orange brand color transformation (21 files)
- Updated OG images, PWA manifest, error pages, email templates, price charts
- Dark-first default with FOUC prevention, WCAG AAA contrast ratios verified
- Fixed PRODUCT_VISION.md (stale indigo references → orange)
- Updated VENDORS_LIST.md with Phase 11 expansion data (Task 11.11)

### Commits
- `e6242cc` — feat: core engine hardening + dark-orange visual identity (Phase 13)

### Phase 13 Status: COMPLETE (all 6 tasks DONE)

---

## Session 34 — 2026-04-09 — Phase 12: Live Discovery Feed

### What Was Done
- Created /api/offers/recent endpoint (30 most recent offers)
- Built NewOffersFound client component with Framer Motion rolling animation
- Integrated live feed section into homepage (between Top Deals and Categories)

### Commits
- `180dda1` — feat: add live "New Offers Found" rolling feed on homepage (Phase 12)

### Phase 12 Status: 3/6 tasks DONE. Remaining: 12.4 (API research), 12.5 (affiliate apps), 12.6 (deploy)

---

## Session 33 — 2026-04-08 — Phase 11: Data Pipeline Scale-Up

### What Was Done
- BuySellVouchers V2: 48 products, 7 currencies, pagination, 1% fee fix
- Eneba: expanded 15→37 products, re-enabled in orchestrator
- Kinguin: expanded 17→41 products, re-enabled in orchestrator
- Bitrefill: expanded 12→32 products (gaming + EU/UK)
- Dundle: expanded 11→28 products (gaming + EU/UK)
- Raise: expanded 12→19 products (gaming + retail)
- Added 4 new brands: Fortnite, PUBG, Free Fire, Riot Access

### Commits
- `64c2a0a` — feat: data pipeline scale-up — expand all adapters, re-enable Eneba + Kinguin (Phase 11)

### Phase 11 Status: 8/11 tasks DONE. Remaining: 11.9 (API research), 11.10 (deploy), 11.11 (vendors list — done in Session 35)

---

## Session 32 — 2026-04-08 — Phases 9 & 10: i18n + Dark-First Theme

### What Was Done
- **Phase 9**: Complete i18n for all pages (en + de), PWA icons (192px, 512px), OG image fix
- **Phase 10**: Dark-first theme redesign — deep navy-indigo surfaces, warm cream light mode, ThemeProvider dark default, FOUC script, typography refinements
- Deployed both phases to VPS

### Commits
- `e521857` — feat: complete i18n for all pages + add PWA icons (Phase 9)
- `7a89b04` — feat: dark-first theme redesign — warm cream light mode, deep navy dark mode (Phase 10)
- `ea9f939` — docs: mark deploy tasks 9.12 + 10.8 DONE — Phase 9 & 10 fully complete

### Phase 9 Status: COMPLETE (all 12 tasks DONE)
### Phase 10 Status: COMPLETE (all 8 tasks DONE)

---

## Session 31 — 2026-04-08 — Phase 8: Data Pipeline Reliability

### What Was Done
- Fixed Raise adapter sourceSlug mismatch (gcx → raise)
- Added Uber brand to seed + production DB
- Added /api/health endpoint
- Disabled 6 broken adapters (CDKeys, Eneba, G2A, Kinguin, OffGamers, GiftCardGranny) with root cause documentation
- Fixed vitest JSX transform for component tests
- Added pipeline health dashboard (/api/admin/ingest-health)
- Enabled catalog source entries in DB
- Configured cron ingestion (every 2h)

### Commits
- `3f3bdfb` — feat: add production seed data for sources and brands
- `1021408` — fix: align Raise adapter sourceSlug with DB + add Uber brand
- `de64be0` — feat: add /api/health endpoint + define Phase 8 in production plan
- `00f9c30` — fix: disable 5 broken adapters, update plan with root causes
- `91c7c48` — feat: add pipeline health dashboard + enable catalog adapters (Tasks 8.11, 8.12)

### Phase 8 Status: COMPLETE (10/14 tasks DONE, 4 BLOCKED on API access)

---

## Session 30 — 2026-04-08 — Phase 7 Revenue & Growth: test fixes, AdSense, social sharing, perf, newsletter

### What Was Done

**Test suite / CI fixes (critical):**
- Pinned vitest to ~3.2.4 (Vitest 4 + Vite 8 Rolldown JSX incompatibility)
- Removed `@vitejs/plugin-react` v6, configured esbuild `jsx: "automatic"` directly
- Fixed `@/app/api/admin/auth` mock for module-scope env var timing
- Added vitest to root package.json for monorepo hoisting
- Regenerated lockfile with cross-platform esbuild binaries (CI on ubuntu-latest)
- Added `corepack disable` step in CI to fix npm/yarn packageManager confusion
- Result: **250/250 tests green**, CI pipeline passing

**Phase 7 tasks completed:**
- **7.1 CSP update**: Whitelisted Google Analytics + AdSense domains in Content-Security-Policy
- **7.2 AdSense components**: Consent-aware `AdSenseScript` + `AdUnit` — gated behind env var AND marketing cookie consent
- **7.3 Vitest pin**: Documented as separate task (see test fixes above)
- **7.4 Ad placement**: `AdUnit` slots on deals page (horizontal top, rectangle bottom)
- **7.5 Performance**: Dynamic imports for PriceHistoryChart (Recharts), AlertManager, CookieBanner via thin client wrappers (ssr:false not allowed in Server Components)
- **7.6 Enhanced sitemap**: i18n localized URLs with hreflang alternates (en, de, x-default) for all static + dynamic pages
- **7.7 Social sharing**: `ShareButton` (Web Share API + clipboard fallback) + `SocialShareLinks` (X, WhatsApp, Reddit) — integrated into brand detail and deals pages
- **7.8 Newsletter**: `newsletterSubscribers` DB table, POST/DELETE `/api/newsletter` API, `NewsletterForm` component on home + deals pages

### Commits
1. `344ba31` — fix: resolve test suite regressions — pin vitest 3.x, fix JSX and auth mocks
2. `308138d` — fix: regenerate lockfile with cross-platform esbuild binaries
3. `3070ecc` — feat: Phase 7 — AdSense infrastructure, CSP update, CI fix
4. `cbbc4f6` — feat: i18n sitemap with hreflang + social share buttons (Phase 7.6, 7.7)
5. `8abdb08` — perf: dynamic imports for PriceHistoryChart, AlertManager, CookieBanner (7.5)
6. `ceac8a5` — feat: newsletter deal digest signup with DB schema and API (Phase 7.4, 7.8)

### Phase 7 Status
| Task | Status |
|------|--------|
| 7.1 CSP for GA + AdSense | DONE |
| 7.2 AdSense components | DONE |
| 7.3 Pin vitest 3.x | DONE |
| 7.4 Ad placement | DONE |
| 7.5 Performance (dynamic imports) | DONE |
| 7.6 Enhanced sitemap (i18n) | DONE |
| 7.7 Social sharing | DONE |
| 7.8 Newsletter signup | DONE |
| 7.9–7.12 | HUMAN (GSC, GA ID, AdSense app, affiliates) |

### Remaining
- VPS deployment needed for latest commits
- Run `drizzle-kit push` on VPS for newsletter_subscribers table
- HUMAN tasks: 7.9 (Google Search Console), 7.10 (GA measurement ID), 7.11 (AdSense application), 7.12 (Affiliate signups)

---

## Session 29 — 2026-04-07 — JSON-LD structured data, dynamic OG images, VPS deploy

### What Was Done
- **Task 6.5 (Deploy)**: Pulled 5 pending commits to VPS, rebuilt Docker container with `--force-recreate --no-deps`. Fixed Docker network isolation (connected `igift-db` to `igift_default` network with alias). Verified all endpoints responding.
- **Task 6.7 (Env vars)**: Verified `ADMIN_API_KEY` and `INGEST_API_KEY` are set on VPS after auth hardening removed fallback keys. Confirmed fail-closed behavior works.
- **Task 6.1 (JSON-LD)**: Added schema.org structured data to 4 page types:
  - Home: `WebSite` (with SearchAction) + `Organization`
  - Deals: `ItemList` with `Offer` items (top 20 deals, correct USD pricing)
  - Categories index: `CollectionPage` with `ItemList` of categories
  - Category detail: `CollectionPage` with `ItemList` of category-scoped offers
- **Task 6.2 (OG images)**: Created dynamic `opengraph-image.tsx` files using Next.js `ImageResponse`:
  - Site-wide default: indigo gradient, "iG" logo, tagline, feature pills (edge runtime)
  - Brand detail: shows brand name, category, best/avg discount stats, deal count (nodejs runtime)
  - Category detail: shows category icon, name, description (nodejs runtime)
  - Fixed Satori layout errors: `display: "flex"` on multi-child divs, template literals for single text nodes

- **Task 6.3 (Component tests)**: 43 new frontend tests across 4 test files:
  - `deal-card.test.tsx` (16 tests): price formatting, discount calc, affiliate compliance, brand link, historical low badge
  - `deal-score.test.tsx` (8 tests): score bands (Excellent/Good/Fair/Weak), boundary values, aria-label
  - `trust-badge.test.tsx` (6 tests): zone labels (Verified/Marketplace/Caution), CSS classes
  - `deal-filters.test.tsx` (13 tests): region filtering, global inclusion, green-only/historical toggles, combined filters, empty state, aria-pressed
  - Infra: shared `test-mocks.tsx` (motion/react factory mock), `test-setup.ts` (jest-dom matchers), vitest config updated for jsdom + React plugin

- **Task 6.8 (npm audit)**: Fixed esbuild vulnerability (GHSA-67mh-4wv8-2f99) via root package.json override forcing esbuild 0.25.12 for @esbuild-kit/core-utils. Also removed duplicate `next-intl` from root dependencies that caused next@16 vs next@15 type conflict. `npm audit` now reports 0 vulnerabilities.
- **Task 6.10 (Rate limiter)**: Built sliding-window in-memory rate limiter (`src/lib/rate-limit.ts`) with per-IP, per-route bucketing. Applied to 7 public API routes with appropriate limits:
  - deals/brands: 60 req/min (read-heavy, page loads)
  - search: 30 req/min (heavier DB queries)
  - watchlist: 20 req/min (write operations)
  - alerts GET: 30/min, alerts POST/DELETE: 10/min
  - complaints: 5/min (abuse-sensitive)
  - Returns 429 with `X-RateLimit-*` headers and `Retry-After`

- **Task 6.4 (Dark mode)**: CSS variable remap pattern — `.dark` selector overrides `--color-surface-*` scale so all 565+ component references switch automatically without adding `dark:` variants.
  - `ThemeProvider` with localStorage persistence + system preference listener (light/dark/system)
  - `ThemeToggle` button in header, cycles modes with animated icon swap (Sun/Moon/Monitor)
  - FOUC prevention: inline `<script>` in `<head>` reads localStorage before first paint
  - Brand, deal, alert palettes adjusted for dark backgrounds (brighter on dark)
  - Glass, card-hover, bg-grid, bg-dots overrides for dark context

- **Task 6.9 (Deploy pipeline)**: Created `.github/workflows/deploy.yml` — CI (lint/test/build) → SSH deploy → health check. Uses `appleboy/ssh-action`, `concurrency` group to prevent overlapping deploys, `workflow_dispatch` for manual trigger. **BLOCKED**: needs 3 GitHub Secrets set: `VPS_HOST` (69.30.247.151), `VPS_USER` (realdeal), `VPS_SSH_KEY` (private key from ~/.ssh/realdeal).

### Key Metrics
- Tests: **250** (199 backend + 43 component + 8 rate-limit)
- Commits: 11 pushed this session
- Tasks completed: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8, 6.9*, 6.10

### Architecture Notes
- OG images use `runtime = "nodejs"` (not edge) when importing from `@/lib/data.ts` because the postgres driver (`net`, `tls`) is incompatible with edge runtime — even for pure functions, webpack bundles all top-level imports
- JSON-LD `priceCurrency` is hardcoded `"USD"` because `deal.currency` is the display symbol `"$"` not ISO 4217
- `effectivePrice` is already in dollars (via `centsToDollars()`), not cents — don't divide by 100

### Architecture Notes (Dark Mode)
- Surface scale remap avoids Tailwind `dark:` prefix on 565+ class references — single `.dark` block in globals.css flips the entire palette
- FOUC prevention script must run before React hydration — inline `<head>` script with `suppressHydrationWarning` on `<html>`
- ThemeProvider detects `prefers-color-scheme` changes for system mode via `matchMedia` listener

### Wrong Roads
- Initially used `runtime = "edge"` for all OG images — failed build due to postgres driver imports
- Initially divided `effectivePrice` by 100 in JSON-LD — already in dollars, caused wrong prices
- Satori `{var} text` pattern creates multiple child nodes — need template literals or `display: "flex"`
- npm override `"@esbuild-kit/core-utils>esbuild"` syntax rejected — needs nested object syntax
- npm override `$esbuild` reference fails at monorepo root — esbuild not a root dep; use explicit version
- Clean `npm install` after removing lockfile exposed latent `next-intl` at root pulling next@16 — always check `npm ls` for hoisting conflicts before declaring an install clean

---

## Session 28 — 2026-04-07 — Flight audit + security hardening + live FX rates

### What Was Done
- **Constitution Flight Audit**: Full 106-point audit across 15 domains. Verdict: CONDITIONAL GO → now GO after fixes.
- **Security: Auth hardening**: Removed hardcoded fallback API keys from admin and ingest auth. Now fail-closed when env vars unset.
- **Security: Timing-safe auth**: Replaced `===` string comparison with `crypto.timingSafeEqual` in all auth paths (admin + ingest).
- **Security: Error message sanitization**: Removed internal error details from 500 responses in ingest and admin/sources routes.
- **SEO: Dynamic sitemap**: Rewrote sitemap.ts to query DB for brands/sources dynamically, added 5 missing routes (/sources, /historical-lows, /developers, /alerts, /about).
- **Feature: Live FX rates (RD-35)**: New `fx-rates.ts` module fetching from open.er-api.com with 6h cache + static fallback. Orchestrator loads rates once per run, passes to normalizer. 10 new tests.
- **Dead code removal**: Deleted unused `sample-data.ts`, cleaned up empty directories.
- **Notion sync**: Marked RD-49 (kill switches), RD-48 (complaints), RD-47 (LLM category mapping), RD-35 (live FX) as Done. All tasks now cleared.
- **Phase 6 added** to production plan with discovered next tasks.

### Key Metrics
- Tests: 189 → **199** (+10 FX rate tests)
- Commits: 4 pushed (161dbb7, 4654281, 437fd69, b76aa8c)
- Security findings fixed: 5 (2 High auth fallbacks, 2 Medium timing, 1 Medium error leak)

### Architecture Notes
- `fx-rates.ts`: In-memory cache with 6h TTL, `STATIC_RATES` export for backward-compat
- `safeCompare()`: Exported from `admin/auth.ts` for reuse across any auth path
- `normalizeOffer()`: Now accepts optional `fxRates` parameter (3rd arg, backward-compatible)

---

## Session 27 — 2026-04-07 — Phase 5 complete: Performance audit + Accessibility audit

### What Was Done
- **Task 5.12**: Performance audit — bundle analysis + TTFB measurement
  - Shared JS bundle: **218KB** (124KB Sentry SDK, 37.2KB React/Next, 54.2KB React DOM, 2.73KB other)
  - Heaviest page: `/brands/[slug]` at 386KB total (121KB recharts — page-specific `"use client"` component, NOT shared)
  - TTFB (production Docker): Home 34ms, Deals 19ms, Brands 15ms — **excellent**
  - Sentry replay SDK: lazy-loaded in v10, not counted against initial bundle
  - Recharts: isolated to brand detail pages only, no shared bundle impact
  - **Verdict**: No critical issues. Bundle is well-structured with proper code splitting.

- **Task 5.13**: Accessibility audit — comprehensive a11y hardening
  - **Skip-to-content link**: Added `<a href="#main-content">` in root layout, target `id="main-content"` on `<main>`, sr-only with focus-visible styling
  - **Form label associations**: Added explicit `htmlFor`/`id` pairs to `alert-form.tsx` (4 inputs), `home-alert-form.tsx` (2 inputs with sr-only labels), `hero-search.tsx`, `search-bar.tsx`
  - **ARIA states**: `aria-pressed` on filter toggle buttons (region pills + toggle filters in `deal-filters.tsx`), `aria-label` on `DealScore` component with full context for screen readers
  - **Live region announcements**: `role="alert"` on success/error messages in both `alert-form.tsx` and `home-alert-form.tsx`
  - **Search semantics**: `role="search"` + `aria-label="Search deals"` on all search forms, `aria-hidden="true"` on decorative icons
  - **Automated enforcement**: Installed `eslint-plugin-jsx-a11y` with `recommended` ruleset, `no-autofocus` set to warn (intentional use on search)
  - **Already good**: `<html lang>` per locale, semantic `<header>/<nav>/<main>/<footer>` landmarks, `aria-label` on icon-only buttons, `aria-hidden` on decorative SVGs, `rel="noopener noreferrer nofollow"` on external links, no raw `<img>` tags

### Phase 5 Status
- **ALL 14 TASKS COMPLETE** — Phase 5 (Quality & Production Hardening) is now finished
- 189 tests passing, build clean, lint clean (warnings only)

### Build Status
- All 189 tests passing
- Build clean, lint clean (a11y warnings only: intentional autoFocus)

---

## Session 26 — 2026-04-07 — Phase 5 cont.: Sentry error tracking integration

### What Was Done
- **Task 5.11**: Sentry error tracking — full `@sentry/nextjs` v10 integration
  - `sentry.client.config.ts` — browser SDK with replay, tracing, privacy-safe defaults
  - `sentry.server.config.ts` — Node.js SDK for API routes/SSR, breadcrumb sanitization
  - `sentry.edge.config.ts` — Edge runtime for middleware (low sample rate)
  - `src/instrumentation.ts` — Next.js instrumentation hook loading Sentry at startup
  - `next.config.ts` — wrapped with `withSentryConfig()`, source map upload conditional
  - Error boundaries — both `global-error.tsx` and `[locale]/error.tsx` now call `Sentry.captureException()`
  - `docker-compose.yml` — added `SENTRY_DSN` env var pass-through
  - CSP updated — added `*.ingest.sentry.io` to `connect-src`
- **Architecture**: DSN-ready pattern — all code wired, conditional on `SENTRY_DSN` env var. No-ops when absent.
- **Action required**: Create Sentry project at sentry.io → get DSN → set in VPS `.env` → redeploy

### Build Status
- All 189 tests passing
- Build clean (bundle increased ~115KB from Sentry SDK — acceptable)
- Lint clean

---

## Session 25 — 2026-04-07 — Phase 5 cont.: Clustering + Alert matcher tests

### What Was Done
- **Task 5.9**: Clustering engine tests — 18 tests covering:
  - Cluster key generation (brand + denomination + currency normalization)
  - Single-source skip, multi-source clustering, price spread calculation
  - Agreement bonus (+5/source, max +15), confidence cap at 100
  - Currency/denomination/brand isolation, null denomination handling
  - Multiple distinct clusters in one run, getClusterForOffer queries
- **Task 5.10**: Alert matcher tests — 25 tests covering:
  - 4-filter matching: brand, category, discount threshold, region
  - Each filter: positive match, negative rejection, null wildcard behavior
  - Combined filter application, one-match-per-alert rule
  - Multiple alerts → different offers, title fallback, response shape
  - markAlertsSent: empty array no-op, update each ID
- **Total**: 189 tests passing across 7 test files

### Build Status
- All 189 tests passing
- Lint clean
- Build clean

---

## Session 24 — 2026-04-07 — Phase 5 cont.: API route integration tests

### What Was Done
- **Task 5.8**: API route integration tests — 36 tests covering 7 route groups
  - `GET /api/deals` — query params, region filtering, DB failure graceful degradation
  - `GET /api/brands` — brand listing, DB error handling
  - `GET /api/brands/[slug]` — brand detail with offers, 404, 503 on DB failure
  - `GET /api/search` — search with params, empty queries, search engine errors, limit capping
  - `POST /api/ingest` — auth rejection, valid ingestion, param forwarding, pipeline errors
  - `POST /api/complaints` — full validation battery (JSON, fields, types, lengths, email, 404)
  - `GET /api/click/[offerId]` — affiliate redirect, invalid IDs, missing offers, Referrer-Policy
  - `GET /api/admin/health` — auth check, health report
- **Test Infrastructure**: Created chainable Drizzle ORM mock (`createChain()`) for DB-free route testing
- **Total**: 146 tests passing (30 scoring + 39 normalization + 20 regions + 21 adapters + 36 API routes)

### Build Status
- All 146 tests passing
- Lint clean
- Build clean

---

## Session 23 — 2026-04-07 — Phase 5 cont.: CI/CD, adapter tests, VPS deploy

### What Was Done
- **VPS deploy**: SSH working via `~/.ssh/realdeal` key. Pulled 6 commits (Sessions 17–22), rebuilt `realdeal-web` Docker image from latest `igift-web:latest` tag, container recreated and healthy (HTTP 200). Fixed project-name mismatch (`realdeal` vs `igift`) by running `docker compose -p realdeal` to match existing containers.
- **Lock file fix**: `npm ci` in Docker failed — `@swc/helpers@0.5.21` missing from `package-lock.json` after vitest was added. Regenerated with `npm install`, committed and pushed fix.
- **CI/CD pipeline** (Task 5.14): Created `.github/workflows/ci.yml` — triggers on push to main + PRs, Postgres 16 service container, npm + turborepo cache, sequential: lint → test → build. First run passed on GitHub Actions.
- **Adapter unit tests** (Task 5.7 — 21 tests): `adapters.test.ts` — bitrefill (7), dundle (5), raise (6), shared helpers (3). Tests use `vi.stubGlobal('fetch', ...)` with HTML fixtures + `vi.useFakeTimers()` to skip polite delays. Verified dryRun paths, HTML parsing, discount detection, OutOfStock filtering, HTTP errors, fallback parsers.
- **Notion**: Added Phase 5 option to task database, created all 14 Phase 5 tasks with correct statuses.

### Build Status
- Local: `npm run test` — **110 tests passing** (4 files, 217ms)
- CI: GitHub Actions run `8697477` — ✅ Lint · Test · Build all green
- VPS: Live at igift.app — running commit `aaad8b3`

### Architecture Notes
- Adapter tests avoid real HTTP by mocking `globalThis.fetch`. Combined with `vi.useFakeTimers()` + `vi.runAllTimersAsync()`, 12-product adapter loops run in milliseconds.
- Docker project name was `realdeal` (from original setup) but directory is `/opt/igift`. Always use `docker compose -p realdeal` on VPS or the containers will conflict.
- GitHub Actions Node 20 deprecation notice (forced Node 24 by June 2026) — informational only, no action needed now.

### Pending
- 5.8 API route integration tests (High)
- 5.9 Clustering engine tests (Medium)
- 5.10 Alert matcher tests (Medium)
- 5.11 Sentry error tracking (High)
- 5.12 Performance audit (Medium)
- 5.13 Accessibility audit (Medium)

---

## Session 22 — 2026-04-06 — Phase 5: Quality & Production Hardening

### What Was Done
- **Discovery Protocol**: Verified all 4 phases (46 tasks) genuinely DONE. Identified 5 critical gaps: zero tests, no error boundaries, sample-data fallback masking DB failures, 2 TODOs in orchestrator, 4 commits pending VPS deploy.
- **Error boundaries**: Created `[locale]/error.tsx` (branded, within app shell, Try Again + Back to Home) and `global-error.tsx` (standalone HTML with inline styles, catches root layout failures).
- **Sample-data removal**: Removed `sampleDeals`/`sampleCategories` imports from home page, deals page, categories page, and search API. Pages now render empty sections when DB unavailable. Search API returns `{ error: "Search temporarily unavailable" }` instead of fake results.
- **Vitest infrastructure**: Installed `vitest ^4.1.2` + `@vitejs/plugin-react ^6.0.1`. Created `vitest.config.ts` with `@/` path alias. Added `test` and `test:watch` scripts.
- **Scoring engine tests** (30 tests): `scoring.test.ts` — deal quality (discount, fees, region, trust zone, history, freshness), confidence (source type, fraud flags, agreement, reference data), full pipeline (red zone suppression, region incompatible, fraud penalty, unknown region, historical low detection, formula verification), label helpers.
- **Normalization tests** (39 tests): `normalize.test.ts` — brand resolution (exact, case-insensitive, aliases, trademark symbols, partial match, unknown), FX conversion (USD passthrough, EUR, GBP, case-insensitive, unknown passthrough, rounding), region mapping (full names, shorthand, global, unknown fallback, dedup), denomination extraction (USD/EUR/GBP/suffix, null), title normalization (currency symbols, fallback), full pipeline (brand, denomination, USD conversion, effective price, discount, dedup, EUR conversion, snapshot, override).
- **Regions tests** (20 tests): `regions.test.ts` — config completeness, required fields, EU includes DE, Global empty, selectable excludes Global, locale mapping, getRegion (known + fallback), formatRegionPrice (USD/en, EUR/de, zero, default locale), regionFromCurrency (all currencies + unknown + case-insensitive).
- **Bug fix**: `resolveBrandSlug("")` returned `"apple"` instead of `null` due to `"apple".includes("") === true`. Added empty-string guard.
- **Phase 5 added to PRODUCTION_PLAN.md**: 14 tasks, 6 DONE in this session, 8 TODO.

### Build Status
- Local: `npx turbo build --force` — PASS (19.7s, 0 errors)
- Tests: `npx vitest run` — 89 tests passing (237ms)
- VPS: SSH still down — 4 commits pending deploy

### Architecture Notes
- Vitest runs in Node environment (not jsdom) — sufficient for pure logic modules. Component tests would need jsdom.
- Error boundaries: `[locale]/error.tsx` catches page errors while preserving the Header/Footer shell. `global-error.tsx` catches root layout errors and must render its own `<html>/<body>` with inline styles.
- Sample-data.ts is still in the codebase but no longer imported by any production code. Safe to keep as a dev reference.

### Pending
- VPS SSH: still needs Contabo VNC console restart
- 5 commits now pending VPS deploy
- Phase 5 remaining: adapter tests, API integration tests, clustering/alert matcher tests, Sentry, perf audit, a11y audit, CI/CD pipeline

---

## Session 21 — 2026-04-06 — Phase 2 Tasks 2.5–2.7 (Continuation)

### What Was Done
- **Opsera pre-commit security gate** — full `pre-commit` scan completed across all 6 phases
  - gitleaks: 15 FP (all in `.next/` gitignored build artifacts)
  - grype: 150 findings (all Go stdlib CVEs from system scan, not app code)
  - semgrep: 3 pre-existing findings (email.ts + buysellvouchers.ts)
  - npm audit: 4 moderate (pre-existing)
  - **New findings from Phase 2 code: 0** — cleared for commit
- **Committed + pushed** `270a4e5`: Tasks 2.5–2.7 (734 insertions)

### Build Status
- Local: `npx turbo build` — PASS (cached, 0 errors)
- VPS: SSH port 22 still refusing — pending Contabo console restart
- 4 commits now pending VPS deploy: `dd65b5a` + `4ab3e26` + `0a01f7c` + `270a4e5`

### Pending
- VPS SSH: sshd needs restart via Contabo VNC console (my.contabo.com)
- Deploy when SSH restored: `cd /opt/realdeal && git pull origin main && docker compose build web && docker compose up -d web`

---

## Session 20 — 2026-04-06 — de-DE Language Support (Task 4.5)

### What Was Done
- **Task 4.5: de-DE language support — COMPLETE**
  - **Architecture**: `[locale]` routing with next-intl v4.9.0; English at `/` (no prefix), German at `/de/`; `localePrefix: 'as-needed'`
  - **Config**: `src/i18n/routing.ts` (defineRouting) + `src/i18n/request.ts` (getRequestConfig with locale validation)
  - **Messages**: `messages/en.json` + `messages/de.json` — 60+ strings across Navigation, Footer, Home, Common, Metadata namespaces
  - **next.config.ts**: wrapped with `createNextIntlPlugin('./src/i18n/request.ts')`
  - **Middleware**: next-intl `createMiddleware(routing)` merged with session cookie; API routes excluded from matcher
  - **Root layout** (`app/layout.tsx`): async, reads `getLocale()` for dynamic `lang` attribute; fonts and body class only
  - **Locale layout** (`app/[locale]/layout.tsx`): `NextIntlClientProvider` + app shell; `hasLocale()` validation; per-locale `generateMetadata`
  - **Header**: `useTranslations('Navigation')` for all nav labels and aria-labels (client component)
  - **Footer**: `getTranslations('Footer')` for all link/section text (server component, now async)
  - **Page migration**: 16 front-end routes moved from `app/` to `app/[locale]/` via `git mv`
  - **Lint fixes**: `sources/page.tsx` and `admin/layout.tsx` `<a>` → `<Link>`
  - **Commit**: `4ab3e26` pushed to GitHub

### Build Status
- Local: `npx turbo build` — PASS (19.5s, 0 type errors, 0 lint warnings)
- VPS: SSH port 22 refusing connections — container still running (igift.app serving HTTP 200), pending deployment
- Deploy command when SSH restored: `cd /opt/realdeal && git pull origin main && docker compose build web && docker compose up -d web`

### Architecture Notes
- **[locale] routing**: Next.js 15 App Router requires a root layout (`app/layout.tsx`) with `<html>/<body>`. The i18n layout at `app/[locale]/layout.tsx` handles the app shell (Header, Footer, providers) WITHOUT nesting html elements — root layout stays as the HTML shell.
- **getLocale() in root layout**: Allows the root `lang` attribute to be dynamic (en/de) without moving html/body into `[locale]/layout.tsx`. This requires the root layout to be async.
- **hasLocale() guard**: Prevents crafted URLs like `/fr/deals` from causing 500 — they get a clean 404.
- **NextIntlClientProvider**: Passes messages to client components (Header uses `useTranslations`). Server components use `getTranslations` directly.

### Pending
- VPS SSH access down: sshd needs restart via Contabo panel (my.contabo.com VNC console)
- 3 commits pending VPS deploy: `dd65b5a` (lint fix) + `4ab3e26` (i18n) + `0a01f7c` (regions)
- Dependabot 1 moderate vulnerability on GitHub (pre-existing, to investigate)

### Also in this session: Task 4.6 — EU/UK/AU regions
- `src/lib/regions.ts`: canonical region registry with flag emojis, currencies, `formatRegionPrice()`, `LOCALE_TO_REGION`
- `deal-filters.tsx`: all 4 regions with flag emoji pills, `defaultRegion` prop, URL `?region=` param
- `deal-card.tsx`: region display → `{flag} {displayName}` via `getRegion()`
- `deals/page.tsx`: `getLocale()` → `LOCALE_TO_REGION` → `defaultRegion` hint (de → EU)
- Commit: `0a01f7c` pushed to GitHub

## Session 19 — 2026-04-05 — Source Scorecard Pages (Task 4.4)

### What Was Done
- **Task 4.4: Merchant/source scorecards — COMPLETE**
  - Data layer: `getAllSourceScorecards()` + `getSourceScorecardBySlug()` in `lib/data.ts`
    - Drizzle left-join query: sources + offers with conditional COUNT/AVG/MAX aggregates
    - `computeTrustScore()`: 0–100 from zone (40pts) + buyerProtection (20pts) + refundPolicy (15pts) + fetchSuccessRate×25 (25pts)
    - `computeHealthStatus()`: healthy / degraded / unhealthy / unknown from staleness factor and success rate
    - `SourceScorecard` interface (typed: trustZone, healthStatus, all offer stats)
  - **`/sources/page.tsx`** — ISR 30m, two zone sections, stats banner, methodology callout
  - **`/sources/[slug]/page.tsx`** — SSG, trust ring, score breakdown table, buyer protection panel, freshness indicators, deals CTA
  - **`components/sources/source-card.tsx`** — animated trust bar (Framer Motion), stagger entry, zone color system, stats grid
  - **`GET /api/v1/sources`** — ISR 30m, response includes `sources[]` + `meta` summary object
  - Header nav: added "Sources" with `ShieldCheck` icon; Footer: "Source Directory" in Product column
  - Deploy: Docker build + container recreated on VPS · igift.app/sources live

### Build Status
- Local: `npx turbo build` — PASS (22.4s, 0 type errors)
- VPS: Build + deploy — PASS (2m57s Docker build)
- New routes: `/sources` (ISR 30m) · `/sources/[slug]` (SSG) · `/api/v1/sources` (ISR 30m)

### Architecture Notes
- **SSG vs ISR split**: `/sources/[slug]` pages are SSG via `generateStaticParams` — generated at build time from DB. The listing `/sources` is ISR 30m since source counts change as we add new adapters. Each slug page revalidates independently at 30m on-demand.
- **Score architecture**: Trust score is application-layer computation (not a DB column) — avoids a migration whenever the scoring formula evolves. The formula coefficients are intentionally transparent (40+20+15+25=100) so they can be published in `/methodology`.
- **Zone color system**: `ZONE_CONFIG` maps zone strings to Tailwind class sets. Both the listing card and detail page share the same config, preventing color drift.

---

## Session 18 — 2026-04-05 — Partner Feed Expansion (Task 4.2)

### What Was Done
- **Task 4.2: Partner feed expansion — 10 new sources, 6 new brands**
  - 5 new live HTML source adapters (parse waterfall pattern):
    - `cdkeys.ts` — CDKeys.com, authorized reseller (green zone), Trustpilot 4.4/5, 23 SKUs
    - `eneba.ts` — Eneba.com, EU marketplace (yellow zone), 15 SKUs, prefers `__NEXT_DATA__` JSON
    - `offgamers.ts` — OffGamers.com, Asian marketplace (yellow zone), 16 SKUs
    - `g2a.ts` — G2A.com, major marketplace (yellow zone), 14 SKUs, `hasBuyerProtection: false`
    - `kinguin.ts` — Kinguin.net, Polish marketplace (yellow zone), 17 SKUs
  - 5 new catalog sources added to `catalog.ts`: Best Buy, Target, Newegg, Walmart, GameStop
  - All adapters follow the parse waterfall: JSON-LD → data attributes → regex fallback
  - `orchestrator.ts` updated: all 5 new live adapters registered in `getRegisteredAdapters()`
  - `adapters/index.ts`: all new exports added (live + catalog)
  - 6 new brands: Roblox, Valorant, Twitch, EA Play, PlayStation Plus, Razer Gold
  - DB migration `0003_expand_sources_brands.sql`: INSERT 10 new sources + 6 brands
  - `seed.ts`: 10 new sources + 6 new brands added for local dev
  - Root layout `metadataBase` warning fixed (`new URL("https://igift.app")`)

### Build Status
- `npx turbo build` — PASS (19.0s, 0 type errors)
- Type errors fixed during build: `countryRedeemable: string` → `string[]`, `rawSnapshot: string` → `Record<string, unknown>`, missing `originalTitle/externalUrl/sellerName` fields

### Architecture Notes
- **Parse waterfall pattern**: JSON-LD (most semantic, most stable) → embedded Next.js `__NEXT_DATA__` (for sites using Next.js) → HTML data attributes → regex fallback. Order chosen for brittleness resistance.
- **Trust zone encoding**: green zone adapters get `sellerRating: 0.80+`, yellow zone adapters get lower ratings (0.72-0.82). G2A explicitly sets `hasBuyerProtection: false` because their Shield program is opt-in per purchase.
- **Polite delays**: 500-700ms between requests per adapter. No auth bypass, no session cookies.
- **Total sources**: grew from 10 → 20 (11 live adapters + 9 catalog adapters)
- **VPS deploy**: SSH to 69.30.247.151 port 22 refused (likely fail2ban triggered by repeated auth failures during key discovery). Code pushed to GitHub — manual `git pull + docker compose build` needed on VPS.

### Git
- Commit: `feat: partner feed expansion — 10 new sources, 6 new brands (task 4.2)` — c71eb94
- Pushed to: github.com/Cryptosours/igift main

---

## Session 17 — 2026-04-05 — Historical Analytics & Trend Pages (Task 4.3)

### What Was Done
- **Task 4.3: Historical analytics and trend pages**
  - `PriceHistoryChart` Recharts client component: dual Y-axis (price + discount %), indigo area + green line, all-time low reference line, custom tooltip, empty state
  - `/historical-lows` page: SEO grid of brands at all-time lows; uses existing `isHistoricalLow` flag on `offers` table — zero new schema changes
  - Brand detail `/brands/[slug]` enhanced: 90-day price trend section, all-time low badge, parallel data fetch via `Promise.all`
  - `GET /api/v1/brands/:slug/history` B2B endpoint: free (90d) / pro (365d), optional `denomination` filter
  - `getPriceHistory()`: `DATE_TRUNC('day') + MIN()` daily aggregation from existing `priceHistory` table
  - `getHistoricalLowBrands()`: JOIN on `offers WHERE isHistoricalLow = true`, deduped to best offer per brand
  - `getBrandBySlug()` now exposes `id` (was missing; caught by TypeScript build check)
  - Header nav + footer Product section: "Historical Lows" / "Hist. Lows" links added

### Build Status
- `npx turbo build` — PASS (20.1s, 0 type errors after fixing missing `id` field)
- Type error fix: `getBrandBySlug` was not exposing `brand.id` in return object; caught at build time

### Architecture Notes
- All analytics data comes from the existing `priceHistory` table (Phase 1) — no new tables or migrations required
- Daily aggregation (one point per day via `DATE_TRUNC`) keeps chart clean and avoids rendering thousands of raw data points
- `PriceHistoryChart` is `"use client"` (Recharts requires browser canvas); parent pages remain server components
- `/historical-lows` is dynamically rendered — SSG not appropriate as lows change every 6h

### Commits
- `34963ba` feat: historical analytics — price chart, /historical-lows page, B2B history endpoint (task 4.3)

### Next Task
- 4.2: Partner feed expansion (10+ new sources) — now the last major Phase 4 priority
- 4.4: Merchant/source scorecards

---

## Session 16 — 2026-04-05 — B2B API Product (Task 4.1)

### What Was Done
- VPS git repo initialized (`git init` + `git reset --hard origin/main`) — was deployed via file copy, not git clone. Commit `645cba6` now live on VPS.
- **Task 4.1: B2B / API product**
  - `api_keys` table added to DB schema (`apps/web/src/db/schema.ts`): key hash (SHA-256), owner, tier (free/pro), rate limit per hour, rolling window counters
  - Migration: `drizzle/0002_add_api_keys.sql`
  - Auth middleware (`src/app/api/v1/auth.ts`): `X-API-Key` or `Bearer` extraction, SHA-256 hash lookup, rolling 1-hour DB-based rate limiting (no Redis needed at B2B volume)
  - `GET /api/v1/deals` — active deals with filters: category, trust_zone, region, min_score, cursor; free tier capped at 100/req and green zone by default
  - `GET /api/v1/brands` — paginated brand list with active offer counts
  - `GET /api/v1/brands/[slug]` — single brand + all current offers (20 free / 50 pro)
  - `GET /api/v1/stats` — platform statistics snapshot (offers, brands, historical lows, by-category)
  - `GET|POST|DELETE /api/admin/api-keys` — admin-protected key management; POST issues raw key once (never retrievable again)
  - `/developers` page — conversion-first API docs: quick-start curl, auth guide, endpoint reference table, error format, pricing plans, CTA
  - Footer: "API for Developers" link added under Company column

### Build Status
- `npx turbo build` — PASS (18.4s, 0 type errors)

### Architecture Notes
- Keys stored as SHA-256 hex — raw key shown once on creation, then gone
- Rate limiting: DB counter in 1-hour rolling window. On window expiry: reset. On over-limit: 429 + Retry-After header. Acceptable latency (~1 extra write/request) at B2B volumes
- Free tier: 100 req/hr, green zone only by default. Pro: 1000 req/hr, all trust zones
- Affiliate URLs are intentionally excluded from API responses — click-outs stay on igift.app to preserve attribution
- `/developers` is static (SSG) — no DB queries, fast TTL

### Commits
- `[pending]` feat: B2B API v1 — api keys, /api/v1 endpoints, /developers page (task 4.1)

### Next Task
- 4.2: Partner feed expansion (10+ new sources)
- 4.3: Historical analytics and trend pages

---

## Session 15 — 2026-04-05 — Constitution Audit + Pro Dashboard (Tasks 3.5 + UI)

### What Was Done

**Part 1 — Constitution Audit (UI/UX upgrade)**
- Active nav indicator: `usePathname` + animated `layoutId` underline
- Dynamic hero stats wired to PostgreSQL (`getHeroStats`)
- `HomeAlertForm` client component → `/api/alerts` with `useTransition`
- `FadeIn` / `StaggerContainer` / `StaggerItem` animations on all pages
- Footer: social links (nofollow), Dashboard link, responsive layout
- Loading skeletons: deals, brands, categories, dashboard
- Mobile responsive audit (320px): header icon overflow, DealCard wrapping
- New: `fade-in.tsx`, `brand-avatar.tsx`, `motion-provider.tsx`, `page-transition.tsx`, `not-found.tsx`
- Deleted: `scroll-reveal.tsx` (superseded)

**Part 2 — Task 3.5: Pro Dashboard**
- `getDashboardStats()` in `lib/data.ts`: parallel queries — `newIn24h` (offers created in last 24h), `historicalLowsTotal`, `topCategory` (by deal count)
- Market Pulse strip: dark-themed real-time market stats bar at top of dashboard
- Stats row expanded to 4 cards: Watching, Live Deals, **Savings Opportunity**, **Hist. Lows in Watchlist**
- Savings computed server-side: `sum(faceValue - effectivePrice)` across watchlist best deals — zero extra DB queries
- Top Opportunity callout: highest deal-score item from watchlist surfaced as a highlighted card
- Watchlist Snapshot panel: concise 4-row summary with CheckCircle indicators
- Quick Links sidebar: 5 jump links
- Historical Low badge per brand in the watchlist list

### Build Status
- `npx turbo build` — PASS (17.1s, 0 errors)
- Committed, pushed to `Cryptosours/igift`

### Architecture Notes
- `getDashboardStats()` uses three parallel queries in series (Drizzle doesn't support `Promise.all` with transactions, but each is fast single-aggregate query)
- Server-side metric derivation: savings, hist. lows count, top opportunity all computed from watchlist array without additional DB roundtrips
- Dashboard now distinguishes itself from `/watchlist`: adds market intelligence layer

### Commits
- `a526183` feat: constitution audit — UI/UX upgrade, animations, responsive (session 15)
- `[next]` feat: pro dashboard — market pulse, savings widget, top opportunity (task 3.5)

### Next Task
Phase 4: 4.1 — B2B / API product (read-only deal data API), or 4.2 — Partner feed expansion

---

## Session 14 — 2026-04-04 — Sponsored Placement System (Task 3.3)

### What Was Done

- **`sponsored_placements` table** — `brand_id FK → brands`, `placement_type` enum (`featured_deal` | `featured_brand`), `starts_at`, `ends_at`, `is_active`, `notes`, `created_at`. Migration applied on VPS via SCP + psql.

- **`getFeaturedPlacements(type)`** (`lib/data.ts`) — queries active placements joined to brands, fetches best active offer per sponsored brand (ordered by finalScore desc). Returns `[]` silently on DB unavailable — pages degrade gracefully.

- **`SponsoredBadge`** (`components/ui/sponsored-badge.tsx`) — amber pill "Sponsored" + `Info` icon that reveals tooltip on click: "This brand paid for a featured position. All deal data — prices, scores, and trust ratings — remain unaltered." FTC-compliant.

- **`FeaturedSection`** (`components/deals/featured-section.tsx`) — deal card grid with amber top-accent border. Shows `SponsoredBadge` in section header. Only renders if at least one active placement has a live deal.

- **`/deals` page** — loads `getFeaturedPlacements("featured_deal")`, renders `<FeaturedSection>` above organic results.

- **`/brands` page** — loads `getFeaturedPlacements("featured_brand")`, renders amber-accented brand card row above organic grid.

- **`/api/admin/sponsorships`** — GET (list all), POST (create — validates brandSlug, placementType, date range), PATCH (`?id=N` — update isActive/endsAt/notes). Admin Bearer auth.

- **Admin dashboard** — `getSponsorships()` fetcher + Sponsorships panel with Live/Scheduled/Expired/Inactive status labels; API reference updated.

- **Deployed to VPS** — 31 routes, build clean, containers healthy.

### Commits
- `3ed61a5` feat: sponsored placement system with strict labeling (task 3.3)

### Next Task
3.5 — Pro dashboard for power users (task 3.4 already DONE)

---

## Session 13 — 2026-04-04 — Premium Alerts Tier (Task 3.2)

### What Was Done

- **Free tier alert cap** — POST /api/alerts now counts active alerts per email; returns 402 `ALERT_LIMIT_REACHED` (limit: 5) before creating a new one. AlertForm surfaces "You've reached the 5-alert free tier limit. Delete an existing alert below to create a new one."

- **AlertManager component** (`apps/web/src/components/alerts/alert-manager.tsx`)
  - Email input → GET /api/alerts → filtered to active alerts only
  - Per-alert: human-readable description (discount %, region), "Fired" badge when `lastSentAt` set
  - Trash button → DELETE /api/alerts?id=N with `useTransition` for non-blocking UX
  - Same optimistic-delete pattern as WatchButton

- **AlertForm pre-fill** — accepts `initialBrand?: string` prop; `useState(initialBrand)` so `?brand=<slug>` from URL pre-fills the brand input

- **/alerts page rewrite** (server component)
  - `searchParams.brand` → passed as `initialBrand` to AlertForm
  - `searchParams.unsubscribe` → server-side DB update (`isActive: false`) → renders "Alert cancelled" or "not found" confirmation without client JS
  - Features grid (Instant Alerts, Trust-Filtered, No Spam), AlertForm, AlertManager stacked vertically
  - Free tier note in footer: "Free tier includes up to 5 active alerts · 24-hour delivery cooldown between repeat notifications"

- **Watchlist page alert CTAs**
  - Per-brand row: added Bell icon linking to `/alerts?brand=<slug>`
  - Empty-deal fallback now links to `/alerts?brand=<slug>` (was plain `/alerts`)

- **Deployed to VPS** — Docker build clean (30 routes), containers healthy, https://igift.app live

### Commits
- `def625f` feat: task 3.2 — free tier cap, AlertManager, unsubscribe flow, watchlist alert CTAs

### Next Task
3.3 — Sponsored placement system with strict labeling

---

## Session 12 — 2026-04-04 — Ingestion Cron + Watchlist (Tasks 3.4 + cron)

### What Was Done

- **VPS database recovery** (pre-task blocker)
  - `pgdata` volume was initialized under `realdeal` user during the rebrand; Docker Compose now expects `igift` user
  - Manually created `igift` role + database via `psql` as `realdeal` superuser
  - `drizzle-kit push` hung via SSH tunnel — used `drizzle-kit generate` to produce raw SQL, then ran via `docker exec psql -f`
  - Database re-seeded and ingest pipeline re-run; production restored to 239 live offers

- **Ingestion cron schedule** (Notion RD-34 — DONE)
  - `scripts/ingest-cron.sh`: sources `.env`, calls `POST /api/ingest` with Bearer auth, logs success/failure with timestamp to `/opt/realdeal/logs/ingest.log`
  - VPS crontab entry: `0 */6 * * *` — runs every 6 hours, logs appended to file
  - Tested manually; cron active on VPS

- **User watchlist persistence** (task 3.4 — DONE)
  - `watchlist_items` table in Drizzle schema: `id`, `session_id`, `brand_id` (FK→brands, cascade), `created_at`, unique index on `(session_id, brand_id)`
  - `apps/web/src/middleware.ts`: mints `igift_session` UUID cookie on first visit (Edge Runtime, Web Crypto API, `httpOnly`, 1-year TTL)
  - `apps/web/src/app/api/watchlist/route.ts`: GET (list watched brands), POST (add by `brandSlug`), DELETE (remove by `?slug=`); idempotent with `onConflictDoNothing()`
  - `apps/web/src/components/ui/watch-button.tsx`: client component, Heart icon toggle, `useTransition` for non-blocking optimistic UI
  - `DealCard`: enriched with `initialWatched` prop + `WatchButton` in top-right
  - `/brands/[slug]` page: server-reads session cookie, passes `isWatched` to `WatchButton` in brand header
  - `/deals` page: enriched each deal's `initialWatched` from `getWatchedSlugs()` set
  - `apps/web/src/app/watchlist/page.tsx`: dedicated `/watchlist` page — empty state + populated state showing best deal per watched brand; footer CTA to set alerts
  - Header: Heart icon links to `/watchlist`
  - `lib/data.ts`: added `getWatchedSlugs(sessionId)` and `getWatchlist(sessionId)` (includes best deal per brand)

- **Full deploy to VPS** — all 33 routes building clean, Docker rebuilt, containers healthy

### Build Status
- `npx turbo build` — PASS
- Committed, pushed to `Cryptosours/igift`

### Architecture Notes
- Anonymous session pattern: UUID cookie → no auth required for V1 watchlist. Session ID can be associated with an email/account in Phase 4.
- `useTransition` (not `useOptimistic`) keeps the toggle snappy while keeping server truth as the source of reality on reload.

### Wrong Roads
- `drizzle-kit push` hangs when connecting via SSH tunnel — always use `generate` + `docker exec psql` for VPS schema changes
- `crypto.randomUUID()` not available in Node.js `crypto` module in Edge Runtime — use Web Crypto API global instead
- `cookies()` in Next.js 15 returns a Promise — always `await` it

### Next Steps
- Phase 3 continues: 3.2 (premium alerts subscription tier — High priority)
- Phase 2 remaining: 2.5 (LLM title normalization), 2.6 (LLM category mapping), 2.7 (merchant complaints)

---

## Session 11 — 2026-04-04 — Affiliate Click Tracking (Task 3.1)

### What Was Done
- **Affiliate deep link system** (task 3.1 — DONE)
  - `affiliate_clicks` table added to Drizzle schema with FK indexes on offer, source, clicked_at
  - `/lib/affiliate.ts`: per-network URL builder (bitrefill, dundle, raise, giftcardgranny, gameflip, buysellvouchers, generic), SHA-256 IP/UA hashing, pathname extraction from Referer header
  - `/api/click/[offerId]`: 302 redirect handler — rate limited 30/IP/min, fire-and-forget click log, falls back to /deals if suppressed
  - `/api/admin/clicks`: admin-auth'd endpoint returning total / 24h / 7d counts + top 5 sources
  - DealCard CTA wired through `/api/click/[offerId]` instead of raw source URL
  - Admin dashboard: "Click Attribution" section with 3 stat cards + top sources table; API reference entries added

- **Project folder fully renamed RealDeal → iGift**
  - Folder was already at Projects/iGift; empty RealDeal shell removed
  - Memory files migrated to new path key; Notion DB and hub page renamed

### Build Status
- `npx turbo build` — PASS (17s)
- Committed `e97309f`, pushed to `Cryptosours/igift`

### Next Steps
- Deploy to VPS: `scripts/deploy.sh` + run `drizzle-kit push` to create `affiliate_clicks` table
- Phase 3 continues: 3.2 (premium alerts), 3.4 (user accounts/watchlists)
- Phase 2 remaining: 2.5 (LLM title normalization), 2.6 (LLM category mapping)

---

## Session 10 — 2026-04-04 — Rebrand + Open Source Release + VPS Deploy

### What Was Done
- **Full rebrand RealDeal → iGift** across entire codebase (previous session, continued here)
  - Config files: package.json names, tsconfig paths, next.config transpile, drizzle/db connection strings
  - Ingest adapters: all 6 USER_AGENT strings updated
  - Dockerfile: filter target updated
  - Deploy script: hardcoded credentials → env vars with `${VAR:?}` fail-closed syntax
  - Docker Compose: credentials now use env var interpolation
  - All UI pages, components, documentation, and KB files rebranded

- **Git history scrub** with git-filter-repo
  - Scrubbed VPS IP address, SSH key path, credential directory path from all file contents
  - Second pass with `--message-callback` to scrub IP from commit messages
  - Verified 0 remaining sensitive matches across entire history
  - Force-pushed cleaned history to GitHub

- **Open source release prep**
  - Created: LICENSE (MIT), README.md, SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, .env.example
  - Hardened .gitignore: added .claude/, .remember/, SESSION_LOG.md, credential patterns
  - All infrastructure references use env vars, no hardcoded values

- **GitHub repo configuration**
  - Renamed repo: Cryptosours/RealDeal → Cryptosours/igift
  - Updated local remote to new URL
  - Set description, homepage (igift.app), topics (gift-cards, deal-intelligence, price-comparison, nextjs, typescript, open-source)
  - Disabled wiki and projects (not needed)
  - Made repo **public**

- **Credential rotation**
  - Generated new 64-char hex ADMIN_API_KEY and INGEST_API_KEY
  - Generated new database password
  - Deployed new .env to VPS with all rotated credentials
  - Saved all credentials locally to ~/Desktop/cred/dev/realdeal/env/

- **Deploy script hardening**
  - Added .env to rsync excludes (prevents deletion on deploy)
  - Added `set -a && source .env && set +a` before docker compose commands
  - Fixes `${VAR:?}` interpolation in docker-compose.yml

- **VPS deployment**
  - Full rsync + Docker build deployed successfully
  - Next.js 15 build: 10 static + 19 dynamic routes, 0 errors
  - Both containers running: igift-db (healthy) + igift-web (started)
  - Note: VPS path remains /opt/realdeal (no sudo to rename), deploy uses DEPLOY_PATH env var

### Key Decisions
- Kept VPS directory as /opt/realdeal — renaming requires root access, internal path doesn't affect users
- MIT license for open source release — permissive, standard for web projects
- `${VAR:?message}` bash syntax for required deploy vars — fails fast with clear error instead of silent misconfiguration
- Two-pass git-filter-repo: `--replace-text` for files, `--message-callback` for commit messages

### Files Changed
- `scripts/deploy.sh` — added .env exclude, env sourcing before docker compose
- `replacements.txt` — DELETED (temporary git-filter-repo input)
- All rebrand changes from previous session deployed

### State
- Build: passes (32+ pages, 0 errors)
- GitHub: Cryptosours/igift — PUBLIC, clean history
- VPS: deployed with rotated credentials, both containers running
- Credentials: rotated, saved locally
- Phase 1: 15/15 DONE
- Phase 2: 4/8 DONE (2.1, 2.2, 2.3, 2.8)

---

## Session 9 — 2026-04-03 — Revalidation + Alert System (Tasks 2.2 & 2.4)

### What Was Done
- **Task 2.2: Automated offer revalidation and staleness detection**
  - Built `lib/revalidation.ts` — per-offer staleness detection (3x source SLA), 7-day expiry, at-risk detection, cleanup tracking
  - Built `/api/admin/revalidation` — GET for lifecycle report, POST to trigger revalidation cycle
  - Added Offer Lifecycle dashboard section to admin page — status counts, per-source staleness breakdown table
  - Integrated revalidation into orchestrator as step 6 (runs after each ingestion cycle)

- **Task 2.3: Duplicate clustering engine**
  - Built `lib/clustering.ts` — groups offers by brand+denomination+currency cluster key
  - Confidence boost: +5 per agreeing source within 5% price threshold (max +15)
  - `getClusterForOffer()` for frontend source comparison
  - Integrated into orchestrator as step 7

- **Task 2.8: Source kill switches**
  - Built `lib/killswitch.ts` — 3-level controls: per-source (DB), per-category (runtime), global (runtime)
  - Per-source: sets isActive=false + suppresses all active offers from that source
  - Per-category: suppresses all offers in category via raw SQL UPDATE...FROM
  - Global: orchestrator checks `isGlobalKillActive()` and aborts if true
  - Built `/api/admin/killswitch` — GET state, POST execute actions

- **Task 2.4: Email alert delivery system**
  - Built `lib/alerts/matcher.ts` — matches user alerts against eligible offers (brand, category, discount, region filters)
  - Built `lib/alerts/email.ts` — Resend REST API delivery with HTML+text templates, dev console fallback
  - Built `lib/alerts/index.ts` — orchestrates matching → delivery → mark-sent flow
  - Built `/api/alerts` — CRUD endpoint (POST create, GET list, DELETE deactivate)
  - Created interactive `AlertForm` client component (replaces static form on /alerts page)
  - Integrated alert processing into orchestrator as step 7 (scoped to upserted offer IDs)

### Key Decisions
- **Resend over nodemailer** — zero-dependency HTTP transport, no bundling issues in Next.js
- **24-hour alert cooldown** — prevents alert spam; one notification per alert per day max
- **One match per alert per cycle** — best matching offer wins, avoids email flood
- **Dev console fallback** — when RESEND_API_KEY not set, emails log to console for local testing
- **3x SLA multiplier for per-offer staleness** — more generous than source-level (2x)
- **Raw SQL for complex queries** — Postgres FILTER (WHERE) and UPDATE...FROM where Drizzle lacks support

### Files Changed
- `apps/web/src/lib/revalidation.ts` — NEW (offer lifecycle management)
- `apps/web/src/app/api/admin/revalidation/route.ts` — NEW (admin API)
- `apps/web/src/app/admin/page.tsx` — MODIFIED (lifecycle dashboard + API reference)
- `apps/web/src/lib/ingest/orchestrator.ts` — MODIFIED (revalidation step 6)
- `apps/web/src/app/api/ingest/route.ts` — MODIFIED (revalidation in response)
- `PRODUCTION_PLAN.md` — Task 2.2 marked DONE
- `CHANGELOG.md` — v1.1.0-phase2 entry
- `SESSION_LOG.md` — Session 9 entry

---

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
- Created VPS user `realdeal` on 69.30.247.151 with password and SSH key auth (docker group)
- SSH key generated and stored at `~/Desktop/cred/dev/realdeal/ssh/realdeal`
- Multi-stage Dockerfile: deps -> builder -> runner (standalone Next.js, ~102kB)
- docker-compose.yml: container on localhost:3200, health check, auto-restart
- Deploy script (scripts/deploy.sh): rsync + SSH Docker rebuild
- Nginx reverse proxy: port 80 -> localhost:3200 on VPS
- Deployed and verified: HTTP 200, 114KB response, 32 static pages
- Updated all credentials in ~/Desktop/cred/ (CREDENTIAL_INDEX.md + all-credentials.local)
- Pushed to GitHub (Cryptosours/RealDeal)
- Updated Notion with 22 tasks, board/timeline/dashboard views

### Decisions Made
- Port 3200 (3100 was occupied by another project on VPS)
- Standalone Next.js output for minimal Docker image
- Nginx reverse proxy (not Caddy) — consistent with existing VPS setup

### State
- Build: passes (32 pages, 0 errors)
- Pages: 13 routes (+ 12 brand slugs + 6 category slugs = ~31 total pages)
- Deploy: live on VPS at http://69.30.247.151 (via Nginx)
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
- **VPS Security** (69.30.247.151):
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
  - Admin API keys replaced: 64-char hex keys deployed to /opt/realdeal/.env
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
