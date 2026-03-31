# RealDeal — Engineering & Compliance Rules

## Compliance Boundaries (Non-Negotiable)

### What We Are
- A deal discovery, verification, and ranking platform
- A publisher and affiliate referral site
- A premium alerts and API service (later)

### What We Are NOT (and Must Never Become in V1)
- A marketplace or store
- A payment processor or escrow service
- A broker or reseller of stored value
- A wallet or account system holding user funds

### Content Exclusions (V1)
- Account resale or credential-linked listings
- Open-loop prepaid cards (Visa/Mastercard gift cards)
- Adult or gambling-linked payment vouchers
- "No-KYC" crypto gift card positioning
- Any listing that implies trading accounts or credentials

### Data Handling
- NEVER store gift card codes, redemption codes, or credentials
- NEVER scrape behind authentication walls
- NEVER bypass CAPTCHA or anti-bot systems
- NEVER republish full catalogs (store minimal metadata + canonical links)
- Raw fetch snapshots must be preserved for audit/dispute resolution
- Every offer must have provenance (feed/API/manual/scrape) and last-verified timestamp

## Source Classification

| Zone | Allowed in V1 | Examples |
|------|---------------|----------|
| Green | Yes | Authorized retailers, official promos, B2B catalog APIs, editorial deal pages |
| Yellow | Yes (with enhanced scoring) | Reputable secondary marketplaces with buyer protection |
| Red | No | Account resale, credential markets, unclear provenance |

## Engineering Standards

### TypeScript
- Strict mode enabled
- No `any` types in committed code
- Zod for runtime validation at system boundaries
- All API responses typed

### Data Model
- All monetary values stored as integers (cents/smallest unit)
- All timestamps stored as UTC ISO 8601
- Currency codes as ISO 4217 (USD, EUR, GBP)
- Country codes as ISO 3166-1 alpha-2

### Frontend
- Server-side rendering for all public pages (SEO requirement)
- Every page: unique title (<60 chars), unique meta description (<155 chars)
- Affiliate links: `rel="noopener noreferrer nofollow"` always
- `price-display` class for all monetary values (tabular-nums monospace)
- Trust badges on every deal listing — never hide source classification

### Scoring Engine
- Two scores always: Deal Quality (0-100) + Confidence (0-100)
- Both displayed to users separately
- Hard suppression rules cannot be overridden by high scores
- Region-incompatible deals: score capped at 30 regardless of price

### SEO
- Programmatic pages only with unique, verified data
- No thin pages — every page must have real, differentiated content
- JSON-LD structured data on deal and brand pages
- robots.txt and sitemap.xml maintained
- OG tags and Twitter Cards on every page
