import { prisma } from "../prisma";
import { CreditTransactionType } from "@prisma/client";

export interface UserCreditBalance {
  available: number;
  reserved: number;
  lifetimeUsed: number;
}

export interface CreditReservationResult {
  success: boolean;
  remaining: number;
}

/**
 * Grants 5 free welcome credits to a user upon onboarding.
 * Idempotent: If user already has a WELCOME_BONUS transaction, returns current available balance without granting again.
 */
export async function grantWelcomeBonus(userId: string): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    const users = await tx.$queryRaw<Array<{ id: string; creditsAvailable: number }>>`
      SELECT id, "creditsAvailable"
      FROM "User"
      WHERE id = ${userId}
      FOR UPDATE
    `;
    const user = users[0];
    if (!user) {
      throw new Error("User not found");
    }

    const existingBonus = await tx.creditTransaction.findFirst({
      where: {
        userId,
        type: CreditTransactionType.WELCOME_BONUS,
      },
    });

    if (existingBonus) {
      return user.creditsAvailable;
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        creditsAvailable: { increment: 5 },
      },
      select: {
        creditsAvailable: true,
      },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: 5,
        balanceAfter: updatedUser.creditsAvailable,
        type: CreditTransactionType.WELCOME_BONUS,
        description: "Welcome bonus: 5 free page credits",
      },
    });

    return updatedUser.creditsAvailable;
  });
}

/**
 * Reserves credits atomically before a translation job begins.
 * Deducts from creditsAvailable and places on hold in creditsReserved.
 * Throws INSUFFICIENT_CREDITS if user cannot cover the page count.
 */
export async function reserveCreditsForJob(
  userId: string,
  jobId: string,
  pages: number
): Promise<CreditReservationResult> {
  if (!Number.isInteger(pages) || pages <= 0) {
    throw new Error(`Invalid page count: ${pages}. Pages must be a positive integer.`);
  }

  return await prisma.$transaction(async (tx) => {
    const users = await tx.$queryRaw<Array<{ id: string; creditsAvailable: number; creditsReserved: number }>>`
      SELECT id, "creditsAvailable", "creditsReserved"
      FROM "User"
      WHERE id = ${userId}
      FOR UPDATE
    `;
    const user = users[0];
    if (!user) {
      throw new Error("User not found");
    }

    if (user.creditsAvailable < pages) {
      throw new Error(
        `INSUFFICIENT_CREDITS: Required ${pages} credits, but only ${user.creditsAvailable} available`
      );
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        creditsAvailable: { decrement: pages },
        creditsReserved: { increment: pages },
      },
      select: {
        creditsAvailable: true,
        creditsReserved: true,
      },
    });

    // Verify if translation job exists in DB for foreign key integrity
    const jobExists = await tx.translationJob.findUnique({
      where: { id: jobId },
      select: { id: true },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -pages,
        balanceAfter: updatedUser.creditsAvailable,
        type: CreditTransactionType.JOB_RESERVED,
        description: `Reserved ${pages} credits for job ${jobId}`,
        jobId: jobExists ? jobId : null,
      },
    });

    return {
      success: true,
      remaining: updatedUser.creditsAvailable,
    };
  });
}

/**
 * Settles reserved credits on successful job completion.
 * Clears the hold from creditsReserved and increments lifetimePagesUsed.
 * creditsAvailable remains unchanged because credits were already deducted at reservation.
 */
export async function settleCreditsOnSuccess(
  userId: string,
  jobId: string,
  pages: number
): Promise<void> {
  if (!Number.isInteger(pages) || pages <= 0) {
    throw new Error(`Invalid page count: ${pages}. Pages must be a positive integer.`);
  }

  await prisma.$transaction(async (tx) => {
    const users = await tx.$queryRaw<Array<{ id: string; creditsAvailable: number; creditsReserved: number; lifetimePagesUsed: number }>>`
      SELECT id, "creditsAvailable", "creditsReserved", "lifetimePagesUsed"
      FROM "User"
      WHERE id = ${userId}
      FOR UPDATE
    `;
    const user = users[0];
    if (!user) {
      throw new Error("User not found");
    }

    const newReserved = Math.max(0, user.creditsReserved - pages);

    await tx.user.update({
      where: { id: userId },
      data: {
        creditsReserved: newReserved,
        lifetimePagesUsed: { increment: pages },
      },
    });

    const jobExists = await tx.translationJob.findUnique({
      where: { id: jobId },
      select: { id: true },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: 0,
        balanceAfter: user.creditsAvailable,
        type: CreditTransactionType.JOB_DEDUCTED,
        description: `Settled ${pages} reserved credits for completed job ${jobId}`,
        jobId: jobExists ? jobId : null,
      },
    });
  });
}

