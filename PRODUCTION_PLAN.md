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
| 6.6 | Create Sentry project + set SENTRY_DSN on VPS | DONE | Operator | High |
| 6.7 | Verify VPS env vars (ADMIN_API_KEY, INGEST_API_KEY) after auth hardening | DONE | Operator | Critical |
| 6.8 | npm audit fix (esbuild override + root next-intl cleanup) | DONE | Builder | Medium |
| 6.9 | Automated deploy pipeline (GitHub → VPS on push) | DONE* | Operator | Medium |
| 6.10 | Rate limiter for public API routes (anti-abuse) | DONE | Builder | Medium |

---

## Phase 7: Revenue & Growth (V1.3)
> Goal: Ad monetization infrastructure, performance optimization, enhanced discoverability, email capture. First revenue milestone.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 7.1 | CSP update for Google Analytics + AdSense domains | DONE | Builder | Critical |
| 7.2 | AdSense ad components (consent-aware, env-gated) | DONE | Builder | Critical |
| 7.3 | Pin vitest 3.x — fix Vite 8 JSX regression (250 tests green) | DONE | Builder | Critical |
| 7.4 | Ad placement integration (deals page, between listings) | DONE | Builder | High |
| 7.5 | Performance optimization (dynamic imports, bundle splitting) | DONE | Builder | High |
| 7.6 | Enhanced sitemap (i18n hreflang, dynamic brand/source pages, lastmod) | DONE | SEO | High |
| 7.7 | Social sharing (share buttons, copy-link, WhatsApp/X/Reddit) | DONE | Builder | Medium |
| 7.8 | Newsletter / email capture (deal digest signup) | DONE | Builder | Medium |
| 7.9 | Google Search Console verification + sitemap submission | HUMAN | Operator | Critical |
| 7.10 | Google Analytics property creation + measurement ID setup | HUMAN | Operator | Critical |
| 7.11 | Google AdSense application (after traffic data exists) | HUMAN | Operator | High |
| 7.12 | Affiliate program signups (Eneba, CDKeys, Kinguin, G2A) | HUMAN | Operator | High |

---

## Phase 8: Data Pipeline Reliability & Automation (V1.4)
> Goal: Maximize live deal data coverage. Fix failing adapters, automate ingestion via cron, add health monitoring. Target: 500+ offers from 7+ working sources.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 8.1 | Fix Raise adapter sourceSlug mismatch (gcx → raise) | DONE | Builder | Critical |
| 8.2 | Add missing Uber brand to seed + production DB | DONE | Builder | High |
| 8.3 | Add health check API endpoint (/api/health) | DONE | Builder | Critical |
| 8.4 | CDKeys adapter — rebranded to Loaded.com, disabled (needs API) | BLOCKED | Builder | High |
| 8.5 | Eneba adapter — SPA, no server-side prices, disabled (needs API) | BLOCKED | Builder | High |
| 8.6 | G2A adapter — anti-bot, disabled (needs affiliate API) | BLOCKED | Builder | Medium |
| 8.7 | Kinguin adapter — anti-bot, disabled (needs affiliate API) | BLOCKED | Builder | Medium |
| 8.8 | OffGamers adapter — anti-bot, disabled (needs affiliate API) | BLOCKED | Builder | Medium |
| 8.9 | GiftCardGranny — 403 on all pages, disabled (anti-bot) | BLOCKED | Builder | Low |
| 8.14 | Disable broken adapters in orchestrator (stop noisy logs) | DONE | Builder | High |
| 8.10 | Automated cron ingestion (every 2h via scripts/ingest-cron.sh) | DONE | Operator | Critical |
| 8.11 | Ingest health dashboard (last run time, success rate, offer counts) | DONE | Builder | High |
| 8.12 | Add catalog source entries to DB (costco, egifter, cardcash, etc.) | DONE | Builder | Medium |
| 8.13 | Trust-badge pre-existing test fix (React import in vitest JSX) | DONE | Builder | Low |

---

