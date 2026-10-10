import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  inngest,
  documentTranslatePayloadSchema,
  documentTranslateEvent,
  type DocumentTranslatePayload,
} from "@/src/inngest/client";
import { processTranslationJob } from "@/src/inngest/functions";
import { translateDocumentJob } from "@/app/api/inngest/functions";
import * as routeHandlers from "@/app/api/inngest/route";

// Mock Supabase admin client
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

vi.mock("@/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  })),
}));

describe("Distributed Inngest Queue Infrastructure (Step 1.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ error: null, data: [{ id: "job-123" }] });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });
  });

  describe("1. Inngest Client & Strict Event Definition", () => {
    it("initializes Inngest client with correct configuration", () => {
      expect(inngest).toBeDefined();
      expect(inngest.id).toBe("verifylingua-translation-saas");
    });

    it("validates strict document.translate payload schema successfully", () => {
      const validPayload: DocumentTranslatePayload = {
        jobId: "018f3a5e-9988-7766-5544-33221100aaee",
        fileUrl: "https://storage.supabase.co/v1/object/documents/affidavit.pdf",
      };

      const result = documentTranslatePayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.jobId).toBe(validPayload.jobId);
        expect(result.data.fileUrl).toBe(validPayload.fileUrl);
      }
    });

    it("rejects invalid payloads missing jobId or fileUrl", () => {
      const missingJobId = {
        fileUrl: "https://storage.example.com/doc.pdf",
      };
      const missingFileUrl = {
        jobId: "job-123",
      };
      const emptyFields = {
        jobId: "",
        fileUrl: "",
      };

      expect(documentTranslatePayloadSchema.safeParse(missingJobId).success).toBe(false);
      expect(documentTranslatePayloadSchema.safeParse(missingFileUrl).success).toBe(false);
      expect(documentTranslatePayloadSchema.safeParse(emptyFields).success).toBe(false);
    });

    it("exposes documentTranslateEvent with document.translate event name", () => {
      expect(documentTranslateEvent).toBeDefined();
      expect(documentTranslateEvent.name).toBe("document.translate");
    });
  });

  describe("2. Dummy Worker (processTranslationJob)", () => {
    it("is properly registered with the expected id and triggers", () => {
      expect(processTranslationJob).toBeDefined();
      // Inngest function metadata
      const fnOpts = (processTranslationJob as any).opts;
      expect(fnOpts.id).toBe("process-translation-job");
      expect(fnOpts.triggers).toEqual([{ event: "document.translate" }]);
    });

    it("executes the full dummy translation lifecycle: processing -> sleep 2s -> completed", async () => {
      const targetJobId = "trans-job-887766";
      const targetFileUrl = "https://bucket.aws.com/records/birth_cert.pdf";

      const event = {
        name: "document.translate" as const,
        data: {
          jobId: targetJobId,
          fileUrl: targetFileUrl,
        },
      };

      // Mock Step tools
      const executedStepNames: string[] = [];
      const sleepCalls: Array<{ id: string; duration: string }> = [];

      const step = {
        run: vi.fn(async (stepId: string, fn: () => Promise<any>) => {
          executedStepNames.push(stepId);
          return await fn();
        }),
        sleep: vi.fn(async (stepId: string, duration: string) => {
          sleepCalls.push({ id: stepId, duration });
        }),
      };

      // Retrieve function handler
      const handler = (processTranslationJob as any).fn;
      expect(handler).toBeTypeOf("function");

      const result = await handler({ event, step });

      // Verify return value
      expect(result).toEqual({
        jobId: targetJobId,
        status: "completed",
      });

      // Verify step execution sequence
      expect(executedStepNames).toEqual([
        "update-status-to-processing",
        "update-status-to-completed",
      ]);

      // Verify sleep duration
      expect(sleepCalls).toEqual([
        { id: "wait-two-seconds", duration: "2s" },
      ]);

      // Verify Supabase updates
      expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "translating",
          current_phase: "translating",
        })
      );

      // Verify Supabase Storage upload to translated_documents bucket
      expect(mockStorageFrom).toHaveBeenCalledWith("translated_documents");
      expect(mockUpload).toHaveBeenCalledWith(
        `${targetJobId}/translated_document.pdf`,
        expect.any(Buffer),
        expect.objectContaining({
          contentType: "application/pdf",
          upsert: true,
        })
      );

      // Verify translation_jobs updated with completed status and exact storage path
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          file_url: `${targetJobId}/translated_document.pdf`,
          status: "completed",
          current_phase: "completed",
        })
      );
      expect(mockEq).toHaveBeenCalledWith("id", targetJobId);
    });

    it("throws explicit Error when Supabase Storage upload returns an error object (strict mode)", async () => {
      mockUpload.mockResolvedValueOnce({
        data: null,
        error: { message: "Bucket translated_documents access denied: RLS policy violation" },
      });

      const event = {
        name: "document.translate" as const,
        data: {
          jobId: "strict-fail-job",
          fileUrl: "https://example.com/fail.pdf",
        },
      };

      const step = {
        run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        sleep: vi.fn(),
      };

      const handler = (processTranslationJob as any).fn;
      await expect(handler({ event, step })).rejects.toThrow(
        "Upload failed: Bucket translated_documents access denied: RLS policy violation"
      );
    });

    it("dynamically scopes storage destination path to orderId when orderId is provided", async () => {
      const event = {
        name: "document.translate" as const,
        data: {
          jobId: "child-job-999",
          orderId: "parent-order-444",
          fileUrl: "https://example.com/doc.pdf",
        },
      };

      const step = {
        run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        sleep: vi.fn(),
      };

      const handler = (processTranslationJob as any).fn;
      await handler({ event, step });

      expect(mockUpload).toHaveBeenCalledWith(
        "parent-order-444/translated_document.pdf",
        expect.any(Buffer),
        expect.objectContaining({
          contentType: "application/pdf",
          upsert: true,
        })
      );

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          file_url: "parent-order-444/translated_document.pdf",
          status: "completed",
          current_phase: "completed",
        })
      );
    });

    it("throws error if Supabase status update fails", async () => {
      mockEq.mockResolvedValueOnce({
        error: new Error("Supabase connection timeout"),
        data: null,
      });

      const event = {
        name: "document.translate" as const,
        data: {
          jobId: "failing-job-id",
          fileUrl: "https://example.com/fail.pdf",
        },
      };

      const step = {
        run: vi.fn(async (_id: string, fn: () => Promise<any>) => {
          return await fn();
        }),
        sleep: vi.fn(),
      };

      const handler = (processTranslationJob as any).fn;
      await expect(handler({ event, step })).rejects.toThrow(
        /Failed to update job status to processing/
      );
    });

    it("handles failure via onFailure hook by marking translation_jobs as failed with reason_code", async () => {
      const fnOpts = (processTranslationJob as any).opts;
      expect(fnOpts.onFailure).toBeDefined();

      const failureEvent = {
        data: {
          event: {
            data: {
              jobId: "failed-job-999",
              orderId: "failed-order-999",
            },
          },
        },
      };

      const error = new Error("Missing Gemini API Key");
      await fnOpts.onFailure({ error, event: failureEvent });

      expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
          reason_code: "missing_gemini_api_key",
        })
      );
    });
  });

  describe("3. Inngest API Route Endpoint", () => {
    it("exposes GET, POST, and PUT handlers via serve()", () => {
      expect(routeHandlers.GET).toBeDefined();
      expect(routeHandlers.POST).toBeDefined();
      expect(routeHandlers.PUT).toBeDefined();
      expect(routeHandlers.GET).toBeTypeOf("function");
      expect(routeHandlers.POST).toBeTypeOf("function");
      expect(routeHandlers.PUT).toBeTypeOf("function");
    });
  });

  describe("4. Strict LLM Translation Job Hardening (translateDocumentJob)", () => {
    it("throws NonRetriableError('Missing Gemini API Key') when GEMINI_API_KEY is missing", async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      try {
        const handler = (translateDocumentJob as any).fn;
        const event = {
          data: {
            jobId: "job-missing-key",
            orderId: "order-missing-key",
            extractedBlocks: [{ id: "b1", text: "Test text" }],
          },
        };
        const step = {
          run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        };

        await expect(handler({ event, step, attempt: 0 })).rejects.toThrow("Missing Gemini API Key");
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "failed",
            reason_code: "missing_gemini_api_key",
          })
        );
      } finally {
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      }
    });

    it("allows retry on Zod validation error for attempt < 3 and throws NonRetriableError for attempt >= 3", async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = "test-gemini-key";

      const translatorModule = await import("../services/translator");
      const spyRunAgent2 = vi.spyOn(translatorModule, "runAgent2");

      try {
        const valErr = new Error("LLM output failed Zod schema validation: invalid structure");
        (valErr as any).name = "ZodError";
        (valErr as any).isValidationError = true;
        spyRunAgent2.mockRejectedValue(valErr);

        const handler = (translateDocumentJob as any).fn;
        const event = {
          data: {
            jobId: "job-val-err",
            orderId: "order-val-err",
            extractedBlocks: [{ id: "b1", text: "Sample" }],
          },
        };
        const step = {
          run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        };

        // Attempt 0: retryable error
        await expect(handler({ event, step, attempt: 0 })).rejects.toThrow(
          /LLM structured output validation failed \(attempt 1 of 3\)/
        );

        // Attempt 3: fatal NonRetriableError
        await expect(handler({ event, step, attempt: 3 })).rejects.toThrow(
          "LLM structured output validation failed"
        );
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "failed",
            reason_code: "llm_validation_failed",
          })
        );
      } finally {
        spyRunAgent2.mockRestore();
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
        else delete process.env.GEMINI_API_KEY;
      }
    });

    it("handles LLM timeout and throws NonRetriableError after 3 retries", async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = "test-gemini-key";

      const translatorModule = await import("../services/translator");
      const spyRunAgent2 = vi.spyOn(translatorModule, "runAgent2");

      try {
        const timeoutErr = new Error("Gemini API call timed out after 35s");
        (timeoutErr as any).name = "TimeoutError";
        (timeoutErr as any).isTimeout = true;
        spyRunAgent2.mockRejectedValue(timeoutErr);

        const handler = (translateDocumentJob as any).fn;
        const event = {
          data: {
            jobId: "job-timeout-err",
            orderId: "order-timeout-err",
            extractedBlocks: [{ id: "b1", text: "Sample" }],
          },
        };
        const step = {
          run: vi.fn(async (_id: string, fn: () => Promise<any>) => fn()),
        };

        // Attempt 0: retryable error
        await expect(handler({ event, step, attempt: 0 })).rejects.toThrow(
          /Gemini API call timed out \(attempt 1 of 3\)/
        );

        // Attempt 3: fatal NonRetriableError
        await expect(handler({ event, step, attempt: 3 })).rejects.toThrow(
          "Gemini API call timed out after 3 retries"
        );
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "failed",
            reason_code: "llm_timeout",
          })
        );
      } finally {
        spyRunAgent2.mockRestore();
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
        else delete process.env.GEMINI_API_KEY;
      }
    });

    it("translateDocumentJob onFailure hook updates Supabase status and reason_code", async () => {
      const fnOpts = (translateDocumentJob as any).opts;
      expect(fnOpts.onFailure).toBeDefined();

      const failureEvent = {
        data: {
          event: {
            data: {
              jobId: "failed-job-888",
              orderId: "failed-order-888",
            },
          },
        },
      };

      // Test validation error -> status: failed, reason_code: llm_validation_failed
      const valError = new Error("LLM structured output validation failed");
      (valError as any).reasonCode = "llm_validation_failed";
      await fnOpts.onFailure({ error: valError, event: failureEvent });

      expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
          reason_code: "llm_validation_failed",
        })
      );

      // Test QA error -> status: needs_manual, reason_code: qa_integrity_failure
      const qaError = new Error("QA integrity check failed");
      (qaError as any).reasonCode = "qa_integrity_failure";
      await fnOpts.onFailure({ error: qaError, event: failureEvent });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "needs_manual",
          reason_code: "qa_integrity_failure",
        })
      );
    });
  });
});
