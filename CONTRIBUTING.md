# Contributing to iGift

Thank you for your interest in contributing to iGift.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/iGift.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run the build: `npx turbo build`
7. Run the linter: `npx turbo lint`
8. Commit and push
9. Open a pull request

## Development Guidelines

### Code Style

- TypeScript strict mode (no `any` types)
- Tailwind CSS for styling
- Server Components by default, `"use client"` only when needed
- All monetary values in cents (integers)
- All timestamps in UTC

### Commit Messages

We use conventional commits:

```
feat: add brand detail page
fix: correct price calculation for CAD offers
docs: update scoring methodology
refactor: extract price normalization logic
```

### Pull Requests

- Keep PRs focused on a single change
- Include a clear description of what changed and why
- Ensure the build passes (`npx turbo build`)
- Update documentation if behavior changes

### What We Accept

- Bug fixes
- Performance improvements
- New source adapters (following the existing adapter pattern)
- UI/UX improvements
- Documentation improvements
- Test coverage improvements

### What We Don't Accept

- Features that change iGift into a marketplace or payment processor
- Scraping behind authentication walls or bypassing anti-bot measures
- Storing gift card codes or credentials
- Changes that compromise user privacy

## Compliance Rules

iGift operates under strict compliance boundaries. Please read `PROJECT_RULES.md` before contributing. Key rules:

- Green-zone sources only in V1
- Never store gift card codes
- Never hold funds or process payments
- Affiliate links must use `rel="noopener noreferrer nofollow"`
- Two scores (Deal Quality + Confidence), always shown separately

## Questions?

Open an issue or email hello@igift.app.
