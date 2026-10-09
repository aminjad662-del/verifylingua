import crypto from "crypto";
import { putObject, getObject } from "../storage";
import { FidelityScoreBreakdown, FidelityIssue } from "../fidelity";

import { JobStatus } from "./types";
import { generateJobTrackingId, getTranslationJob } from "./store";

export type PersistentJobStatus =
  | JobStatus
  | "created"
  | "uploading"
  | "classifying"
  | "translation_queued"
  | "repairing"
  | "rendering_preview"
  | "rendering"
  | "cancelled"
  | "expired"
  | "deleted";

export interface PersistentTranslationJob {
  id: string;
  userId?: string | null;
  documentId?: string | null;
  sourceKey: string;
  outputKey?: string | null;
  previewKey?: string | null;
  sourceFilename: string;
  sourceFormat: "pdf" | "docx" | "png" | "jpg";
  sourceMimeType: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: PersistentJobStatus;
  currentStep: string;
  progress: number;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  provider: string;
  providerJobId?: string | null;
  fidelityScore?: number | null;
  fidelityBreakdown?: FidelityScoreBreakdown | null;
  issues?: (FidelityIssue | string)[];
  warnings?: string[];
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  expiresAt: string;
  downloadToken: string;
  layoutPreserved?: boolean;
}

const jobMetadataCache = new Map<
  string,
  { issues?: (FidelityIssue | string)[]; warnings?: string[]; fidelityBreakdown?: FidelityScoreBreakdown | null }
>();

// Persistent jobs memory store (singleton across module reloads)
const globalForPersistent = globalThis as unknown as {
  __persistentJobsMemory?: Map<string, any>;
};
const persistentJobsMemory =
  globalForPersistent.__persistentJobsMemory ?? new Map<string, any>();
if (process.env.NODE_ENV !== "production") {
  globalForPersistent.__persistentJobsMemory = persistentJobsMemory;
}

function mapDbToJob(db: any): PersistentTranslationJob {
  const cached = jobMetadataCache.get(db.id);
  return {
    id: db.id,
    userId: db.userId || null,
    documentId: db.documentId || null,
    sourceKey: db.sourceKey,
    outputKey: db.outputKey || null,
    previewKey: db.previewKey || null,
    sourceFilename: db.sourceFilename,
    sourceFormat: (db.sourceFormat?.toLowerCase() as any) || "pdf",
    sourceMimeType: db.sourceMimeType || "application/octet-stream",
    sourceLanguage: db.sourceLanguage,
    targetLanguage: db.targetLanguage,
    status: db.status as PersistentJobStatus,
    currentStep: db.currentStep || "Processing",
    progress: db.progress || 0,
    pageCount: db.pageCount || 1,
    wordCount: db.wordCount || 0,
    characterCount: db.characterCount || 0,
    provider: db.provider || "azure",
    providerJobId: db.providerJobId || null,
    fidelityScore: db.fidelityScore ?? null,
    fidelityBreakdown: cached?.fidelityBreakdown ?? null,
    issues: cached?.issues ?? (db.errorMessage ? [db.errorMessage] : []),
    warnings: cached?.warnings ?? [],
    errorCode: db.errorCode || undefined,
    errorMessage: db.errorMessage || undefined,
    createdAt: db.createdAt instanceof Date ? db.createdAt.toISOString() : new Date(db.createdAt || Date.now()).toISOString(),
    updatedAt: db.updatedAt instanceof Date ? db.updatedAt.toISOString() : new Date(db.updatedAt || Date.now()).toISOString(),
    startedAt: db.startedAt ? (db.startedAt instanceof Date ? db.startedAt.toISOString() : new Date(db.startedAt).toISOString()) : null,
    completedAt: db.completedAt ? (db.completedAt instanceof Date ? db.completedAt.toISOString() : new Date(db.completedAt).toISOString()) : null,
    expiresAt: db.expiresAt ? (db.expiresAt instanceof Date ? db.expiresAt.toISOString() : new Date(db.expiresAt).toISOString()) : new Date(Date.now() + 86400000).toISOString(),
    downloadToken: db.downloadToken || db.id,
    layoutPreserved: db.layoutPreserved ?? true,
  };
}

/**
 * Creates a persistent translation job in the store.
 */
