# Pre-Commit Security Scan — iGift
**Date:** 2026-04-06  **Verdict:** ✅ SAFE TO COMMIT — 0 new findings

## Summary

| Severity | New | Existing | Total |
|----------|-----|----------|-------|
| 🔴 Critical | 0 | 0 | 0 |
| 🟠 High | 0 | 0 | 0 |
| 🟡 Medium | 0 | 5 | 5 |
| 🟢 Low | 0 | 2 | 2 |
| **Total** | **0** | **7** | **7** |

**Risk Score:** 43.9/100 (Moderate Risk — all pre-existing)

## Findings (Pre-Existing Only)

| # | Sev | Title | File:Line | Remediation |
|---|-----|-------|-----------|-------------|
| 1 | 🟡 Medium | Non-literal RegExp argument | `adapters/buysellvouchers.ts:89` | Validate `product` input before passing to `RegExp()` |
| 2 | 🟢 Info | Unsafe format string concat | `lib/alerts/email.ts:154` | Use parameterized template instead of string concat |
| 3 | 🟢 Info | Unsafe format string concat | `lib/alerts/email.ts:161` | Use parameterized template instead of string concat |
| 4–7 | 🟡 Medium | npm moderate vulns (4) | `package-lock.json` | Run `npm audit fix` when stable |

**Note:** 15 gitleaks findings in `.next/` (gitignored build artifacts — false positives). 150 grype findings in Go stdlib from system environment — unrelated to app code.

## New Files Scanned (Phase 2 Tasks 2.5–2.7)
- `apps/web/src/lib/ingest/title-normalizer.ts` — 0 findings
- `apps/web/src/app/api/admin/normalize/route.ts` — 0 findings
- `apps/web/src/app/api/complaints/route.ts` — 0 findings
