import crypto from "crypto";
import { TranslationJob } from "./types";
import { generateCompositeKey, CURRENT_PIPELINE_VERSION } from "./composite-key";

declare global {
  // eslint-disable-next-line no-var
  var __translationJobs: Map<string, TranslationJob> | undefined;
  // eslint-disable-next-line no-var
  var __compositeKeyJobMap: Map<string, string> | undefined;
  // eslint-disable-next-line no-var
  var __inFlightTranslationPromises: Map<string, Promise<any>> | undefined;
  // eslint-disable-next-line no-var
  var __translationJobsCleanupStarted: boolean | undefined;
}

const jobsMap: Map<string, TranslationJob> =
  globalThis.__translationJobs ?? new Map<string, TranslationJob>();
globalThis.__translationJobs = jobsMap;

const compositeKeyJobMap: Map<string, string> =
  globalThis.__compositeKeyJobMap ?? new Map<string, string>();
globalThis.__compositeKeyJobMap = compositeKeyJobMap;

const inFlightMap: Map<string, Promise<any>> =
  globalThis.__inFlightTranslationPromises ?? new Map<string, Promise<any>>();
globalThis.__inFlightTranslationPromises = inFlightMap;

// TTL auto-purge: remove expired jobs every hour (24h retention window)
if (!globalThis.__translationJobsCleanupStarted) {
  globalThis.__translationJobsCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobsMap.entries()) {
      const expiresAt = new Date(job.tokenExpiresAt).getTime();
      if (now > expiresAt) {
        if (job.compositeKey) {
          compositeKeyJobMap.delete(job.compositeKey);
        }
        jobsMap.delete(id);
      }
    }
  }, 60 * 60 * 1000);
}

export function generateJobTrackingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VL-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createTranslationJob(params: {
  id?: string;
  fileName: string;
  fileFormat: "pdf" | "docx" | "png" | "jpg";
  fileSize: number;
  sourceLang: string;
  targetLang: string;
  originalBuffer: Buffer;
  userId?: string | null;
  pageCount?: number;
  options?: Record<string, any>;
}): TranslationJob {
  const id = params.id || generateJobTrackingId();
  const downloadToken = crypto.randomBytes(24).toString("hex");

  // 24-hour expiration window
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const userSegment = params.userId || "anonymous";
  const ext = params.fileName.split(".").pop()?.toLowerCase() || params.fileFormat;

  // Generate composite identity key and deterministic artifact storage path
  const compositeDetails = generateCompositeKey({
    buffer: params.originalBuffer,
    sourceLang: params.sourceLang,
    targetLang: params.targetLang,
    pipelineVersion: CURRENT_PIPELINE_VERSION,
    options: { ...params.options, format: ext },
  });

  const sourceKey = `jobs/${userSegment}/${id}/source.${ext}`;
  const outputKey = `jobs/${userSegment}/${id}/output.pdf`;

  const job: TranslationJob = {
    id,
    fileName: params.fileName,
    fileFormat: params.fileFormat,
    fileSize: params.fileSize,
    sourceLang: params.sourceLang,
    targetLang: params.targetLang,
    status: "queued",
    progress: 0,
    currentStep: "Job initialized and queued for processing",
    createdAt: new Date().toISOString(),
    originalBuffer: params.originalBuffer,
    downloadToken,
    tokenExpiresAt: expiresAt,
    userId: params.userId || null,
    pageCount: params.pageCount || 1,
    sourceKey,
    outputKey,
    sourceSha256: compositeDetails.contentHash,
    compositeKey: compositeDetails.compositeKey,
    contentHash: compositeDetails.contentHash,
    pipelineVersion: compositeDetails.pipelineVersion,
    artifactStoragePath: compositeDetails.artifactStoragePath,
  };

  jobsMap.set(id, job);
  compositeKeyJobMap.set(compositeDetails.compositeKey, id);

  return job;
}

export function getTranslationJob(id: string): TranslationJob | null {
  return jobsMap.get(id) || null;
}

/**
 * Retrieves an existing verified job matching the exact composite key
 * (contentHash + sourceLang + targetLang + pipelineVersion).
 * Enables legitimate cache reuse for identical documents and languages.
 */
export function getJobByCompositeKey(compositeKey: string): TranslationJob | null {
  const jobId = compositeKeyJobMap.get(compositeKey);
  if (!jobId) return null;
  const job = jobsMap.get(jobId);
  if (!job) {
    compositeKeyJobMap.delete(compositeKey);
    return null;
  }
  return job;
}

export function updateTranslationJob(job: TranslationJob): void {
  jobsMap.set(job.id, job);
  if (job.compositeKey) {
    compositeKeyJobMap.set(job.compositeKey, job.id);
  }
}

export function listTranslationJobs(): TranslationJob[] {
  return Array.from(jobsMap.values());
}

export function deleteTranslationJob(id: string): boolean {
  const job = jobsMap.get(id);
  if (job && job.compositeKey) {
    compositeKeyJobMap.delete(job.compositeKey);
  }
  return jobsMap.delete(id);
}

// In-flight deduplication
export function getInFlightTranslation(compositeKey: string): Promise<any> | undefined {
  return inFlightMap.get(compositeKey);
}

export function setInFlightTranslation(compositeKey: string, promise: Promise<any>): void {
  inFlightMap.set(compositeKey, promise);
  promise.finally(() => {
    inFlightMap.delete(compositeKey);
  });
}
