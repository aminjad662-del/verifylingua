# PRODUCT DIAGNOSIS & REPOSITORY FORENSICS AUDIT

**Product:** VerifyLingua — Enterprise Autonomous & Certified Document-Translation Platform  
**Date:** September 11, 2026  
**Auditor:** Principal Product Architect & Staff Systems Engineering Pod  
**Repository State:** Pre-Migration Forensic Audit  
**Baseline Test Status:** 28/28 test suites passing (167/167 tests), 0 TypeScript compilation errors, 0 raw hex violations, 0 ESLint errors.

---

## 1. Executive Summary

VerifyLingua is designed to be a category-defining document-translation SaaS that bridges the gap between mechanical machine translation tools (which destroy document layout, tables, formatting, and typography) and slow, expensive traditional human translation agencies (ImmiTranslate, RushTranslate).

The repository currently contains a sophisticated prototype with a working layout-preserving translation engine across PDF, DOCX, PNG, and JPG, support for RTL languages (Arabic), an extensive marketing surface, and partial client and admin dashboards. However, forensic analysis reveals critical architectural divides, dual database paradigms, missing route namespaces required for enterprise client/admin separation, and security gaps in middleware authorization.

This audit provides the definitive technical baseline before executing non-destructive enhancements.

---

## 2. Forensic Analysis by Subsystem

### 2.1 Framework, Runtime & Entry Points
- **Next.js Version:** 15.2.0 (App Router), React 19.0.0, TypeScript 5.7.3.
- **Node Runtime:** Node.js 22 LTS (`.node-version: 22`).
- **CSS Architecture:** Tailwind CSS v4 (`@tailwindcss/postcss` 4.0.9) with custom CSS custom properties defined in `app/globals.css`. Design token discipline is verified via `scripts/check-raw-hex.js` (0 raw hex violations).
- **Application Entry Points:**
  - `app/layout.tsx`: Root HTML shell with font definitions (Inter, JetBrains Mono), meta tags, and accessibility hooks.
  - `app/page.tsx`: Marketing landing page featuring interactive document transformation visualizer, certified sample showcase, and comparison tables.
  - `middleware.ts`: Edge routing middleware guarding session routes.

### 2.2 Routing Structure & Surface Separation
Forensic analysis reveals a misalignment between the legacy prototype routes and the production architecture requirements:
1. **Client Routes:** Currently live primarily in `/dashboard`, `/dashboard/orders/[id]`, `/dashboard/documents`, `/dashboard/billing`, `/dashboard/settings`, and `/translate`.
   - **Gaps:** The required enterprise client workspace routes (`/app`, `/app/new-translation`, `/app/projects`, `/app/projects/:id`, `/app/projects/:id/revisions`, `/app/files`, `/app/usage`, `/app/billing`, `/app/settings`, `/app/support`) are not yet provisioned.
2. **Admin Routes:** Currently located in `/admin/*` (`clients`, `finance`, `orders`, `qa`, `queue`, `quotes`, `reports`, `settings`, `shipping`, `support`, `translators`).
   - **Gaps:** Admin paths need normalization to standard administrative resources: `/admin/jobs`, `/admin/jobs/:id`, `/admin/users`, `/admin/organizations`, `/admin/reviews`, `/admin/languages`, `/admin/glossaries`, `/admin/billing`, `/admin/system-health`, `/admin/audit-log`, and `/admin/settings`.
3. **Route Separation:** Client and Admin consoles currently share some store utilities in `lib/dashboard/store.ts`. There is no strict layout isolation preventing an admin component from appearing in the client tree or vice versa.

### 2.3 Authentication & Authorization Security
- **Authentication Mechanisms:**
  - `lib/auth/session.ts`: Session management using cryptographically secure tokens (`vl_session` cookie), scrypt password hashing with 16-byte random salts, and constant-time verification.
  - Dual store: Stores active sessions in PostgreSQL via Prisma with an in-memory resilient fallback (`lib/auth/dev-store.ts`) for offline or test execution.
  - External auth dependencies: `clerk/nextjs` and `next-auth` are present in `package.json` but `session.ts` and custom routes provide primary auth.
