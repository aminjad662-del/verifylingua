/**
 * Project and Document Service
 * Unified domain service bridging translation jobs, orders, files, revisions, and usage.
 */

import { getAllJobs, getPersistentJob, PersistentTranslationJob } from "../translation/persistent-store";
import { getAllOrders, getOrderById, OrderStatus } from "../dashboard/store";

export interface ProjectSummary {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  status: string;
  progress: number;
  currentStep: string;
  format: "pdf" | "docx" | "png" | "jpg";
  fileSizeBytes: number;
  pageCount: number;
  fidelityScore?: number;
  serviceTier: "AUTOMATED" | "CERTIFIED";
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  revisionCount: number;
}

export interface ProjectRevision {
  id: string;
  projectId: string;
  reason: "LAYOUT_DRIFT" | "TRANSLATION_CORRECTION" | "MISSING_ELEMENT" | "FORMATTING" | "OTHER";
  status: "PENDING_REVIEW" | "IN_REVISION" | "RESOLVED" | "REJECTED";
  notes: string;
  requestedBy: string;
  requestedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// In-memory persistent revision store
const globalForRevisions = globalThis as unknown as {
  __projectRevisions?: Map<string, ProjectRevision[]>;
};
const projectRevisions = globalForRevisions.__projectRevisions ?? new Map<string, ProjectRevision[]>();
if (process.env.NODE_ENV !== "production") {
  globalForRevisions.__projectRevisions = projectRevisions;
}

/**
 * Normalizes an internal PersistentTranslationJob into a ProjectSummary
 */
function normalizeJobToProject(job: PersistentTranslationJob): ProjectSummary {
  const revisions = projectRevisions.get(job.id) || [];
  return {
    id: job.id,
    name: job.sourceFilename,
    sourceLang: job.sourceLanguage || "auto",
    targetLang: job.targetLanguage,
    status: job.status.toUpperCase(),
    progress: job.progress || 0,
    currentStep: job.currentStep || "Processing",
    format: job.sourceFormat || "pdf",
    fileSizeBytes: 1024 * (job.pageCount || 1) * 250,
    pageCount: job.pageCount || 1,
    fidelityScore: job.fidelityScore ?? (job.status === "completed" ? 98 : undefined),
    serviceTier: "AUTOMATED",
    downloadUrl: job.status === "completed" || (job.status as string) === "ready"
      ? `/api/translate/download/${job.id}?token=${job.downloadToken}`
      : undefined,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    userId: job.userId || undefined,
    revisionCount: revisions.length,
  };
}

export class ProjectService {
  /**
   * List all projects, optionally scoped to a specific user.
   */
  static async listProjects(userId?: string, options?: { status?: string; search?: string }): Promise<ProjectSummary[]> {
    const jobs = await getAllJobs();
    const orders = getAllOrders();

    // 1. Map Translation Jobs
    let projects: ProjectSummary[] = jobs.map(normalizeJobToProject);

    // 2. Map Orders from store for backward compatibility
    for (const order of orders) {
      const existing = projects.find((p) => p.id === order.id || p.id === order.publicCode);
      if (!existing) {
        const revs = projectRevisions.get(order.id) || [];
        const firstFile = order.uploadedFiles?.[0];
        projects.push({
          id: order.id,
          name: firstFile?.name || `Document_${order.publicCode}.pdf`,
          sourceLang: order.sourceLang,
          targetLang: order.targetLangs?.[0] || "en",
          status: order.status,
          progress: order.status === "COMPLETED" ? 100 : 65,
          currentStep: order.timeline[order.timeline.length - 1]?.title || "Processing",
          format: "pdf",
          fileSizeBytes: firstFile?.sizeBytes || 524288,
          pageCount: order.pageCount || 2,
          fidelityScore: 99,
          serviceTier: order.serviceType === "STANDARD" ? "AUTOMATED" : "CERTIFIED",
          downloadUrl: order.status === "COMPLETED" ? `/api/order/${order.id}/proof` : undefined,
          createdAt: order.submittedAt,
          updatedAt: order.completedAt || order.submittedAt,
          userId: order.clientId,
          revisionCount: revs.length,
        });
      }
    }

    // Filter by user if specified
    if (userId) {
      projects = projects.filter((p) => !p.userId || p.userId === userId);
    }

    // Filter by search query
    if (options?.search) {
      const q = options.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.sourceLang.toLowerCase().includes(q) ||
          p.targetLang.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (options?.status && options.status !== "ALL") {
      projects = projects.filter((p) => p.status.toUpperCase() === options.status?.toUpperCase());
    }

    // Sort newest first
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get single project detail by ID
   */
  static async getProjectById(projectId: string): Promise<ProjectSummary | null> {
    const job = await getPersistentJob(projectId);
    if (job) return normalizeJobToProject(job);

    const order = getOrderById(projectId);
    if (order) {
      const revs = projectRevisions.get(order.id) || [];
      const firstFile = order.uploadedFiles?.[0];
      return {
        id: order.id,
        name: firstFile?.name || `Document_${order.publicCode}.pdf`,
        sourceLang: order.sourceLang,
        targetLang: order.targetLangs?.[0] || "en",
        status: order.status,
        progress: order.status === "COMPLETED" ? 100 : 65,
        currentStep: order.timeline[order.timeline.length - 1]?.title || "Processing",
        format: "pdf",
        fileSizeBytes: firstFile?.sizeBytes || 524288,
        pageCount: order.pageCount || 2,
        fidelityScore: 99,
        serviceTier: order.serviceType === "STANDARD" ? "AUTOMATED" : "CERTIFIED",
        downloadUrl: order.status === "COMPLETED" ? `/api/order/${order.id}/proof` : undefined,
        createdAt: order.submittedAt,
        updatedAt: order.completedAt || order.submittedAt,
        userId: order.clientId,
        revisionCount: revs.length,
      };
    }

    return null;
  }

  /**
   * Submit formal revision request for a project
   */
  static async submitRevision(
    projectId: string,
    params: {
      reason: ProjectRevision["reason"];
      notes: string;
      requestedBy: string;
    }
  ): Promise<ProjectRevision> {
    const revision: ProjectRevision = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      projectId,
      reason: params.reason,
      status: "PENDING_REVIEW",
      notes: params.notes,
      requestedBy: params.requestedBy,
      requestedAt: new Date().toISOString(),
    };

    const existing = projectRevisions.get(projectId) || [];
    existing.unshift(revision);
    projectRevisions.set(projectId, existing);

    return revision;
  }

  /**
   * List all revisions for a project
   */
  static async listRevisions(projectId: string): Promise<ProjectRevision[]> {
    return projectRevisions.get(projectId) || [];
  }

  /**
   * Get aggregated usage statistics
   */
  static async getUsageStats(userId?: string) {
    const projects = await this.listProjects(userId);
    const totalPages = projects.reduce((acc, p) => acc + (p.pageCount || 1), 0);
    const completedProjects = projects.filter((p) => p.status === "COMPLETED" || p.status === "READY").length;
    const quota = 100; // default monthly pages quota for Pro tier

    return {
      monthlyQuotaPages: quota,
      pagesUsedThisPeriod: totalPages,
      pagesRemaining: Math.max(0, quota - totalPages),
      totalProjectsCount: projects.length,
      completedProjectsCount: completedProjects,
      activeProjectsCount: projects.length - completedProjects,
      percentUsed: Math.min(100, Math.round((totalPages / quota) * 100)),
    };
  }
}
