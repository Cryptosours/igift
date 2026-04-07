# Pre-Commit Security Scan — iGift
**Date:** 2026-04-07  **Verdict:** ✅ SAFE TO COMMIT — 0 new findings

## Summary

| Severity | New | Existing | Total |
|----------|-----|----------|-------|
| 🔴 Critical | 0 | 0 | 0 |
| 🟠 High | 0 | 0 | 0 |
| 🟡 Medium | 0 | 5 | 5 |
| 🟢 Low | 0 | 2 | 2 |
| **Total** | **0** | **7** | **7** |

**Risk Score:** 43.9/100 (Moderate Risk — all pre-existing, unchanged from 2026-04-06 scan)

## Findings (Pre-Existing Only — Unchanged)

| # | Sev | Title | File:Line | Remediation |
|---|-----|-------|-----------|-------------|
| 1 | 🟡 Medium | Non-literal RegExp argument | `adapters/buysellvouchers.ts:89` | Validate `product` input before passing to `RegExp()` |
| 2 | 🟢 Info | Unsafe format string concat | `lib/alerts/email.ts:154` | Use parameterized template instead of string concat |
| 3 | 🟢 Info | Unsafe format string concat | `lib/alerts/email.ts:161` | Use parameterized template instead of string concat |
| 4–7 | 🟡 Medium | npm moderate vulns (4) | `package-lock.json` | Run `npm audit fix` when stable |

## New Files Scanned (Phase 5 — Quality Hardening)

| File | Findings |
|------|----------|
| `apps/web/src/app/[locale]/error.tsx` | 0 — displays `error.digest` (opaque server-generated ID, safe) |
| `apps/web/src/app/global-error.tsx` | 0 — inline styles only, no user-controlled output except `error.digest` |
| `apps/web/vitest.config.ts` | 0 — dev tooling config |
| `apps/web/src/lib/scoring.test.ts` | 0 — test file, no runtime exposure |
| `apps/web/src/lib/ingest/normalize.test.ts` | 0 — test file, no runtime exposure |
| `apps/web/src/lib/regions.test.ts` | 0 — test file, no runtime exposure |

## Modified Files Scanned

| File | Change | Findings |
|------|--------|----------|
| `apps/web/src/lib/ingest/normalize.ts` | Added `if (!normalized) return null` guard | 0 — defensive fix |
| `apps/web/src/app/[locale]/page.tsx` | Removed sample-data fallback | 0 — tightens error handling |
| `apps/web/src/app/[locale]/deals/page.tsx` | Removed sample-data fallback | 0 — tightens error handling |
| `apps/web/src/app/[locale]/categories/page.tsx` | Removed sample-data fallback | 0 — tightens error handling |
| `apps/web/src/app/api/search/route.ts` | Returns structured JSON error on DB failure | 0 — no user input reflected |
| `apps/web/package.json` | Added vitest + @vitejs/plugin-react devDeps | 0 — dev-only dependencies |

## Notes

- No secrets, tokens, or credentials detected in staged changes
- `error.digest` values are Next.js server-generated opaque hashes — safe to display
- All 4 pre-existing npm moderate vulns are in `package-lock.json` and predate this commit