- **CRITICAL SECURITY VULNERABILITY IDENTIFIED:**
  - In `middleware.ts`, `PROTECTED_ROUTES` only guards `["/dashboard", "/settings", "/history", "/counsel"]`.
  - **The entire `/admin` route namespace is unprotected in Edge middleware.** Any unauthenticated visitor can enter `/admin` URLs without an active session or admin role validation.
  - `/app` routes are not yet registered in middleware protection.
  - There is no server-side role check (Super Admin, Operations Manager, Translator, Customer Support, Billing Manager, Read-Only Analyst) enforced at the middleware barrier.

### 2.4 Database Schema & Persistence Divergence (Split Brain)
A primary architectural defect discovered is the **dual database schema divergence**:
1. **Prisma Schema (`prisma/schema.prisma`):**
   - 19 comprehensive models: `User`, `Account`, `Session`, `VerificationToken`, `Order`, `Document`, `TriageFinding`, `GlossaryTerm`, `AddOn`, `Translator`, `Assignment`, `OrderEvent`, `Message`, `Certificate`, `Matter`, `Organization`, `TranslationJob`, `TranslationSegment`, `TranslationVersion`, `ProviderJob`, `QAResult`, `QAIssue`, `Glossary`, `UsageEvent`, `Subscription`, `AuditEvent`.
   - Used by: `app/api/auth/*`, `app/api/order/*`, `app/api/counsel/*`, `app/api/glossaries/*`, `app/api/verify/*`.
2. **Drizzle ORM Schema (`lib/db/schema.ts`):**
   - 5 models: `users`, `documents`, `translation_jobs`, `job_status_events`, `retention_settings`.
   - Accompanied by an in-memory tenant-isolation repository in `lib/db/data-isolation.ts`.
   - Tested by: `test/phase1-data-isolation.test.ts`.
3. **In-Memory Stores:**
   - `lib/dashboard/store.ts`: In-memory orders, quotes, revisions, translators, and system settings.
   - `lib/translation/persistent-store.ts`: In-memory translation job queue and progress tracker.
- **Risk Assessment:** High. Without a unified adapter layer, updates to a job in one system are invisible to another. The application must bridge these data access layers so that both relational queries and isolated multi-tenant operations remain synchronized.

