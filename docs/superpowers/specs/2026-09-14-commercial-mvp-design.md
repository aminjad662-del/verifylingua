# VerifyLingua Commercial MVP Specification

**Document Version**: 1.0.0  
**Date**: 2026-09-14  
**Target Architecture**: Cloudflare Pages / Edge Workers, Neon Serverless PostgreSQL, Cloudflare R2, Stripe  
**Target Audience**: Freelance translators, Translation companies/agencies, Students  
**Core Problem**: Translate DOCX and PDF files with near-zero formatting drift, providing fast, secure downloads.

---

## 1. Commercial Goals & Pilot Boundaries

### 1.1 Commercial Objectives
- **Initial Target**: Acquire the first 100 paying customers and process 5,000 successfully translated documents.
- **Sustainable Economics**: Prioritize gross margin and AI API cost control over unmetered vanity metrics.
- **Resource Constraints**: 1 Full-Stack developer, no dedicated QA or DevOps team, lightweight autonomous testing.

### 1.2 Pilot Cohort Composition (10 Users)
- **4 Freelance Translators**: Daily document processing, high attention to font/layout fidelity.
- **3 Translation Agencies**: Multi-document batches, repetitive client filings, budget sensitivity.
- **3 Students**: Academic diplomas, transcripts, price-sensitive occasional usage.

---

## 2. Hybrid Billing Architecture & Pricing Plans

Configured deterministically in `lib/pricing.ts`.

### 2.1 Pricing Plans
1. **Free Welcome Trial**:
   - **5 page credits** granted automatically upon verified account registration.
   - Allows pilot participants to run real DOCX/PDF tests before entering payment credentials.
2. **Small Credit Pack (Occasional Users / Students)**:
   - **$9.99** for **25 page credits** (~$0.40/page).
   - One-time payment via Stripe Checkout (`mode: "payment"`).
   - Credits never expire; no recurring charges.
3. **Large Credit Pack (Frequent Freelancers)**:
   - **$29.99** for **100 page credits** (~$0.30/page).
   - One-time payment via Stripe Checkout (`mode: "payment"`).
   - Credits never expire.
4. **Agency Monthly Plan (High-Volume Agencies)**:
   - **$119.00 / month** for **500 page credits / month** (~$0.24/page).
   - Recurring subscription via Stripe Checkout (`mode: "subscription"`).
   - **Hard Monthly Cap**: When 500 pages are used in a billing cycle, processing stops. The customer must purchase top-up packs or wait for the monthly renewal. No automatic overages.

### 2.2 Operational Limits & Safeguards
- **Per-Job Ceiling**: Maximum 100 pages per single document upload.
- **Zero Metered / Overage Billing**: No post-hoc billing or unexpected credit card charges.
- **Zero Charge on Failure**: Reserved credits are automatically refunded to available balance if a job fails.

---

## 3. Database Schema & Credit Ledger Engine

### 3.1 Prisma Schema (`prisma/schema.prisma`)

```prisma
enum CreditTransactionType {
  WELCOME_BONUS
  PACK_PURCHASE
  SUBSCRIPTION_GRANT
  JOB_RESERVED
  JOB_DEDUCTED
  JOB_RELEASED
  ADMIN_ADJUSTMENT
}

model User {
  // Existing fields...
  creditsAvailable  Int @default(0)
  creditsReserved   Int @default(0)
  lifetimePagesUsed Int @default(0)

  creditTransactions CreditTransaction[]
  pilotFeedback      PilotFeedback[]
}

model CreditTransaction {
  id              String                @id @default(cuid())
  userId          String
  amount          Int
  balanceAfter    Int
  type            CreditTransactionType
  description     String
  jobId           String?
  stripePaymentId String?
  createdAt       DateTime              @default(now())

  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  job             TranslationJob?       @relation(fields: [jobId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([jobId])
  @@unique([stripePaymentId, type])
}

model PilotFeedback {
  id               String   @id @default(cuid())
  userId           String?
  jobId            String
  userRole         String?
  rating           Int
  issueTag         String?
  valueVerdict     String?
  comment          String?
  pageCount        Int
  sourceFormat     String
  sourceLang       String
  targetLang       String
  processingTimeMs Int
  retryAttempts    Int
  providerUsed     String
  createdAt        DateTime @default(now())

  job              TranslationJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  user             User?          @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([jobId])
  @@index([rating])
}
```

