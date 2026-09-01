# VerifyLingua — Production Certified Translation Platform

> **100% USCIS-Guaranteed Certified Document Translation Platform.**
> Human-verified translations for immigration, courts, and universities with pre-payment document quality triage, passport name consistency locking, deterministic turnaround quotes, live translator tracking, and public QR verification.

---

## 🏛 The Six Differentiation Moats

1. **Acceptance Pre-Check Wizard (`/order/precheck`)**: Automatically configures certified vs. notarized vs. apostille requirements based on receiving institution rules (USCIS, university WES, DMV, courts).
2. **Pre-Payment Document Quality Triage (`/order/triage`)**: Computer vision detects low resolution, cropped edges, glare, and missing pages *before* payment to eliminate post-payment refunds and RFE rejections.
3. **Passport Name & Date Consistency Lock (`/order/configure`)**: Hard-locks applicant passport spellings into the translator workspace; automated QA validator blocks issuance on transliteration mismatch.
4. **Instant Deterministic Turnaround Quote**: Real-time datetime promise ("Tue, Sep 2, 9:00 AM EST") calculating page count, language pairs, and physical notarization batch timing.
5. **Live Order Tracker + Named Translator (`/order/[id]`)**: 7-stage timestamped event timeline (`DRAFT` → `TRIAGED` → `PAID` → `ASSIGNED` → `TRANSLATING` → `QA` → `CERTIFIED` → `DELIVERED`), named ATA translator profile, and direct in-thread messaging.
6. **Public QR Verification Portal (`/verify/[code]`)**: Every issued certificate embeds a QR code and short code where receiving officers verify cryptographic SHA-256 document hash, translator credentials, and validity status without login.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15.2 (App Router) + TypeScript Strict Mode
- **Styling**: Tailwind CSS v4 + Design System Tokens (`app/globals.css`)
- **UI Primitives**: shadcn/ui (Radix UI)
- **Database / ORM**: PostgreSQL + Prisma ORM (11 Models)
- **Auth & Onboarding**: Guest Checkout First + Auth.js v5 + 3-Step Skippable Onboarding
- **AI & Vision Pipeline**: Google Gemini Vision (`gemini-2.5-flash` for OCR/triage), Nano Banana Pro (`gemini-3-pro-image` asset pipeline)
- **PDF & Cryptography**: `pdf-lib` + `qrcode` + SHA-256 Certificate Generator
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Design Tokens Verification**: `scripts/check-raw-hex.js` (Zero raw hex rule)

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```
Fill in the environment variables (Stripe, Google Gemini API, PostgreSQL `DATABASE_URL`, and AWS S3 keys).

### 3. Initialize & Seed Database
```bash
pnpm db:generate
pnpm db:seed
```

### 4. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Application Routes

### Marketing & Pillars
- `/` — Homepage with interactive drag-and-drop dropzone & live camera scan
- `/pricing` — $24.95/page flat rate, add-on breakdown, live competitor pricing comparison
- `/how-it-works` — 4-stage process with Nano Banana Pro visuals
- `/documents` & `/documents/[slug]` — 25+ programmatic document landing pages with JSON-LD
- `/languages` & `/languages/[slug]` — 70+ language landing pages with RTL support
- `/use-cases` & `/use-cases/[slug]` — Institutional filing guides (USCIS, WES, DMV, Courts)
- `/guides` & `/guides/[slug]` — Authority knowledge hub on USCIS 8 CFR 103.2(b)(3) compliance
- `/help` — Interactive FAQ accordion & live support channels
- `/dev/tokens` — Live design system token catalog with light/dark contrast matrix

### Order Funnel
- `/order/triage` — Pre-payment OCR, page count calculation, and image quality check
- `/order/precheck` — "Who receives this document?" acceptance wizard
- `/order/configure` — Language pair selector, passport name lock, add-on toggle rows
- `/order/checkout` — Guest checkout with Stripe payment integration
- `/order/[id]` — Live 7-stage order tracker, ATA translator bio, and in-thread messaging

### Public Verification Portal
- `/verify` — Search portal to verify any certificate code
- `/verify/[code]` — Public certificate verification record with SHA-256 document hash verification

### Customer Dashboard
- `/onboarding` — 3-step post-purchase profile setup (skippable)
- `/dashboard` — Order history, live status chips, and certificate downloads
- `/dashboard/documents` — AES-256 encrypted document vault with 90-day retention countdown
- `/dashboard/settings` — Notification preferences and data purge controls

### Admin & Translator Cockpit
- `/admin/queue` — Order queue with turnaround timers and claim actions
- `/admin/orders/[id]` — Side-by-side workspace, locked glossary validator, and USCIS QA Checklist

---

## 🧪 Testing & Verification

Run the test suite:
```bash
pnpm test
```

Verify design system tokens (zero raw hex in `.tsx`):
```bash
npm run check:hex
```

Compile production build:
```bash
pnpm build
```

---

## 📄 License & Compliance

Complies with USCIS federal regulations under **8 CFR 103.2(b)(3)** and American Translators Association (ATA) certification standards.
