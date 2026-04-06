/**
 * POST /api/admin/normalize — Re-normalize offer titles and category mappings
 *
 * Runs the LLM-assisted normalization pipeline over:
 * - offers with low-confidence or non-English titles
 * - offers with unmapped categories
 *
 * Protected by ADMIN_API_KEY header.
 *
 * Body (optional):
 * {
 *   "scope": "titles" | "categories" | "all",   // default: "all"
 *   "limit": number,                              // max offers to process (default: 50)
 *   "dryRun": boolean                             // if true, return changes without applying
 * }
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers, brands } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { normalizeOfferTitle, mapCategory } from "@/lib/ingest/title-normalizer";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Auth check
  const apiKey = request.headers.get("x-api-key");
  if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { scope?: string; limit?: number; dryRun?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  const scope = body.scope ?? "all";
  const limit = Math.min(body.limit ?? 50, 200);
  const dryRun = body.dryRun ?? false;

  const startedAt = Date.now();
  const titleChanges: Array<{ id: number; oldTitle: string; newTitle: string; method: string }> = [];
  const categoryChanges: Array<{ id: number; oldCategory: string | null; newCategory: string; method: string }> = [];

  // ── Title normalization ──────────────────────────────────────────────────

  if (scope === "titles" || scope === "all") {
    // Fetch active/pending offers that have non-English markers in their normalizedTitle
    // or where normalizedTitle is suspiciously short/generic
    const rows = await db
      .select({
        id: offers.id,
        normalizedTitle: offers.normalizedTitle,
        brandName: brands.name,
      })
      .from(offers)
      .innerJoin(brands, eq(offers.brandId, brands.id))
      .where(
        or(
          // Offers with obvious non-English terms in title
          sql`LOWER(${offers.normalizedTitle}) ~ '(gutschein|guthaben|carte|cadeau|tarjeta|geschenk|guthaben|buono)'`,
          // Very short titles that might be poorly normalized
          sql`LENGTH(${offers.normalizedTitle}) < 8`,
        ),
      )
      .limit(limit);

    for (const row of rows) {
      if (!row.normalizedTitle) continue;

      const result = await normalizeOfferTitle(row.normalizedTitle, row.brandName);

      if (result.normalizedTitle !== row.normalizedTitle && result.confidence >= 70) {
        titleChanges.push({
          id: row.id,
          oldTitle: row.normalizedTitle,
          newTitle: result.normalizedTitle,
          method: result.method,
        });

        if (!dryRun) {
          await db
            .update(offers)
            .set({ normalizedTitle: result.normalizedTitle, updatedAt: new Date() })
            .where(eq(offers.id, row.id));
        }
      }
    }
  }

  // ── Category normalization ───────────────────────────────────────────────
  // category lives on brands, not offers. Map brand names to canonical slugs.

  if (scope === "categories" || scope === "all") {
    // Fetch brands where category is still "other" (uncategorized)
    const rows = await db
      .select({
        id: brands.id,
        name: brands.name,
        category: brands.category,
      })
      .from(brands)
      .where(sql`${brands.category} = 'other'`)
      .limit(limit);

    for (const row of rows) {
      const result = await mapCategory(row.name);

      if (result.confidence >= 60 && result.categorySlug !== "other") {
        categoryChanges.push({
          id: row.id,
          oldCategory: row.category,
          newCategory: result.categorySlug,
          method: result.method,
        });

        if (!dryRun) {
          await db
            .update(brands)
            .set({ category: result.categorySlug as typeof brands.$inferInsert.category, updatedAt: new Date() })
            .where(eq(brands.id, row.id));
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    dryRun,
    scope,
    durationMs: Date.now() - startedAt,
    llmAvailable: !!process.env.ANTHROPIC_API_KEY,
    titleChanges: {
      count: titleChanges.length,
      items: dryRun ? titleChanges : undefined,
    },
    categoryChanges: {
      count: categoryChanges.length,
      items: dryRun ? categoryChanges : undefined,
    },
  });
}