## Phase 9: i18n Completeness & Launch Polish (V1.5)
> Goal: All user-facing pages fully internationalized (en + de). Social sharing works with proper PNG OG images. PWA-ready with proper icon assets. Every page looks correct in both languages.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 9.1 | i18n: Home page — extract all hardcoded strings to message files | DONE | Builder | Critical |
| 9.2 | i18n: Deals page — extract hardcoded strings | DONE | Builder | Critical |
| 9.3 | i18n: Brands listing + brand detail pages | DONE | Builder | Critical |
| 9.4 | i18n: Categories listing + category detail pages | DONE | Builder | High |
| 9.5 | i18n: Sources listing + source detail pages | DONE | Builder | High |
| 9.6 | i18n: About, Methodology, Developers pages | DONE | Builder | High |
| 9.7 | i18n: Alerts, Dashboard, Watchlist, Historical Lows pages | DONE | Builder | High |
| 9.8 | i18n: Legal pages (Terms, Privacy, Disclosure) | DONE | Builder | Medium |
| 9.9 | Fix OG image fallback — PNG default for pages without opengraph-image.tsx | DONE | Builder | Critical |
| 9.10 | Add PWA icons (192px, 512px PNG) + apple-touch-icon | DONE | Builder | High |
| 9.11 | i18n: Components — DealCard, DealFilters, NewsletterForm, ShareButton | DONE | Builder | High |
| 9.12 | Deploy latest code to VPS | DONE | Operator | High |

---

## Phase 10: Dark-First Theme Redesign (V1.6)
> Goal: Eliminate harsh white backgrounds. Dark-first design system with deep navy-indigo base. Warm cream light mode. Meaningful visual difference between themes. Improved readability.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 10.1 | Redesign surface color scale — dark navy-indigo default, warm cream light mode | DONE | Designer | Critical |
| 10.2 | Update ThemeProvider + FOUC script for dark-first default | DONE | Builder | Critical |
| 10.3 | Replace all bg-white usage across 32+ files with surface tokens | DONE | Builder | Critical |
| 10.4 | Update glass/card-hover/decorative patterns for dark-first | DONE | Builder | High |
| 10.5 | Improve typography — body font-size 15px, line-height 1.6, heavier data labels | DONE | Designer | High |
| 10.6 | Update global-error.tsx fallback colors for dark theme | DONE | Builder | Medium |
| 10.7 | Update PRODUCT_VISION.md with new color system | DONE | Architect | Medium |
| 10.8 | Deploy latest code to VPS | DONE | Operator | High |

---

## Phase 11: Data Pipeline Scale-Up (V1.7)
> Goal: Maximize live deal data coverage. Expand all adapter product lists, add new brands, re-enable blocked adapters, and move toward 1,000+ offers from 7+ working sources. Target: every seeded brand tracked by every relevant adapter.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 11.1 | BuySellVouchers V2 — 48 products, 7 currencies, pagination, 1% fee fix | DONE | Builder | Critical |
| 11.2 | Eneba adapter — expand from 15 to 35 tracked products | DONE | Builder | High |
| 11.3 | Kinguin adapter — expand from 17 to 40 tracked products | DONE | Builder | High |
| 11.4 | Bitrefill adapter — expand from 12 to 31 products (gaming + EU/UK) | DONE | Builder | High |
| 11.5 | Dundle adapter — expand from 11 to 27 products (gaming + EU/UK) | DONE | Builder | High |
| 11.6 | Raise adapter — expand from 12 to 18 products (gaming + retail) | DONE | Builder | High |
| 11.7 | Re-enable Eneba + Kinguin in orchestrator (fault-tolerant) | DONE | Builder | High |
| 11.8 | Add 4 new brands to DB seed: Fortnite, PUBG, Free Fire, Riot Access | DONE | Builder | Medium |
| 11.9 | Research API/affiliate access for blocked adapters (G2A, CDKeys, OffGamers) | DONE | Operator | Medium |
| 11.10 | Deploy + run full ingestion pipeline | DONE | Operator | Critical |
| 11.11 | Update VENDORS_LIST.md with expanded coverage | DONE | Architect | Medium |

---

## Phase 12: Live Discovery Feed + Data Access Strategy (V1.8)
> Goal: Add a "New Offers Found" live rolling feed to the homepage that reveals recently discovered deals one at a time. Research legitimate data access strategies (APIs, affiliate feeds) for blocked sources.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 12.1 | Create /api/offers/recent endpoint (30 most recent offers) | DONE | Builder | High |
| 12.2 | Build NewOffersFound client component with Framer Motion rolling animation | DONE | Builder | Critical |
| 12.3 | Integrate live feed section into homepage (between Top Deals and Categories) | DONE | Builder | High |
| 12.4 | Research API access: Kinguin REST API, Eneba GraphQL, G2A Integration API | DONE | Operator | High |
| 12.5 | Apply for affiliate programs: Awin (CDKeys/Loaded), Rakuten (GiftCardGranny) | TODO | Operator | Medium |
| 12.6 | Deploy + verify live feed works in production | DONE | Operator | Critical |

