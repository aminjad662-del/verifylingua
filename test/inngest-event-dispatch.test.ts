import { describe, it, expect, vi, beforeEach } from "vitest";
import { inngest } from "@/src/inngest/client";

// Mock Supabase admin client
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockUpload = vi.fn().mockResolvedValue({ data: { path: "mock-path" }, error: null });
const mockGetPublicUrl = vi.fn().mockReturnValue({
  data: { publicUrl: "https://mock.supabase.co/storage/v1/object/public/translated_documents/mock.pdf" },
});
const mockStorageFrom = vi.fn(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
}));

const mockSupabase = {
  from: mockFrom,
  storage: {
    from: mockStorageFrom,
  },
};

vi.mock("@/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

vi.mock("@/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    ...mockSupabase,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "00000000-0000-4000-8000-000000000001" } },
        error: null,
      }),
    },
  })),
}));

vi.mock("@/lib/storage", () => ({
  putObject: vi.fn().mockResolvedValue({ key: "mock-key" }),
  getObject: vi.fn().mockResolvedValue(Buffer.from("mock")),
}));

vi.mock("@/lib/services/job-persistence", () => ({
  persistTranslationJobRecord: vi.fn().mockResolvedValue({
    id: "job-record-uuid-1",
    status: "queued",
  }),
}));

vi.mock("@/lib/queue/worker", () => ({
  dispatchBackgroundJob: vi.fn().mockResolvedValue(undefined),
}));

describe("Inngest Event Dispatch Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-key";

    mockSingle.mockImplementation(() =>
      Promise.resolve({
        data: { id: "job-record-uuid-1", public_code: "VL-TEST1", status: "pending" },
        error: null,
      })
    );
    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockEq.mockResolvedValue({ error: null, data: [{ id: "job-record-uuid-1" }] });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    });
  });

  it("verifies POST /api/upload dispatches document.translate event to Inngest immediately after Supabase insert", async () => {
    const sendSpy = vi.spyOn(inngest, "send").mockResolvedValue({ ids: ["mock-event-id"] } as any);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { POST: uploadHandler } = await import("@/app/api/upload/route");

    const pdfBytes = Buffer.from("%PDF-1.4 mock content for upload test");
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }), "document.pdf");
    form.append("sourceLang", "en");
    form.append("targetLang", "es");

    const req = new Request("http://localhost:3000/api/upload", {
      method: "POST",
      body: form,
    });

    const res = await uploadHandler(req as any);
    expect(res.status).toBe(201);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "document.translate",
        data: expect.objectContaining({
          jobId: expect.any(String),
          orderId: expect.any(String),
          fileUrl: expect.stringContaining("/api/jobs/"),
        }),
      })
    );

    expect(logSpy).toHaveBeenCalledWith("Inngest Event Sent!");

    sendSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("verifies POST /api/order dispatches document.translate event to Inngest immediately after Supabase insert", async () => {
    const sendSpy = vi.spyOn(inngest, "send").mockResolvedValue({ ids: ["mock-event-id"] } as any);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { POST: orderHandler } = await import("@/app/api/order/route");

    const payload = {
      guestEmail: "user@example.com",
      pageCount: 1,
      wordCount: 150,
      fileName: "certificate.pdf",
    };

    const req = new Request("http://localhost:3000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await orderHandler(req);
    expect(res.status).toBe(200);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "document.translate",
        data: expect.objectContaining({
          jobId: expect.any(String),
          orderId: expect.any(String),
        }),
      })
    );

    expect(logSpy).toHaveBeenCalledWith("Inngest Event Sent!");

    sendSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("verifies POST /api/translate/upload dispatches document.translate event to Inngest with explicit jobId and orderId", async () => {
    const sendSpy = vi.spyOn(inngest, "send").mockResolvedValue({ ids: ["mock-event-id"] } as any);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { POST: translateUploadHandler } = await import("@/app/api/translate/upload/route");

    const pdfBytes = Buffer.from("%PDF-1.4 mock content for translate upload test");
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }), "passport.pdf");
    form.append("sourceLang", "es");
    form.append("targetLang", "en");

    const req = new Request("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: form,
    });

    const res = await translateUploadHandler(req as any);
    expect(res.status).toBe(202);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "document.translate",
        data: expect.objectContaining({
          jobId: expect.any(String),
          orderId: expect.any(String),
          fileUrl: expect.stringContaining("/api/jobs/"),
        }),
      })
    );

    expect(logSpy).toHaveBeenCalledWith("Inngest Event Sent!");

    sendSpy.mockRestore();
    logSpy.mockRestore();
  });

  describe("processTranslationJob Payload Extraction Verification", () => {
    it("extracts jobId and orderId when provided as camelCase, snake_case, or nested data", async () => {
      const { processTranslationJob } = await import("@/src/inngest/functions");
      const handler = (processTranslationJob as any).fn;

      const mockStep = {
        run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        sleep: vi.fn().mockResolvedValue(undefined),
      };

      // Case 1: Standard camelCase { jobId, orderId }
      const res1 = await handler({
        event: {
          name: "document.translate",
          data: { jobId: "job-123", orderId: "ord-456", fileUrl: "/path/1.pdf" },
        },
        step: mockStep,
      });
      expect(res1.jobId).toBe("job-123");
      expect(res1.status).toBe("completed");

      // Case 2: snake_case { job_id, order_id }
      const res2 = await handler({
        event: {
          name: "document.translate",
          data: { job_id: "job-snake-1", order_id: "ord-snake-2", file_url: "/path/2.pdf" },
        },
        step: mockStep,
      });
      expect(res2.jobId).toBe("job-snake-1");

      // Case 3: orderId-only fallback
      const res3 = await handler({
        event: {
          name: "document.translate",
          data: { orderId: "ord-only-99", fileUrl: "/path/3.pdf" },
        },
        step: mockStep,
      });
      expect(res3.jobId).toBe("ord-only-99");

      // Case 4: nested { data: { jobId, orderId } }
      const res4 = await handler({
        event: {
          name: "document.translate",
          data: { data: { jobId: "nested-job-88", orderId: "nested-ord-88" } },
        },
        step: mockStep,
      });
      expect(res4.jobId).toBe("nested-job-88");
    });

    it("throws clear error when both jobId and orderId are missing or empty", async () => {
      const { processTranslationJob } = await import("@/src/inngest/functions");
      const handler = (processTranslationJob as any).fn;

      const mockStep = {
        run: vi.fn(),
        sleep: vi.fn(),
      };

      // Completely empty payload
      await expect(
        handler({
          event: {
            name: "document.translate",
            data: {},
          },
          step: mockStep,
        })
      ).rejects.toThrow("Missing jobId or orderId in document.translate event payload.");

      // Empty strings
      await expect(
        handler({
          event: {
            name: "document.translate",
            data: { jobId: "", orderId: "   " },
          },
          step: mockStep,
        })
      ).rejects.toThrow("Missing jobId or orderId in document.translate event payload.");
    });
  });
});
