import { describe, it, expect } from "vitest";
import { middleware } from "../middleware";
import { NextRequest } from "next/server";
import { isAdminRole, hasPermission, ROLE_COOKIE_NAME } from "../lib/auth/rbac";

describe("Edge Security & RBAC Route Protection Suite", () => {
  const SESSION_COOKIE = "vl_session";
  const mockToken = "valid_test_session_token_1234567890abcdef";

  describe("1. RBAC Utility Unit Tests", () => {
    it("identifies administrative roles accurately", () => {
      expect(isAdminRole("SUPER_ADMIN")).toBe(true);
      expect(isAdminRole("ADMIN")).toBe(true);
      expect(isAdminRole("OPERATIONS_MANAGER")).toBe(true);
      expect(isAdminRole("TRANSLATOR_REVIEWER")).toBe(true);
      expect(isAdminRole("TRANSLATOR")).toBe(true);
      expect(isAdminRole("CUSTOMER_SUPPORT")).toBe(true);
      expect(isAdminRole("BILLING_MANAGER")).toBe(true);
      expect(isAdminRole("READ_ONLY_ANALYST")).toBe(true);
    });

    it("rejects non-administrative roles", () => {
      expect(isAdminRole("CUSTOMER")).toBe(false);
      expect(isAdminRole("INDIVIDUAL")).toBe(false);
      expect(isAdminRole("ATTORNEY")).toBe(false);
      expect(isAdminRole("CLIENT_MEMBER")).toBe(false);
      expect(isAdminRole("GUEST")).toBe(false);
      expect(isAdminRole(null)).toBe(false);
      expect(isAdminRole(undefined)).toBe(false);
    });

    it("evaluates role permissions correctly", () => {
      expect(hasPermission("SUPER_ADMIN", "anything")).toBe(true);
      expect(hasPermission("OPERATIONS_MANAGER", "jobs:retry")).toBe(true);
      expect(hasPermission("TRANSLATOR", "reviews:write")).toBe(true);
      expect(hasPermission("TRANSLATOR", "billing:write")).toBe(false);
      expect(hasPermission("READ_ONLY_ANALYST", "jobs:read")).toBe(true);
      expect(hasPermission("READ_ONLY_ANALYST", "jobs:write")).toBe(false);
    });
  });

  describe("2. Edge Middleware Protection for Client Workspace (/app/*)", () => {
    it("intercepts unauthenticated request to /app and redirects to /login", () => {
      const req = new NextRequest("http://localhost:3000/app", { method: "GET" });
      const res = middleware(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/login");
      expect(location).toContain("returnUrl=%2Fapp");
    });

    it("intercepts unauthenticated request to sub-paths like /app/new-translation", () => {
      const req = new NextRequest("http://localhost:3000/app/new-translation", { method: "GET" });
      const res = middleware(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("returnUrl=%2Fapp%2Fnew-translation");
    });

    it("permits authenticated request to /app with valid session cookie", () => {
      const req = new NextRequest("http://localhost:3000/app", {
        method: "GET",
        headers: {
          cookie: `${SESSION_COOKIE}=${mockToken}`,
        },
      });

      const res = middleware(req);
      expect(res.status).toBe(200); // NextResponse.next()
    });
  });

  describe("3. Edge Middleware Protection for Admin Console (/admin/*)", () => {
    it("intercepts unauthenticated request to /admin and redirects to /login", () => {
      const req = new NextRequest("http://localhost:3000/admin", { method: "GET" });
      const res = middleware(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/login");
      expect(location).toContain("returnUrl=%2Fadmin");
    });

    it("blocks authenticated customer from accessing /admin and redirects to /app", () => {
      const req = new NextRequest("http://localhost:3000/admin/jobs", {
        method: "GET",
        headers: {
          cookie: `${SESSION_COOKIE}=${mockToken}; ${ROLE_COOKIE_NAME}=CUSTOMER`,
        },
      });

      const res = middleware(req);
      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/app");
      expect(location).toContain("error=unauthorized_admin_access");
    });

    it("permits authenticated admin user to access /admin/jobs", () => {
      const req = new NextRequest("http://localhost:3000/admin/jobs", {
        method: "GET",
        headers: {
          cookie: `${SESSION_COOKIE}=${mockToken}; ${ROLE_COOKIE_NAME}=SUPER_ADMIN`,
        },
      });

      const res = middleware(req);
      expect(res.status).toBe(200);
    });

    it("permits operations manager to access /admin/queue", () => {
      const req = new NextRequest("http://localhost:3000/admin/queue", {
        method: "GET",
        headers: {
          cookie: `${SESSION_COOKIE}=${mockToken}; ${ROLE_COOKIE_NAME}=OPERATIONS_MANAGER`,
        },
      });

      const res = middleware(req);
      expect(res.status).toBe(200);
    });
  });
});
