import { describe, it, expect, beforeEach, vi } from "vitest";
import * as adminModule from "@/supabase/admin";
import { inngest } from "@/src/inngest/client";
import { POST as handleRequest } from "@/app/api/translations/request/route";
import { POST as handleApprove } from "@/app/api/translations/approve/route";
import { GET as handleGetStatus } from "@/app/api/translations/[orderId]/route";
import { createTranslationJob, updateTranslationJob } from "@/lib/translation/store";

describe("Next.js API Routes - Certified Translation Pipeline", () => {
  let mockJob: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockJob = {
      id: "uuid-job-1",
      order_id: "ord_api_test_1",
      user_id: "usr_client_1",
      source_path: "source_documents/cert.pdf",
      source_lang: "en",
      target_lang: "fr",
      doc_type: "birth_certificate",
      status: "pending_review",
      draft_path: "translated_documents/ord_api_test_1/draft.pdf",
      final_path: null,
      qa_report: { errors: [], warnings: [], stats: { totalBlocks: 10, checkedBlocks: 10, errorCount: 0, warningCount: 0 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSupabase = {
      from: vi.fn(() => {
        let pendingUpdate: any = null;
        let filterVal: any = null;

        const builder: any = {
          select: vi.fn(() => builder),
          upsert: vi.fn((data: any) => {
            mockJob = { ...mockJob, ...data };
            return { error: null };
          }),
          update: vi.fn((data: any) => {
            pendingUpdate = data;
            return builder;
          }),
          eq: vi.fn((_col: string, val: any) => {
            filterVal = val;
            if (pendingUpdate && filterVal === mockJob.order_id) {
              mockJob = { ...mockJob, ...pendingUpdate };
            }
            return builder;
          }),
          or: vi.fn((_filter: string) => builder),
          maybeSingle: vi.fn(async () => {
            if (filterVal && filterVal !== mockJob.order_id && filterVal !== mockJob.id) {
              return { data: null, error: null };
            }
            return { data: mockJob, error: null };
          }),
          single: vi.fn(async () => {
            if (filterVal && filterVal !== mockJob.order_id && filterVal !== mockJob.id) {
              return { data: null, error: { message: "Not found" } };
            }
            return { data: mockJob, error: null };
          }),
        };
        return builder;
      }),

      storage: {
        from: vi.fn((bucket: string) => ({
          createSignedUrl: vi.fn(async (path: string, expiresIn: number) => {
            return {
              data: {
                signedUrl: `https://mock.supabase.co/storage/v1/sign/${bucket}/${path}?expires=${expiresIn}`,
              },
              error: null,
            };
          }),
        })),
      },

      auth: {
        admin: {
          getUserById: vi.fn(async (id: string) => {
            if (id === "rev_authorized") {
              return {
                data: {
                  user: {
                    id: "rev_authorized",
                    app_metadata: { role: "reviewer" },
                    user_metadata: { full_name: "Certified Translator", license_number: "CT-991" },
                  },
                },
                error: null,
              };
            }
            return {
              data: {
                user: {
                  id: "unauthorized_user",
                  app_metadata: { role: "customer" },
                },
              },
              error: null,
            };
          }),
        },
      },
    };

    vi.spyOn(adminModule, "createAdminClient").mockReturnValue(mockSupabase as any);
    vi.spyOn(inngest, "send").mockResolvedValue([] as any);
  });

  describe("POST /api/translations/request", () => {
    it("creates translation job and dispatches translation/requested Inngest event", async () => {
      const payload = {
        orderId: "ord_api_test_1",
        userId: "usr_client_1",
        sourcePath: "source_documents/cert.pdf",
        sourceLang: "en",
        targetLang: "fr",
        docType: "birth_certificate",
      };

      const req = new Request("http://localhost:3000/api/translations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await handleRequest(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.orderId).toBe("ord_api_test_1");
      expect(json.status).toBe("uploaded");

      expect(inngest.send).toHaveBeenCalledWith({
        name: "translation/requested",
        data: payload,
      });
    });

    it("rejects invalid payload missing required fields with 400", async () => {
      const req = new Request("http://localhost:3000/api/translations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: "ord_missing_fields" }),
      });

      const res = await handleRequest(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Invalid request payload");
    });
  });

  describe("POST /api/translations/approve", () => {
    it("approves translation and dispatches translation/approved event for authorized reviewer", async () => {
      mockJob.status = "pending_review";

      const payload = {
        orderId: "ord_api_test_1",
        reviewerId: "rev_authorized",
      };

      const req = new Request("http://localhost:3000/api/translations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await handleApprove(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.status).toBe("approved");

      expect(inngest.send).toHaveBeenCalledWith({
        name: "translation/approved",
        data: payload,
      });
      expect(mockJob.status).toBe("approved");
      expect(mockJob.reviewer_id).toBe("rev_authorized");
    });

    it("rejects unauthorized reviewer without reviewer role with 403", async () => {
      const req = new Request("http://localhost:3000/api/translations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ord_api_test_1",
          reviewerId: "unauthorized_user",
        }),
      });

      const res = await handleApprove(req);
      expect(res.status).toBe(403);
    });

    it("rejects job not in pending_review status with 400", async () => {
      mockJob.status = "extracting"; // Not pending_review

      const req = new Request("http://localhost:3000/api/translations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ord_api_test_1",
          reviewerId: "rev_authorized",
        }),
      });

      const res = await handleApprove(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain("Expected 'pending_review'");
    });
  });

  describe("GET /api/translations/[orderId]", () => {
    it("returns draft details and enforces isOfficiallyCertified false when pending_review", async () => {
      mockJob.status = "pending_review";

      const req = new Request("http://localhost:3000/api/translations/ord_api_test_1");
      const res = await handleGetStatus(req, {
        params: Promise.resolve({ orderId: "ord_api_test_1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.orderId).toBe("ord_api_test_1");
      expect(json.status).toBe("pending_review");
      expect(json.isOfficiallyCertified).toBe(false);
      expect(json.downloadUrl).toContain("translated_documents");
      expect(json.job).toBeDefined();
      expect(json.job.order_id).toBe("ord_api_test_1");
    });

    it("returns final certified document and flags isOfficiallyCertified true when delivered", async () => {
      mockJob.status = "delivered";
      mockJob.final_path = "translated_documents/ord_api_test_1/translated_document.pdf";

      const req = new Request("http://localhost:3000/api/translations/ord_api_test_1");
      const res = await handleGetStatus(req, {
        params: Promise.resolve({ orderId: "ord_api_test_1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.orderId).toBe("ord_api_test_1");
      expect(json.status).toBe("delivered");
      expect(json.isOfficiallyCertified).toBe(true);
      expect(json.downloadUrl).toBeDefined();
    });

    it("returns 404 when orderId is not found", async () => {
      // Temporarily mock supabase to return null
      const mockSupabase = adminModule.createAdminClient();
      vi.spyOn(mockSupabase, "from").mockReturnValue({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const req = new Request("http://localhost:3000/api/translations/non_existent_123");
      const res = await handleGetStatus(req, {
        params: Promise.resolve({ orderId: "non_existent_123" }),
      });

      expect(res.status).toBe(404);
    });
  });
});
