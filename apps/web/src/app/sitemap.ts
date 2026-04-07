import type { MetadataRoute } from "next";
import { db } from "@/db";
import { brands as brandsTable, sources } from "@/db/schema";

const BASE_URL = "https://igift.app";

const CATEGORIES = [
  "gaming", "app-stores", "streaming", "retail", "food-dining", "travel",
  "telecom", "other",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/deals`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/sources`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/historical-lows`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/alerts`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/developers`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/disclosure`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

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

  const brandPages: MetadataRoute.Sitemap = brandSlugs.map((slug) => ({
    url: `${BASE_URL}/brands/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const sourcePages: MetadataRoute.Sitemap = sourceSlugs.map((slug) => ({
    url: `${BASE_URL}/sources/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...brandPages, ...categoryPages, ...sourcePages];
}
