# iGift

Trust-scored deal intelligence for digital gift cards, credits, and vouchers.

**[igift.app](https://igift.app)**

## What is iGift?

iGift discovers, verifies, and ranks digital gift card deals across authorized retailers and reputable marketplaces. Every listing gets a dual score: **Deal Quality** (how good is this deal?) and **Confidence** (how much do we trust the data?).

We are a publisher/referral platform. We never sell gift cards, hold funds, or process payments.

## Stack

- **Framework:** Next.js 15 (App Router) with React Server Components
- **Monorepo:** Turborepo with npm workspaces
- **Styling:** Tailwind CSS 4 with `@theme` design tokens
- **Database:** PostgreSQL 16 via Drizzle ORM
- **Language:** TypeScript (strict mode)
- **Deployment:** Docker (multi-stage) + VPS

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx turbo dev

# Production build
npx turbo build

# Lint
npx turbo lint
```

### Database Setup

1. Start PostgreSQL (via Docker or local install)
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Run migrations and seed:
   ```bash
   cd apps/web
   npm run db:push
   npm run db:seed
   ```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://igift:yourpassword@localhost:5432/igift
ADMIN_API_KEY=your-admin-key
INGEST_API_KEY=your-ingest-key
```

## Project Structure

```
iGift/
├── apps/web/          # Next.js public site
├── packages/          # Shared libraries (planned)
├── scripts/           # Deploy and utility scripts
├── kb/                # Knowledge base and architecture docs
└── docs/              # Research and compliance docs
```

## Scoring System

Every deal gets two independent scores (0-100):

| Score | Measures | Key Factors |
|-------|----------|-------------|
| **Deal Quality** | How good is this deal? | Discount depth, fee transparency, region fit, seller trust, buyer protection |
| **Confidence** | How reliable is our data? | Data freshness, source reliability, cross-source consistency, fraud signals |

Deals from red-zone sources are excluded entirely. Region-incompatible deals are capped at 30 regardless of price.

## Source Classification

| Zone | Description | Included |
|------|-------------|----------|
| Green | Authorized retailers, official promos | Yes |
| Yellow | Reputable marketplaces with buyer protection | Yes (enhanced scoring) |
| Red | Unclear provenance, account resale | Excluded |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for our responsible disclosure policy.

## License

[MIT](LICENSE)
