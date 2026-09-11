import { describe, it, expect } from "vitest";
import { ProjectService } from "../lib/services/project-service";

describe("Client Workspace & Project Lifecycle Service Suite", () => {
  describe("1. Project Directory & Data Mapping", () => {
    it("lists all active and completed translation projects", async () => {
      const projects = await ProjectService.listProjects();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);

      const first = projects[0];
      expect(first.id).toBeDefined();
      expect(first.name).toBeDefined();
      expect(first.sourceLang).toBeDefined();
      expect(first.targetLang).toBeDefined();
      expect(first.status).toBeDefined();
    });

    it("filters projects by search term across document name and languages", async () => {
      const allProjects = await ProjectService.listProjects();
      if (allProjects.length > 0) {
        const searchTerm = allProjects[0].sourceLang;
        const filtered = await ProjectService.listProjects(undefined, { search: searchTerm });
        expect(filtered.length).toBeGreaterThan(0);
        expect(
          filtered.every(
            (p) =>
              p.sourceLang.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.id.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ).toBe(true);
      }
    });

    it("retrieves a single project detail by ID accurately", async () => {
      const allProjects = await ProjectService.listProjects();
      const targetId = allProjects[0].id;

      const project = await ProjectService.getProjectById(targetId);
      expect(project).not.toBeNull();
      expect(project?.id).toBe(targetId);
      expect(project?.pageCount).toBeGreaterThan(0);
    });
  });

  describe("2. Formal Revision Lifecycle", () => {
    it("submits and logs a formal revision request with reason code", async () => {
      const allProjects = await ProjectService.listProjects();
      const targetId = allProjects[0].id;

      const revision = await ProjectService.submitRevision(targetId, {
        reason: "TRANSLATION_CORRECTION",
        notes: "Test revision: please verify applicant surname spelling.",
        requestedBy: "attorney@example.com",
      });

      expect(revision.id).toBeDefined();
      expect(revision.projectId).toBe(targetId);
      expect(revision.status).toBe("PENDING_REVIEW");
      expect(revision.reason).toBe("TRANSLATION_CORRECTION");

      // Verify that revisions list for this project returns the new entry
      const revisions = await ProjectService.listRevisions(targetId);
      expect(revisions.some((r) => r.id === revision.id)).toBe(true);
    });
  });

  describe("3. Quota & Usage Telemetry", () => {
    it("computes accurate monthly page quota statistics", async () => {
      const stats = await ProjectService.getUsageStats();

      expect(stats.monthlyQuotaPages).toBe(100);
      expect(stats.pagesUsedThisPeriod).toBeGreaterThanOrEqual(0);
      expect(stats.pagesRemaining).toBeGreaterThanOrEqual(0);
      expect(stats.percentUsed).toBeLessThanOrEqual(100);
      expect(stats.totalProjectsCount).toBeGreaterThan(0);
    });
  });
});
