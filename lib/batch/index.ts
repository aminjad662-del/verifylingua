import JSZip from "jszip";
import { DocumentFormat, TranslationQualityGate } from "../translation/types";
import { validateInputFile, processTranslationJob } from "../translation/pipeline";
import { createTranslationJob } from "../translation/store";

export interface BatchItemInput {
  fileName: string;
  fileBuffer: Buffer;
  sourceLang?: string;
  targetLang?: string;
  serviceTier?: "automated" | "professional" | "certified";
}

export interface BatchItemRecord {
  id: string;
  batchId: string;
  fileName: string;
  fileFormat: DocumentFormat;
  fileSizeBytes: number;
  sourceLang: string;
  targetLang: string;
  serviceTier: "automated" | "professional" | "certified";
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  error?: string;
  outputBuffer?: Buffer;
  outputFileName?: string;
  qualityGate?: TranslationQualityGate;
  processedAt?: string;
}

export interface BatchJobRecord {
  id: string;
  name: string;
  createdAt: string;
  completedAt?: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED";
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  inProgressFiles: number;
  items: BatchItemRecord[];
  summary: {
    successRate: number;
    totalBytes: number;
    deliveredBytes: number;
  };
}

// In-memory batch job store
const batchStore = new Map<string, BatchJobRecord>();

export function createBatchJob(
  name: string,
  items: BatchItemInput[],
  defaultTargetLang: string = "en",
  defaultServiceTier: "automated" | "professional" | "certified" = "automated"
): BatchJobRecord {
  const batchId = "batch_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const records: BatchItemRecord[] = items.map((item, idx) => {
    const validation = validateInputFile(item.fileBuffer, item.fileName);
    return {
      id: `item_${batchId}_${idx + 1}`,
      batchId,
      fileName: item.fileName,
      fileFormat: validation.format,
      fileSizeBytes: item.fileBuffer.length,
      sourceLang: item.sourceLang || "auto",
      targetLang: item.targetLang || defaultTargetLang,
      serviceTier: item.serviceTier || defaultServiceTier,
      status: "QUEUED",
      progress: 0,
    };
  });

  const totalBytes = items.reduce((sum, item) => sum + item.fileBuffer.length, 0);

  const batch: BatchJobRecord = {
    id: batchId,
    name: name || `Batch Translation (${items.length} files)`,
    createdAt: now,
    status: "QUEUED",
    totalFiles: records.length,
    completedFiles: 0,
    failedFiles: 0,
    inProgressFiles: 0,
    items: records,
    summary: {
      successRate: 0,
      totalBytes,
      deliveredBytes: 0,
    },
  };

  batchStore.set(batchId, batch);
  return batch;
}

export function getBatchJob(batchId: string): BatchJobRecord | undefined {
  return batchStore.get(batchId);
}

