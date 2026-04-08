# iGift — Agent Entry Point

> **What:** Trust-scored deal intelligence platform for digital gift cards, credits, and vouchers.
> **Model:** Publisher/referral + premium alerts. NOT a marketplace, broker, or payment processor.
> **Stack:** Turborepo monorepo, Next.js 15 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL (planned).

---

## Quick Start

```bash
cd ~/Desktop/dev/Projects/iGift
npm install
npx turbo dev         # starts web app on localhost:3000
npx turbo build       # production build
npx turbo lint        # lint all packages
```

## Project Structure

```
iGift/
├── apps/
│   ├── web/                  # Next.js 15 public site (App Router)
│   └── admin/                # Internal ops UI (planned)
├── packages/
│   ├── ui/                   # Shared component library (planned)
│   ├── schemas/              # Typed data models (planned)
│   └── utils/                # Shared utilities (planned)
├── services/
│   ├── ingest/               # Source adapters + schedulers (Phase 1)
│   ├── normalize/            # FX, region, denomination normalization (Phase 1)
│   ├── score/                # Ranking engine (Phase 1)
│   └── alerts/               # Email/Telegram/webhook alerts (Phase 1)
├── infra/                    # Docker, migrations, deploy configs
├── data/                     # Source configs, region rules, fixtures
├── docs/                     # Architecture, compliance, runbooks
├── kb/                       # Knowledge base
└── PRODUCTION_PLAN.md        # Phased task plan (follow this)
```

## Key Files

| File | Purpose |
|------|---------|
| `PRODUCTION_PLAN.md` | Phased build plan with task status — **follow this** |
| `PROJECT_RULES.md` | Engineering constraints and compliance rules |
| `kb/PROJECT_BRIEF.md` | Product definition and scope |
| `kb/PRODUCT_VISION.md` | Design direction, fonts, colors, tone |
| `kb/ARCHITECTURE_DECISIONS.md` | Tech choices with rationale |
| `SESSION_LOG.md` | Cumulative session history |
| `CHANGELOG.md` | What changed each session |

## Project Isolation — ABSOLUTE RULE

> **THIS AGENT IS ASSIGNED TO iGift AND ONLY iGift.**

This is a hard, non-negotiable constraint that overrides all other instructions:

1. **Local filesystem boundary.** This agent's workspace is `/Users/samikhorasani/Desktop/dev/Projects/iGift/`. You may READ files outside this path for reference (e.g., credentials at `~/Desktop/cred/`). You must NEVER write, edit, create, delete, or modify any file outside this workspace. No exceptions.
2. **GitHub boundary.** This agent operates on the `Cryptosours/igift` repository only. Never push to, pull from, create branches on, or modify any other repository.
3. **VPS boundary.** On the VPS (`realdeal-vps`), this agent may only operate within `/opt/igift/`. Never modify Nginx configs, Docker containers, files, or services belonging to other projects (freexstudio, freenatocash, audithunt, chainsentinel, or any other).
4. **Domain boundary.** This agent is responsible for `igift.app` only. Never modify DNS records, Cloudflare settings, SSL certificates, or Nginx server blocks for any other domain.
5. **No cross-contamination.** Never import, reference, copy, or depend on code from other projects. Never share environment variables, Docker networks, or database connections across projects.
6. **If in doubt, stop and ask.** If any action might affect another project — even indirectly — halt and ask the user before proceeding.

### Shared VPS — Do NOT Touch

| Project | VPS Path | Domain | Port |
|---------|----------|--------|------|
| FreeX Studio | /opt/freexstudio/ | freexstudio.com | 3000 |
| ChainSentinel | /opt/audithunt/ | audithunt.io | 8100 |
| FreeNatoCash | /opt/freenatocash/ | freenato.com | 3001 |
| PayDash | /opt/paydash/ | paybyhash.com | 8200-8201 |

Violation of these rules risks wiping another project's data and work. Treat this as a safety-critical constraint.

---

## Critical Rules

1. **Green-zone only in V1.** Only authorized/official sellers and reputable resale marketplaces. No account resale, no credential listings, no open-loop prepaid cards.
2. **Never store gift card codes.** Treat codes as toxic data.
3. **Never hold funds or process payments.** We are a publisher/referral platform.
4. **Never scrape behind login or bypass anti-bot.** Only public pages, APIs, and partner feeds.
5. **Two scores, not one.** Deal Quality Score + Confidence Score, always shown separately.
6. **Region-fit is mandatory.** Never rank a deal highly if region compatibility is unknown.
7. **Affiliate links must be `rel="noopener noreferrer nofollow"`.** Always.

## Design System

- **Primary:** Indigo/brand scale (brand-50 through brand-950)
- **Deal/savings:** Emerald/green (deal-50 through deal-900)
- **Alert/premium:** Amber (alert-50 through alert-700)
- **Trust zones:** Green (#22c55e), Yellow (#eab308), Red (#ef4444)
- **Font:** Inter (sans), JetBrains Mono (prices/scores)
- **Spacing:** 4px grid
- **Components:** See `apps/web/src/components/`

## Test Commands

```bash
npx turbo build       # full build (catches type errors + build failures)
npx turbo lint        # ESLint across workspace
```
