import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import {
  grantWelcomeBonus,
  reserveCreditsForJob,
  settleCreditsOnSuccess,
  releaseCreditsOnFailure,
  getUserCreditBalance,
  reconcileStaleReservations,
} from "../lib/services/credit-service";
import { CreditTransactionType } from "@prisma/client";

describe("Transactional Credit Service Ledger", () => {
  const createdUserIds: string[] = [];
  const createdJobIds: string[] = [];

  const createTestUser = async (overrides?: {
    creditsAvailable?: number;
    creditsReserved?: number;
    lifetimePagesUsed?: number;
  }) => {
    const user = await prisma.user.create({
      data: {
        email: `credit_ledger_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`,
        creditsAvailable: overrides?.creditsAvailable ?? 0,
        creditsReserved: overrides?.creditsReserved ?? 0,
        lifetimePagesUsed: overrides?.lifetimePagesUsed ?? 0,
      },
    });
    createdUserIds.push(user.id);
    return user;
  };

  const createTestJob = async (userId: string, status = "translating", createdAt?: Date) => {
    const job = await prisma.translationJob.create({
      data: {
        userId,
        sourceKey: `vault/test_${Date.now()}.docx`,
        sourceFilename: "test.docx",
        sourceFormat: "docx",
        sourceMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sourceLanguage: "en",
        targetLanguage: "es",
        status,
        pageCount: 3,
        createdAt: createdAt ?? new Date(),
      },
    });
    createdJobIds.push(job.id);
    return job;
  };

  afterEach(async () => {
    // Clean up created jobs and transactions
    if (createdJobIds.length > 0) {
      await prisma.creditTransaction.deleteMany({
        where: { jobId: { in: createdJobIds } },
      });
      await prisma.translationJob.deleteMany({
        where: { id: { in: createdJobIds } },
      });
      createdJobIds.length = 0;
    }

    if (createdUserIds.length > 0) {
      await prisma.creditTransaction.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      createdUserIds.length = 0;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("grants 5 free welcome credits on onboarding and is idempotent on repeated calls", async () => {
    const user = await createTestUser();

    // First grant
    const initialBalance = await grantWelcomeBonus(user.id);
    expect(initialBalance).toBe(5);

    const balanceCheck1 = await getUserCreditBalance(user.id);
    expect(balanceCheck1.available).toBe(5);
    expect(balanceCheck1.reserved).toBe(0);
    expect(balanceCheck1.lifetimeUsed).toBe(0);

    // Second grant (idempotent call)
    const secondBalance = await grantWelcomeBonus(user.id);
    expect(secondBalance).toBe(5);

    const balanceCheck2 = await getUserCreditBalance(user.id);
    expect(balanceCheck2.available).toBe(5);
    expect(balanceCheck2.reserved).toBe(0);

    // Verify only ONE CreditTransaction was created
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id, type: CreditTransactionType.WELCOME_BONUS },
    });
    expect(transactions).toHaveLength(1);
    expect(transactions[0].amount).toBe(5);
    expect(transactions[0].balanceAfter).toBe(5);
    expect(transactions[0].description).toBe("Welcome bonus: 5 free page credits");
  });

  it("reserves credits when job starts and rejects when insufficient", async () => {
    const user = await createTestUser();
    await grantWelcomeBonus(user.id); // 5 available

    const job = await createTestJob(user.id);

    // Reserve 3 credits for a 3-page job
    const res = await reserveCreditsForJob(user.id, job.id, 3);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(2);

    const check1 = await getUserCreditBalance(user.id);
    expect(check1.available).toBe(2);
    expect(check1.reserved).toBe(3);
    expect(check1.lifetimeUsed).toBe(0);

    // Verify ledger entry
    const reservedTx = await prisma.creditTransaction.findFirst({
      where: { userId: user.id, jobId: job.id, type: CreditTransactionType.JOB_RESERVED },
    });
    expect(reservedTx).not.toBeNull();
    expect(reservedTx?.amount).toBe(-3);
    expect(reservedTx?.balanceAfter).toBe(2);

    // Attempting to reserve 4 credits when only 2 remain must throw INSUFFICIENT_CREDITS
    const secondJob = await createTestJob(user.id);
    await expect(reserveCreditsForJob(user.id, secondJob.id, 4)).rejects.toThrow(
      "INSUFFICIENT_CREDITS: Required 4 credits, but only 2 available"
    );

    // Verify balances did not mutate on failed reservation
    const check2 = await getUserCreditBalance(user.id);
    expect(check2.available).toBe(2);
    expect(check2.reserved).toBe(3);
  });

  it("settles credits on successful completion (clears hold, increments lifetimePagesUsed)", async () => {
    const user = await createTestUser();
    await grantWelcomeBonus(user.id);
    const job = await createTestJob(user.id);

    await reserveCreditsForJob(user.id, job.id, 3);
    await settleCreditsOnSuccess(user.id, job.id, 3);

    const check = await getUserCreditBalance(user.id);
    expect(check.available).toBe(2);
    expect(check.reserved).toBe(0);
    expect(check.lifetimeUsed).toBe(3);

    // Verify settle transaction record
    const settleTx = await prisma.creditTransaction.findFirst({
      where: { userId: user.id, jobId: job.id, type: CreditTransactionType.JOB_DEDUCTED },
    });
    expect(settleTx).not.toBeNull();
    expect(settleTx?.amount).toBe(0);
    expect(settleTx?.balanceAfter).toBe(2);
    expect(settleTx?.description).toContain("Settled 3 reserved credits");
  });

  it("automatically releases and refunds credits on job failure back to available balance", async () => {
    const user = await createTestUser();
    await grantWelcomeBonus(user.id);
    const job = await createTestJob(user.id);

    await reserveCreditsForJob(user.id, job.id, 3);
    const beforeRelease = await getUserCreditBalance(user.id);
    expect(beforeRelease.available).toBe(2);
    expect(beforeRelease.reserved).toBe(3);

    await releaseCreditsOnFailure(user.id, job.id, 3, "Upstream rate limit 429");

    const afterRelease = await getUserCreditBalance(user.id);
    expect(afterRelease.available).toBe(5); // Refunded in full
    expect(afterRelease.reserved).toBe(0);
    expect(afterRelease.lifetimeUsed).toBe(0);

    // Verify release transaction record
    const releaseTx = await prisma.creditTransaction.findFirst({
      where: { userId: user.id, jobId: job.id, type: CreditTransactionType.JOB_RELEASED },
    });
    expect(releaseTx).not.toBeNull();
    expect(releaseTx?.amount).toBe(3);
    expect(releaseTx?.balanceAfter).toBe(5);
    expect(releaseTx?.description).toContain("Released 3 credits for failed job");
    expect(releaseTx?.description).toContain("Upstream rate limit 429");
  });

  it("concurrency safety: two parallel 3-page reservation requests when only 4 credits are available — exactly one succeeds and one fails", async () => {
    const user = await createTestUser({ creditsAvailable: 4, creditsReserved: 0 });
    const jobA = await createTestJob(user.id);
    const jobB = await createTestJob(user.id);

    // Launch two parallel reservation calls simultaneously
    const results = await Promise.allSettled([
      reserveCreditsForJob(user.id, jobA.id, 3),
      reserveCreditsForJob(user.id, jobB.id, 3),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const rejectedError = (rejected[0] as PromiseRejectedResult).reason;
    expect(rejectedError.message).toMatch(/INSUFFICIENT_CREDITS/);

    const finalBalance = await getUserCreditBalance(user.id);
    expect(finalBalance.available).toBe(1);
    expect(finalBalance.reserved).toBe(3);
  });

  it("reconciles stale pending/translating jobs exceeding maxAgeMinutes and auto-refunds credits", async () => {
    const user = await createTestUser();
    await grantWelcomeBonus(user.id); // 5 credits

    // Create a job from 45 minutes ago
    const staleDate = new Date(Date.now() - 45 * 60 * 1000);
    const staleJob = await createTestJob(user.id, "translating", staleDate);

    // Reserve 2 credits for this job
    await reserveCreditsForJob(user.id, staleJob.id, 2);

    const balanceBefore = await getUserCreditBalance(user.id);
    expect(balanceBefore.available).toBe(3);
    expect(balanceBefore.reserved).toBe(2);

    // Reconcile stale reservations with default 30 min max age
    const reconciledCount = await reconcileStaleReservations(30);
    expect(reconciledCount).toBeGreaterThanOrEqual(1);

    // Verify job was marked failed
    const updatedJob = await prisma.translationJob.findUnique({
      where: { id: staleJob.id },
    });
    expect(updatedJob?.status).toBe("failed");
    expect(updatedJob?.errorCode).toBe("WORKER_TIMEOUT_AUTO_REFUNDED");

    // Verify credits were refunded to user
    const balanceAfter = await getUserCreditBalance(user.id);
    expect(balanceAfter.available).toBe(5);
    expect(balanceAfter.reserved).toBe(0);

    // Re-running reconciliation immediately should find 0 additional stale jobs
    const secondReconcile = await reconcileStaleReservations(30);
    expect(secondReconcile).toBe(0);
  });
});
