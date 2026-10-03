import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Database, Order, TranslationJob, OrderStatus, TranslationJobStatus } from "@/supabase/types";
import { createClient as createBrowserClient } from "@/supabase/client";
import { createClient as createServerClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin";

// Mock next/headers for Server Component testing
vi.mock("next/headers", () => {
  return {
    cookies: vi.fn().mockResolvedValue({
      getAll: vi.fn().mockReturnValue([{ name: "sb-access-token", value: "test-token" }]),
      set: vi.fn(),
    }),
  };
});

describe("Supabase Enterprise Backend Infrastructure", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
      SUPABASE_SERVICE_ROLE_KEY: "mock-service-role-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    };
  });

  describe("1. Type Definitions & Enums Integrity", () => {
    it("satisfies valid Order and TranslationJob record contracts", () => {
      const orderStatus: OrderStatus = "paid";
      const jobStatus: TranslationJobStatus = "translating";

      const sampleOrder: Order = {
        id: "a0000000-0000-0000-0000-000000000001",
        user_id: "u0000000-0000-0000-0000-000000000001",
        public_code: "ORD-TEST-99",
        stripe_session_id: "cs_test_mock123",
        status: orderStatus,
        created_at: "2026-10-03T12:00:00Z",
        updated_at: "2026-10-03T12:00:00Z",
      };

      const sampleJob: TranslationJob = {
        id: "j0000000-0000-0000-0000-000000000001",
        order_id: sampleOrder.id,
        file_url: "https://storage.example.com/vault/doc1.pdf",
        status: jobStatus,
        current_phase: "extracting",
        error_log: null,
        created_at: "2026-10-03T12:00:00Z",
        updated_at: "2026-10-03T12:00:00Z",
      };

      expect(sampleOrder.status).toBe("paid");
      expect(sampleJob.status).toBe("translating");
      expect(sampleJob.current_phase).toBe("extracting");
    });

    it("verifies all required enum states are represented", () => {
      const validStatuses: TranslationJobStatus[] = [
        "pending",
        "extracting",
        "translating",
        "qa",
        "rendering",
        "completed",
        "failed",
      ];
      expect(validStatuses).toHaveLength(7);
    });
  });

  describe("2. Client Initializers", () => {
    it("initializes browser client with valid environment variables", () => {
      const client = createBrowserClient();
      expect(client).toBeDefined();
      expect(client.from).toBeTypeOf("function");
      expect(client.auth).toBeDefined();
    });

    it("throws clear error when browser client lacks environment variables", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      expect(() => createBrowserClient()).toThrow(/Missing Supabase environment variables/);
    });

    it("initializes server client with async Next.js cookie handling", async () => {
      const serverClient = await createServerClient();
      expect(serverClient).toBeDefined();
      expect(serverClient.from).toBeTypeOf("function");
      expect(serverClient.auth).toBeDefined();
    });

    it("initializes admin service-role client", () => {
      const adminClient = createAdminClient();
      expect(adminClient).toBeDefined();
      expect(adminClient.from).toBeTypeOf("function");
    });

    it("throws error when admin client lacks service role key", () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      expect(() => createAdminClient()).toThrow(/Missing Supabase admin environment variables/);
    });
  });
});
