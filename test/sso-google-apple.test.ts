import { describe, it, expect } from "vitest";
import { GET as ssoSignInHandler } from "@/app/api/auth/signin/[provider]/route";
import { GET as ssoCallbackHandler } from "@/app/api/auth/callback/route";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth/session";

describe("Google & Apple Single Sign-On (SSO) Suite", () => {
  it("1. Google SSO: Initiates sign-in, creates verified account, and sets session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/signin/google?callbackUrl=/dashboard");
    const params = Promise.resolve({ provider: "google" });

    const res = await ssoSignInHandler(req, { params });
    expect(res.status).toBe(307); // NextResponse.redirect defaults to 307

    const location = res.headers.get("location");
    expect(location).toContain("/dashboard");
    expect(location).toContain("sso=google");

    const cookies = res.cookies.getAll();
    const sessionCookie = cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    const roleCookie = cookies.find((c) => c.name === "vl_role");

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBeTruthy();
    expect(roleCookie?.value).toBe("CUSTOMER");

    // Verify session user
    if (sessionCookie) {
      const user = await getSessionUser(sessionCookie.value);
      expect(user).toBeDefined();
      expect(user?.email).toContain("google");
      expect(user?.isGuest).toBe(false);
    }
  });

  it("2. Apple SSO: Initiates sign-in, creates private relay verified account, and sets session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/signin/apple?callbackUrl=/order/configure");
    const params = Promise.resolve({ provider: "apple" });

    const res = await ssoSignInHandler(req, { params });
    expect(res.status).toBe(307);

    const location = res.headers.get("location");
    expect(location).toContain("/order/configure");
    expect(location).toContain("sso=apple");

    const sessionCookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBeTruthy();

    if (sessionCookie) {
      const user = await getSessionUser(sessionCookie.value);
      expect(user).toBeDefined();
      expect(user?.email).toContain("appleid.com");
      expect(user?.isGuest).toBe(false);
    }
  });

  it("3. Custom Email SSO: Allows signing in directly with user's specific Google email", async () => {
    const specificEmail = `carlos.mendoza_${Date.now()}@gmail.com`;
    const req = new NextRequest(
      `http://localhost:3000/api/auth/signin/google?email=${encodeURIComponent(specificEmail)}&name=Carlos+Mendoza`
    );
    const params = Promise.resolve({ provider: "google" });

    const res = await ssoSignInHandler(req, { params });
    expect(res.status).toBe(307);

    const sessionCookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(sessionCookie).toBeDefined();

    if (sessionCookie) {
      const user = await getSessionUser(sessionCookie.value);
      expect(user?.email).toBe(specificEmail);
      expect(user?.name).toBe("Carlos Mendoza");
    }
  });

  it("4. Rejects unsupported SSO providers cleanly with HTTP 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/signin/facebook");
    const params = Promise.resolve({ provider: "facebook" });

    const res = await ssoSignInHandler(req, { params });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("Unsupported SSO provider");
  });

  it("5. OAuth Callback: Rejects missing code and redirects to login with error", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/callback");
    const res = await ssoCallbackHandler(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("error=oauth_callback_failed");
  });
});
