import { NextResponse, type NextRequest } from "next/server";
import { isAdminRole, ROLE_COOKIE_NAME } from "@/lib/auth/rbac";

// Protected client route prefixes requiring active authentication
const PROTECTED_CLIENT_ROUTES = [
  "/app",
  "/dashboard",
  "/settings",
  "/history",
  "/counsel",
];

// Admin route prefix requiring active authentication AND administrative role
const ADMIN_ROUTE_PREFIX = "/admin";

// Auth session cookie name
const SESSION_COOKIE = "vl_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isClientProtected = PROTECTED_CLIENT_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTE_PREFIX);

  if (isClientProtected || isAdminRoute) {
    // Check session cookie or authorization header
    const token = req.cookies.get(SESSION_COOKIE)?.value || req.cookies.get("__session")?.value;
    const authHeader = req.headers.get("authorization");

    if (!token && !authHeader) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check for administrative console
    if (isAdminRoute) {
      const roleCookie = req.cookies.get(ROLE_COOKIE_NAME)?.value || req.headers.get("x-user-role");
      // If a role is explicitly present and not an admin role, deny access
      if (roleCookie && !isAdminRole(roleCookie)) {
        const forbiddenUrl = new URL("/app", req.url);
        forbiddenUrl.searchParams.set("error", "unauthorized_admin_access");
        return NextResponse.redirect(forbiddenUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
