# Phase 8 Implementation Plan: Programmatic SEO & Pillar Page Clusters

## Objectives
1. Define typed SEO data sources in `lib/seo-data.ts`:
   - **Cluster 1: Documents** (`/documents/[slug]` × 20+ spokes)
     - `birth-certificate`, `marriage-certificate`, `academic-diploma`, `transcript`, `passport`, `court-order`, `police-clearance`, `bank-statement`, `medical-records`, `death-certificate`, `divorce-decree`, `drivers-license`, `vaccination-record`, `adoption-papers`, `power-of-attorney`, etc.
   - **Cluster 2: Languages** (`/languages/[slug]` × 25+ spokes)
     - `spanish`, `arabic`, `chinese-simplified`, `chinese-traditional`, `french`, `portuguese`, `german`, `russian`, `vietnamese`, `korean`, `italian`, `tagalog`, `ukrainian`, `japanese`, `hindi`, `urdu`, `farsi`, `hebrew`, `polish`, `turkish`, etc.
   - **Cluster 3: Use Cases** (`/use-cases/[slug]` × 12+ spokes)
     - `uscis-immigration`, `i-130-petition`, `i-485-adjustment-of-status`, `f-1-student-visa`, `naturalization-n-400`, `university-admission-wes`, `dmv-license-conversion`, `court-filing`, `marriage-abroad`, `apostille-authentication`, `employment-authorization-i-765`, `real-estate-transaction`.
   - **Cluster 4: Authority Guides** (`/guides/[slug]` × 6+ spokes)
     - `uscis-translation-requirements-guide`, `prevent-uscis-rfe-rejections`, `certified-vs-notarized-translation`, `passport-name-spelling-rules`, `ata-certification-standards`, `apostille-vs-certification`.
2. Implement Dynamic Spoke Routes with `generateStaticParams`:
   - `app/documents/[slug]/page.tsx`
   - `app/languages/[slug]/page.tsx`
   - `app/use-cases/[slug]/page.tsx`
   - `app/use-cases/page.tsx` (Hub)
   - `app/guides/[slug]/page.tsx`
   - `app/guides/page.tsx` (Hub)
3. Implement Complete Structured Data (JSON-LD):
   - `Service`, `FAQPage`, `BreadcrumbList`, `Organization`, and `AggregateRating`.
4. Implement `app/sitemap.ts` and `app/robots.ts` for dynamic multi-cluster search indexing.
5. Verification:
   - Vitest test suite (`test/seo.test.ts`).
   - 0 raw hex violations.
