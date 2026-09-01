import { describe, it, expect } from "vitest";
import {
  SEO_DOCUMENTS,
  SEO_LANGUAGES,
  SEO_USE_CASES,
  SEO_GUIDES,
} from "@/lib/seo-data";

describe("Programmatic SEO & Pillar Page Clusters (Phase 8)", () => {
  it("ensures all document spoke pages have unique slugs, H1s, and meta descriptions", () => {
    const slugs = new Set<string>();
    const h1s = new Set<string>();

    SEO_DOCUMENTS.forEach((doc) => {
      expect(slugs.has(doc.slug)).toBe(false);
      slugs.add(doc.slug);

      expect(h1s.has(doc.h1)).toBe(false);
      h1s.add(doc.h1);

      expect(doc.metaDescription.length).toBeGreaterThan(50);
      expect(doc.complianceRequirements.length).toBeGreaterThanOrEqual(2);
      expect(doc.faqs.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("ensures language spoke pages include RTL direction indicators", () => {
    const arabic = SEO_LANGUAGES.find((l) => l.code === "ar");
    expect(arabic).toBeDefined();
    expect(arabic?.dir).toBe("rtl");

    const spanish = SEO_LANGUAGES.find((l) => l.code === "es");
    expect(spanish).toBeDefined();
    expect(spanish?.dir).toBe("ltr");
  });

  it("verifies authority guide clusters have valid sections and reading times", () => {
    SEO_GUIDES.forEach((guide) => {
      expect(guide.sections.length).toBeGreaterThanOrEqual(2);
      expect(guide.readTime).toContain("read");
      expect(guide.lastUpdated).toBeTruthy();
    });
  });
});
