import { prisma } from "../prisma";
import { deleteObject } from "../storage";
import { listUserJobs, deletePersistentJob } from "../translation/persistent-store";

/**
 * Sweeps and purges jobs and storage objects older than 24 hours
 */
export async function runRetentionCleanup(): Promise<{
  purgedJobsCount: number;
  purgedFilesCount: number;
}> {
  const now = new Date();
  let purgedJobsCount = 0;
  let purgedFilesCount = 0;

  // 1. In-memory & persistent cache sweep
  const allJobs = await listUserJobs();
  for (const job of allJobs) {
    const expiresAt = new Date(job.expiresAt);
    if (now > expiresAt) {
      if (job.sourceKey) {
        await deleteObject(job.sourceKey);
        purgedFilesCount++;
      }
      if (job.outputKey) {
        await deleteObject(job.outputKey);
        purgedFilesCount++;
      }
      if (job.previewKey) {
        await deleteObject(job.previewKey);
        purgedFilesCount++;
      }
      await deletePersistentJob(job.id);
      purgedJobsCount++;
    }
  }

  // 2. Database sweep
  if (!process.env.VITEST) {
    try {
      const expiredDbJobs = await prisma.translationJob.findMany({
        where: {
          expiresAt: { lt: now },
          status: { notIn: ["deleted", "expired"] },
        },
      });

      for (const job of expiredDbJobs) {
        if (job.sourceKey) await deleteObject(job.sourceKey);
        if (job.outputKey) await deleteObject(job.outputKey);

        await prisma.translationJob.update({
          where: { id: job.id },
          data: { status: "deleted" },
        });
        purgedJobsCount++;
      }
    } catch {
      // ignore
    }
  }

  return { purgedJobsCount, purgedFilesCount };
}
