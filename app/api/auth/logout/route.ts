import { NextRequest, NextResponse } from "next/server";
import { destroySession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const AUTH_COOKIES_TO_CLEAR = [
  SESSION_COOKIE_NAME,
  "vl_role",
  "sso_google",
  "sso_apple",
  "sb-access-token",
  "sb-refresh-token",
  "auth_token",
];

function applySignOutCookies(response: NextResponse) {
  for (const cookieName of AUTH_COOKIES_TO_CLEAR) {
    response.cookies.set({
      name: cookieName,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
    });
  }
  return response;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    try {
      await destroySession(token);
    } catch {
      // Resilience against offline storage
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  return applySignOutCookies(response);
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    try {
      await destroySession(token);
    } catch {
      // Resilience against offline storage
    }
  }

  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/";
  const redirectTarget = new URL(callbackUrl, req.url);

  const response = NextResponse.redirect(redirectTarget, 302);
  return applySignOutCookies(response);
}
