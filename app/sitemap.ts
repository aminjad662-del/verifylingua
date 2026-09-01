import { MetadataRoute } from "next";
import { SEO_DOCUMENTS, SEO_LANGUAGES, SEO_USE_CASES, SEO_GUIDES } from "@/lib/seo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://verifylingua.com";
  const now = new Date();

  // Core Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/documents`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/languages`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/use-cases`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/verify`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Document Spokes
  const docRoutes: MetadataRoute.Sitemap = SEO_DOCUMENTS.map((doc) => ({
    url: `${baseUrl}/documents/${doc.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Language Spokes
  const langRoutes: MetadataRoute.Sitemap = SEO_LANGUAGES.map((lang) => ({
    url: `${baseUrl}/languages/${lang.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Use Case Spokes
  const useCaseRoutes: MetadataRoute.Sitemap = SEO_USE_CASES.map((uc) => ({
    url: `${baseUrl}/use-cases/${uc.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Guide Spokes
  const guideRoutes: MetadataRoute.Sitemap = SEO_GUIDES.map((g) => ({
    url: `${baseUrl}/guides/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...docRoutes, ...langRoutes, ...useCaseRoutes, ...guideRoutes];
}
