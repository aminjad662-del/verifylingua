import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as logoutPostHandler, GET as logoutGetHandler } from "@/app/api/auth/logout/route";
import { createSession, getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { memoryUsers } from "@/lib/auth/dev-store";

describe("Sign Out & Session Destruction Suite", () => {
  const testUserId = "usr-test-signout-123";

  beforeEach(() => {
    memoryUsers.set(testUserId, {
      id: testUserId,
      email: "signout-test@verifylingua.com",
      name: "Signout Test User",
      role: "CUSTOMER",
      accountType: "INDIVIDUAL",
      companyName: null,
      phone: null,
      passwordHash: "mock_password_hash",
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("1. POST /api/auth/logout destroys active session and returns Set-Cookie expiration headers", async () => {
    const sessionToken = await createSession(testUserId);
    expect(await getSessionUser(sessionToken)).not.toBeNull();

    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionToken}; vl_role=CUSTOMER; sso_google=true`,
      },
    });

    const res = await logoutPostHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("Logged out successfully");

    // Session must be destroyed from server memory/store
    expect(await getSessionUser(sessionToken)).toBeNull();

    // Verify Set-Cookie headers expire all authentication cookies
    const setCookieHeaders = res.headers.getSetCookie();
    expect(setCookieHeaders.length).toBeGreaterThanOrEqual(2);

    const sessionCookieHeader = setCookieHeaders.find((c) => c.includes(`${SESSION_COOKIE_NAME}=`));
    expect(sessionCookieHeader).toBeDefined();
    expect(
      sessionCookieHeader?.includes("Max-Age=0") ||
      sessionCookieHeader?.includes("Expires=Thu, 01 Jan 1970") ||
      sessionCookieHeader?.includes("expires=Thu, 01 Jan 1970")
    ).toBe(true);

    const roleCookieHeader = setCookieHeaders.find((c) => c.includes("vl_role="));
    expect(roleCookieHeader).toBeDefined();
    expect(
      roleCookieHeader?.includes("Max-Age=0") ||
      roleCookieHeader?.includes("Expires=Thu, 01 Jan 1970") ||
      roleCookieHeader?.includes("expires=Thu, 01 Jan 1970")
    ).toBe(true);
  });

  it("2. GET /api/auth/logout clears cookies and returns HTTP 302 redirection", async () => {
    const sessionToken = await createSession(testUserId);
    const req = new NextRequest("http://localhost:3000/api/auth/logout?callbackUrl=/login", {
      method: "GET",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionToken}; vl_role=CUSTOMER`,
      },
    });

    const res = await logoutGetHandler(req);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("/login");

    // Session destroyed
    expect(await getSessionUser(sessionToken)).toBeNull();

    // Cookie headers present
    const setCookieHeaders = res.headers.getSetCookie();
    const sessionCookie = setCookieHeaders.find((c) => c.includes(`${SESSION_COOKIE_NAME}=`));
    expect(sessionCookie).toBeDefined();
  });

  it("3. Cloudflare Edge Worker script includes dedicated /api/auth/logout and /api/auth/signout handlers", () => {
    const fs = require("fs");
    const path = require("path");
    const workerScript = fs.readFileSync(path.resolve(__dirname, "../scripts/build-cloudflare.js"), "utf8");

    expect(workerScript).toContain("pathname === '/api/auth/logout'");
    expect(workerScript).toContain("pathname === '/api/auth/signout'");
    expect(workerScript).toContain("vl_session=; Path=/;");
    expect(workerScript).toContain("vl_role=; Path=/;");
  });

  it("4. POST & GET /api/auth/signout forwards and executes cleanly", async () => {
    const { POST: signoutPostHandler, GET: signoutGetHandler } = await import("@/app/api/auth/signout/route");
    const sessionToken = await createSession(testUserId);
    const postReq = new NextRequest("http://localhost:3000/api/auth/signout", {
      method: "POST",
      headers: { cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
    });
    const postRes = await signoutPostHandler(postReq);
    expect(postRes.status).toBe(200);

    const getReq = new NextRequest("http://localhost:3000/api/auth/signout?callbackUrl=/", {
      method: "GET",
    });
    const getRes = await signoutGetHandler(getReq);
    expect(getRes.status).toBe(302);
  });
});
