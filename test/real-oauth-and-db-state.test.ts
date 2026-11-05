import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as handleSignIn } from "@/app/api/auth/signin/[provider]/route";
import { GET as handleGoogleCallback } from "@/app/api/auth/callback/google/route";
import { createSession, getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { memoryUsers, memorySessions } from "@/lib/auth/dev-store";
import fs from "fs";
import path from "path";

describe("Real OAuth & Database Session State Integration Tests", () => {
  const originalGoogleId = process.env.GOOGLE_CLIENT_ID;
  const originalAppleId = process.env.APPLE_CLIENT_ID;

  beforeEach(() => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.APPLE_CLIENT_ID;
    memoryUsers.clear();
    memorySessions.clear();
  });

  afterEach(() => {
    if (originalGoogleId) process.env.GOOGLE_CLIENT_ID = originalGoogleId;
    else delete process.env.GOOGLE_CLIENT_ID;
    if (originalAppleId) process.env.APPLE_CLIENT_ID = originalAppleId;
    else delete process.env.APPLE_CLIENT_ID;
  });

  describe("SSO Sign-In Zero-Mock Enforcement", () => {
    it("redirects cleanly to /login?error=oauth_unconfigured when GOOGLE_CLIENT_ID is not configured", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/signin/google?callbackUrl=/translate");
      const res = await handleSignIn(req, { params: Promise.resolve({ provider: "google" }) });

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toBeTruthy();
      const redirectUrl = new URL(location!);
      expect(redirectUrl.pathname).toBe("/login");
      expect(redirectUrl.searchParams.get("error")).toBe("oauth_unconfigured");
      expect(redirectUrl.searchParams.get("provider")).toBe("google");
      expect(redirectUrl.searchParams.get("callbackUrl")).toBe("/translate");
    });

    it("redirects cleanly to /login?error=oauth_unconfigured when APPLE_CLIENT_ID is not configured", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/signin/apple?callbackUrl=/translate");
      const res = await handleSignIn(req, { params: Promise.resolve({ provider: "apple" }) });

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toBeTruthy();
      const redirectUrl = new URL(location!);
      expect(redirectUrl.pathname).toBe("/login");
      expect(redirectUrl.searchParams.get("error")).toBe("oauth_unconfigured");
      expect(redirectUrl.searchParams.get("provider")).toBe("apple");
    });

    it("redirects directly to accounts.google.com when GOOGLE_CLIENT_ID is configured in environment", async () => {
      process.env.GOOGLE_CLIENT_ID = "test-google-client-id-12345.apps.googleusercontent.com";
      const req = new NextRequest("http://localhost:3000/api/auth/signin/google?callbackUrl=/translate");
      const res = await handleSignIn(req, { params: Promise.resolve({ provider: "google" }) });

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toBeTruthy();
      const authUrl = new URL(location!);
      expect(authUrl.origin).toBe("https://accounts.google.com");
      expect(authUrl.pathname).toBe("/o/oauth2/v2/auth");
      expect(authUrl.searchParams.get("client_id")).toBe("test-google-client-id-12345.apps.googleusercontent.com");
      expect(authUrl.searchParams.get("response_type")).toBe("code");
      expect(authUrl.searchParams.get("scope")).toContain("openid");
      expect(authUrl.searchParams.get("scope")).toContain("email");
    });

    it("redirects directly to appleid.apple.com when APPLE_CLIENT_ID is configured in environment", async () => {
      process.env.APPLE_CLIENT_ID = "com.verifylingua.auth.client";
      const req = new NextRequest("http://localhost:3000/api/auth/signin/apple?callbackUrl=/translate");
      const res = await handleSignIn(req, { params: Promise.resolve({ provider: "apple" }) });

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toBeTruthy();
      const authUrl = new URL(location!);
      expect(authUrl.origin).toBe("https://appleid.apple.com");
      expect(authUrl.pathname).toBe("/auth/authorize");
      expect(authUrl.searchParams.get("client_id")).toBe("com.verifylingua.auth.client");
      expect(authUrl.searchParams.get("response_type")).toBe("code");
    });

    it("rejects unsupported SSO providers with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/signin/github");
      const res = await handleSignIn(req, { params: Promise.resolve({ provider: "github" }) });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Unsupported SSO provider");
    });
  });

  describe("Google OAuth Callback Route", () => {
    it("redirects to /login?error=oauth_callback_failed if code is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/callback/google");
      const res = await handleGoogleCallback(req);
      expect(res.status).toBe(307);
      const redirectUrl = new URL(res.headers.get("location")!);
      expect(redirectUrl.pathname).toBe("/login");
      expect(redirectUrl.searchParams.get("error")).toBe("oauth_callback_failed");
    });

    it("redirects to /login?error=oauth_unconfigured if client credentials missing during code exchange", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/callback/google?code=auth_code_sample_987");
      const res = await handleGoogleCallback(req);
      expect(res.status).toBe(307);
      const redirectUrl = new URL(res.headers.get("location")!);
      expect(redirectUrl.pathname).toBe("/login");
      expect(redirectUrl.searchParams.get("error")).toBe("oauth_unconfigured");
      expect(redirectUrl.searchParams.get("provider")).toBe("google");
    });
  });

  describe("Real Database Session Credits Binding", () => {
    it("retrieves authentic credit balance attributes (creditsAvailable, creditsReserved, lifetimePagesUsed)", async () => {
      const testUserId = "usr_legal_verified_99";
      memoryUsers.set(testUserId, {
        id: testUserId,
        email: "counsel@immigration-law.org",
        name: "Partner Sarah Chen",
        passwordHash: "",
        role: "CUSTOMER",
        accountType: "LAW_FIRM",
        companyName: "Chen & Associates Immigration Law",
        phone: "+1-202-555-0192",
        isGuest: false,
        emailVerified: new Date(),
        creditsAvailable: 42,
        creditsReserved: 3,
        lifetimePagesUsed: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const sessionToken = await createSession(testUserId);
      expect(sessionToken).toBeTruthy();

      const user = await getSessionUser(sessionToken);
      expect(user).not.toBeNull();
      expect(user?.email).toBe("counsel@immigration-law.org");
      expect(user?.creditsAvailable).toBe(42);
      expect(user?.creditsReserved).toBe(3);
      expect(user?.lifetimePagesUsed).toBe(120);
    });

    it("returns null for non-existent session token", async () => {
      const user = await getSessionUser("invalid_token_xyz_999");
      expect(user).toBeNull();
    });
  });

  describe("Zero Mock Audit in Cloudflare Edge Worker", () => {
    it("verifies scripts/build-cloudflare.js contains zero fake email bypasses", () => {
      const workerScript = fs.readFileSync(path.join(process.cwd(), "scripts", "build-cloudflare.js"), "utf8");
      expect(workerScript).not.toContain("google.applicant@gmail.com");
      expect(workerScript).not.toContain("applicant.privaterelay@appleid.com");
      expect(workerScript).not.toContain("Alejandro Hernandez");
      expect(workerScript).not.toContain("available: 25");
      expect(workerScript).not.toContain("sso_google");
      expect(workerScript).not.toContain("sso_apple");
    });
  });
});
