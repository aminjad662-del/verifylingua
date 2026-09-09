import crypto from "crypto";

export interface UserRecord {
  id: string; // Clerk user_id
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  filename: string;
  format: "pdf" | "png" | "jpg";
  mimeType: string;
  sizeBytes: number;
  r2SourceKey: string; // strictly ${userId}/${documentId}/${filename}
  r2OutputKey?: string | null;
  sha256Hash: string;
  pageCount: number;
  hasEmbeddedImages: boolean;
  hasTables: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationJobRecord {
  id: string;
  documentId: string;
  userId: string;
  sourceLang: string;
  targetLang: string;
  status: "queued" | "extracting" | "translating" | "rendering" | "done" | "error";
  progress: number;
  currentStep: string;
  providerUsed?: string | null;
  fidelityScore?: number | null;
  fidelityBreakdown?: Record<string, any> | null;
  ocrConfidence?: number | null;
  r2ResultKey?: string | null;
  downloadToken: string;
  errorMessage?: string | null;
  verificationDigest?: {
    verified: boolean;
    validDocumentType: boolean;
    sourceSignatureMatched: boolean;
    notPlaceholder: boolean;
    outputSha256: string;
    verifiedAt: string;
  } | null;
  createdAt: string;
  completedAt?: string | null;
  updatedAt: string;
}

export interface JobStatusEventRecord {
  id: string;
  jobId: string;
  userId: string;
  status: string;
  message: string;
  metadata?: Record<string, any> | null;
  timestamp: string;
}

export interface RetentionSettingsRecord {
  id: string;
  userId: string;
  autoDeleteEnabled: boolean;
  retentionDays: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Deterministically constructs and validates a tenant-isolated R2 Object Key.
 * Enforces format: ${userId}/${documentId}/${sanitizedFilename}
 */
export function generateR2ObjectKey(userId: string, documentId: string, filename: string): string {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("Data Isolation Violation: userId is required for R2 object storage key");
  }
  if (!documentId || typeof documentId !== "string" || documentId.trim() === "") {
    throw new Error("Data Isolation Violation: documentId is required for R2 object storage key");
  }
  // Sanitize path traversal attempts
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanDocId = documentId.replace(/[^a-zA-Z0-9_-]/g, "_");

  return `${cleanUserId}/${cleanDocId}/${safeFilename}`;
}

/**
 * Isolated Tenant In-Memory Repository
 * Provides query-layer multi-tenancy enforcement.
 */
class IsolatedDataRepository {
  private users = new Map<string, UserRecord>();
  private documents = new Map<string, DocumentRecord>();
  private jobs = new Map<string, TranslationJobRecord>();
  private events: JobStatusEventRecord[] = [];
  private retention = new Map<string, RetentionSettingsRecord>();