export async function createPersistentJob(params: {
  userId?: string | null;
  filename: string;
  format: "pdf" | "docx" | "png" | "jpg";
  mimeType: string;
  sourceLang?: string;
  targetLang: string;
  fileBuffer?: Buffer;
  sizeBytes?: number;
  sourceKey?: string;
}): Promise<PersistentTranslationJob> {
  const id = crypto.randomUUID();
  const downloadToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const validUserId = params.userId || null;
  const userSegment = validUserId || "anonymous";
  const ext = params.filename.split(".").pop()?.toLowerCase() || params.format;
  const sourceKey = params.sourceKey || `jobs/${userSegment}/${id}/source.${ext}`;
  const outputKey = `jobs/${userSegment}/${id}/output.pdf`;

  if (params.fileBuffer) {
    try {
      await putObject(sourceKey, params.fileBuffer, params.mimeType);
    } catch {}
  }

  const initialStatus: PersistentJobStatus = params.fileBuffer ? "uploaded" : "created";
  const initialStep = params.fileBuffer
    ? "File uploaded and queued for processing"
    : "Job created, awaiting file upload";
  const initialProgress = params.fileBuffer ? 10 : 0;

  const jobData = {
    id,
    userId: validUserId,
    sourceKey,
    outputKey,
    sourceFilename: params.filename,
    sourceFormat: params.format,
    sourceMimeType: params.mimeType,
    sourceLanguage: params.sourceLang || "es",
    targetLanguage: params.targetLang,
    status: initialStatus,
    currentStep: initialStep,
    progress: initialProgress,
    pageCount: 1,
    wordCount: 0,
    characterCount: 0,
    provider: "azure",
    downloadToken,
    expiresAt,
    layoutPreserved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  persistentJobsMemory.set(id, jobData);
  return mapDbToJob(jobData);
}

/**
 * Retrieves a persistent translation job from the store.
 */
export async function getPersistentJob(id: string): Promise<PersistentTranslationJob | null> {
  const job = persistentJobsMemory.get(id) || null;
  if (!job) return null;
  return mapDbToJob(job);
}

/**
 * Updates a persistent translation job in the store.
 */
export async function updatePersistentJob(
  id: string,
  updates: Partial<PersistentTranslationJob>
): Promise<PersistentTranslationJob | null> {
  let existing = persistentJobsMemory.get(id);
  if (!existing) {
    const memJob = getTranslationJob(id);
    if (memJob) {
      existing = {
        id: memJob.id,
        userId: memJob.userId || null,
        sourceFilename: memJob.fileName || "document.pdf",
        sourceFormat: memJob.fileFormat || "pdf",
        sourceMimeType: "application/pdf",
        sourceLanguage: memJob.sourceLang || "auto",
        targetLanguage: memJob.targetLang || "en",
        status: memJob.status,
        currentStep: memJob.currentStep,
        progress: memJob.progress,
        pageCount: memJob.pageCount,
        sourceKey: memJob.sourceKey,
        outputKey: memJob.outputKey,
        downloadToken: memJob.downloadToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      existing = {
        id,
        sourceFilename: "document.pdf",
        sourceFormat: "pdf",
        sourceMimeType: "application/pdf",
        sourceLanguage: "auto",
        targetLanguage: "en",
        status: "queued",
        currentStep: "Processing",
        progress: 0,
        pageCount: 1,
        sourceKey: `jobs/anonymous/${id}/source.pdf`,
        outputKey: `jobs/anonymous/${id}/output.pdf`,
        downloadToken: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }
  const data: any = { ...existing, id };

  if (updates.status !== undefined) data.status = updates.status;
  if (updates.currentStep !== undefined) data.currentStep = updates.currentStep;
  if (updates.progress !== undefined) data.progress = updates.progress;
  if (updates.pageCount !== undefined) data.pageCount = updates.pageCount;
  if (updates.wordCount !== undefined) data.wordCount = updates.wordCount;
  if (updates.characterCount !== undefined) data.characterCount = updates.characterCount;
  if (updates.provider !== undefined) data.provider = updates.provider;
  if (updates.providerJobId !== undefined) data.providerJobId = updates.providerJobId;
  if (updates.fidelityScore !== undefined) data.fidelityScore = updates.fidelityScore;
  if (updates.outputKey !== undefined) data.outputKey = updates.outputKey;
  if (updates.previewKey !== undefined) data.previewKey = updates.previewKey;
  if ("errorCode" in updates) data.errorCode = updates.errorCode ?? null;
  if ("errorMessage" in updates) data.errorMessage = updates.errorMessage ?? null;
  if (updates.downloadToken !== undefined) data.downloadToken = updates.downloadToken;
  if (updates.layoutPreserved !== undefined) data.layoutPreserved = updates.layoutPreserved;
  if ("completedAt" in updates) {
    data.completedAt = updates.completedAt ? new Date(updates.completedAt) : null;
  }
  if ("startedAt" in updates) {
    data.startedAt = updates.startedAt ? new Date(updates.startedAt) : null;
  }
  data.updatedAt = new Date();

  const existingMeta = jobMetadataCache.get(id) || {};
  if (updates.issues !== undefined) existingMeta.issues = updates.issues;
  if (updates.warnings !== undefined) existingMeta.warnings = updates.warnings;
  if (updates.fidelityBreakdown !== undefined) existingMeta.fidelityBreakdown = updates.fidelityBreakdown;
  jobMetadataCache.set(id, existingMeta);

  persistentJobsMemory.set(id, data);
  return mapDbToJob(data);
}

/**
 * Lists user jobs, ordered by creation date descending.
 */
export async function listUserJobs(userId?: string | null): Promise<PersistentTranslationJob[]> {
  const memJobs = Array.from(persistentJobsMemory.values()).filter(
    (j) => !userId || j.userId === userId
  );
  memJobs.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
  return memJobs.map(mapDbToJob);
}

export const getAllJobs = listUserJobs;

/**
 * Deletes a persistent translation job from the store.
 */
export async function deletePersistentJob(id: string): Promise<boolean> {
  return persistentJobsMemory.delete(id);
}
