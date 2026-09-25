import { describe, it, expect, afterEach, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import {
  grantWelcomeBonus,
  getUserCreditBalance,
  settleCreditsOnSuccess,
  reserveCreditsForJob,
} from "../lib/services/credit-service";
import { processDocumentTranslation } from "../lib/translation/pipeline";
import { submitPilotFeedback, getPilotMetricsSummary } from "../app/api/feedback/service";
import { handleStripeWebhookEvent } from "../app/api/webhooks/stripe/handler";
import { POST as uploadPost } from "../app/api/translate/upload/route";
import { POST as preflightPost } from "../app/api/translate/preflight/route";
import { NextRequest } from "next/server";

describe("Commercial MVP End-to-End Pilot Journey", () => {
  const createdUserIds: string[] = [];
  const createdJobIds: string[] = [];
  const createdFeedbackIds: string[] = [];

  const createTestUser = async () => {
    const user = await prisma.user.create({
      data: {
        email: `mvp_pilot_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@example.com`,
        role: "CUSTOMER",
        creditsAvailable: 0,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    createdUserIds.push(user.id);
    return user;
  };

  const cleanupUser = async (userId: string) => {
    try {
      await prisma.pilotFeedback.deleteMany({ where: { userId } });
      await prisma.creditTransaction.deleteMany({ where: { userId } });
      await prisma.translationJob.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    } catch {}
  };

  afterEach(async () => {
    // Delete any feedbacks created directly by test
    if (createdFeedbackIds.length > 0) {
      await prisma.pilotFeedback.deleteMany({
        where: { id: { in: createdFeedbackIds } },
      });
      createdFeedbackIds.length = 0;
    }

    // Delete any jobs created directly by test
    if (createdJobIds.length > 0) {
      await prisma.pilotFeedback.deleteMany({
        where: { jobId: { in: createdJobIds } },
      });
      await prisma.translationJob.deleteMany({
        where: { id: { in: createdJobIds } },
      });
      createdJobIds.length = 0;
    }

    // Clean up created test users and all associated transactions/jobs
    while (createdUserIds.length > 0) {
      const id = createdUserIds.pop();
      if (id) {
        await cleanupUser(id);
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("executes the complete commercial pilot lifecycle: signup bonus -> translation -> settlement -> feedback -> exhaustion -> Stripe fulfillment -> failure refund -> KPI aggregation", async () => {
    // -------------------------------------------------------------------------
    // STEP 1: User Registration & Welcome Credits (5 free pages)
    // -------------------------------------------------------------------------
    const user = await createTestUser();

    // Grant welcome bonus
    const granted = await grantWelcomeBonus(user.id);
    expect(granted).toBe(5);

    // Idempotency: Duplicate call returns existing available balance without granting again
    const duplicateGrant = await grantWelcomeBonus(user.id);
    expect(duplicateGrant).toBe(5);

    let balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(5);
    expect(balance.reserved).toBe(0);
    expect(balance.lifetimeUsed).toBe(0);

    // -------------------------------------------------------------------------
    // STEP 2: Document Translation #1 (Core 4 LTR: German -> English, 1 page)
    // -------------------------------------------------------------------------
    const job1 = await processDocumentTranslation({
      userId: user.id,
      filename: "academic_transcript.docx",
      sourceLang: "de",
      targetLang: "en",
      format: "docx",
      fileBuffer: Buffer.from("Offizielles Zeugnis der Universität Heidelberg. Note: 1.0 Sehr Gut."),
    });

    expect(job1.status).toBe("completed");
    expect(job1.downloadToken).toBeDefined();

    // Check settled balance: 4 available, 0 reserved, 1 lifetime used
    balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(4);
    expect(balance.reserved).toBe(0);
    expect(balance.lifetimeUsed).toBe(1);

    // -------------------------------------------------------------------------
    // STEP 3: Post-Download Micro-Feedback & Willingness-to-Pay Sentiment
    // -------------------------------------------------------------------------
    const feedback1 = await submitPilotFeedback({
      userId: user.id,
      jobId: job1.id,
      userRole: "FREELANCE_TRANSLATOR",
      rating: 5,
      issueTag: "NONE",
      valueVerdict: "GREAT_VALUE",
      comment: "Academic tables and header layout maintained with 100% fidelity.",
    });

    expect(feedback1.id).toBeDefined();
    expect(feedback1.rating).toBe(5);
    expect(feedback1.issueTag).toBe("NONE");
    expect(feedback1.valueVerdict).toBe("GREAT_VALUE");
    expect(feedback1.pageCount).toBe(1);
    expect(feedback1.sourceLang).toBe("de");
    expect(feedback1.targetLang).toBe("en");
    createdFeedbackIds.push(feedback1.id);

    // -------------------------------------------------------------------------
    // STEP 4: Credit Depletion & HTTP 402 Enforcement on Upload Route
    // -------------------------------------------------------------------------
    // Deduct remaining 4 credits so balance is zero
    for (let i = 0; i < 4; i++) {
      const dummyJobId = `deplete_job_${Date.now()}_${i}`;
      await reserveCreditsForJob(user.id, dummyJobId, 1);
      await settleCreditsOnSuccess(user.id, dummyJobId, 1);
    }

    balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(0);
    expect(balance.reserved).toBe(0);
    expect(balance.lifetimeUsed).toBe(5);

    // Attempt translation upload when balance is 0: must return HTTP 402
    const uploadReq = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "commercial_lease.docx",
        sourceLang: "en",
        targetLang: "es",
        pageCount: 1,
        userId: user.id,
        fileBase64: Buffer.from("Commercial Lease Agreement").toString("base64"),
      }),
    });

    const uploadRes = await uploadPost(uploadReq);
    expect(uploadRes.status).toBe(402);
    const uploadErr = await uploadRes.json();
    expect(uploadErr.error).toBe("INSUFFICIENT_CREDITS");
    expect(uploadErr.availableCredits).toBe(0);
    expect(uploadErr.requiredCredits).toBe(1);
    expect(uploadErr.upgradeUrl).toBe("/pricing");

    // -------------------------------------------------------------------------
    // STEP 5: Stripe Checkout Webhook Fulfillment (Starter Pack: 25 pages, $9.99)
    // -------------------------------------------------------------------------
    const paymentSessionId = `cs_pilot_pack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const stripeEvent = {
      id: `evt_test_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: paymentSessionId,
          customer_email: user.email,
          metadata: {
            userId: user.id,
            planId: "pack_small_25",
            pagesGranted: "25",
          },
        },
      },
    };

    const webhookResult = await handleStripeWebhookEvent(stripeEvent);
    expect(webhookResult.status).toBe("CREDITS_GRANTED");
    expect(webhookResult.creditsAdded).toBe(25);

    // Balance is now 25 available
    balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(25);
    expect(balance.reserved).toBe(0);
    expect(balance.lifetimeUsed).toBe(5);

    // Webhook Idempotency: Replaying the event must be ignored without double-crediting
    const duplicateWebhookResult = await handleStripeWebhookEvent(stripeEvent);
    expect(duplicateWebhookResult.status).toBe("DUPLICATE_IGNORED");

    balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(25); // Unchanged

    // -------------------------------------------------------------------------
    // STEP 6: Document Translation #2 with Paid Credits (French -> English)
    // -------------------------------------------------------------------------
    const job2 = await processDocumentTranslation({
      userId: user.id,
      filename: "statuts_societe.docx",
      sourceLang: "fr",
      targetLang: "en",
      format: "docx",
      fileBuffer: Buffer.from("Statuts constitutifs de la société par actions simplifiée."),
    });

    expect(job2.status).toBe("completed");
    expect(job2.downloadToken).toBeDefined();

    // Balance reflects 1 credit deducted: 24 available, 6 lifetime used
    balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(24);
    expect(balance.reserved).toBe(0);
    expect(balance.lifetimeUsed).toBe(6);

    // -------------------------------------------------------------------------
    // STEP 7: Failure Refund Guarantee (Simulated Provider Error -> 100% Release)
    // -------------------------------------------------------------------------
    const failedJob = await processDocumentTranslation({
      userId: user.id,
      filename: "corrupted_file.docx",
      sourceLang: "en",
      targetLang: "de",
      format: "docx",
      fileBuffer: Buffer.from("Corrupted content that triggers error"),
      options: {
        sourceLang: "en",
        targetLang: "de",
        simulateError: "Simulated Provider Error: Translation Engine 503 Outage",
      },
    });

    expect(failedJob.status).toBe("failed");

    // Reserved credit was 100% released back: balance remains 24 available, 6 lifetime used
    balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(24);
    expect(balance.reserved).toBe(0);
    expect(balance.lifetimeUsed).toBe(6);

    // -------------------------------------------------------------------------
    // STEP 8: Pilot Telemetry & Metrics Aggregator Verification
    // -------------------------------------------------------------------------
    const metrics = await getPilotMetricsSummary();
    expect(metrics.totalFeedbackCount).toBeGreaterThanOrEqual(1);
    expect(metrics.averageRating).toBeGreaterThanOrEqual(4.0);
    expect(metrics.issueBreakdown["NONE"]).toBeGreaterThanOrEqual(1);
    expect(metrics.valueBreakdown["GREAT_VALUE"]).toBeGreaterThanOrEqual(1);
    expect(metrics.recentComments).toContain(
      "Academic tables and header layout maintained with 100% fidelity."
    );
  });

  it("enforces agency hard-capped monthly subscription (500 pages) and Core 4 LTR boundary guardrails", async () => {
    const agencyUser = await createTestUser();

    // 1. Core 4 LTR Guardrail Enforcement via Preflight:
    // Attempting translation with unsupported non-Latin / non-Core-4 language pair (e.g. Chinese)
    const preflightReq = new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: "zh",
        targetLang: "en",
        fileName: "patent_document.pdf",
      }),
    });

    const preflightRes = await preflightPost(preflightReq);
    expect(preflightRes.status).toBe(422);
    const preflightData = await preflightRes.json();
    expect(preflightData.waitlistAffordance).toBe(true);
    expect(preflightData.supported).toBe(false);
    expect(preflightData.code).toBe("UNSUPPORTED_LANGUAGE");

    // 2. Fulfill Agency Monthly Subscription ($119.00 / 500 pages) via Stripe Webhook
    const stripeSubEvent = {
      id: `evt_sub_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_sub_${Date.now()}`,
          customer: `cus_agency_${Date.now()}`,
          subscription: `sub_agency_${Date.now()}`,
          customer_email: agencyUser.email,
          metadata: {
            userId: agencyUser.id,
            planId: "agency_monthly_500",
            pagesGranted: "500",
          },
        },
      },
    };

    const subResult = await handleStripeWebhookEvent(stripeSubEvent);
    expect(subResult.status).toBe("CREDITS_GRANTED");
    expect(subResult.creditsAdded).toBe(500);

    // Verify balance & subscription records in Postgres
    const agencyBalance = await getUserCreditBalance(agencyUser.id);
    expect(agencyBalance.available).toBe(500);
    expect(agencyBalance.reserved).toBe(0);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: agencyUser.id },
    });
    expect(subscription).not.toBeNull();
    expect(subscription?.plan).toBe("AGENCY_MONTHLY");
    expect(subscription?.pageQuota).toBe(500);

    // Clean up subscription explicitly before user deletion
    await prisma.subscription.deleteMany({ where: { userId: agencyUser.id } });
  });
});
