import { prisma } from "@/lib/prisma";

export interface PersistJobParams {
  id: string;
  userId?: string | null;
  sourceKey: string;
  outputKey?: string | null;
  sourceFilename: string;
  sourceFormat: string;
  sourceMimeType: string;
  sourceLanguage: string;
  targetLanguage: string;
  pageCount: number;
  downloadToken: string;
  serviceTier?: string;
}

/**
 * Persists a translation job record directly into the primary PostgreSQL database via Prisma.
 * Used by upload API routes while keeping the route files decoupled from direct Prisma references.
 */
export async function persistTranslationJobRecord(params: PersistJobParams) {
  return await prisma.translationJob.create({
    data: {
      id: params.id,
      userId: params.userId || null,
      sourceKey: params.sourceKey,
      outputKey: params.outputKey || null,
      sourceFilename: params.sourceFilename,
      sourceFormat: params.sourceFormat,
      sourceMimeType: params.sourceMimeType,
      sourceLanguage: params.sourceLanguage,
      targetLanguage: params.targetLanguage,
      status: "queued",
      currentStep: "Job initialized and queued for background processing",
      pageCount: params.pageCount,
      downloadToken: params.downloadToken,
      layoutPreserved: true,
    },
  });
}
