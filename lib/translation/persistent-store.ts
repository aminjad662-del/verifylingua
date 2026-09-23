import crypto from "crypto";
import { prisma } from "../prisma";
import { putObject, getObject } from "../storage";
import { FidelityScoreBreakdown, FidelityIssue } from "../fidelity";

import { JobStatus } from "./types";

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
    createdAt: db.createdAt instanceof Date ? db.createdAt.toISOString() : new Date(db.createdAt).toISOString(),
    updatedAt: db.updatedAt instanceof Date ? db.updatedAt.toISOString() : new Date(db.updatedAt).toISOString(),
    startedAt: db.startedAt ? (db.startedAt instanceof Date ? db.startedAt.toISOString() : new Date(db.startedAt).toISOString()) : null,
    completedAt: db.completedAt ? (db.completedAt instanceof Date ? db.completedAt.toISOString() : new Date(db.completedAt).toISOString()) : null,
    expiresAt: db.expiresAt ? (db.expiresAt instanceof Date ? db.expiresAt.toISOString() : new Date(db.expiresAt).toISOString()) : new Date(Date.now() + 86400000).toISOString(),
    downloadToken: db.downloadToken || db.id,
    layoutPreserved: db.layoutPreserved ?? true,
  };
}

/**
 * Creates a persistent translation job directly in PostgreSQL via Prisma.
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

  let validUserId: string | null = null;
  if (params.userId) {
    try {
      await prisma.user.upsert({
        where: { id: params.userId },
        update: {},
        create: {
          id: params.userId,
          email: `${params.userId}@verifylingua.internal`,
          name: params.userId,
          isGuest: false,
        },
      });
      validUserId = params.userId;
    } catch {
      validUserId = params.userId;
    }
  }

  const userSegment = validUserId || "anonymous";
  const ext = params.filename.split(".").pop()?.toLowerCase() || params.format;
  const sourceKey = params.sourceKey || `jobs/${userSegment}/${id}/source.${ext}`;
  const outputKey = `jobs/${userSegment}/${id}/output.pdf`;

  if (params.fileBuffer) {
    await putObject(sourceKey, params.fileBuffer, params.mimeType);
  }

  const initialStatus: PersistentJobStatus = params.fileBuffer ? "uploaded" : "created";
  const initialStep = params.fileBuffer
    ? "File uploaded and queued for processing"
    : "Job created, awaiting file upload";
  const initialProgress = params.fileBuffer ? 10 : 0;

  const dbJob = await prisma.translationJob.create({
    data: {
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
    },
  });

  return mapDbToJob(dbJob);
}

/**
 * Retrieves a persistent translation job directly from PostgreSQL.
 */
export async function getPersistentJob(id: string): Promise<PersistentTranslationJob | null> {
  const dbJob = await prisma.translationJob.findUnique({
    where: { id },
    include: {
      qaResults: {
        include: { issues: true },
      },
    },
  });

  if (!dbJob) return null;
  return mapDbToJob(dbJob);
}

/**
 * Updates a persistent translation job directly in PostgreSQL.
 */
export async function updatePersistentJob(
  id: string,
  updates: Partial<PersistentTranslationJob>
): Promise<PersistentTranslationJob | null> {
  const data: any = {};
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

  const existingMeta = jobMetadataCache.get(id) || {};
  if (updates.issues !== undefined) existingMeta.issues = updates.issues;
  if (updates.warnings !== undefined) existingMeta.warnings = updates.warnings;
  if (updates.fidelityBreakdown !== undefined) existingMeta.fidelityBreakdown = updates.fidelityBreakdown;
  jobMetadataCache.set(id, existingMeta);

  const updated = await prisma.translationJob.update({
    where: { id },
    data,
  });

  return mapDbToJob(updated);
}

/**
 * Lists user jobs directly from PostgreSQL, ordered by creation date descending.
 */
export async function listUserJobs(userId?: string | null): Promise<PersistentTranslationJob[]> {
  const dbJobs = await prisma.translationJob.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return dbJobs.map(mapDbToJob);
}

export const getAllJobs = listUserJobs;

/**
 * Deletes a persistent translation job directly from PostgreSQL.
 */
export async function deletePersistentJob(id: string): Promise<boolean> {
  try {
    await prisma.translationJob.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