  // ── User Management ────────────────────────────────────────────────────────
  async upsertUser(user: { id: string; email: string; name?: string | null }): Promise<UserRecord> {
    const existing = this.users.get(user.id);
    const now = new Date().toISOString();
    const record: UserRecord = {
      id: user.id,
      email: user.email,
      name: user.name ?? existing?.name ?? null,
      imageUrl: existing?.imageUrl ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.users.set(user.id, record);
    return record;
  }

  async getUser(userId: string): Promise<UserRecord | null> {
    return this.users.get(userId) ?? null;
  }

  // ── Document Isolation Layer ──────────────────────────────────────────────
  async createDocument(
    userId: string,
    params: {
      filename: string;
      format: "pdf" | "png" | "jpg";
      mimeType: string;
      sizeBytes: number;
      sha256Hash: string;
      pageCount?: number;
      hasEmbeddedImages?: boolean;
      hasTables?: boolean;
    }
  ): Promise<DocumentRecord> {
    if (!userId) throw new Error("Unauthorized: userId required");
    const docId = `doc_${crypto.randomUUID()}`;
    const r2Key = generateR2ObjectKey(userId, docId, params.filename);
    const now = new Date().toISOString();

    const doc: DocumentRecord = {
      id: docId,
      userId,
      filename: params.filename,
      format: params.format,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      r2SourceKey: r2Key,
      r2OutputKey: null,
      sha256Hash: params.sha256Hash,
      pageCount: params.pageCount ?? 1,
      hasEmbeddedImages: params.hasEmbeddedImages ?? false,
      hasTables: params.hasTables ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(docId, doc);
    return doc;
  }

  /**
   * Strictly returns documents owned by the caller.
   * Impossible for User A to retrieve User B's documents.
   */
  async listUserDocuments(userId: string): Promise<DocumentRecord[]> {
    if (!userId) return [];
    return Array.from(this.documents.values()).filter((d) => d.userId === userId);
  }

  /**
   * Retrieves document by ID only if owned by userId.
   * If document exists but belongs to someone else, returns null.
   */
  async getDocumentById(userId: string, documentId: string): Promise<DocumentRecord | null> {
    if (!userId || !documentId) return null;
    const doc = this.documents.get(documentId);
    if (!doc || doc.userId !== userId) {
      return null; // Strict isolation: act as 404/not found
    }
    return doc;
  }

  // ── Translation Jobs Isolation Layer ───────────────────────────────────────
  async createJob(
    userId: string,
    params: {
      documentId: string;
      sourceLang: string;
      targetLang: string;
    }
  ): Promise<TranslationJobRecord> {
    if (!userId) throw new Error("Unauthorized: userId required");
    const doc = await this.getDocumentById(userId, params.documentId);
    if (!doc) {
      throw new Error("Access Denied: documentId does not exist or belong to user");
    }

    const jobId = `job_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const downloadToken = crypto.randomBytes(32).toString("hex");

    const job: TranslationJobRecord = {
      id: jobId,
      documentId: params.documentId,
      userId,
      sourceLang: params.sourceLang,
      targetLang: params.targetLang,
      status: "queued",
      progress: 0,
      currentStep: "Document translation job enqueued in durable pipeline.",
      downloadToken,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(jobId, job);
    await this.recordJobEvent(userId, jobId, "queued", "Job enqueued in Inngest runner");
    return job;
  }

  async listUserJobs(userId: string): Promise<TranslationJobRecord[]> {
    if (!userId) return [];
    return Array.from(this.jobs.values()).filter((j) => j.userId === userId);
  }

  async getJobById(userId: string, jobId: string): Promise<TranslationJobRecord | null> {
    if (!userId || !jobId) return null;
    const job = this.jobs.get(jobId);
    if (!job || job.userId !== userId) {
      return null; // Strict isolation
    }
    return job;
  }

  async updateJob(
    userId: string,
    jobId: string,
    updates: Partial<Omit<TranslationJobRecord, "id" | "userId" | "documentId" | "createdAt">>
  ): Promise<TranslationJobRecord> {
    const job = await this.getJobById(userId, jobId);
    if (!job) throw new Error("Job not found or access denied");

    const updated: TranslationJobRecord = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  // ── Events & Audit Isolation Layer ─────────────────────────────────────────
  async recordJobEvent(
    userId: string,
    jobId: string,
    status: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<JobStatusEventRecord> {
    const event: JobStatusEventRecord = {
      id: `evt_${crypto.randomUUID()}`,
      jobId,
      userId,
      status,
      message,
      metadata: metadata ?? null,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }

  async listJobEvents(userId: string, jobId: string): Promise<JobStatusEventRecord[]> {
    // Verify job belongs to user
    const job = await this.getJobById(userId, jobId);
    if (!job) return [];
    return this.events.filter((e) => e.jobId === jobId && e.userId === userId);
  }

  // ── Retention Settings Isolation Layer ────────────────────────────────────
  async getRetentionSettings(userId: string): Promise<RetentionSettingsRecord> {
    if (!userId) throw new Error("userId required");
    const existing = this.retention.get(userId);
    if (existing) return existing;

    const def: RetentionSettingsRecord = {
      id: `ret_${crypto.randomUUID()}`,
      userId,
      autoDeleteEnabled: false, // Keep indefinitely by default
      retentionDays: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.retention.set(userId, def);
    return def;
  }

  async updateRetentionSettings(
    userId: string,
    settings: { autoDeleteEnabled: boolean; retentionDays?: number }
  ): Promise<RetentionSettingsRecord> {
    const current = await this.getRetentionSettings(userId);
    const updated: RetentionSettingsRecord = {
      ...current,
      autoDeleteEnabled: settings.autoDeleteEnabled,
      retentionDays: settings.retentionDays ?? current.retentionDays,
      updatedAt: new Date().toISOString(),
    };
    this.retention.set(userId, updated);
    return updated;
  }

  // Helper for test cleanup
  clear() {
    this.users.clear();
    this.documents.clear();
    this.jobs.clear();
    this.events = [];
    this.retention.clear();
  }
}

export const isolatedDb = new IsolatedDataRepository();
