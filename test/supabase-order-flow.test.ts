import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { POST as orderPostHandler, GET as orderGetHandler } from "@/app/api/order/route";
import { POST as orderCreatePostHandler } from "@/app/api/order/create/route";
import { POST as uploadPostHandler } from "@/app/api/upload/route";
import { GET as jobStatusGetHandler } from "@/app/api/jobs/[id]/status/route";
import fs from "fs";
import path from "path";

// Mock Supabase admin client
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();
const mockEq = vi.fn();
const mockOr = vi.fn();
const mockUpdate = vi.fn();

const mockSupabaseInstance = {
  from: mockFrom,
};

vi.mock("@/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockSupabaseInstance),
}));

vi.mock("@/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    ...mockSupabaseInstance,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "00000000-0000-4000-8000-000000000001" } },
        error: null,
      }),
    },
  })),
}));

// Mock object storage putObject
vi.mock("@/lib/storage", () => ({
  putObject: vi.fn().mockResolvedValue({ key: "mock-key", etag: "mock-etag" }),
  getObject: vi.fn().mockResolvedValue(Buffer.from("mock")),
}));

// Mock queue worker
vi.mock("@/lib/queue/worker", () => ({
  dispatchBackgroundJob: vi.fn().mockResolvedValue(undefined),
}));

