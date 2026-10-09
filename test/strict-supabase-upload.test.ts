import { describe, it, expect, vi, beforeEach } from "vitest";

// Vitest hoisted mocks for top-level factory
const {
  mockUpload,
  mockUpdate,
  mockEq,
  mockFrom,
  mockGetPublicUrl,
  mockStorageFrom,
} = vi.hoisted(() => {
  const mockUpload = vi.fn();
  const mockUpdate = vi.fn();
  const mockEq = vi.fn();
  const mockFrom = vi.fn();
  const mockGetPublicUrl = vi.fn();
  const mockStorageFrom = vi.fn();

  return {
    mockUpload,
    mockUpdate,
    mockEq,
    mockFrom,
    mockGetPublicUrl,
    mockStorageFrom,
  };
});

vi.mock("@/supabase/admin", () => {
  const adminClient = {
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  };

  return {
    createAdminClient: vi.fn(() => adminClient),
    supabaseAdmin: adminClient,
  };
});

import { uploadRenderedDocument } from "@/services/renderer";
import { processTranslationJob } from "@/src/inngest/functions";

describe("SYSTEM DIRECTIVE: Fix Silent Failure in Supabase Upload (Strict Mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUpload.mockResolvedValue({
      data: { path: "mock/translated_document.pdf" },
      error: null,
    });

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://mock.supabase.co/storage/v1/object/public/translated_documents/mock.pdf" },
    });

    mockStorageFrom.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    mockEq.mockResolvedValue({ error: null, data: [{ id: "mock-job-id" }] });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });
  });

  describe("Requirement 1 & 2: Dedicated upload logic using supabaseAdmin bypassing RLS", () => {
    it("uploadRenderedDocument uses supabaseAdmin to target 'translated_documents' bucket", async () => {
      const dummyPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
      const result = await uploadRenderedDocument({
        pdfBuffer: dummyPdf,
        orderId: "ord-test-111",
        jobId: "job-test-222",
      });

      expect(mockStorageFrom).toHaveBeenCalledWith("translated_documents");
      expect(result.destinationPath).toBe("ord-test-111/translated_document.pdf");
    });
  });

  describe("Requirement 3: Critical Error Handling (No silent failure, explicit throws)", () => {
    it("uploadRenderedDocument throws explicit Error if storage upload fails", async () => {
      mockUpload.mockResolvedValueOnce({
        data: null,
        error: { message: "Internal storage quota exceeded (507)" },
      });

      const dummyPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
      await expect(
        uploadRenderedDocument({
          pdfBuffer: dummyPdf,
          orderId: "ord-quota-fail",
          jobId: "job-quota-fail",
        })
      ).rejects.toThrow("Upload failed: Internal storage quota exceeded (507)");
    });

    it("Inngest pipeline step throws explicit Error and stops on storage upload failure", async () => {
      mockUpload.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid JWT signature: RLS denied" },
      });

      const event = {
        name: "document.translate" as const,
        data: {
          jobId: "job-rls-fail-99",
          orderId: "ord-rls-fail-99",
          fileUrl: "/path/doc.pdf",
        },
      };

      const step = {
        run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        sleep: vi.fn(),
      };

      const handler = (processTranslationJob as any).fn;
      await expect(handler({ event, step })).rejects.toThrow(
        "Upload failed: Invalid JWT signature: RLS denied"
      );

      // Verify that database was NOT marked completed when upload failed
      expect(mockUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
        })
      );
    });
  });

  describe("Requirement 4: Critical File Naming (Dynamic path to prevent collision)", () => {
    it("dynamically generates destination path from orderId when available", async () => {
      const dummyPdf = Buffer.from("%PDF-1.4 mock");
      const res = await uploadRenderedDocument({
        pdfBuffer: dummyPdf,
        orderId: "order-unique-uuid-99",
        jobId: "job-trans-77",
      });

      expect(mockUpload).toHaveBeenCalledWith(
        "order-unique-uuid-99/translated_document.pdf",
        dummyPdf,
        expect.any(Object)
      );
      expect(res.destinationPath).toBe("order-unique-uuid-99/translated_document.pdf");
    });

    it("falls back to jobId when orderId is omitted or empty", async () => {
      const dummyPdf = Buffer.from("%PDF-1.4 mock");
      const res = await uploadRenderedDocument({
        pdfBuffer: dummyPdf,
        jobId: "job-only-uuid-88",
      });

      expect(mockUpload).toHaveBeenCalledWith(
        "job-only-uuid-88/translated_document.pdf",
        dummyPdf,
        expect.any(Object)
      );
      expect(res.destinationPath).toBe("job-only-uuid-88/translated_document.pdf");
    });
  });

  describe("Requirement 5: Critical Content-Type & Options (application/pdf + upsert: true)", () => {
    it("passes { contentType: 'application/pdf', upsert: true } on upload", async () => {
      const dummyPdf = new Uint8Array([1, 2, 3, 4]);
      await uploadRenderedDocument({
        pdfBuffer: dummyPdf,
        orderId: "ord-opts-check",
        jobId: "job-opts-check",
      });

      expect(mockUpload).toHaveBeenCalledWith(
        "ord-opts-check/translated_document.pdf",
        dummyPdf,
        {
          contentType: "application/pdf",
          upsert: true,
        }
      );
    });
  });

  describe("Requirement 6: Explicitly awaited DB update setting current_phase='completed' and file_url=exact path", () => {
    it("awaits database update with exact destination path and completed status", async () => {
      const event = {
        name: "document.translate" as const,
        data: {
          jobId: "job-db-verify-333",
          orderId: "ord-db-verify-444",
          fileUrl: "/path/source.pdf",
        },
      };

      const step = {
        run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        sleep: vi.fn(),
      };

      const handler = (processTranslationJob as any).fn;
      const result = await handler({ event, step });

      expect(result.status).toBe("completed");
      expect(result.jobId).toBe("job-db-verify-333");

      // Verify translation_jobs database update matches exact dynamic path
      expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          file_url: "ord-db-verify-444/translated_document.pdf",
          status: "completed",
          current_phase: "completed",
        })
      );
    });
  });
});
