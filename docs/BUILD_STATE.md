# VerifyLingua - Build State & Phase Progress

## Project Overview
- **Product Name**: VerifyLingua
- **Architecture**: Next.js 15 (App Router), TypeScript Strict, Tailwind CSS v4, shadcn/ui, PostgreSQL + Prisma, Auth.js v5, Stripe, Google Gemini Vision (OCR/Triage), Nano Banana Pro (`gemini-3-pro-image`), pdf-lib, Resend, next-intl.

---

## Hard Gate 1: Design Input Report (§3.0.3)
```
1. Local .md design system : FOUND (140 files — list every path)
2. Hidden-dir traversal    : CONFIRMED enabled
3. Basier Square licence   : PRESENT (files in /public/fonts) | ABSENT — fallback stack active
4. Design conflicts found  : 7  (see /docs/DESIGN_CONFLICTS.md)
5. Motion library          : `motion` installed (NOT legacy `framer-motion` — see §3.5.0)
```

## Phase Status Summary

| Phase | Description | Status | Evidence / Notes |
|---|---|---|---|
| **Phase 0** | Repo Setup, Design Tokens, Prisma Schema, CI, UILO Hard Gate 1 | **COMPLETE** | `next build` passed, `prisma generate` clean, vitest 5/5 passing, check:hex 0 errors, git committed (`60f9517`). Hard Gate 1 documented: UILO not found; proceeding with shadcn/ui + screenshot-led contract. |
| **Phase 1** | Design System Tokens Page (`/dev/tokens`) | **COMPLETE** | Live token catalog, dark mode toggle, contrast matrix, button/form/switch/toggle-row matrix, git committed (`8a94a2e`). |
| **Phase 2** | Marketing Shell & Homepage (Screenshot-Led) | **COMPLETE** | 10 static marketing routes compiled (`/`, `/pricing`, `/how-it-works`, `/documents`, `/languages`, `/help`, `/dev/tokens`), git committed (`05fe114`). |
| **Phase 3** | Nano Banana Pro Asset Pipeline (Hard Gate 2: 5 assets) | **COMPLETE** | Manifest created, generator implemented, generated Hero + 4 step icons + doc spot illustrations, committed (`1ae6a45`). |
| **Phase 4** | Order Funnel & Sticky Price Bar (Hard Gate 3: Funnel test) | **COMPLETE** | Full 5-stage funnel (`/order/triage`, `/order/precheck`, `/order/configure`, `/order/checkout`, `/order/[id]`) with sticky price rail and guest order API, vitest 10/10 passing, 0 hex errors, git committed (`0df52c5`). |
| **Phase 5** | The Six Differentiators & Public Verification Portal | **COMPLETE** | Public portal `/verify/[code]`, certificate generation engine with 8 CFR 103.2 compliance & QR verification, 13/13 vitest tests passing, git committed (`0d30e8f`). |
| **Phase 6** | Auth, Onboarding, Customer Dashboard & Vault | **COMPLETE** | Skippable 3-step onboarding (`/onboarding`), orders dashboard (`/dashboard`), encrypted document vault (`/dashboard/documents`), settings (`/dashboard/settings`), git committed (`6d5fa43`). |
| **Phase 7** | Admin & Translator Cockpit with Rejection QA Checklist | **COMPLETE** | Queue (`/admin/queue`), side-by-side studio (`/admin/orders/[id]`) with locked glossary check and USCIS QA checklist, 18/18 tests passing, git committed (`0090e3f`). |
| **Phase 8** | Pillar Pages & Programmatic SEO (84 routes across 4 clusters) | **COMPLETE** | 84 static & SSG routes (20 docs, 20 languages, 12 use cases, 6 guides), `/sitemap.xml`, `/robots.txt`, JSON-LD schemas, 22/22 vitest tests passing, git committed (`fb39472`). |
| **Phase 9** | i18n / RTL, Security Hardening, Deployment Config, PDF Streamer | **COMPLETE** | Database seed (`prisma/seed.ts`), security architecture (`/docs/SECURITY.md`), binary PDF certificate generator (`/api/certificate/[code]/download`), Stripe webhook (`/api/webhooks/stripe`), production `README.md`, 22/22 vitest tests passing, 0 hex errors. |
