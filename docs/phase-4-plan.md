# Phase 4 Implementation Plan: Frictionless Order Funnel & Sticky Price Rail

## Objectives
1. Build the persistent Sticky Price Rail / Bar (`components/order/StickyPriceBar.tsx`):
   - Shows running total, effective page count, word count, and deterministic delivery datetime.
   - Persistent bottom bar on mobile (`z-40`), right-rail sticky sidebar on desktop.
   - Recalculates live on every service toggle or add-on change.
2. Implement **Step 1: `/order/triage`** (`[feature 2.2, 2.4]`):
   - File upload dropzone & camera scan capture.
   - Real-time OCR & vision triage analysis simulator/service:
     - Detects: Low resolution, cropped edges/seals, illegible handwriting, missing pages, glare.
     - Categorizes severity: `WARN` (shows fixable warning with re-shoot tip) vs `BLOCK` (blocks proceeding until resolved).
     - Page & word count calculation.
3. Implement **Step 2: `/order/precheck`** (`[feature 2.1]`):
   - Acceptance Pre-Check Wizard: "Who is receiving this document?"
   - Options: USCIS, University / WES, State DMV, State/Federal Court, Foreign Consulate, Employer.
   - Plain-language compliance spec sheet generated for user.
   - Pre-configures required add-ons automatically based on agency.
4. Implement **Step 3: `/order/configure`** (`[feature 2.3]`):
   - Language selector (Source -> Target).
   - **Name & Date Consistency Lock**: Inputs for exact passport full name and preferred date format (`MM/DD/YYYY` vs `DD/MM/YYYY`).
   - Add-on toggle rows (Notarization, Expedited 12h, Hard Copy, Apostille).
5. Implement **Step 4: `/order/checkout`**:
   - Guest checkout first (no account creation required upfront).
   - Stripe integration / test card simulation with full validation.
   - Order creation in database with initial `PAID` / `TRIAGED` state and timestamped `OrderEvent`.
6. Implement **Step 5: `/order/[id]`** (`[feature 2.5]`):
   - Live Order Tracker with timestamped event steps: `Received → Triaged → Assigned → Translating → QA → Certified → Delivered`.
   - Assigned translator info: name (e.g. Maria R.), language pair, ATA accreditation.
   - In-thread messaging component between customer and translator.
   - Download links for signed certificate and public verification QR code.
7. Backend API Routes:
   - `/api/order/create` (creates order + documents + events + glossary)
   - `/api/order/triage` (processes OCR + triage findings)
   - `/api/stripe/checkout` & `/api/stripe/webhook`
8. Verification & Acceptance:
   - Automated end-to-end integration test (`test/funnel.test.ts`).
   - 0 raw hex violations.
