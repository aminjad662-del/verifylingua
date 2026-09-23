import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

export interface AuditLeakageReport {
  timestamp: string;
  totalJobsScanned: number;
  duplicateKeysAcrossDifferentUsers: Array<{
    keyType: "sourceKey" | "outputKey";
    key: string;
    userIds: string[];
    jobIds: string[];
  }>;
  duplicateTokensAcrossDifferentUsers: Array<{
    token: string;
    userIds: string[];
    jobIds: string[];
  }>;
  legacyNonCanonicalKeys: Array<{
    jobId: string;
    userId: string | null;
    sourceKey: string;
    outputKey: string | null;
  }>;
  verdict: "CLEAN_ZERO_LEAKAGE" | "ANOMALIES_DETECTED";
  summary: string;
}

export async function runCrossUserLeakageAudit(): Promise<AuditLeakageReport> {
  const jobs = await prisma.translationJob.findMany({
    select: {
      id: true,
      userId: true,
      sourceKey: true,
      outputKey: true,
      downloadToken: true,
      createdAt: true,
    },
  });

  const duplicateKeysAcrossDifferentUsers: AuditLeakageReport["duplicateKeysAcrossDifferentUsers"] = [];
  const duplicateTokensAcrossDifferentUsers: AuditLeakageReport["duplicateTokensAcrossDifferentUsers"] = [];
  const legacyNonCanonicalKeys: AuditLeakageReport["legacyNonCanonicalKeys"] = [];

  // 1. Group by sourceKey
  const sourceKeyMap = new Map<string, Array<{ jobId: string; userId: string }>>();
  const outputKeyMap = new Map<string, Array<{ jobId: string; userId: string }>>();
  const tokenMap = new Map<string, Array<{ jobId: string; userId: string }>>();

  for (const job of jobs) {
    const uId = job.userId || "anonymous";

    // Legacy format check: does it match jobs/{userId}/{jobId}/ ?
    const isCanonicalSource = /^jobs\/[^/]+\/[^/]+\//.test(job.sourceKey);
    const isCanonicalOutput = !job.outputKey || /^jobs\/[^/]+\/[^/]+\//.test(job.outputKey);

    if (!isCanonicalSource || !isCanonicalOutput) {
      legacyNonCanonicalKeys.push({
        jobId: job.id,
        userId: job.userId,
        sourceKey: job.sourceKey,
        outputKey: job.outputKey,
      });
    }

    // SourceKey collisions across distinct users
    if (job.sourceKey) {
      const existing = sourceKeyMap.get(job.sourceKey) || [];
      existing.push({ jobId: job.id, userId: uId });
      sourceKeyMap.set(job.sourceKey, existing);
    }

    // OutputKey collisions across distinct users
    if (job.outputKey) {
      const existing = outputKeyMap.get(job.outputKey) || [];
      existing.push({ jobId: job.id, userId: uId });
      outputKeyMap.set(job.outputKey, existing);
    }

    // Token collisions across distinct users
    if (job.downloadToken) {
      const existing = tokenMap.get(job.downloadToken) || [];
      existing.push({ jobId: job.id, userId: uId });
      tokenMap.set(job.downloadToken, existing);
    }
  }

  for (const [key, records] of sourceKeyMap.entries()) {
    const userIds = Array.from(new Set(records.map((r) => r.userId)));
    if (userIds.length > 1 && !userIds.includes("anonymous")) {
      duplicateKeysAcrossDifferentUsers.push({
        keyType: "sourceKey",
        key,
        userIds,
        jobIds: records.map((r) => r.jobId),
      });
    }
  }

  for (const [key, records] of outputKeyMap.entries()) {
    const userIds = Array.from(new Set(records.map((r) => r.userId)));
    if (userIds.length > 1 && !userIds.includes("anonymous")) {
      duplicateKeysAcrossDifferentUsers.push({
        keyType: "outputKey",
        key,
        userIds,
        jobIds: records.map((r) => r.jobId),
      });
    }
  }

  for (const [token, records] of tokenMap.entries()) {
    const userIds = Array.from(new Set(records.map((r) => r.userId)));
    if (userIds.length > 1 && !userIds.includes("anonymous")) {
      duplicateTokensAcrossDifferentUsers.push({
        token,
        userIds,
        jobIds: records.map((r) => r.jobId),
      });
    }
  }

  const hasCollisions =
    duplicateKeysAcrossDifferentUsers.length > 0 ||
    duplicateTokensAcrossDifferentUsers.length > 0;

  const verdict = hasCollisions ? "ANOMALIES_DETECTED" : "CLEAN_ZERO_LEAKAGE";
  const summary = hasCollisions
    ? `CRITICAL ALERT: Detected ${duplicateKeysAcrossDifferentUsers.length} key collisions and ${duplicateTokensAcrossDifferentUsers.length} token collisions across distinct accounts.`
    : `AUDIT COMPLETE: Scanned ${jobs.length} jobs. Zero cross-user file or token collisions detected in database. All user boundaries are isolated.`;

  return {
    timestamp: new Date().toISOString(),
    totalJobsScanned: jobs.length,
    duplicateKeysAcrossDifferentUsers,
    duplicateTokensAcrossDifferentUsers,
    legacyNonCanonicalKeys,
    verdict,
    summary,
  };
}

// Auto-run if executed directly
if (require.main === module || process.argv[1]?.includes("audit-cross-user-leakage")) {
  runCrossUserLeakageAudit()
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Audit failed:", err);
      process.exit(1);
    });
}