export function getAllBatchJobs(): BatchJobRecord[] {
  return Array.from(batchStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Processes a batch job asynchronously with partial failure resilience.
 * If 1 of N files encounters an issue, the remaining files still complete successfully.
 */
export async function executeBatchJob(
  batchId: string,
  fileBuffers: Map<string, Buffer>
): Promise<BatchJobRecord> {
  const batch = batchStore.get(batchId);
  if (!batch) throw new Error(`Batch ${batchId} not found.`);

  batch.status = "PROCESSING";

  for (const item of batch.items) {
    const buffer = fileBuffers.get(item.id) || fileBuffers.get(item.fileName);
    if (!buffer) {
      item.status = "FAILED";
      item.error = "File buffer not found in payload.";
      batch.failedFiles++;
      continue;
    }

    const validation = validateInputFile(buffer, item.fileName);
    if (validation.error) {
      item.status = "FAILED";
      item.error = validation.error;
      batch.failedFiles++;
      continue;
    }

    item.status = "PROCESSING";
    item.progress = 25;

    try {
      // Create individual translation job
      const job = createTranslationJob({
        fileName: item.fileName,
        fileFormat: item.fileFormat,
        fileSize: buffer.length,
        sourceLang: item.sourceLang === "auto" ? "es" : item.sourceLang,
        targetLang: item.targetLang,
        originalBuffer: buffer,
      });

      // Execute pipeline
      const completedJob = await processTranslationJob(job, {
        sourceLang: job.sourceLang,
        targetLang: job.targetLang,
        serviceTier: item.serviceTier,
      });

      if (completedJob.status === "ready" && completedJob.translatedBuffer) {
        item.status = "COMPLETED";
        item.progress = 100;
        item.outputBuffer = completedJob.translatedBuffer;
        const ext = item.fileName.split(".").pop();
        const base = item.fileName.replace(/\.[^/.]+$/, "");
        item.outputFileName = `${base}_${item.targetLang.toUpperCase()}_translated.${ext}`;
        item.qualityGate = completedJob.qualityGate;
        item.processedAt = new Date().toISOString();
        batch.completedFiles++;
        batch.summary.deliveredBytes += completedJob.translatedBuffer.length;
      } else {
        item.status = "FAILED";
        item.error = completedJob.error || "Translation processing failed.";
        batch.failedFiles++;
      }
    } catch (err: any) {
      item.status = "FAILED";
      item.error = err.message || "Failed to process item.";
      batch.failedFiles++;
    }
  }

  // Update overall batch status
  if (batch.completedFiles === batch.totalFiles) {
    batch.status = "COMPLETED";
  } else if (batch.completedFiles > 0 && batch.failedFiles > 0) {
    batch.status = "PARTIALLY_COMPLETED";
  } else if (batch.failedFiles === batch.totalFiles) {
    batch.status = "FAILED";
  } else {
    batch.status = "COMPLETED";
  }

  batch.completedAt = new Date().toISOString();
  batch.summary.successRate =
    batch.totalFiles > 0 ? Math.round((batch.completedFiles / batch.totalFiles) * 100) : 0;

  return batch;
}

/**
 * Generates a ZIP archive bundle containing all translated files and a structured audit manifest
 */
export async function generateBatchZipBundle(batchId: string): Promise<Buffer> {
  const batch = batchStore.get(batchId);
  if (!batch) throw new Error(`Batch ${batchId} not found.`);

  const zip = new JSZip();

  // 1. Add translated documents
  let addedCount = 0;
  for (const item of batch.items) {
    if (item.status === "COMPLETED" && item.outputBuffer && item.outputFileName) {
      zip.file(item.outputFileName, item.outputBuffer);
      addedCount++;
    }
  }

  if (addedCount === 0 && batch.totalFiles > 0) {
    throw new Error("No successfully translated documents found in batch to bundle.");
  }

  // 2. Add manifest.json
  const manifest = {
    batchId: batch.id,
    name: batch.name,
    createdAt: batch.createdAt,
    completedAt: batch.completedAt,
    status: batch.status,
    totalFiles: batch.totalFiles,
    completedFiles: batch.completedFiles,
    failedFiles: batch.failedFiles,
    files: batch.items.map((item) => ({
      id: item.id,
      originalName: item.fileName,
      translatedName: item.outputFileName || null,
      format: item.fileFormat,
      sourceLang: item.sourceLang,
      targetLang: item.targetLang,
      serviceTier: item.serviceTier,
      status: item.status,
      error: item.error || null,
      qualityGate: item.qualityGate || null,
    })),
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 3. Add Human-readable audit report
  const report = [
    "==================================================",
    "VERIFYLINGUA BATCH TRANSLATION DELIVERY REPORT",
    "==================================================",
    `Batch ID:        ${batch.id}`,
    `Batch Name:      ${batch.name}`,
    `Created At:      ${batch.createdAt}`,
    `Completed At:    ${batch.completedAt || new Date().toISOString()}`,
    `Status:          ${batch.status}`,
    `Success Rate:    ${batch.summary.successRate}% (${batch.completedFiles}/${batch.totalFiles} files)`,
    "",
    "FILE SUMMARY:",
    ...batch.items.map(
      (item, i) =>
        `[${i + 1}] ${item.fileName} -> ${item.outputFileName || "FAILED"} | Status: ${item.status}${item.error ? ` (Error: ${item.error})` : ""}`
    ),
    "",
    "LEGAL NOTATION:",
    "Translations marked under CERTIFIED tier conform to 8 CFR 103.2(b)(3).",
    "Translations marked under AUTOMATED tier are machine outputs and uncertified.",
    "VerifyLingua ATA Corporate Member #278190.",
  ].join("\n");

  zip.file("BATCH_AUDIT_REPORT.txt", report);

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}
