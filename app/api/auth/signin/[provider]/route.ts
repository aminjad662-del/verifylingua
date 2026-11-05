import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params;
  const provider = rawProvider?.toLowerCase();

  if (provider !== "google" && provider !== "apple") {
    return NextResponse.json(
      { error: "Unsupported SSO provider. Only Google and Apple are supported." },
      { status: 400 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const callbackUrl =
    searchParams.get("callbackUrl") ||
    searchParams.get("returnUrl") ||
    searchParams.get("redirect") ||
    "/translate";
  const origin = req.nextUrl.origin;

  // 1. Direct Google OAuth 2.0 / OIDC Flow (Standard Authorization Code Flow)
  if (provider === "google" && process.env.GOOGLE_CLIENT_ID) {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", `${origin}/api/auth/callback/google`);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    googleAuthUrl.searchParams.set("state", JSON.stringify({ callbackUrl, provider: "google" }));
    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // 2. Direct Apple Sign-In Flow
  if (provider === "apple" && process.env.APPLE_CLIENT_ID) {
    const appleAuthUrl = new URL("https://appleid.apple.com/auth/authorize");
    appleAuthUrl.searchParams.set("client_id", process.env.APPLE_CLIENT_ID);
    appleAuthUrl.searchParams.set("redirect_uri", `${origin}/api/auth/callback`);
    appleAuthUrl.searchParams.set("response_type", "code");
    appleAuthUrl.searchParams.set("scope", "name email");
    appleAuthUrl.searchParams.set("response_mode", "form_post");
    appleAuthUrl.searchParams.set("state", JSON.stringify({ callbackUrl, provider: "apple" }));
    return NextResponse.redirect(appleAuthUrl.toString());
  }

  // 3. Attempt official Supabase OAuth redirect if enabled
  if (process.env.NODE_ENV !== "test") {
    try {
      const supabase = await createClient();
      const redirectTo = `${origin}/api/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google" | "apple",
        options: {
          redirectTo,
        },
      });

      if (!error && data?.url) {
        return NextResponse.redirect(data.url);
      }
    } catch (err) {
      console.warn(`[SSO Provider] Supabase OAuth attempt for ${provider}:`, err);
    }
  }

  // 4. Strict Security & Zero-Mock Policy:
  // When external OAuth credentials are not configured in the active environment,
  // fail cleanly with explicit error parameters and instructions rather than fabricating fake credentials.
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "oauth_unconfigured");
  loginUrl.searchParams.set("provider", provider);
  loginUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(loginUrl.toString());
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  return GET(req, context);
}
