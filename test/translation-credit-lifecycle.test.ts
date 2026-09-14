import { describe, it, expect, afterEach, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import {
  grantWelcomeBonus,
  getUserCreditBalance,
} from "../lib/services/credit-service";
import {
  processDocumentTranslation,
  processTranslationJob,
} from "../lib/translation/pipeline";
import { getTranslationJob, deleteTranslationJob } from "../lib/translation/store";
import { POST as uploadPost } from "../app/api/translate/upload/route";

describe("Translation Pipeline Credit Integration", () => {
  const createdUserIds: string[] = [];

  const createTestUser = async (creditsAvailable = 0) => {
    const user = await prisma.user.create({
      data: {
        email: `pipeline_credit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@example.com`,
        creditsAvailable,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    createdUserIds.push(user.id);
    return user;
  };

  const cleanupUserData = async (userId: string) => {
    try {
      await prisma.creditTransaction.deleteMany({ where: { userId } });
      await prisma.translationJob.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    } catch {}
  };

  afterEach(async () => {
    while (createdUserIds.length > 0) {
      const id = createdUserIds.pop();
      if (id) {
        await cleanupUserData(id);
      }
    }
  });

  afterAll(async () => {
    // Final defensive cleanup
    const leftoverUsers = await prisma.user.findMany({
      where: { email: { contains: "pipeline_credit_" } },
      select: { id: true },
    });
    for (const u of leftoverUsers) {
      await cleanupUserData(u.id);
    }
  });

  it("1. Happy path: User registers -> receives 5 welcome credits -> uploads 1-page DOCX -> 1 credit reserved -> translation completes -> 1 credit settled -> user has 4 available, 0 reserved, 1 lifetime used", async () => {
    const user = await createTestUser(0);

    // Grant 5 free welcome credits
    const granted = await grantWelcomeBonus(user.id);
    expect(granted).toBe(5);

    const initialBalance = await getUserCreditBalance(user.id);
    expect(initialBalance.available).toBe(5);
    expect(initialBalance.reserved).toBe(0);
    expect(initialBalance.lifetimeUsed).toBe(0);

    // Run real 1-page translation via processDocumentTranslation
    const result = await processDocumentTranslation({
      userId: user.id,
      filename: "test_contract.docx",
      sourceLang: "en",
      targetLang: "es",
      format: "docx",
      fileBuffer: Buffer.from("Employment Agreement. Full Name: John Doe."),
    });

    expect(result.status).toBe("completed");
    expect(result.downloadToken).toBeDefined();

    // Verify settled balance: 4 available, 0 reserved, 1 lifetime used
    const balanceAfter = await getUserCreditBalance(user.id);
    expect(balanceAfter.available).toBe(4);
    expect(balanceAfter.reserved).toBe(0);
    expect(balanceAfter.lifetimeUsed).toBe(1);

    // Verify database transaction history
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    expect(transactions.length).toBe(3);
    expect(transactions[0].type).toBe("WELCOME_BONUS");
    expect(transactions[0].amount).toBe(5);
    expect(transactions[1].type).toBe("JOB_RESERVED");
    expect(transactions[1].amount).toBe(-1);
    expect(transactions[2].type).toBe("JOB_DEDUCTED");
    expect(transactions[2].amount).toBe(0);
  });

  it("2. Failure path: User with 5 credits -> uploads document that triggers translation error -> job fails -> 100% of reserved credits automatically released back to available -> user retains 5 available credits", async () => {
    const user = await createTestUser(0);
    await grantWelcomeBonus(user.id); // 5 credits available

    // Process translation with simulated unrecoverable provider failure
    const result = await processDocumentTranslation({
      userId: user.id,
      filename: "corrupted_legal_document.docx",
      sourceLang: "en",
      targetLang: "es",
      format: "docx",
      fileBuffer: Buffer.from("Certified Affiliation Agreement"),
      options: {
        simulateError: "Simulated Provider 500: Neural Translation API unavailable",
      },
    });

    expect(result.status).toBe("failed");
    expect(result.error).toContain("Simulated Provider 500");

    // 100% of reserved credits must be refunded back to available
    const balanceAfter = await getUserCreditBalance(user.id);
    expect(balanceAfter.available).toBe(5);
    expect(balanceAfter.reserved).toBe(0);
    expect(balanceAfter.lifetimeUsed).toBe(0);

    // Verify transaction ledger records JOB_RELEASED
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    expect(transactions.length).toBe(3);
    expect(transactions[0].type).toBe("WELCOME_BONUS");
    expect(transactions[1].type).toBe("JOB_RESERVED");
    expect(transactions[1].amount).toBe(-1);
    expect(transactions[2].type).toBe("JOB_RELEASED");
    expect(transactions[2].amount).toBe(1);
    expect(transactions[2].balanceAfter).toBe(5);
    expect(transactions[2].description).toContain("Simulated Provider 500");
  });

  it("3. Insufficient balance: User with 0 credits -> uploads 2-page document -> rejected upfront with HTTP 402 / INSUFFICIENT_CREDITS without creating or queuing a translation job", async () => {
    const user = await createTestUser(0); // 0 available credits

    const initialJobsCount = await prisma.translationJob.count({
      where: { userId: user.id },
    });

    // Upload 2-page document via POST /api/translate/upload
    const req = new Request("http://localhost:3000/api/translate/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        fileName: "court_deposition_2pages.pdf",
        pageCount: 2,
        sourceLang: "es",
        targetLang: "en",
        fileBase64: Buffer.from("%PDF-1.4 Mock 2 page court deposition").toString("base64"),
      }),
    });

    const res = await uploadPost(req as any);
    expect(res.status).toBe(402);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("INSUFFICIENT_CREDITS");
    expect(json.message).toBe(
      "Insufficient page credits. This document requires 2 credits, but your account has 0 available."
    );
    expect(json.requiredCredits).toBe(2);
    expect(json.availableCredits).toBe(0);
    expect(json.upgradeUrl).toBe("/pricing");

    // Must NOT have created or queued a translation job in PostgreSQL
    const finalJobsCount = await prisma.translationJob.count({
      where: { userId: user.id },
    });
    expect(finalJobsCount).toBe(initialJobsCount);

    // User's balance remains 0 available, 0 reserved
    const balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(0);
    expect(balance.reserved).toBe(0);
  });

  it("4. Upload Route End-to-End: POST /api/translate/upload reserves credits and settles upon async pipeline completion", async () => {
    const user = await createTestUser(0);
    await grantWelcomeBonus(user.id); // 5 credits

    const req = new Request("http://localhost:3000/api/translate/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        fileName: "sample_birth_cert.docx",
        sourceLang: "es",
        targetLang: "en",
        fileBase64: Buffer.from("Acta de Nacimiento. Nombre: Maria Garcia.").toString("base64"),
      }),
    });

    const res = await uploadPost(req as any);
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.jobId).toBeDefined();

    // Wait for async processing in store/DB
    let job = getTranslationJob(body.jobId);
    let attempts = 0;
    while (job && job.status !== "ready" && (job.status as string) !== "completed" && attempts < 50) {
      await new Promise((r) => setTimeout(r, 50));
      job = getTranslationJob(body.jobId);
      attempts++;
    }

    expect(["ready", "completed"]).toContain(job?.status);

    // Verify credits were properly settled
    const balance = await getUserCreditBalance(user.id);
    expect(balance.available).toBe(4);
    expect(balance.reserved).toBe(0);
    expect(balance.lifetimeUsed).toBe(1);

    deleteTranslationJob(body.jobId);
  });

  it("5. Null userId compatibility: Unauthenticated demo uploads skip credit lifecycle gracefully", async () => {
    // Calling processDocumentTranslation without userId
    const result = await processDocumentTranslation({
      userId: null,
      filename: "demo_guest.docx",
      sourceLang: "en",
      targetLang: "es",
      format: "docx",
      fileBuffer: Buffer.from("Public Guest Translation Demo"),
    });

    expect(result.status).toBe("completed");
    expect(result.downloadToken).toBeDefined();

    // Calling upload route without userId
    const req = new Request("http://localhost:3000/api/translate/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "demo_guest_route.docx",
        sourceLang: "en",
        targetLang: "es",
        fileBase64: Buffer.from("Public Route Demo").toString("base64"),
      }),
    });

    const res = await uploadPost(req as any);
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.jobId).toBeDefined();

    deleteTranslationJob(result.id);
    deleteTranslationJob(body.jobId);
  });
});
