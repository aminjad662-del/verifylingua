import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { CreditTransactionType } from "@prisma/client";

describe("Credit Ledger and Pilot Feedback Schema Models", () => {
  const testRunId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const testUserEmail = `credits-user-${testRunId}@example.com`;

  let createdUserId: string | null = null;
  let createdJobId: string | null = null;
  let createdTxId: string | null = null;
  let createdFeedbackId: string | null = null;

  beforeAll(async () => {
    // Ensure DB connection is warm
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up created test records in dependency order
    try {
      if (createdFeedbackId) {
        await prisma.pilotFeedback.deleteMany({ where: { id: createdFeedbackId } });
      }
      if (createdTxId) {
        await prisma.creditTransaction.deleteMany({ where: { id: createdTxId } });
      }
      if (createdJobId) {
        await prisma.translationJob.deleteMany({ where: { id: createdJobId } });
      }
      if (createdUserId) {
        await prisma.user.deleteMany({ where: { id: createdUserId } });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it("creates a test User with credit balance fields and verifies defaults & values", async () => {
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: "Credit Test User",
        role: "CUSTOMER",
        creditsAvailable: 5,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });

    createdUserId = user.id;

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testUserEmail);
    expect(user.creditsAvailable).toBe(5);
    expect(user.creditsReserved).toBe(0);
    expect(user.lifetimePagesUsed).toBe(0);
  });

  it("creates a CreditTransaction linked to the user with type WELCOME_BONUS and reads back with 100% accuracy", async () => {
    expect(createdUserId).toBeTruthy();

    const tx = await prisma.creditTransaction.create({
      data: {
        userId: createdUserId!,
        amount: 5,
        balanceAfter: 5,
        type: CreditTransactionType.WELCOME_BONUS,
        description: "Initial welcome credit grant",
        stripePaymentId: `ch_welcome_${testRunId}`,
      },
    });

    createdTxId = tx.id;

    expect(tx.id).toBeDefined();
    expect(tx.userId).toBe(createdUserId);
    expect(tx.amount).toBe(5);
    expect(tx.balanceAfter).toBe(5);
    expect(tx.type).toBe("WELCOME_BONUS");
    expect(tx.description).toBe("Initial welcome credit grant");
    expect(tx.stripePaymentId).toBe(`ch_welcome_${testRunId}`);
    expect(tx.createdAt).toBeInstanceOf(Date);

    // Read back user with creditTransactions relation
    const userWithTx = await prisma.user.findUnique({
      where: { id: createdUserId! },
      include: { creditTransactions: true },
    });

    expect(userWithTx).not.toBeNull();
    expect(userWithTx?.creditsAvailable).toBe(5);
    expect(userWithTx?.creditsReserved).toBe(0);
    expect(userWithTx?.lifetimePagesUsed).toBe(0);
    expect(userWithTx?.creditTransactions).toHaveLength(1);

    const fetchedTx = userWithTx!.creditTransactions[0];
    expect(fetchedTx.id).toBe(tx.id);
    expect(fetchedTx.userId).toBe(createdUserId);
    expect(fetchedTx.amount).toBe(5);
    expect(fetchedTx.balanceAfter).toBe(5);
    expect(fetchedTx.type).toBe(CreditTransactionType.WELCOME_BONUS);
    expect(fetchedTx.description).toBe("Initial welcome credit grant");
    expect(fetchedTx.stripePaymentId).toBe(`ch_welcome_${testRunId}`);
  });

  it("verifies unique constraint on stripePaymentId and type", async () => {
    expect(createdUserId).toBeTruthy();

    await expect(
      prisma.creditTransaction.create({
        data: {
          userId: createdUserId!,
          amount: 5,
          balanceAfter: 10,
          type: CreditTransactionType.WELCOME_BONUS,
          description: "Duplicate welcome payment test",
          stripePaymentId: `ch_welcome_${testRunId}`, // duplicate stripePaymentId + type
        },
      })
    ).rejects.toThrow();
  });

  it("creates PilotFeedback linked to TranslationJob and User, and verifies inverse relations", async () => {
    expect(createdUserId).toBeTruthy();

    // Create a TranslationJob
    const job = await prisma.translationJob.create({
      data: {
        userId: createdUserId!,
        sourceKey: `vault/${testRunId}/source.pdf`,
        sourceFilename: "legal_brief.pdf",
        sourceFormat: "pdf",
        sourceMimeType: "application/pdf",
        sourceLanguage: "es",
        targetLanguage: "en",
        pageCount: 3,
        provider: "azure",
      },
    });
    createdJobId = job.id;

    // Create PilotFeedback
    const feedback = await prisma.pilotFeedback.create({
      data: {
        userId: createdUserId!,
        jobId: job.id,
        userRole: "ATTORNEY",
        rating: 5,
        issueTag: null,
        valueVerdict: "worth_it",
        comment: "Excellent formatting preservation and prompt delivery",
        pageCount: 3,
        sourceFormat: "pdf",
        sourceLang: "es",
        targetLang: "en",
        processingTimeMs: 4250,
        retryAttempts: 0,
        providerUsed: "azure",
      },
    });
    createdFeedbackId = feedback.id;

    expect(feedback.id).toBeDefined();
    expect(feedback.userId).toBe(createdUserId);
    expect(feedback.jobId).toBe(job.id);
    expect(feedback.rating).toBe(5);
    expect(feedback.userRole).toBe("ATTORNEY");
    expect(feedback.valueVerdict).toBe("worth_it");
    expect(feedback.comment).toBe("Excellent formatting preservation and prompt delivery");
    expect(feedback.pageCount).toBe(3);
    expect(feedback.sourceFormat).toBe("pdf");
    expect(feedback.sourceLang).toBe("es");
    expect(feedback.targetLang).toBe("en");
    expect(feedback.processingTimeMs).toBe(4250);
    expect(feedback.retryAttempts).toBe(0);
    expect(feedback.providerUsed).toBe("azure");

    // Verify inverse relations on TranslationJob
    const jobWithRelations = await prisma.translationJob.findUnique({
      where: { id: job.id },
      include: {
        creditTransactions: true,
        pilotFeedbacks: true,
      },
    });

    expect(jobWithRelations).not.toBeNull();
    expect(jobWithRelations?.pilotFeedbacks).toHaveLength(1);
    expect(jobWithRelations?.pilotFeedbacks[0].id).toBe(feedback.id);
    expect(jobWithRelations?.creditTransactions).toHaveLength(0);

    // Verify inverse relations on User
    const userWithFeedback = await prisma.user.findUnique({
      where: { id: createdUserId! },
      include: {
        pilotFeedbacks: true,
      },
    });

    expect(userWithFeedback).not.toBeNull();
    expect(userWithFeedback?.pilotFeedbacks).toHaveLength(1);
    expect(userWithFeedback?.pilotFeedbacks[0].id).toBe(feedback.id);
  });
});
