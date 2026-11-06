import { describe, it, expect, beforeAll } from "vitest";
import { config } from "dotenv";
config();
import { GET as diagnosticHandler } from "@/app/api/auth/google/diagnostic/route";
import { NextRequest } from "next/server";

describe("Google OAuth Configuration & Diagnostic Endpoint", () => {
  it("returns status ok and lists required Google Cloud Console entries", async () => {
    const req = new NextRequest("https://verifylingua.pages.dev/api/auth/google/diagnostic");
    const res = await diagnosticHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.configured).toBe(true);
    expect(data.canonicalOrigin).toBe("https://verifylingua.pages.dev");
    expect(data.effectiveRedirectUri).toBe("https://verifylingua.pages.dev/api/auth/callback/google");
    expect(data.requiredGoogleCloudConsoleEntries.authorizedJavaScriptOrigins).toContain("https://verifylingua.pages.dev");
    expect(data.requiredGoogleCloudConsoleEntries.authorizedRedirectUris).toContain("https://verifylingua.pages.dev/api/auth/callback/google");
    expect(data.requiredGoogleCloudConsoleEntries.authorizedRedirectUris).toContain("https://verifylingua.pages.dev/api/auth/callback");
  });
});
