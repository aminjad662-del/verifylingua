import crypto from "crypto";
import { prisma } from "../prisma";
import { putObject, getObject } from "../storage";
import { FidelityScoreBreakdown, FidelityIssue } from "../fidelity";

export type PersistentJobStatus =
  | "queued"
  | "rendering"
  | "created"
  | "uploading"
  | "uploaded"
  | "classifying"
  | "extracting"
  | "translation_queued"
  | "translating"
  | "reconstructing"
  | "qa"
  | "repairing"
  | "rendering_preview"
  | "completed"
  | "completed_with_warnings"
  | "failed"
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

declare global {
  // eslint-disable-next-line no-var
  var __persistentJobsMap: Map<string, PersistentTranslationJob> | undefined;
}

const memoryJobs =
  globalThis.__persistentJobsMap ?? new Map<string, PersistentTranslationJob>();
globalThis.__persistentJobsMap = memoryJobs;

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
  const id = `job_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const downloadToken = crypto.randomBytes(24).toString("hex");
  const sourceKey = params.sourceKey || `sources/${id}/${params.filename}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  if (params.fileBuffer) {
    await putObject(sourceKey, params.fileBuffer, params.mimeType);
  }

  const job: PersistentTranslationJob = {
    id,
    userId: params.userId || null,
    sourceKey,
    sourceFilename: params.filename,
    sourceFormat: params.format,
    sourceMimeType: params.mimeType,
    sourceLanguage: params.sourceLang || "es",
    targetLanguage: params.targetLang,
    status: params.fileBuffer ? "uploaded" : "created",
    currentStep: params.fileBuffer ? "File uploaded and queued for processing" : "Job created, awaiting file upload",
    progress: params.fileBuffer ? 10 : 0,
    pageCount: 1,
    wordCount: 0,
    characterCount: 0,
    provider: "azure",
    createdAt: now,
    updatedAt: now,
    expiresAt,
    downloadToken,
  };

  memoryJobs.set(id, job);

  // Sync to database if reachable and not in Vitest offline mode
  if (!process.env.VITEST) {
    try {
      await prisma.translationJob.create({
        data: {
          id: job.id,
          userId: job.userId,
          sourceKey: job.sourceKey,
          sourceFilename: job.sourceFilename,
          sourceFormat: job.sourceFormat,
          sourceMimeType: job.sourceMimeType,
          sourceLanguage: job.sourceLanguage,
          targetLanguage: job.targetLanguage,
          status: job.status,
          currentStep: job.currentStep,
          progress: job.progress,
          pageCount: job.pageCount,
          provider: job.provider,
          expiresAt: new Date(job.expiresAt),
        },
      });
    } catch {
      // Database connection silent catch (in-memory resilience)
    }
  }

  return job;
}

export async function getPersistentJob(id: string): Promise<PersistentTranslationJob | null> {
  const memoryJob = memoryJobs.get(id);
  if (memoryJob) return memoryJob;

  if (!process.env.VITEST) {
    try {
      const dbJob = await prisma.translationJob.findUnique({
        where: { id },
        include: {
          qaResults: {
            include: { issues: true },
          },
        },
      });

      if (dbJob) {
        const mapped: PersistentTranslationJob = {
          id: dbJob.id,
          userId: dbJob.userId,
          documentId: dbJob.documentId,
          sourceKey: dbJob.sourceKey,
          outputKey: dbJob.outputKey,
          previewKey: dbJob.previewKey,
          sourceFilename: dbJob.sourceFilename,
          sourceFormat: dbJob.sourceFormat as any,
          sourceMimeType: dbJob.sourceMimeType,
          sourceLanguage: dbJob.sourceLanguage,
          targetLanguage: dbJob.targetLanguage,
          status: dbJob.status as PersistentJobStatus,
          currentStep: dbJob.currentStep,
          progress: dbJob.progress,
          pageCount: dbJob.pageCount,
          wordCount: dbJob.wordCount,
          characterCount: dbJob.characterCount,
          provider: dbJob.provider,
          providerJobId: dbJob.providerJobId,
          fidelityScore: dbJob.fidelityScore,
          errorCode: dbJob.errorCode,
          errorMessage: dbJob.errorMessage,
          createdAt: dbJob.createdAt.toISOString(),
          updatedAt: dbJob.updatedAt.toISOString(),
          startedAt: dbJob.startedAt?.toISOString() || null,
          completedAt: dbJob.completedAt?.toISOString() || null,
          expiresAt: dbJob.expiresAt?.toISOString() || new Date(Date.now() + 86400000).toISOString(),
          downloadToken: id,
        };
        memoryJobs.set(id, mapped);
        return mapped;
      }
    } catch {
      // Database offline
    }
  }

  return null;
}

export async function updatePersistentJob(
  id: string,
  updates: Partial<PersistentTranslationJob>
): Promise<PersistentTranslationJob | null> {
  const existing = await getPersistentJob(id);
  if (!existing) return null;

  const updated: PersistentTranslationJob = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  memoryJobs.set(id, updated);

  if (!process.env.VITEST) {
    try {
      await prisma.translationJob.update({
        where: { id },
        data: {
          status: updated.status,
          currentStep: updated.currentStep,
          progress: updated.progress,
          pageCount: updated.pageCount,
          wordCount: updated.wordCount,
          characterCount: updated.characterCount,
          provider: updated.provider,
          providerJobId: updated.providerJobId,
          fidelityScore: updated.fidelityScore,
          outputKey: updated.outputKey,
          previewKey: updated.previewKey,
          errorCode: updated.errorCode,
          errorMessage: updated.errorMessage,
          completedAt: updated.completedAt ? new Date(updated.completedAt) : undefined,
        },
      });
    } catch {
      // silent catch
    }
  }

  return updated;
}

export async function listUserJobs(userId?: string | null): Promise<PersistentTranslationJob[]> {
  const all = Array.from(memoryJobs.values());
  if (userId) {
    return all
      .filter((j) => j.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const getAllJobs = listUserJobs;

export async function deletePersistentJob(id: string): Promise<boolean> {
  memoryJobs.delete(id);
  try {
    await prisma.translationJob.delete({ where: { id } });
  } catch {
    // silent catch
  }
  return true;
}
