import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

describe("Dashboard Request Routing, Auth Enforcement & Visual Polish", () => {
  const rootDir = process.cwd();

  describe("1. Route Redirection: /dashboard/request -> /translate", () => {
    it("middleware redirects /dashboard/request to /translate preserving search params", () => {
      const req = new NextRequest("http://localhost:3000/dashboard/request?tier=certified&lang=es");
      const res = middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/translate?tier=certified&lang=es");
    });

    it("middleware redirects /dashboard/request/ trailing slash to /translate", () => {
      const req = new NextRequest("http://localhost:3000/dashboard/request/");
      const res = middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/translate");
    });

    it("public/_redirects contains 302 redirect from /dashboard/request to /translate", () => {
      const redirectsPath = path.join(rootDir, "public/_redirects");
      const content = fs.readFileSync(redirectsPath, "utf8");
      expect(content).toContain("/dashboard/request /translate 302");
    });

    it("DashboardNav.tsx routes new request button directly to /translate", () => {
      const navPath = path.join(rootDir, "components/layout/DashboardNav.tsx");
      const content = fs.readFileSync(navPath, "utf8");
      expect(content).not.toContain('href: "/dashboard/request"');
      expect(content).toContain('href: "/translate"');
    });

    it("app/dashboard/billing/page.tsx routes new request CTA directly to /translate", () => {
      const billingPath = path.join(rootDir, "app/dashboard/billing/page.tsx");
      const content = fs.readFileSync(billingPath, "utf8");
      expect(content).not.toContain('href="/dashboard/request"');
      expect(content).toContain('href="/translate"');
    });
  });

  describe("2. Authentication & Access Control: Session Validation on Upload", () => {
    it("app/api/translate/upload/route.ts contains unauthorized session gate check", () => {
      const uploadPath = path.join(rootDir, "app/api/translate/upload/route.ts");
      const content = fs.readFileSync(uploadPath, "utf8");
      expect(content).toContain("UNAUTHORIZED");
      expect(content).toContain("401");
    });

    it("app/translate/page.tsx verifies auth status and guards upload execution", () => {
      const translatePagePath = path.join(rootDir, "app/translate/page.tsx");
      const content = fs.readFileSync(translatePagePath, "utf8");
      // Must check /api/auth/me or session
      expect(content).toContain("/api/auth/me");
      // Must guard executeUpload with isAuthenticated
      expect(content).toContain("if (!isAuthenticated)");
      // Must not silently default null balance to 20
      expect(content).not.toContain("setAvailableCredits(data.available ?? 20)");
    });

    it("scripts/build-cloudflare.js protects edge upload endpoint with 401 UNAUTHORIZED check", () => {
      const cfScriptPath = path.join(rootDir, "scripts/build-cloudflare.js");
      const content = fs.readFileSync(cfScriptPath, "utf8");
      expect(content).toContain("pathname === '/api/translate/upload'");
      expect(content).toContain("UNAUTHORIZED");
      expect(content).toContain("Authentication required to translate documents");
    });
  });

  describe("3. Color Palette: Elimination of Excessive Orange/Amber", () => {
    it("Header.tsx contains no legacy orange rgba(255,85,0) shadows", () => {
      const headerPath = path.join(rootDir, "components/layout/Header.tsx");
      const content = fs.readFileSync(headerPath, "utf8");
      expect(content).not.toContain("255,85,0");
      expect(content).not.toContain("255, 85, 0");
    });

    it("globals.css contains no amber shadow-seal", () => {
      const cssPath = path.join(rootDir, "app/globals.css");
      const content = fs.readFileSync(cssPath, "utf8");
      expect(content).not.toContain("217, 119, 6");
    });

    it("app/dashboard/billing/page.tsx replaces amber-200 and amber-600 with clean neutral/brand tokens", () => {
      const billingPath = path.join(rootDir, "app/dashboard/billing/page.tsx");
      const content = fs.readFileSync(billingPath, "utf8");
      expect(content).not.toContain("bg-amber-600");
      expect(content).not.toContain("border-amber-200");
    });
  });
});
