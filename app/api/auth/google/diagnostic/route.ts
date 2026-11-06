import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const canonicalOrigin =
    req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1"
      ? origin
      : (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
          ? process.env.NEXTAUTH_URL
          : "https://verifylingua.pages.dev");

  const clientId = process.env.GOOGLE_CLIENT_ID || null;
  const hasClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const effectiveRedirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${canonicalOrigin}/api/auth/callback/google`;

  return NextResponse.json({
    status: "ok",
    configured: Boolean(clientId && hasClientSecret),
    clientIdPreview: clientId ? `${clientId.substring(0, 15)}...${clientId.slice(-10)}` : null,
    fullClientId: clientId,
    hasClientSecret,
    canonicalOrigin,
    effectiveRedirectUri,
    requiredGoogleCloudConsoleEntries: {
      authorizedJavaScriptOrigins: [
        "https://verifylingua.pages.dev",
        "http://localhost:3000",
      ],
      authorizedRedirectUris: [
        "https://verifylingua.pages.dev/api/auth/callback/google",
        "https://verifylingua.pages.dev/api/auth/callback",
        "https://lhmcenzdjcbqjvluacrj.supabase.co/auth/v1/callback",
        "http://localhost:3000/api/auth/callback/google",
        "http://localhost:3000/api/auth/callback",
      ],
    },
    directGoogleConsoleUrl: clientId
      ? `https://console.cloud.google.com/apis/credentials/oauthclient/${clientId}?project=electric-orbit-513911-e3`
      : null,
  });
}
