# Phase 7 Implementation Plan: Admin & Translator Workspace with Rejection QA Checklist

## Objectives
1. Implement **Admin / Translator Queue** (`app/admin/queue/page.tsx`):
   - Real-time order queue filtering by status (`UNASSIGNED`, `TRANSLATING`, `QA_READY`, `CERTIFIED`).
   - Turnaround countdown indicator with warning for approaching deadlines.
   - Quick actions to claim, assign, or review translation drafts.
2. Implement **Side-by-Side Translation Studio** (`app/admin/orders/[id]/page.tsx`):
   - **Split Workspace Layout**:
     - Left pane (50%): High-resolution source document viewer with zoom & pan controls.
     - Right pane (50%): Dual-view translation editor (Document Header, Body Text, Official Seals & Stamps Translation, Notarization Jurat).
   - **Locked Glossary Terms Panel** (Feature 2.3):
     - Displays applicant passport transliterations (`locked: true`).
     - Automated consistency validator: Highlights terms and dynamically blocks final QA approval if the translated draft contains spelling mismatches.
   - **USCIS Rejection Prevention QA Checklist**:
     - [ ] All official stamps, seals, and registry watermarks translated.
     - [ ] Source layout and typography mirroring verified.
     - [ ] Passport name transliterations verified with 100% character match.
     - [ ] Date format preference applied consistently.
     - [ ] Signed Certificate of Accuracy generated with 8 CFR 103.2(b)(3) competence statement.
     - [ ] Cryptographic SHA-256 hash computed and stamped.
3. Verification:
   - Vitest test suite (`test/admin.test.ts`).
   - 0 raw hex violations.
