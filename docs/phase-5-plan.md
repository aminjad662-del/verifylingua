# Phase 5 Implementation Plan: The Six Differentiation Moats & Public Verification Portal

## Objectives
1. Implement the **Public Verification Portal** (`app/verify/[code]/page.tsx` & `app/verify/page.tsx`):
   - Completely public, zero authentication required (accessible to USCIS officers, universities, courts).
   - Verifies:
     - Document SHA-256 cryptographic fingerprint.
     - Translator credentials (e.g. ATA Member No., legal competence declaration).
     - Timestamp of certification and delivery.
     - Active validity status: `VALID` / `AUTHENTIC` / `REVOKED`.
     - Direct PDF download and printable officer verification sheet.
2. Implement **Certificate of Accuracy Engine** (`lib/certificate.ts`):
   - Compliant with **8 CFR 103.2(b)(3)**.
   - Includes mandatory legal competence statement: *"I am competent to translate from [Source] to English and the above translation is true and accurate to the best of my abilities."*
   - Embedded QR code linking directly to `https://verifylingua.com/verify/[code]`.
   - Embeds translator digital seal, certificate hash, and page count.
3. Write `docs/DIFFERENTIATION.md`:
   - Detailed documentation of all 6 moats and their exact file locations:
     1. Acceptance Pre-Check Wizard (`app/order/precheck/page.tsx`)
     2. Pre-Payment Document Triage (`app/order/triage/page.tsx`)
     3. Passport Name & Date Consistency Lock (`app/order/configure/page.tsx` & `prisma/schema.prisma`)
     4. Instant Deterministic Quote (`lib/pricing.ts`)
     5. Live Order Tracker + Named Translator (`app/order/[id]/page.tsx`)
     6. Public Verification Portal (`app/verify/[code]/page.tsx` & `lib/certificate.ts`)
4. Verification & Testing:
   - Vitest test suite for Certificate & Hash verification (`test/verify.test.ts`).
   - 0 raw hex violations.
