import type { MetadataRoute } from "next";

const BASE_URL = "https://igift.app";

// Sample brands and categories — will be dynamic from DB later
const brands = [
  "apple", "steam", "netflix", "playstation", "google-play",
  "amazon", "xbox", "spotify", "nintendo", "uber", "doordash", "disney-plus",
];

const categories = [
  "gaming", "app-stores", "streaming", "retail", "food-dining", "travel",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/deals`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/alerts`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/disclosure`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const brandPages: MetadataRoute.Sitemap = brands.map((slug) => ({
    url: `${BASE_URL}/brands/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...categoryPages];
}
