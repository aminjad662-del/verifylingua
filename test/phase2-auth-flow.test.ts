import { describe, it, expect } from "vitest";
import { POST as registerHandler } from "../app/api/auth/register/route";
import { GET as meHandler } from "../app/api/auth/me/route";
import { middleware } from "../middleware";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "../lib/auth/session";

describe("Phase 2: Auth Wire & Middleware Gate", () => {
  const testUser = {
    name: "Alex Vance",
    email: `alex_${Date.now()}@example.com`,
    password: "Correct-Horse-Battery-Staple-2026!",
    accountType: "INDIVIDUAL" as const,
    terms: true as const,
  };

  let sessionCookieValue = "";

  it("1. Middleware intercepts unauthenticated request to /dashboard and redirects to /login", () => {
    const unauthReq = new NextRequest("http://localhost:3000/dashboard", {
      method: "GET",
    });

    const res = middleware(unauthReq);
    expect(res.status).toBe(307); // Next.js NextResponse.redirect default
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("returnUrl=%2Fdashboard");
  });

  it("2. Executes signup end-to-end and issues authenticated session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.id).toBeDefined();

    // Verify Set-Cookie header
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain(SESSION_COOKIE_NAME);

    // Extract cookie value for subsequent requests
    const match = setCookie?.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    expect(match).not.toBeNull();
    sessionCookieValue = match![1];
    expect(sessionCookieValue.length).toBeGreaterThan(16);
  });

  it("3. Middleware permits authenticated request to /dashboard with session cookie", () => {
    const authReq = new NextRequest("http://localhost:3000/dashboard", {
      method: "GET",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionCookieValue}`,
      },
    });

    const res = middleware(authReq);
    // NextResponse.next() returns a standard response without redirect location
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("4. Session persists on reload (verification over repeated requests to /api/auth/me)", async () => {
    // Reload 1
    const reqReload1 = new NextRequest("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionCookieValue}`,
      },
    });
    const res1 = await meHandler(reqReload1);
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    expect(body1.authenticated).toBe(true);
    expect(body1.user.email).toBe(testUser.email);

    // Reload 2
    const reqReload2 = new NextRequest("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionCookieValue}`,
      },
    });
    const res2 = await meHandler(reqReload2);
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.authenticated).toBe(true);
    expect(body2.user.id).toBe(body1.user.id);
  });

  it("5. Rejects tampering with invalid session cookie", async () => {
    const reqTampered = new NextRequest("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=invalid_tampered_token_999`,
      },
    });
    const res = await meHandler(reqTampered);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(body.user).toBeNull();
  });
});
