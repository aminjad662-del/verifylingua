# VerifyLingua Engineering Progress Log

## Autonomous UI/UX Rebuild: VerifyLingua Client Dashboard (Phase 6 Rebuild)

### 1. Architectural & Visual Overview
- **Visual Identity (The Notarial Palette):**
  - App Canvas Background: `--sand` (`#FAF7F2`) for warm, archival paper materiality.
  - Primary Typography: `--ink` (`#0A2540`) for primary text and headings.
  - Editorial Dashboard H1: Fraunces & Instrument Serif typography (`font-serif`) for institutional authority.
  - Singular Primary CTA: `--cta` (`#B45309` Amber) with `--cta-hover` (`#92400E`) — strictly the only color for "Start New Translation".
  - Trust Elements: `--trust` (`#0F7B4F` Green) and `--trust-bg` (`#E7F6EE`) strictly reserved for "Certified" and "USCIS Accepted" credentials.
  - Motion Engineering: Framer Motion (`motion/react`) for smooth layout shifts, dropdown reveals, and status badge pulses.

### 2. Layout & Header De-duplication
- **Eliminated Redundancy:** Removed the duplicate "Start Translation" button in `components/layout/DashboardNav.tsx`. The dashboard page now features a singular, visually dominant Amber CTA.
- **High-Density Utility Bar:** Implemented below the H1, containing:
  - Real-time `SearchInput` searching across document name, accredited linguist, matter/case number, or public order code with instant clear button.
  - Responsive `StatusFilter` controls: All Orders, Action Required (with warning badge count), Translating (with active count), and Certified (with trust badge count).
  - Quick status summary and instant refresh trigger.

### 3. Action-First Metrics Row
Replaced legacy vanity metrics with actionable intelligence:
1. **Action Required Card:** Highlights orders waiting for client approval on family surname spellings or missing scans. Features subtle warning border (`border-status-warning/60 bg-status-warning-bg/30`), live pulsing badge, and one-click "Review Pending Items" filtering.
2. **Pending Delivery Card:** Displays active translations with live ETA countdown ("Due in 3h 45m • Today at 4:30 PM EST") and ATA sworn competence review stage.
3. **Total Spend & Invoices Card:** Law firm and client accounting summary showing $1,248.50 YTD across 12 certified filings, with instant action to "Download All Receipts (PDF)" via `/api/invoices/download-all`.

### 4. The Order Vault (Enhanced List UI)
Upgraded `Recent Certified Orders` into a rich data table / card hybrid:
- **Source Thumbnail:** Realistic blurred/watermarked preview of uploaded documents with slanted "CONFIDENTIAL" watermark, 8 CFR notarial shield seal, and `.PDF` badge.
- **Document Metadata:** Document title, Source/Target language, Assigned ATA linguist with member credentials, Matter/Case Number, promised ETA, and public order code.
- **Contextual Action Menu:**
  - `TRANSLATING`: Disabled "Translating..." button with live spinner and "View Live Tracker" link.
  - `ACTION_REQUIRED`: High-priority "Resolve Action" and "Review & Confirm" triggers opening the verification dialog.
  - `DELIVERED`: Primary "Download Certified PDF" button.
  - **Three-Dots Dropdown Menu:**
    - `Download Receipt/Invoice`: Calls `/api/order/[id]/receipt` streaming official itemized legal PDF receipt.
    - `Request a Revision`: Opens institutional revision modal to report spelling/date typos, submitting directly to `/api/order/[id]/revisions`.
    - `Order Hard Copy by Mail`: Opens physical shipping modal with live USPS Priority ($19.95), FedEx Overnight ($39.95), USPS First-Class ($9.95), 24K Gold Foil seal add-on, and fulfillment via `/api/shipping/fulfill`.
    - `Verify Public Ledger`: Direct link to `/verify/[code]`.

### 5. Backend & API Additions
- `lib/receipt.ts`: `generateReceiptPdf` compiling official itemized legal receipts with 8 CFR 103.2 compliance statements and ATA corporate credentials.
- `app/api/order/[id]/receipt/route.ts`: Streaming endpoint for individual order PDF receipts.
- `app/api/invoices/download-all/route.ts`: Consolidated YTD law firm tax and expense PDF report generator.
- `components/ui/dialog.tsx`: Accessible Radix dialog primitive with backdrop blur and smooth transitions.
- `components/ui/dropdown-menu.tsx`: Accessible Radix dropdown menu with origin-aware transforms.

### 6. Verification & Quality Gates
- `npm run check:hex`: PASSED (0 raw hex violations across all `.tsx` files; semantic tokens strictly maintained).
- `pnpm test`: PASSED (14 test suites, 63 tests passing, including new PDF receipt and invoice stream tests).
- `npm run build`: PASSED (124/124 static and dynamic routes compiled cleanly; Cloudflare Pages edge build successful).

### 7. Definition of Done (DoD) Checklist
- [x] Duplicate CTA in header eliminated.
- [x] Functional SearchInput and StatusFilter utility bar implemented.
- [x] Amber (`#B45309`) CTA is the most visually dominant element on screen.
- [x] Action-first 3-card metrics row active with live warning highlights and spend reporting.
- [x] Every order has clear paths to download certified deliverables, download itemized receipts, request revisions, and order physical hard copies by mail.
- [x] Institutional, warm Notarial palette applied strictly without AI clichés or generic blue gradients.
