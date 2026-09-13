# Commercial MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the commercial MVP foundations for VerifyLingua: credit pack & agency subscription billing, atomic credit reservation & refund state machine, Core 4 LTR language guardrails with preflight waitlist capture, and post-download pilot micro-feedback.

**Architecture:** A native PostgreSQL credit ledger (`CreditTransaction`) with atomic Prisma transactions for reservation/settlement/refund, Stripe Checkout for one-time packs and recurring agency subscriptions with idempotent webhook fulfillment, strict server-side LTR preflight validation, and lightweight in-DB pilot feedback telemetry.

**Tech Stack:** Next.js 15, Neon PostgreSQL 16 (Prisma ORM), Cloudflare Pages & Workers edge runtime, Cloudflare R2 / S3 storage, Stripe SDK, Vitest.

**Spec:** [`docs/superpowers/specs/2026-09-14-commercial-mvp-design.md`](file:///C:/Users/aminj/Downloads/SAAS%207/docs/superpowers/specs/2026-09-14-commercial-mvp-design.md)

## Global Constraints
- Neon PostgreSQL is the single source of truth for credit balances and job state.
- Zero metered billing and zero automatic overage charges.
- Credits must be reserved before translation begins and automatically refunded if the job fails.
- MVP language scope is restricted to English (`en`), Spanish (`es`), French (`fr`), and German (`de`).
- Presigned download URLs remain temporary (900s TTL) and access-protected.
- Duplicate Stripe webhooks must never double-grant credits (enforced via unique `stripePaymentId` in ledger).

---

### Task 1: Prisma Schema & Database Migration for Credit Ledger and Pilot Feedback

**Files:**
- Modify: `prisma/schema.prisma:80-140` (Add credit fields to User, add models CreditTransaction and PilotFeedback)
- Create: `prisma/migrations/20260914000000_commercial_credit_ledger/migration.sql`
- Test: `test/credits-schema.test.ts`

**Interfaces:**
- Produces:
  - `User.creditsAvailable: Int`
  - `User.creditsReserved: Int`
  - `User.lifetimePagesUsed: Int`
  - `model CreditTransaction`
  - `model PilotFeedback`

- [ ] **Step 1: Write the failing test for schema models and fields**

```typescript
// test/credits-schema.test.ts
import { describe, it, expect } from "vitest";
import { prisma } from "../lib/prisma";

describe("Credit Ledger Schema & Migration", () => {
  it("verifies User has credit balance fields and relations exist", async () => {
    const testUser = await prisma.user.create({
      data: {
        email: `schema_test_${Date.now()}@example.com`,
        creditsAvailable: 5,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });

    expect(testUser.creditsAvailable).toBe(5);
    expect(testUser.creditsReserved).toBe(0);

    const tx = await prisma.creditTransaction.create({
      data: {
        userId: testUser.id,
        amount: 5,
        balanceAfter: 5,
        type: "WELCOME_BONUS",
        description: "Welcome bonus: 5 free page credits",
      },
    });

    expect(tx.id).toBeDefined();
    expect(tx.type).toBe("WELCOME_BONUS");

    // Clean up
    await prisma.creditTransaction.delete({ where: { id: tx.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ./node_modules/vitest/vitest.mjs run test/credits-schema.test.ts`  
Expected: FAIL (fields `creditsAvailable` or model `creditTransaction` not in Prisma Client).

- [ ] **Step 3: Update `prisma/schema.prisma` and generate migration**

Add `CreditTransactionType` enum, update `User`, and add `CreditTransaction` and `PilotFeedback` models. Run `npx prisma migrate dev --name commercial_credit_ledger` or generate migration SQL and apply via `npx prisma db push` / `npx prisma generate`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node ./node_modules/vitest/vitest.mjs run test/credits-schema.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/ test/credits-schema.test.ts
git commit -m "feat(db): add credit ledger and pilot feedback schema models"
```

---

### Task 2: Transactional Credit Service (`lib/services/credit-service.ts`)

**Files:**
- Create: `lib/services/credit-service.ts`
- Test: `test/credits-ledger.test.ts`

**Interfaces:**
- Produces:
  - `grantWelcomeBonus(userId: string): Promise<number>`
  - `reserveCreditsForJob(userId: string, jobId: string, pages: number): Promise<{ success: boolean; remaining: number }>`
  - `settleCreditsOnSuccess(userId: string, jobId: string, pages: number): Promise<void>`
  - `releaseCreditsOnFailure(userId: string, jobId: string, pages: number, reason: string): Promise<void>`
  - `getUserCreditBalance(userId: string): Promise<{ available: number; reserved: number; lifetimeUsed: number }>`

- [ ] **Step 1: Write the failing unit tests for credit operations**

```typescript
// test/credits-ledger.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "../lib/prisma";
import {
  grantWelcomeBonus,
  reserveCreditsForJob,
  settleCreditsOnSuccess,
  releaseCreditsOnFailure,
  getUserCreditBalance,
} from "../lib/services/credit-service";

describe("Transactional Credit Service", () => {
  let userId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: `credit_test_${Date.now()}@example.com`,
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.creditTransaction.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it("grants 5 free welcome credits on onboarding", async () => {
    const balance = await grantWelcomeBonus(userId);
    expect(balance).toBe(5);

    const check = await getUserCreditBalance(userId);
    expect(check.available).toBe(5);
    expect(check.reserved).toBe(0);
  });

  it("reserves credits when job starts and rejects when insufficient", async () => {
    await grantWelcomeBonus(userId); // has 5 credits

    // Reserve 3 credits for a 3-page job
    const res = await reserveCreditsForJob(userId, "job_test_1", 3);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(2);

    const check1 = await getUserCreditBalance(userId);
    expect(check1.available).toBe(2);
    expect(check1.reserved).toBe(3);

    // Attempting to reserve 4 credits when only 2 remain should fail
    await expect(reserveCreditsForJob(userId, "job_test_2", 4)).rejects.toThrow("INSUFFICIENT_CREDITS");
  });

  it("settles credits on successful completion", async () => {
    await grantWelcomeBonus(userId);
    await reserveCreditsForJob(userId, "job_success_1", 3);

    await settleCreditsOnSuccess(userId, "job_success_1", 3);

    const check = await getUserCreditBalance(userId);
    expect(check.available).toBe(2);
    expect(check.reserved).toBe(0);
    expect(check.lifetimeUsed).toBe(3);
  });

  it("automatically releases and refunds credits on job failure", async () => {
    await grantWelcomeBonus(userId);
    await reserveCreditsForJob(userId, "job_fail_1", 3);

    await releaseCreditsOnFailure(userId, "job_fail_1", 3, "Upstream rate limit 429");

    const check = await getUserCreditBalance(userId);
    expect(check.available).toBe(5); // Refunded in full
    expect(check.reserved).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ./node_modules/vitest/vitest.mjs run test/credits-ledger.test.ts`  
Expected: FAIL (`Cannot find module '../lib/services/credit-service'`).

- [ ] **Step 3: Implement `lib/services/credit-service.ts`**

Use atomic `prisma.$transaction` blocks to ensure concurrency safety and exact ledger writes.

- [ ] **Step 4: Run test to verify it passes**

Run: `node ./node_modules/vitest/vitest.mjs run test/credits-ledger.test.ts`  
Expected: PASS (All 4 credit lifecycle tests pass).

- [ ] **Step 5: Commit**

```bash
git add lib/services/credit-service.ts test/credits-ledger.test.ts
git commit -m "feat(credits): implement transactional credit ledger service"
```

---

### Task 3: Core 4 LTR Matrix & Preflight Guardrails

**Files:**
- Modify: `lib/constants.ts:65-87` (Add `MVP_SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de']`)
- Modify: `lib/preflight.ts` (Add deep script and language check)
- Modify: `app/api/translate/preflight/route.ts` (Enforce LTR and return waitlist affordance)
- Test: `test/language-guardrails.test.ts`

**Interfaces:**
- Produces:
  - `validateMvpLanguagePair(sourceLang: string, targetLang: string): { valid: boolean; reason?: string }`
  - `detectNonLatinScriptRatio(text: string): number`
  - Preflight HTTP 422 response with `waitlistAffordance: true` for unsupported scripts

- [ ] **Step 1: Write the failing tests for language guardrails**

```typescript
// test/language-guardrails.test.ts
import { describe, it, expect } from "vitest";
import { validateMvpLanguagePair, detectNonLatinScriptRatio } from "../lib/preflight";

describe("Core 4 LTR Language Guardrails", () => {
  it("approves all 6 bi-directional pairs between EN, ES, FR, and DE", () => {
    const pairs = [
      ["en", "es"], ["es", "en"],
      ["en", "fr"], ["fr", "en"],
      ["en", "de"], ["de", "en"],
      ["es", "fr"], ["fr", "es"],
      ["es", "de"], ["de", "es"],
      ["fr", "de"], ["de", "fr"],
    ];

    for (const [source, target] of pairs) {
      const check = validateMvpLanguagePair(source, target);
      expect(check.valid).toBe(true);
    }
  });

  it("rejects identical source and target language", () => {
    const check = validateMvpLanguagePair("en", "en");
    expect(check.valid).toBe(false);
  });

  it("rejects unsupported RTL and Asian languages", () => {
    expect(validateMvpLanguagePair("ar", "en").valid).toBe(false);
    expect(validateMvpLanguagePair("zh", "en").valid).toBe(false);
    expect(validateMvpLanguagePair("ru", "en").valid).toBe(false);
    expect(validateMvpLanguagePair("en", "he").valid).toBe(false);
  });

  it("detects non-Latin scripts in document text sample", () => {
    const latinText = "This is a standard employment contract in English.";
    expect(detectNonLatinScriptRatio(latinText)).toBe(0);

    const arabicSample = "هذا عقد عمل رسمي تم توقيعه في القاهرة";
    expect(detectNonLatinScriptRatio(arabicSample)).toBeGreaterThan(0.8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ./node_modules/vitest/vitest.mjs run test/language-guardrails.test.ts`  
Expected: FAIL (`validateMvpLanguagePair is not a function`).

- [ ] **Step 3: Implement language validation and script detection in `lib/preflight.ts` and `app/api/translate/preflight/route.ts`**

Define `MVP_SUPPORTED_LANGUAGES`, implement regex detection for Arabic, Hebrew, CJK, and Cyrillic Unicode ranges, and return structured waitlist response in preflight API.

- [ ] **Step 4: Run test to verify it passes**

Run: `node ./node_modules/vitest/vitest.mjs run test/language-guardrails.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/constants.ts lib/preflight.ts app/api/translate/preflight/route.ts test/language-guardrails.test.ts
git commit -m "feat(languages): enforce Core 4 LTR matrix with preflight script detection"
```

---

### Task 4: Credit Reservation Integration in Translation Pipeline

**Files:**
- Modify: `app/api/translate/upload/route.ts` (Call `reserveCreditsForJob`)
- Modify: `lib/translation/pipeline.ts` (Call `settleCreditsOnSuccess` on completion, `releaseCreditsOnFailure` on error)
- Test: `test/translation-credit-lifecycle.test.ts`

**Interfaces:**
- Consumes:
  - `reserveCreditsForJob`, `settleCreditsOnSuccess`, `releaseCreditsOnFailure` from `lib/services/credit-service`

- [ ] **Step 1: Write integration test for pipeline credit lifecycle**

```typescript
// test/translation-credit-lifecycle.test.ts
import { describe, it, expect } from "vitest";
import { prisma } from "../lib/prisma";
import { grantWelcomeBonus, getUserCreditBalance } from "../lib/services/credit-service";
import { processDocumentTranslation } from "../lib/translation/pipeline";

describe("Translation Pipeline Credit Integration", () => {
  it("reserves credits, completes translation, and settles credits in database", async () => {
    const user = await prisma.user.create({
      data: { email: `pipeline_credit_${Date.now()}@example.com` },
    });

    await grantWelcomeBonus(user.id); // 5 credits available

    // Run real 1-page translation
    const result = await processDocumentTranslation({
      userId: user.id,
      filename: "test_contract.docx",
      sourceLang: "en",
      targetLang: "es",
      format: "docx",
      fileBuffer: Buffer.from("Employment Agreement. Full Name: John Doe."),
    });

    expect(result.status).toBe("completed");

    const balanceAfter = await getUserCreditBalance(user.id);
    expect(balanceAfter.available).toBe(4); // 5 - 1 = 4
    expect(balanceAfter.reserved).toBe(0);
    expect(balanceAfter.lifetimeUsed).toBe(1);

    // Cleanup
    await prisma.creditTransaction.deleteMany({ where: { userId: user.id } });
    await prisma.translationJob.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails or exposes missing pipeline hooks**

Run: `node ./node_modules/vitest/vitest.mjs run test/translation-credit-lifecycle.test.ts`

- [ ] **Step 3: Wire credit reservations into `app/api/translate/upload/route.ts` and `lib/translation/pipeline.ts`**

Ensure credit reservation happens atomically before provider calls, and release is triggered in every `catch` or failure path.

- [ ] **Step 4: Run test to verify it passes**

Run: `node ./node_modules/vitest/vitest.mjs run test/translation-credit-lifecycle.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/translate/upload/route.ts lib/translation/pipeline.ts test/translation-credit-lifecycle.test.ts
git commit -m "feat(pipeline): integrate atomic credit reservation and settlement into translation engine"
```

---

### Task 5: Stripe Checkout & Idempotent Webhook Processing

**Files:**
- Modify: `lib/pricing.ts` (Add `MVP_PLANS` dictionary)
- Create: `app/api/billing/checkout/route.ts`
- Modify: `app/api/webhooks/stripe/route.ts`
- Test: `test/stripe-commercial.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/billing/checkout` &rarr; returns `{ checkoutUrl: string }`
  - `POST /api/webhooks/stripe` &rarr; processes `checkout.session.completed` idempotently

- [ ] **Step 1: Write unit tests for checkout session generation and webhook idempotency**

```typescript
// test/stripe-commercial.test.ts
import { describe, it, expect } from "vitest";
import { MVP_PLANS } from "../lib/pricing";
import { prisma } from "../lib/prisma";
import { handleStripeWebhookEvent } from "../app/api/webhooks/stripe/handler";

describe("Stripe Commercial Plans & Webhook Idempotency", () => {
  it("defines exact pilot plan pricing and page counts", () => {
    expect(MVP_PLANS.PACK_SMALL.pages).toBe(25);
    expect(MVP_PLANS.PACK_SMALL.priceCents).toBe(999);

    expect(MVP_PLANS.PACK_LARGE.pages).toBe(100);
    expect(MVP_PLANS.PACK_LARGE.priceCents).toBe(2999);

    expect(MVP_PLANS.AGENCY_MONTHLY.pagesPerMonth).toBe(500);
    expect(MVP_PLANS.AGENCY_MONTHLY.priceCents).toBe(11900);
  });

  it("processes checkout.session.completed and rejects duplicate replay", async () => {
    const user = await prisma.user.create({
      data: { email: `stripe_test_${Date.now()}@example.com` },
    });

    const mockSessionId = `cs_test_${Date.now()}`;
    const eventPayload = {
      id: `evt_test_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: mockSessionId,
          customer_email: user.email,
          metadata: {
            userId: user.id,
            planId: "pack_small_25",
            pagesGranted: "25",
          },
        },
      },
    };

    // First delivery: grants 25 credits
    const firstResult = await handleStripeWebhookEvent(eventPayload);
    expect(firstResult.status).toBe("CREDITS_GRANTED");
    expect(firstResult.creditsAdded).toBe(25);

    const userAfterFirst = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userAfterFirst?.creditsAvailable).toBe(25);

    // Duplicate replay: must return DUPLICATE_IGNORED and NOT add credits again
    const secondResult = await handleStripeWebhookEvent(eventPayload);
    expect(secondResult.status).toBe("DUPLICATE_IGNORED");

    const userAfterSecond = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userAfterSecond?.creditsAvailable).toBe(25); // Remains exactly 25

    // Cleanup
    await prisma.creditTransaction.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ./node_modules/vitest/vitest.mjs run test/stripe-commercial.test.ts`  
Expected: FAIL (`MVP_PLANS is not defined`).

- [ ] **Step 3: Implement `MVP_PLANS` in `lib/pricing.ts`, `/api/billing/checkout`, and idempotent webhook handler**

- [ ] **Step 4: Run test to verify it passes**

Run: `node ./node_modules/vitest/vitest.mjs run test/stripe-commercial.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing.ts app/api/billing/checkout/route.ts app/api/webhooks/stripe/ test/stripe-commercial.test.ts
git commit -m "feat(billing): add Stripe checkout sessions and idempotent webhook fulfillment"
```

---

### Task 6: Post-Download Micro-Feedback & Pilot Telemetry

**Files:**
- Create: `app/api/feedback/route.ts`
- Create: `components/feedback/post-download-feedback.tsx`
- Test: `test/pilot-feedback.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/feedback` &rarr; persists record to `PilotFeedback` with joined job telemetry

- [ ] **Step 1: Write unit tests for feedback submission and telemetry join**

```typescript
// test/pilot-feedback.test.ts
import { describe, it, expect } from "vitest";
import { prisma } from "../lib/prisma";
import { submitPilotFeedback, getPilotMetricsSummary } from "../app/api/feedback/service";

describe("Pilot Micro-Feedback & Telemetry", () => {
  it("persists feedback and enriches with job metadata", async () => {
    const user = await prisma.user.create({
      data: { email: `feedback_test_${Date.now()}@example.com`, role: "CUSTOMER" },
    });

    const job = await prisma.translationJob.create({
      data: {
        userId: user.id,
        sourceFilename: "diploma.pdf",
        sourceKey: "feedback/diploma.pdf",
        sourceFormat: "pdf",
        sourceMimeType: "application/pdf",
        sourceLanguage: "fr",
        targetLanguage: "en",
        status: "completed",
        pageCount: 2,
        provider: "deepl",
      },
    });

    const feedback = await submitPilotFeedback({
      userId: user.id,
      jobId: job.id,
      userRole: "STUDENT",
      rating: 5,
      issueTag: "NONE",
      valueVerdict: "GREAT_VALUE",
      comment: "Formatting was completely preserved. Fast download!",
      processingTimeMs: 1450,
      retryAttempts: 0,
    });

    expect(feedback.id).toBeDefined();
    expect(feedback.rating).toBe(5);
    expect(feedback.pageCount).toBe(2);

    const metrics = await getPilotMetricsSummary();
    expect(metrics.totalFeedbackCount).toBeGreaterThanOrEqual(1);
    expect(metrics.averageRating).toBeGreaterThanOrEqual(4.0);

    // Cleanup
    await prisma.pilotFeedback.delete({ where: { id: feedback.id } });
    await prisma.translationJob.delete({ where: { id: job.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node ./node_modules/vitest/vitest.mjs run test/pilot-feedback.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement `app/api/feedback/route.ts`, service, and component**

- [ ] **Step 4: Run test to verify it passes**

Run: `node ./node_modules/vitest/vitest.mjs run test/pilot-feedback.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/feedback/ components/feedback/ test/pilot-feedback.test.ts
git commit -m "feat(telemetry): add post-download micro-feedback and pilot KPI aggregator"
```

---

### Task 7: Commercial End-to-End Pilot Integration Test & Build Verification

**Files:**
- Create: `test/mvp-commercial-e2e.test.ts`
- Modify: `scripts/build-cloudflare.js`

- [ ] **Step 1: Write full end-to-end commercial test**

```typescript
// test/mvp-commercial-e2e.test.ts
import { describe, it, expect } from "vitest";
import { prisma } from "../lib/prisma";
import { grantWelcomeBonus, getUserCreditBalance } from "../lib/services/credit-service";
import { processDocumentTranslation } from "../lib/translation/pipeline";
import { submitPilotFeedback } from "../app/api/feedback/service";

describe("Commercial MVP End-to-End Pilot Flow", () => {
  it("executes complete lifecycle from signup bonus to download and feedback", async () => {
    // 1. New user registration
    const user = await prisma.user.create({
      data: { email: `e2e_pilot_${Date.now()}@example.com` },
    });

    // 2. 5 Welcome credits granted
    await grantWelcomeBonus(user.id);
    const balanceInitial = await getUserCreditBalance(user.id);
    expect(balanceInitial.available).toBe(5);

    // 3. Document upload & translation
    const job = await processDocumentTranslation({
      userId: user.id,
      filename: "transcript.docx",
      sourceLang: "de",
      targetLang: "en",
      format: "docx",
      fileBuffer: Buffer.from("Academic Transcript. Grade: 1.0"),
    });

    expect(job.status).toBe("completed");
    expect(job.downloadToken).toBeDefined();

    // 4. Credits settled
    const balanceFinal = await getUserCreditBalance(user.id);
    expect(balanceFinal.available).toBe(4); // 1 credit deducted
    expect(balanceFinal.reserved).toBe(0);

    // 5. Post-download feedback submitted
    const feedback = await submitPilotFeedback({
      userId: user.id,
      jobId: job.id,
      userRole: "FREELANCER",
      rating: 5,
      issueTag: "NONE",
      valueVerdict: "GREAT_VALUE",
      processingTimeMs: 1200,
      retryAttempts: 0,
    });
    expect(feedback.id).toBeDefined();

    // Cleanup
    await prisma.pilotFeedback.deleteMany({ where: { userId: user.id } });
    await prisma.creditTransaction.deleteMany({ where: { userId: user.id } });
    await prisma.translationJob.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
```

- [ ] **Step 2: Run all test suites across the codebase**

Run: `node ./node_modules/vitest/vitest.mjs run --pool=forks --poolOptions.forks.singleFork`  
Expected: All 37+ test files pass (100% green).

- [ ] **Step 3: Run production build and verify Cloudflare Pages artifacts**

Run: `node scripts/build.js`  
Expected: Clean Next.js compilation, 139 HTML pages, `dist/BUILD_INFO.json` matching current commit.

- [ ] **Step 4: Final commit**

```bash
git add test/mvp-commercial-e2e.test.ts scripts/
git commit -m "chore(release): verify commercial MVP end-to-end flow and production artifacts"
```