---

## Phase 13: Core Engine Hardening + Visual Identity (V1.9)
> Goal: Remove artificial scraping restrictions, enforce real-discount pricing logic, harden FX engine as core immutable feature, and apply the definitive dark+orange visual identity. The platform exists to index every public deal and show ONLY real discounts — "iGift, the real discount."

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 13.1 | Update PROJECT_RULES.md + CLAUDE.md — allow aggressive public-page scraping with proxy/UA rotation | DONE | Architect | Critical |
| 13.2 | Implement overpriced offer filter — suppress offers where effectivePrice > faceValue | DONE | Builder | Critical |
| 13.3 | Verify + harden FX engine — ensure currency conversion is immutable in normalize pipeline | DONE | Builder | Critical |
| 13.4 | Apply FreeX dark palette (bg #1a1815, accent #c15f3c/#d97757) + force dark default | DONE | Designer | Critical |
| 13.5 | Audit all components for remaining indigo / hardcoded color issues | DONE | Builder | High |
| 13.6 | Build + verify all changes | DONE | Operator | Critical |

---

## Phase 14: Revenue Activation (V2.0)
> Goal: Activate all revenue streams. Affiliate links live, Google Analytics tracking, email delivery working, first ad placements. Turn built infrastructure into money.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 14.1 | G2A Goldmine affiliate signup | DONE | Human | High |
| 14.2 | Awin publisher signup (CDKeys #30147 + Kinguin) | IN PROGRESS | Human | Critical |
| 14.3 | Eneba affiliate signup | TODO | Human | High |
| 14.4 | OffGamers affiliate signup | TODO | Human | Medium |
| 14.5 | Set up Google Analytics (add NEXT_PUBLIC_GA_MEASUREMENT_ID env var) | TODO | Human + Agent | Critical |
| 14.6 | Apply for Google AdSense | TODO | Human | High |
| 14.7 | Set up Google Search Console + submit sitemap | TODO | Human | Critical |
| 14.8 | Set up Resend for email delivery (centralized mailing service) | TODO | Agent | High |
| 14.9 | Build price alert email templates (React Email) | TODO | Agent | High |
| 14.10 | Wire affiliate links into deal cards (once approved) | TODO | Agent | High |
| 14.11 | Add GA4 custom events (deal_click, alert_signup, brand_view) | TODO | Agent | Medium |
| 14.12 | Weekly deal digest newsletter template | TODO | Agent | Medium |

---

## Phase 15: User Acquisition & SEO (V2.1)
> Goal: Drive organic traffic. Content marketing, SEO articles, Google Shopping CSS ads.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 15.1 | Content pages: "Best [Brand] Gift Card Deals" for top 10 brands | TODO | Agent | High |
| 15.2 | Blog/guide system (MDX or CMS) | TODO | Agent | High |
| 15.3 | Write 5 SEO articles (gift card buying guides, comparison posts) | TODO | Agent | High |
| 15.4 | Internal linking strategy (brand pages cross-link to guides) | TODO | Agent | Medium |
| 15.5 | Google Shopping CSS (Comparison Shopping Service) integration via Awin | TODO | Agent + Human | High |
| 15.6 | Submit to Product Hunt / Hacker News | TODO | Human | Medium |
| 15.7 | Social media accounts (X/Twitter, Reddit presence) | TODO | Human | Medium |

---

## Phase 16: Advanced Intelligence (V2.2)
> Goal: Make iGift smarter than any competitor. Price predictions, buy recommendations, cross-vendor comparison.

| # | Task | Status | Specialist | Priority |
|---|------|--------|------------|----------|
| 16.1 | Price trend predictions (moving average + anomaly detection) | TODO | Agent | High |
| 16.2 | "Best time to buy" recommendations per brand | TODO | Agent | High |
| 16.3 | Price drop notifications (email alerts on historical low) | TODO | Agent | High |
| 16.4 | Cross-vendor price comparison view (same card, all sources side by side) | TODO | Agent | Critical |
| 16.5 | Deal expiry tracking (estimate when deals typically disappear) | TODO | Agent | Medium |
