# iGift — Architecture Decisions

## ADR-001: Monorepo with Turborepo
**Decision:** Use Turborepo for monorepo management.
**Alternatives:** Nx, Lerna, standalone repos.
**Why:** Turborepo is lightweight, TypeScript-native, and handles our needs (web, admin, shared packages) without the config overhead of Nx. Build caching speeds up iteration.
**Revisit when:** More than 5 apps/packages or CI build times exceed 5 minutes.

## ADR-002: Next.js 15 with App Router
**Decision:** Next.js 15 App Router for the public site.
**Alternatives:** Astro, Remix, SvelteKit.
**Why:** Server-side rendering is critical for SEO (programmatic brand/deal pages). App Router gives us React Server Components for minimal JS shipped. React ecosystem is deepest for component libraries. Next.js has the strongest Vercel deployment path.
**Revisit when:** Performance requirements change or Astro's ecosystem matures for dynamic data.

## ADR-003: Tailwind CSS 4
**Decision:** Tailwind CSS 4 with @theme for design tokens.
**Alternatives:** CSS Modules, styled-components, Panda CSS.
**Why:** Utility-first matches rapid iteration. @theme in Tailwind 4 provides native CSS custom properties for our design tokens. No runtime cost. Consistent with the Inter + clean UI direction.
**Revisit when:** N/A — strong fit.

## ADR-004: Drizzle ORM (Planned for Phase 1)
**Decision:** Drizzle ORM over Prisma for database access.
**Alternatives:** Prisma, Kysely, raw SQL.
**Why:** SQL-first approach. Better for complex queries (scoring engine, price aggregations). Lighter runtime than Prisma. Type-safe without code generation step. Migrations via drizzle-kit.
**Revisit when:** Team members strongly prefer Prisma's DX.

## ADR-005: Dual Scoring System
**Decision:** Two separate scores — Deal Quality (0-100) and Confidence (0-100) — always shown separately.
**Alternatives:** Single composite score, star rating, letter grades.
**Why:** A deal can look great (high quality) but be unreliable (low confidence). Merging these hides critical information. The research validated this — "a great-looking deal with low confidence is not a deal you should trust." Transparency builds user trust and differentiates us from single-number aggregators.
**Revisit when:** User research shows confusion. Consider adding a simplified "verdict" label on top.

## ADR-006: Green/Yellow/Red Trust Zones
**Decision:** Every source classified into Green (verified/authorized), Yellow (marketplace with protection), or Red (excluded).
**Alternatives:** Numerical trust scores only, no classification.
**Why:** Traffic-light metaphor is instantly understood. Matches compliance reality (green-zone sources have materially different risk profiles). Red zone is excluded entirely — not shown, not ranked.
**Revisit when:** Need finer granularity within zones.

## ADR-007: Publisher/Referral Model Only
**Decision:** Never process payments, hold funds, or broker stored value in V1.
**Alternatives:** Marketplace model, checkout integration.
**Why:** Processor risk (Stripe/PayPal restrictions on stored-value businesses), AML/compliance risk, and the research is clear that the safest operating model is publisher/referral. Affiliate revenue is validated by incumbents (Gift Card Granny, Bitrefill affiliate program).
**Revisit when:** Revenue requires checkout — but only with proper compliance infrastructure.

## ADR-008: PostgreSQL for Primary Store
**Decision:** PostgreSQL as primary database.
**Alternatives:** MySQL, MongoDB, Supabase.
**Why:** Best for structured data with complex queries. TimescaleDB extension available for price history if needed. Rich JSON support for flexible metadata. Industry standard for financial/transactional data.
**Revisit when:** N/A.

## ADR-009: Feed/API-First Data Acquisition
**Decision:** Prefer official APIs and affiliate feeds over scraping.
**Alternatives:** Scraping-first approach.
**Why:** Research is unambiguous — scraping is expensive, legally risky, and fragile against bot defenses (Cloudflare, Akamai, DataDome). Feed-based ingestion is cheaper, more reliable, and legally safer. Scraping reserved only for selected public pages where permitted.
**Revisit when:** N/A — this is foundational.

## ADR-010: Effective Price, Not Sticker Price
**Decision:** Always show "effective price" that includes all known fees.
**Alternatives:** Show listing price with fees noted separately.
**Why:** Core differentiator. "15% off" means nothing if there's a 10% platform fee. Effective price = listing + platform fees + payment surcharges + membership cost allocation, converted to user currency. This is what the user actually pays.
**Revisit when:** N/A — this is the product thesis.

## ADR-011: PostgreSQL ILIKE Search over Meilisearch for V1
**Decision:** Use Postgres ILIKE with multi-field matching for V1 search, not a dedicated search engine.
**Alternatives:** Meilisearch (Docker), OpenSearch, Fuse.js (client-side), Algolia (SaaS).
**Why:** At current scale (<1000 offers), Meilisearch adds infrastructure complexity (Docker service, sync pipeline, memory on VPS) for marginal UX benefit. Postgres ILIKE is zero-infrastructure, always consistent, and fast enough. The search UI is fully built — only the backend engine is simple. Upgrade to Meilisearch when volume exceeds 100K+ offers or typo tolerance becomes critical.
**Revisit when:** Offer count > 100K, or user feedback requests fuzzy/typo-tolerant search.
