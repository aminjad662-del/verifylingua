import crypto from "crypto";
import { TranslationJob } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __translationJobs: Map<string, TranslationJob> | undefined;
}

const jobsMap: Map<string, TranslationJob> =
  globalThis.__translationJobs ?? new Map<string, TranslationJob>();
globalThis.__translationJobs = jobsMap;

export function createTranslationJob(params: {
  fileName: string;
  fileFormat: "pdf" | "docx" | "png" | "jpg";
  fileSize: number;
  sourceLang: string;
  targetLang: string;
  originalBuffer: Buffer;
}): TranslationJob {
  const id = `job_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const downloadToken = crypto.randomBytes(24).toString("hex");

  // 24-hour expiration window
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
  };

  jobsMap.set(id, job);
  return job;
}

export function getTranslationJob(id: string): TranslationJob | null {
  return jobsMap.get(id) || null;
}

export function updateTranslationJob(job: TranslationJob): void {
  jobsMap.set(job.id, job);
}

export function listTranslationJobs(): TranslationJob[] {
  return Array.from(jobsMap.values());
}

export function deleteTranslationJob(id: string): boolean {
  return jobsMap.delete(id);
}
