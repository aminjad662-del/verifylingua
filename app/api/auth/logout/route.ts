import { NextRequest, NextResponse } from "next/server";
import { destroySession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const AUTH_COOKIES = [
  SESSION_COOKIE_NAME,
  "vl_role",
  "sso_google",
  "sso_apple",
  "sb-access-token",
  "sb-refresh-token",
  "auth_token",
];

function clearAuthCookies(res: NextResponse) {
  for (const cookieName of AUTH_COOKIES) {
    res.cookies.set(cookieName, "", {
      maxAge: 0,
      path: "/",
      expires: new Date(0),
      sameSite: "lax",
    });
  }
  return res;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    try {
      await destroySession(token);
    } catch {}
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  return clearAuthCookies(response);
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    try {
      await destroySession(token);
    } catch {}
  }

  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/login";
  const redirectTarget = new URL(callbackUrl, req.url);

  const response = NextResponse.redirect(redirectTarget, 302);
  return clearAuthCookies(response);
}