### 2.5 File Storage Configuration
- **Cloudflare R2 Storage (`lib/storage/index.ts`):**
  - Uses `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` configured via `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.
  - Deterministic object key generation: `${userId}/${documentId}/${filename}`.
  - Resilience: Automatic in-memory buffer fallback when R2 credentials are unset (local development and test environments).

### 2.6 Background Jobs & Queue Architecture
- **Inngest:** Configured via `lib/inngest/client.ts` and `lib/inngest/functions.ts` with HTTP trigger route in `app/api/inngest/route.ts`.
- **In-Process Pipeline:** `lib/translation/pipeline.ts` provides an asynchronous job runner with status transitions: `queued` -> `extracting` -> `translating` -> `reconstructing` -> `ready` (or `failed`).
- **Limitation:** In-process pipeline runs within the Next.js server runtime. For large documents (10+ page PDFs), execution time can exceed standard serverless timeouts (15–30s) if not processed via dedicated background workers or streaming chunking.

### 2.7 Translation, OCR & Layout Reconstruction Pipeline
- **Providers:**
  - Google Gemini (`@google/genai`): Primary context-aware document translation.
  - DeepL API: Automatic rate-limit failover on HTTP 429 errors.
  - Tesseract.js: Scanned document and image OCR utilizing `eng.traineddata`.
- **Format Engines:**
  - **DOCX (`lib/translation/docx.ts`):** OpenXML parsing via `jszip`. Extracts `<w:t>` runs, translates text, and reconstructs the ZIP archive while preserving runs, styles, tables (`<w:tbl>`), headers, and footers.
  - **PDF (`lib/translation/pdf.ts`):** Evaluates text layer with `pdf-lib`. Reconstructs pages with localized background inpainting and font scaling.
  - **Images (`lib/translation/image.ts`):** Uses `jimp` for bounding-box masking and bitmap font rendering with dimension preservation.
- **Anti-Pattern Guard:** Banned overlay pattern is eliminated; text is reconstructed or masked cleanly.
- **Quality Gate:** Verifies output byte size, document structure, checksum, and layout preservation score before releasing download tokens.

### 2.8 Billing & Usage Implementation
- **Stripe Integration:** Installed (`stripe`, `@stripe/stripe-js`), webhook handler in `app/api/webhooks/stripe/route.ts`.
- **Pricing Engine:** `lib/pricing.ts` supports standard ($19.95/page) and certified ($24.95/page) pricing with add-ons (notarization, apostille, physical shipping).
- **Waitlist Affordance:** `/api/waitlist` captures enterprise waitlist intents.

### 2.9 Error Logging & Observability
- Structured console error logging across all pipeline stages.
- Sentry and PostHog environment keys defined in `.env.example`.
- Comprehensive audit event models in `prisma/schema.prisma` and `lib/db/schema.ts`.

---

## 3. Forensic Status Breakdown

| Subsystem | Status | Detailed Assessment |
|---|---|---|
| Core Translation Engine | **WORKING** | DOCX, PDF, PNG, JPG layout-preserving engines pass 14/14 tests. Gemini + DeepL fallback functional. |
| Test Suite | **WORKING** | 28/28 test suites (167/167 tests) passing with 100% green status. |
| Type & Lint Hygiene | **WORKING** | `npx tsc --noEmit` clean (0 errors), `npm run lint` clean (0 errors), `check:hex` clean. |
| Multi-tenant Data Isolation | **WORKING** | Isolated R2 keys and query-level tenant filters verified in `test/phase1-data-isolation.test.ts`. |
| Public Marketing Site | **WORKING** | Complete landing page, comparison tables, visualizer, guides, and use cases. |
| Edge Route Protection | **PARTIALLY WORKING** | Middleware guards `/dashboard` and `/counsel`, but leaves `/admin` wide open to unauthenticated traffic. |
| Client Application Routes | **PARTIALLY WORKING** | Functional dashboard at `/dashboard`, but missing canonical `/app/*` enterprise routes specified in product requirements. |
| Admin Console Routes | **PARTIALLY WORKING** | Functional views under `/admin/*`, but lacks role enforcement, `/admin/jobs`, `/admin/system-health`, and `/admin/audit-log`. |
| Database Architecture | **PARTIALLY WORKING** | Dual-schema (Prisma + Drizzle + In-Memory) operates in parallel without unified abstraction. |
| Human Review Workflow | **PARTIALLY WORKING** | Translator workbench exists (`/translator/workbench/[id]`), but lacks formal revision request lifecycle and multi-stage human QA handoff. |
| Asynchronous State Machine | **PARTIALLY WORKING** | Statuses exist (`queued`, `extracting`, `translating`, `reconstructing`, `ready`, `failed`), but need complete alignment with enterprise states. |
| Stripe Checkout | **PARTIALLY WORKING** | Webhooks and price models exist, but full live end-to-end subscription metering requires client dashboard linking. |
| Admin Role Authorization | **BROKEN / MISSING** | Zero server-side role check on `/admin` paths in middleware. Any user can navigate to admin screens. |
| Certified vs Machine Disclaimer | **PARTIALLY WORKING** | Clear terminology needed to distinguish certified legal translation from automated self-service translation across all UI touchpoints. |

---

## 4. What Is Falsely Represented as Complete

1. **"Complete Admin RBAC":** The previous status claimed complete admin and client architecture. In reality, `middleware.ts` had no checks for `/admin` routes, meaning role authorization (Super Admin, Ops Manager, Linguist, Support) was purely decorative and un-enforced at the route boundary.
2. **"Complete Enterprise Client Suite":** While `/dashboard` had order lists and triage tables, the requested `/app/*` enterprise paths (`/app`, `/app/new-translation`, `/app/projects`, `/app/files`, `/app/usage`, etc.) did not exist as discrete, accessible App Router pages.
3. **"Single Source of Truth Database":** The repository maintains two distinct schemas (Prisma and Drizzle) along with multiple in-memory state caches (`lib/dashboard/store.ts`, `lib/translation/persistent-store.ts`, `lib/auth/dev-store.ts`). Calling this a single unified database is inaccurate.

---

## 5. High-Risk Changes & Guardrails

1. **Modifying `middleware.ts`:**
   - *Risk:* Overly aggressive path matching can break public marketing pages, static assets, or public verification links (`/verify/[code]`).
   - *Guardrail:* Exact matcher configuration with regression tests in `test/edge-routes.test.ts` and `test/auth.test.ts`.
2. **Adding `/app` and Updating `/admin` Routes:**
   - *Risk:* Breaking existing `/dashboard` and `/admin/orders` URLs referenced by existing automated tests.
   - *Guardrail:* Non-destructive addition of `/app/*` and `/admin/*` routes while preserving `/dashboard` as a backward-compatible proxy/redirect.
3. **Database Schema Harmonization:**
   - *Risk:* Prisma migrations conflicting with Drizzle schema or breaking database seeds.
   - *Guardrail:* Maintain Prisma as the authoritative schema for relational operations and provide bidirectional adapter bridges for Drizzle and in-memory caches.

---

## 6. Smallest Safe Implementation Sequence

1. **Step 1: Foundational Documentation:** Complete all 6 mandatory architectural specifications in `/docs/`.
2. **Step 2: Edge Route & Role Guard Security:** Harden `middleware.ts` to enforce authentication on `/app/*` and strict role-based authorization on `/admin/*` (blocking unauthenticated and non-admin users).
3. **Step 3: Canonical Client Experience (`/app/*`):** Implement the missing client application routes:
   - `/app` (Executive Workspace & Hub)
   - `/app/new-translation` (Progressive 6-stage intake flow)
   - `/app/projects` & `/app/projects/[id]` (Lifecycle project tracking)
   - `/app/projects/[id]/revisions` (Audit-trailed revision request center)
   - `/app/files` (Secure document vault & preview)
   - `/app/usage` (Quota & telemetry meter)
   - `/app/billing` (Subscription & invoice management)
   - `/app/settings` (Tenant preferences & retention policies)
   - `/app/support` (Dedicated enterprise support portal)
4. **Step 4: Canonical Admin Operations (`/admin/*`):** Implement the missing admin console surfaces:
   - `/admin/jobs` & `/admin/jobs/[id]` (Queue telemetry & reprocess controls)
   - `/admin/users` (Account lifecycle & role management)
   - `/admin/organizations` (Multi-tenant organization oversight)
   - `/admin/reviews` (Linguist QA & human verification queue)
   - `/admin/languages` (Language pair & model routing manager)
   - `/admin/glossaries` (Enterprise terminology & locked terms)
   - `/admin/billing` (Financial analytics & invoice administration)
   - `/admin/system-health` (Provider uptime, latency & circuit breakers)
   - `/admin/audit-log` (Immutable security audit stream)
5. **Step 5: Pipeline & Quality Gate Hardening:** Expand automated pipeline checks with comprehensive document-quality scoring (overflow detection, table deformation, OCR confidence, human-review triggers).
6. **Step 6: Comprehensive Verification & E2E Testing:** Execute full automated test suites, verify all routes, confirm zero regressions, and deliver milestone reporting.
