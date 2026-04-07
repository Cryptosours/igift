import type { MetadataRoute } from "next";
import { db } from "@/db";
import { brands as brandsTable, sources } from "@/db/schema";

const BASE_URL = "https://igift.app";
const LOCALES = ["en", "de"] as const;

const CATEGORIES = [
  "gaming", "app-stores", "streaming", "retail", "food-dining", "travel",
  "telecom", "other",
];

/**
 * Build a sitemap entry with i18n alternates for all supported locales.
 * Google uses these hreflang annotations to serve the correct language.
 */
function localizedEntry(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number; lastModified: Date },
): MetadataRoute.Sitemap[number] {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[locale] = `${BASE_URL}/${locale}${path}`;
  }
  // x-default points to English as the canonical fallback
  alternates["x-default"] = `${BASE_URL}/en${path}`;

  return {
    url: `${BASE_URL}/en${path}`,
    lastModified: opts.lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages: alternates },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths: Array<[string, { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }]> = [
    ["", { changeFrequency: "daily", priority: 1 }],
    ["/deals", { changeFrequency: "hourly", priority: 0.9 }],
    ["/brands", { changeFrequency: "daily", priority: 0.8 }],
    ["/categories", { changeFrequency: "weekly", priority: 0.7 }],
    ["/sources", { changeFrequency: "daily", priority: 0.7 }],
    ["/historical-lows", { changeFrequency: "daily", priority: 0.8 }],
    ["/alerts", { changeFrequency: "monthly", priority: 0.6 }],
    ["/developers", { changeFrequency: "monthly", priority: 0.5 }],
    ["/methodology", { changeFrequency: "monthly", priority: 0.5 }],
    ["/about", { changeFrequency: "monthly", priority: 0.4 }],
    ["/terms", { changeFrequency: "yearly", priority: 0.2 }],
    ["/privacy", { changeFrequency: "yearly", priority: 0.2 }],
    ["/disclosure", { changeFrequency: "yearly", priority: 0.2 }],
  ];

  const staticPages = staticPaths.map(([path, opts]) =>
    localizedEntry(path, { ...opts, lastModified: now }),
  );

  // Dynamic brand pages from DB (falls back to empty if DB unavailable)
  let brandSlugs: string[] = [];
  let sourceSlugs: string[] = [];
  try {
    const dbBrands = await db.select({ slug: brandsTable.slug }).from(brandsTable);
    brandSlugs = dbBrands.map((b) => b.slug);
    const dbSources = await db.select({ slug: sources.slug }).from(sources);
    sourceSlugs = dbSources.map((s) => s.slug);
  } catch {
    // DB unavailable at build time — static pages only
  }

  const brandPages = brandSlugs.map((slug) =>
    localizedEntry(`/brands/${slug}`, { changeFrequency: "daily", priority: 0.8, lastModified: now }),
  );

  const categoryPages = CATEGORIES.map((slug) =>
    localizedEntry(`/categories/${slug}`, { changeFrequency: "daily", priority: 0.7, lastModified: now }),
  );

  const sourcePages = sourceSlugs.map((slug) =>
    localizedEntry(`/sources/${slug}`, { changeFrequency: "weekly", priority: 0.6, lastModified: now }),
  );

  return [...staticPages, ...brandPages, ...categoryPages, ...sourcePages];
}