describe("Supabase Order & Triage Flow (Prisma Elimination)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key";
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  beforeEach(() => {
    // Set up default chaining mocks for Supabase
    mockSingle.mockImplementation(() =>
      Promise.resolve({
        data: { id: "ord-test-uuid-1", public_code: "VL-TEST1", status: "paid" },
        error: null,
      })
    );
    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockEq.mockResolvedValue({ data: [], error: null });
    mockOr.mockResolvedValue({ data: [], error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          insert: mockInsert,
          select: mockSelect,
          update: mockUpdate,
        };
      }
      if (table === "translation_jobs") {
        return {
          insert: mockInsert,
          select: mockSelect,
          update: mockUpdate,
        };
      }
      return {
        insert: mockInsert,
        select: mockSelect,
      };
    });
  });

  describe("1. Static Code Analysis: Zero Prisma Dependencies in Order Flow", () => {
    it("ensures app/api/order/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/order/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
      expect(content).toContain("@/supabase/server");
      expect(content).toContain("@/supabase/admin");
    });

    it("ensures app/api/order/create/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/order/create/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });

    it("ensures app/api/upload/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/upload/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
      expect(content).toContain("@/supabase/server");
      expect(content).toContain("@/supabase/admin");
    });

    it("ensures app/api/jobs/[id]/status/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/jobs/[id]/status/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
      expect(content).toContain("@/supabase/server");
      expect(content).toContain("@/supabase/admin");
    });

    it("ensures app/api/jobs/[id]/download/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/jobs/[id]/download/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
      expect(content).toContain("@/supabase/server");
      expect(content).toContain("@/supabase/admin");
    });

    it("ensures app/api/jobs/[id]/review/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/jobs/[id]/review/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });

    it("ensures app/api/translate/upload/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/translate/upload/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });

    it("ensures app/api/translate/status/[jobId]/route.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "app/api/translate/status/[jobId]/route.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });

    it("ensures lib/translation/persistent-store.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "lib/translation/persistent-store.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("../prisma");
      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });

    it("ensures lib/translation/pipeline.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "lib/translation/pipeline.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("../prisma");
      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });

    it("ensures lib/queue/worker.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "lib/queue/worker.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("../prisma");
      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });

    it("ensures lib/agents/00_orchestrator.ts has NO prisma imports or invocations", () => {
      const filePath = path.resolve(process.cwd(), "lib/agents/00_orchestrator.ts");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("../prisma");
      expect(content).not.toContain("@/lib/prisma");
      expect(content).not.toContain("prisma.");
      expect(content).not.toContain("@prisma/client");
    });
  });

  describe("2. Order API (POST /api/order and POST /api/order/create) with Supabase", () => {
    it("successfully creates order and translation_jobs record in Supabase", async () => {
      const payload = {
        guestEmail: "client@example.com",
        pageCount: 2,
        wordCount: 500,
        primaryName: "Carlos Garcia",
        isExpedited: true,
        needsNotarization: true,
        fileName: "official_transcript.pdf",
      };

      const req = new Request("http://localhost:3000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await orderPostHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.orderId).toBeDefined();
      expect(json.publicCode).toMatch(/^VL-[A-Z0-9]{5}$/);
      expect(json.jobId).toBe(json.publicCode);
      expect(json.translationJobId).toBeDefined();
      expect(json.total).toBeGreaterThan(0);

      // Verify orders table insert
      expect(mockFrom).toHaveBeenCalledWith("orders");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "paid",
          public_code: json.publicCode,
        })
      );

      // Verify translation_jobs table insert
      expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: json.orderId,
          status: "pending",
          current_phase: "Job initialized and queued for background processing",
        })
      );
    });

    it("POST /api/order/create re-export behaves identically", async () => {
      const payload = {
        guestEmail: "triage_user@example.com",
        pageCount: 1,
        wordCount: 200,
        fileName: "cert.pdf",
      };

      const req = new Request("http://localhost:3000/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await orderCreatePostHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.publicCode).toBeDefined();
    });

    it("rejects order creation with missing or invalid guest email", async () => {
      const req = new Request("http://localhost:3000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestEmail: "invalid-email" }),
      });

      const res = await orderPostHandler(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain("valid email");
    });

    it("returns HTTP 500 when Supabase orders table insert fails", async () => {
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Supabase connection error: relation 'orders' does not exist" },
          }),
        }),
      });

      const req = new Request("http://localhost:3000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestEmail: "test@example.com" }),
      });

      const res = await orderPostHandler(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("DATABASE_INSERT_FAILED");
    });
  });

  describe("3. Upload API (POST /api/upload) with Supabase", () => {
    it("successfully creates orders and translation_jobs rows in Supabase on file upload", async () => {
      const pdfBytes = Buffer.from("%PDF-1.4 sample pdf content for upload test");
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }), "passport.pdf");
      form.append("sourceLang", "es");
      form.append("targetLang", "en");

      const req = new Request("http://localhost:3000/api/upload", {
        method: "POST",
        body: form,
      });

      const res = await uploadPostHandler(req as any);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.jobId).toBeDefined();
      expect(json.orderId).toBeDefined();
      expect(json.fileUrl).toContain(json.jobId);

      // Verify orders table was called
      expect(mockFrom).toHaveBeenCalledWith("orders");

      // Verify translation_jobs table was called
      expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
    });

    it("returns HTTP 500 when Supabase translation_jobs insert fails during upload", async () => {
      // First insert (orders) succeeds
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "ord-1" },
            error: null,
          }),
        }),
      });
      // Second insert (translation_jobs) fails
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Supabase network unreachable" },
          }),
        }),
      });

      const pdfBytes = Buffer.from("%PDF-1.4 failing test pdf");
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }), "doc.pdf");

      const req = new Request("http://localhost:3000/api/upload", {
        method: "POST",
        body: form,
      });

      const res = await uploadPostHandler(req as any);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("DATABASE_INSERT_FAILED");
      expect(json.jobId).toBeUndefined();
    });

    it("rejects empty file upload with HTTP 400", async () => {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array([])], { type: "application/pdf" }), "empty.pdf");

      const req = new Request("http://localhost:3000/api/upload", {
        method: "POST",
        body: form,
      });

      const res = await uploadPostHandler(req as any);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBeDefined();
    });
  });

  describe("4. Job Status API (GET /api/jobs/[id]/status) with Supabase", () => {
    it("returns 404 when job is not found in memory, persistent store, or Supabase", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const req = new Request("http://localhost:3000/api/jobs/NONEXISTENT-999/status");
      const res = await jobStatusGetHandler(req as any, {
        params: Promise.resolve({ id: "NONEXISTENT-999" }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain("not found");
    });

    it("resolves status for order/job found in Supabase", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "ord-status-uuid",
                public_code: "VL-STATUS1",
                status: "paid",
                created_at: new Date().toISOString(),
                translation_jobs: [
                  {
                    id: "job-status-uuid",
                    order_id: "ord-status-uuid",
                    status: "translating",
                    current_phase: "ATA-accredited certified linguist assigned. Processing document...",
                    created_at: new Date().toISOString(),
                  },
                ],
              },
              error: null,
            }),
          }),
        }),
      });

      const req = new Request("http://localhost:3000/api/jobs/VL-STATUS1/status");
      const res = await jobStatusGetHandler(req as any, {
        params: Promise.resolve({ id: "VL-STATUS1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.jobId).toBe("job-status-uuid");
      expect(json.status).toBe("translating");
      expect(json.currentPhase).toBe("translating");
    });
  });
});
