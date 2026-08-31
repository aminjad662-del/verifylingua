# VerifyLingua - Build State & Phase Progress

## Project Overview
- **Product Name**: VerifyLingua
- **Architecture**: Next.js 15 (App Router), TypeScript Strict, Tailwind CSS v4, shadcn/ui, PostgreSQL + Prisma, Auth.js v5, Stripe, Google Gemini Vision (OCR/Triage), Nano Banana Pro (`gemini-3-pro-image`), pdf-lib, Resend, next-intl.

---

## Phase Status Summary

| Phase | Description | Status | Evidence / Notes |
|---|---|---|---|
| **Phase 0** | Repo Setup, Design Tokens, Prisma Schema, CI, UILO Hard Gate 1 | **COMPLETE** | `next build` passed, `prisma generate` clean, vitest 5/5 passing, check:hex 0 errors, git committed (`60f9517`). Hard Gate 1 documented: UILO not found; proceeding with shadcn/ui + screenshot-led contract. |
| **Phase 1** | Design System Tokens Page (`/dev/tokens`) | **COMPLETE** | Live token catalog, dark mode toggle, contrast matrix, button/form/switch/toggle-row matrix, git committed (`8a94a2e`). |
| **Phase 2** | Marketing Shell & Homepage (Screenshot-Led) | **COMPLETE** | 10 static marketing routes compiled (`/`, `/pricing`, `/how-it-works`, `/documents`, `/languages`, `/help`, `/dev/tokens`), git committed (`05fe114`). |
| **Phase 3** | Nano Banana Pro Asset Pipeline (Hard Gate 2: 5 assets) | **COMPLETE** | Manifest created, generator implemented, generated Hero + 4 step icons + doc spot illustrations, committed (`1ae6a45`). |
| **Phase 4** | Order Funnel & Sticky Price Bar (Hard Gate 3: Funnel test) | **IN PROGRESS** | Implementing `/order/triage`, `/order/precheck`, `/order/configure`, `/order/checkout`, `/order/[id]`, sticky price rail, and Stripe webhook handler. |
| **Phase 5** | The Six Differentiators & Public Verification Portal | PENDING | - |
| **Phase 6** | Auth, Onboarding, Customer Dashboard & Vault | PENDING | - |
| **Phase 7** | Admin & Translator Cockpit with Rejection QA Checklist | PENDING | - |
| **Phase 8** | Pillar Pages & Programmatic SEO (~110 pages) | PENDING | - |
| **Phase 9** | i18n / RTL, a11y & Security Hardening, Deployment Config | PENDING | - |

---

## Hard Gate Records

### Hard Gate 1: UILO Skill Availability Check
- **Status**: RESOLVED
- **Outcome**: UILO checked and not found. Proceeded with shadcn/ui and design token specification.

### Hard Gate 2: Nano Banana Pro Initial 5 Assets Review
- **Status**: RESOLVED
- **Outcome**: Hero illustration (16:9) + 4 step icons (1:1) generated and integrated into `HowItWorks.tsx`.

### Hard Gate 3: Working Order Funnel Walkthrough
- **Status**: IN PROGRESS
- **Requirement**: Stop after Phase 4 and give a 10-line summary + local URL to walk the funnel.