/**
 * Releases reserved credits back to available balance on job failure.
 * Clears the hold from creditsReserved and refunds creditsAvailable in full.
 */
export async function releaseCreditsOnFailure(
  userId: string,
  jobId: string,
  pages: number,
  reason: string
): Promise<void> {
  if (!Number.isInteger(pages) || pages <= 0) {
    throw new Error(`Invalid page count: ${pages}. Pages must be a positive integer.`);
  }

  await prisma.$transaction(async (tx) => {
    const users = await tx.$queryRaw<Array<{ id: string; creditsAvailable: number; creditsReserved: number }>>`
      SELECT id, "creditsAvailable", "creditsReserved"
      FROM "User"
      WHERE id = ${userId}
      FOR UPDATE
    `;
    const user = users[0];
    if (!user) {
      throw new Error("User not found");
    }

    const newReserved = Math.max(0, user.creditsReserved - pages);

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        creditsReserved: newReserved,
        creditsAvailable: { increment: pages },
      },
      select: {
        creditsAvailable: true,
      },
    });

    const jobExists = await tx.translationJob.findUnique({
      where: { id: jobId },
      select: { id: true },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: pages,
        balanceAfter: updatedUser.creditsAvailable,
        type: CreditTransactionType.JOB_RELEASED,
        description: `Released ${pages} credits for failed job ${jobId}: ${reason}`,
        jobId: jobExists ? jobId : null,
      },
    });
  });
}

/**
 * Retrieves the current credit balance breakdown for a user.
 */
export async function getUserCreditBalance(userId: string): Promise<UserCreditBalance> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      creditsAvailable: true,
      creditsReserved: true,
      lifetimePagesUsed: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    available: user.creditsAvailable,
    reserved: user.creditsReserved,
    lifetimeUsed: user.lifetimePagesUsed,
  };
}

/**
 * Reconciles stale reservations where jobs have been pending/translating for longer than maxAgeMinutes
 * and have a JOB_RESERVED transaction without a subsequent JOB_DEDUCTED or JOB_RELEASED.
 * Automatically marks the job failed with code WORKER_TIMEOUT_AUTO_REFUNDED and releases reserved credits.
 * If job.userId is null (orphan job), still marks job failed to prevent persistent stale loops.
 */
export async function reconcileStaleReservations(maxAgeMinutes: number = 30): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

  const staleJobs = await prisma.translationJob.findMany({
    where: {
      status: {
        notIn: ["completed", "completed_with_warnings", "failed", "cancelled", "expired", "deleted"],
      },
      createdAt: { lte: cutoff },
    },
    include: {
      creditTransactions: true,
    },
  });

  let reconciledCount = 0;

  for (const job of staleJobs) {
    const reservedTx = job.creditTransactions.find(
      (tx) => tx.type === CreditTransactionType.JOB_RESERVED
    );
    const settledOrReleased = job.creditTransactions.some(
      (tx) =>
        tx.type === CreditTransactionType.JOB_DEDUCTED ||
        tx.type === CreditTransactionType.JOB_RELEASED
    );

    if (reservedTx && !settledOrReleased) {
      const pages = Math.abs(reservedTx.amount);

      await prisma.$transaction(async (tx) => {
        // Mark job failed
        await tx.translationJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
            errorCode: "WORKER_TIMEOUT_AUTO_REFUNDED",
            errorMessage: `Job timed out after ${maxAgeMinutes} minutes and reserved credits were refunded`,
          },
        });

        // Release reserved credits if user still exists
        if (job.userId) {
          const users = await tx.$queryRaw<Array<{ id: string; creditsAvailable: number; creditsReserved: number }>>`
            SELECT id, "creditsAvailable", "creditsReserved"
            FROM "User"
            WHERE id = ${job.userId!}
            FOR UPDATE
          `;
          const user = users[0];
          if (user) {
            const newReserved = Math.max(0, user.creditsReserved - pages);
            const updatedUser = await tx.user.update({
              where: { id: job.userId! },
              data: {
                creditsReserved: newReserved,
                creditsAvailable: { increment: pages },
              },
              select: {
                creditsAvailable: true,
              },
            });

            await tx.creditTransaction.create({
              data: {
                userId: job.userId!,
                amount: pages,
                balanceAfter: updatedUser.creditsAvailable,
                type: CreditTransactionType.JOB_RELEASED,
                description: `Released ${pages} credits for failed job ${job.id}: WORKER_TIMEOUT_AUTO_REFUNDED`,
                jobId: job.id,
              },
            });
          }
        }
      });

      reconciledCount++;
    }
  }

  return reconciledCount;
}
