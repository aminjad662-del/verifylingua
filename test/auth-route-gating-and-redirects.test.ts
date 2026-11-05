import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

describe("Strict Authentication Gating & Route Protection End-to-End", () => {
  const rootDir = process.cwd();

  describe("1. Next.js Middleware Route Protection for /translate", () => {
    it("redirects unauthenticated request to /translate to /login with returnUrl and redirect params", () => {
      const req = new NextRequest("http://localhost:3000/translate");
      const res = middleware(req);
      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/login");
      expect(location).toContain("returnUrl=%2Ftranslate");
      expect(location).toContain("redirect=%2Ftranslate");
    });

    it("redirects unauthenticated request to /translate/ trailing slash to /login", () => {
      const req = new NextRequest("http://localhost:3000/translate/");
      const res = middleware(req);
      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/login");
    });

    it("allows authenticated request with vl_session cookie to access /translate", () => {
      const req = new NextRequest("http://localhost:3000/translate", {
        headers: {
          cookie: "vl_session=valid_test_token_12345",
        },
      });
      const res = middleware(req);
      // If allowed, middleware returns NextResponse.next() which has status 200
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });

    it("allows authenticated request with authorization header to access /translate", () => {
      const req = new NextRequest("http://localhost:3000/translate", {
        headers: {
          authorization: "Bearer valid_bearer_token",
        },
      });
      const res = middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("2. Cloudflare Edge Worker Route Protection", () => {
    it("scripts/build-cloudflare.js protects /translate at the edge with 302 redirect for guests", () => {
      const cfScriptPath = path.join(rootDir, "scripts/build-cloudflare.js");
      const content = fs.readFileSync(cfScriptPath, "utf8");
      // Must include edge route protection for /translate
      expect(content).toContain("'/translate'");
      expect(content).toContain("/login");
      expect(content).toContain("returnUrl");
    });
  });

  describe("3. Client-Side Studio Workspace Authentication Guard", () => {
    it("app/translate/page.tsx redirects unauthenticated visitors to login immediately", () => {
      const translatePath = path.join(rootDir, "app/translate/page.tsx");
      const content = fs.readFileSync(translatePath, "utf8");
      expect(content).toContain("/api/auth/me");
      expect(content).toContain("/login");
      expect(content).toContain("returnUrl=/translate");
    });
  });

  describe("4. Post-Authentication Seamless Redirects", () => {
    it("LoginForm.tsx supports callbackUrl, returnUrl, and redirect defaulting to /translate", () => {
      const loginFormPath = path.join(rootDir, "components/auth/LoginForm.tsx");
      const content = fs.readFileSync(loginFormPath, "utf8");
      expect(content).toContain('searchParams.get("returnUrl")');
      expect(content).toContain('searchParams.get("redirect")');
      expect(content).toContain('"/translate"');
    });

    it("RegisterForm.tsx supports callbackUrl, returnUrl, and redirect defaulting to /translate", () => {
      const registerFormPath = path.join(rootDir, "components/auth/RegisterForm.tsx");
      const content = fs.readFileSync(registerFormPath, "utf8");
      expect(content).toContain('searchParams.get("returnUrl")');
      expect(content).toContain('searchParams.get("redirect")');
      expect(content).toContain('"/translate"');
    });
  });

  describe("5. Backend Upload & OCR API Session Authentication", () => {
    it("app/api/upload/route.ts rejects unauthenticated uploads with 401 UNAUTHORIZED", () => {
      const uploadPath = path.join(rootDir, "app/api/upload/route.ts");
      const content = fs.readFileSync(uploadPath, "utf8");
      expect(content).toContain("UNAUTHORIZED");
      expect(content).toContain("401");
    });

    it("app/api/ocr/analyze/route.ts rejects unauthenticated requests with 401 UNAUTHORIZED", () => {
      const ocrPath = path.join(rootDir, "app/api/ocr/analyze/route.ts");
      const content = fs.readFileSync(ocrPath, "utf8");
      expect(content).toContain("UNAUTHORIZED");
      expect(content).toContain("401");
    });
  });
});