### 3.2 Credit Transaction Lifecycle (`lib/services/credit-service.ts`)
- `grantWelcomeBonus(userId: string)`: Adds 5 credits to `creditsAvailable`, writes `WELCOME_BONUS` transaction.
- `reserveCreditsForJob(userId: string, jobId: string, pages: number)`:
  - Validates `user.creditsAvailable >= pages`.
  - Atomically moves `pages` from `creditsAvailable` to `creditsReserved`.
  - Records `JOB_RESERVED` transaction.
- `settleCreditsOnSuccess(userId: string, jobId: string, pages: number)`:
  - Decrements `creditsReserved` by `pages`, increments `lifetimePagesUsed`.
  - Records `JOB_DEDUCTED` transaction.
- `releaseCreditsOnFailure(userId: string, jobId: string, pages: number, reason: string)`:
  - Restores `pages` from `creditsReserved` back to `creditsAvailable`.
  - Records `JOB_RELEASED` transaction.

---

## 4. Language Scope & Preflight Guardrails

### 4.1 Enforced Language Scope
- **Core 4 LTR Matrix**: English (`en`), Spanish (`es`), French (`fr`), German (`de`).
- 6 bi-directional combinations: `en-es`, `en-fr`, `en-de`, `es-fr`, `es-de`, `fr-de`.
- UI selectors restrict choices to these four languages.

### 4.2 Preflight Rejection & Waitlist
- `/api/translate/preflight` checks:
  1. `pageCount <= 100`
  2. `sourceLang` and `targetLang` in `['en', 'es', 'fr', 'de']`
  3. Text script inspection: checks if non-Latin characters exceed 10% of total characters.
- If unsupported language is detected or selected:
  - Rejects translation with HTTP 422 `UNSUPPORTED_LANGUAGE`.
  - Returns `waitlistAffordance: true`.
  - UI offers 1-click waitlist signup: *"Join early access for v1.1 RTL & Asian script translation"*.

---

## 5. Stripe Checkout & Idempotent Webhook Processing

### 5.1 Endpoints
- `POST /api/billing/checkout`:
  - Body: `{ planId: "pack_small_25" | "pack_large_100" | "agency_monthly_500" }`.
  - Creates Stripe Checkout Session with `metadata: { userId, planId, pagesGranted }`.
- `POST /api/webhooks/stripe`:
  - Validates signature with `STRIPE_WEBHOOK_SECRET`.
  - Handles `checkout.session.completed` (one-time packs) and `invoice.payment_succeeded` (subscription renewals).
  - Checks `CreditTransaction` for existing `stripePaymentId` to guarantee idempotency.
  - Grants credits in a single atomic database transaction.

---

## 6. Pilot Feedback & Quality Telemetry

### 6.1 Post-Download Micro-Feedback Modal
- Triggers immediately after client clicks the temporary presigned download button.
- Captures:
  - 1-to-5 star formatting rating.
  - Visual issue tags (`NONE`, `LAYOUT_SHIFT`, `FONT_SIZE`, `TABLE_MISALIGNED`, `OTHER`).
  - Value assessment (`GREAT_VALUE`, `FAIR`, `TOO_EXPENSIVE`).
  - Optional feedback text.
- POST `/api/feedback` stores record in `PilotFeedback`, automatically enriched with job processing telemetry.

### 6.2 Pilot KPIs Dashboard Query
Calculates:
1. **Task completion rate** (Target $\ge 90\%$)
2. **Average processing time per page**
3. **Average formatting score** (Target $\ge 4.5/5$)
4. **Retry and provider failover rate**
5. **Willingness to pay ratio**
6. **Common confusion feedback points**

---

## 7. Automated Testing & Verification Plan

1. **`test/credits-ledger.test.ts`**:
   - Welcome credits allotment
   - Atomic reservation, deduction, and automatic failure refund
   - Insufficient balance rejection
   - Concurrent reservation race prevention
2. **`test/language-guardrails.test.ts`**:
   - 6 bi-directional Core 4 LTR language pairs
   - Arabic, Hebrew, CJK rejection with waitlist trigger
3. **`test/stripe-commercial.test.ts`**:
   - Small pack, large pack, and agency checkout sessions
   - Webhook credit fulfillment
   - Duplicate webhook replay idempotency check
4. **`test/pilot-feedback.test.ts`**:
   - Micro-feedback submission and telemetry joining
5. **`test/mvp-commercial-e2e.test.ts`**:
   - Full end-to-end user journey from registration to download and feedback.
