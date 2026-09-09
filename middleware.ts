import { NextResponse, type NextRequest } from "next/server";

// Protected route prefixes requiring active authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/history",
  "/counsel",
];

// Auth session cookie name
const SESSION_COOKIE = "vl_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Check session cookie or authorization header
    const token = req.cookies.get(SESSION_COOKIE)?.value || req.cookies.get("__session")?.value;
    const authHeader = req.headers.get("authorization");

    if (!token && !authHeader) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
