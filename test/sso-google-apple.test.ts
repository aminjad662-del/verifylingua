import { describe, it, expect } from "vitest";
import "dotenv/config";
import { GET as ssoSignInHandler } from "@/app/api/auth/signin/[provider]/route";
import { GET as ssoCallbackHandler } from "@/app/api/auth/callback/route";
import { GET as googleCallbackHandler } from "@/app/api/auth/callback/google/route";
import { NextRequest } from "next/server";

describe("Google & Apple Single Sign-On (SSO) Suite", () => {
  it("1. Google SSO: Initiates real OAuth 2.0 authorization request with correct client_id, scopes, and redirect_uri", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/signin/google?callbackUrl=/translate");
    const params = Promise.resolve({ provider: "google" });

    const res = await ssoSignInHandler(req, { params });
    expect(res.status).toBe(307); // NextResponse.redirect defaults to 307

    const location = res.headers.get("location");
    expect(location).toBeTruthy();

    const redirectUrl = new URL(location!);
    expect(redirectUrl.origin).toBe("https://accounts.google.com");
    expect(redirectUrl.pathname).toBe("/o/oauth2/v2/auth");
    expect(redirectUrl.searchParams.get("client_id")).toBe(process.env.GOOGLE_CLIENT_ID);
    expect(redirectUrl.searchParams.get("response_type")).toBe("code");
    expect(redirectUrl.searchParams.get("scope")).toContain("openid");
    expect(redirectUrl.searchParams.get("scope")).toContain("email");
    expect(redirectUrl.searchParams.get("prompt")).toBe("select_account");

    const stateParam = redirectUrl.searchParams.get("state");
    expect(stateParam).toBeTruthy();
    const parsedState = JSON.parse(stateParam!);
    expect(parsedState.callbackUrl).toBe("/translate");
    expect(parsedState.provider).toBe("google");
    expect(parsedState.redirectUri).toContain("/api/auth/callback/google");
  });

  it("2. Apple SSO: Rejects unconfigured Apple credentials gracefully by redirecting to login with explanatory error", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/signin/apple?callbackUrl=/translate");
    const params = Promise.resolve({ provider: "apple" });

    const res = await ssoSignInHandler(req, { params });
    expect(res.status).toBe(307);

    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("error=oauth_unconfigured");
    expect(location).toContain("provider=apple");
  });

  it("3. Redirect URI canonicalization: Uses canonical production domain for cloud deployments", async () => {
    const req = new NextRequest("https://52b8f7a3.verifylingua.pages.dev/api/auth/signin/google?callbackUrl=/translate");
    const params = Promise.resolve({ provider: "google" });

    const res = await ssoSignInHandler(req, { params });
    const location = res.headers.get("location");
    expect(location).toBeTruthy();

    const redirectUrl = new URL(location!);
    const redirectUri = redirectUrl.searchParams.get("redirect_uri");
    expect(redirectUri).toBe("https://verifylingua.pages.dev/api/auth/callback/google");
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

  it("6. Google OAuth Dedicated Callback: Rejects missing code and redirects with details", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/callback/google");
    const res = await googleCallbackHandler(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("error=oauth_callback_failed");
    expect(location).toContain("details=missing_code");
  });
});
