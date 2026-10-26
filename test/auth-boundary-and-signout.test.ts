import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getMeHandler } from "@/app/api/auth/me/route";
import { GET as getBalanceHandler } from "@/app/api/billing/balance/route";
import { POST as logoutPostHandler } from "@/app/api/auth/logout/route";
import { createSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { memoryUsers } from "@/lib/auth/dev-store";

describe("Strict View Separation & Authentication Boundary Suite", () => {
  const verifiedUserId = "usr-boundary-test-888";

  beforeEach(() => {
    memoryUsers.set(verifiedUserId, {
      id: verifiedUserId,
      email: "counsel@firmboundary.com",
      name: "Managing Partner",
      role: "CUSTOMER",
      accountType: "LAW_FIRM",
      companyName: "Firm Boundary LLP",
      phone: null,
      isGuest: false,
      createdAt: new Date(),
    });
  });

  it("1. Unauthenticated Visitor / Guest: GET /api/auth/me strictly returns authenticated: false and null user", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/me", {
      method: "GET",
    });

    const res = await getMeHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(body.user).toBeNull();
  });

  it("2. Unauthenticated Visitor / Guest: GET /api/billing/balance strictly returns available: null", async () => {
    const req = new NextRequest("http://localhost:3000/api/billing/balance", {
      method: "GET",
    });

    const res = await getBalanceHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(body.available).toBeNull();
    // Guests must never be given fake or active credits
  });

  it("3. Authenticated Firm Counsel: GET /api/auth/me resolves identity with valid session", async () => {
    const sessionToken = await createSession(verifiedUserId);
    const req = new NextRequest("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    });

    const res = await getMeHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.authenticated).toBe(true);
    expect(body.user).not.toBeNull();
    expect(body.user.email).toBe("counsel@firmboundary.com");
  });

  it("4. Explicit Sign Out: POST /api/auth/logout destroys session and purges cookies", async () => {
    const sessionToken = await createSession(verifiedUserId);
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionToken}; vl_role=CUSTOMER`,
      },
    });

    const res = await logoutPostHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify Set-Cookie headers expire all tokens
    const setCookieHeaders = res.headers.getSetCookie();
    const sessionCookie = setCookieHeaders.find((c) => c.includes(`${SESSION_COOKIE_NAME}=`));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.includes("Max-Age=0") || sessionCookie?.includes("Expires=")).toBe(true);
  });
});
