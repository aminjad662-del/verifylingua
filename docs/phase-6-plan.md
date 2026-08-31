# Phase 6 Implementation Plan: Post-Purchase Onboarding, Customer Dashboard & Document Vault

## Objectives
1. Implement **Post-Purchase Onboarding** (`app/onboarding/page.tsx` §5.3):
   - Progress-visible, 3-step skippable flow:
     - Step 1: Set your passport name spellings (Primary applicant & family members).
     - Step 2: Set notifications (Email / SMS / WhatsApp).
     - Step 3: Secure Document Vault opt-in (save encrypted documents for future re-use).
   - "Skip to Order Tracker" button (order tracking is never gated).
2. Implement **Customer Dashboard Hub** (`app/dashboard/page.tsx` §5.4):
   - Active and completed orders table.
   - Status badge system using status tokens (`PAID`, `ASSIGNED`, `TRANSLATING`, `QA`, `CERTIFIED`, `DELIVERED`).
   - Quick action: "Start translation", link to public verification, download signed certificates.
3. Implement **Customer Document Vault** (`app/dashboard/documents/page.tsx`):
   - Displays stored encrypted documents, MIME type, upload timestamp, SHA-256 fingerprint, and 90-day retention countdown.
   - One-click "Translate this document" action.
4. Implement **Account Settings** (`app/dashboard/settings/page.tsx`):
   - Contact details, notification toggles, saved passport glossary terms, and privacy / auto-purge configuration (§11).
5. Implement **Dashboard Navigation Shell** (`components/layout/DashboardNav.tsx`):
   - High-density workspace header with user profile menu, active orders indicator, and dark mode toggle.
6. Verification:
   - Vitest test suite (`test/dashboard.test.ts`).
   - 0 raw hex violations.
