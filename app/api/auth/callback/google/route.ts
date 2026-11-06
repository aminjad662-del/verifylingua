import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { memoryUsers } from "@/lib/auth/dev-store";
import { recordAuthAuditEvent } from "@/lib/auth/audit";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  let callbackUrl = "/translate";
  let stateRedirectUri: string | null = null;
  if (rawState) {
    try {
      const parsed = JSON.parse(rawState);
      if (parsed.callbackUrl) callbackUrl = parsed.callbackUrl;
      if (parsed.redirectUri) stateRedirectUri = parsed.redirectUri;
    } catch {
      // Keep default
    }
  }

  if (!code) {
    const errorTarget = new URL("/login", origin);
    errorTarget.searchParams.set("error", "oauth_callback_failed");
    errorTarget.searchParams.set("details", "missing_code");
    return NextResponse.redirect(errorTarget);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const errorTarget = new URL("/login", origin);
    errorTarget.searchParams.set("error", "oauth_unconfigured");
    errorTarget.searchParams.set("provider", "google");
    return NextResponse.redirect(errorTarget);
  }

  try {
    // 1. Exchange authorization code with Google OAuth token endpoint
    const canonicalOrigin =
      req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1"
        ? origin
        : (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
            ? process.env.NEXTAUTH_URL
            : "https://verifylingua.pages.dev");
    const redirectUri =
      stateRedirectUri || process.env.GOOGLE_REDIRECT_URI || `${canonicalOrigin}/api/auth/callback/google`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[Google OAuth] Token exchange error:", await tokenRes.text());
      const errorTarget = new URL("/login", origin);
      errorTarget.searchParams.set("error", "oauth_callback_failed");
      return NextResponse.redirect(errorTarget);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("No access_token returned from Google");
    }

    // 2. Fetch authenticated user profile from Google OIDC userinfo
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      throw new Error("Failed to fetch Google userinfo");
    }

    const profile = await userinfoRes.json();
    const verifiedEmail = profile.email?.trim().toLowerCase();
    const displayName = profile.name?.trim() || verifiedEmail?.split("@")[0] || "Google User";
    const googleSubjectId = profile.sub;

    if (!verifiedEmail) {
      throw new Error("No verified email found in Google profile");
    }

    // 3. Upsert User in Prisma Database
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: verifiedEmail },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: user.emailVerified || new Date(),
            isGuest: false,
            updatedAt: new Date(),
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: verifiedEmail,
            name: displayName,
            role: "CUSTOMER",
            accountType: "INDIVIDUAL",
            isGuest: false,
            emailVerified: new Date(),
            creditsAvailable: 5, // Welcome credits
          },
        });

        await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: "google",
            providerAccountId: googleSubjectId,
          },
        }).catch(() => null);
      }

      // Re-assign previous guest orders
      await prisma.order.updateMany({
        where: { guestEmail: verifiedEmail, userId: null },
        data: { userId: user.id },
      }).catch(() => null);

      // Synchronize in-memory user cache
      memoryUsers.set(user.id, {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: "",
        role: user.role,
        accountType: user.accountType,
        companyName: user.companyName,
        phone: user.phone,
        isGuest: user.isGuest,
        emailVerified: user.emailVerified,
        creditsAvailable: user.creditsAvailable,
        creditsReserved: user.creditsReserved,
        lifetimePagesUsed: user.lifetimePagesUsed,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch {
      // Resilient fallback for memory cache in development / tests
      let memUser = Array.from(memoryUsers.values()).find((u) => u.email === verifiedEmail);
      if (!memUser) {
        const memId = `usr_google_${Date.now()}`;
        memUser = {
          id: memId,
          email: verifiedEmail,
          name: displayName,
          passwordHash: "",
          role: "CUSTOMER",
          accountType: "INDIVIDUAL",
          companyName: null,
          phone: null,
          isGuest: false,
          emailVerified: new Date(),
          creditsAvailable: 5,
          creditsReserved: 0,
          lifetimePagesUsed: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryUsers.set(memId, memUser);
      }
      user = memUser;
    }

    // 4. Create authentic session
    const sessionToken = await createSession(user.id);

    // 5. Record Audit Event
    await recordAuthAuditEvent({
      userId: user.id,
      action: "SSO_CALLBACK_SUCCESS_GOOGLE",
      ipAddress: ip,
      userAgent,
      details: { email: verifiedEmail, provider: "google" },
    }).catch(() => null);

    // 6. Redirect to requested callback destination with authentication cookies
    const destination = new URL(callbackUrl, origin);
    destination.searchParams.set("authenticated", "true");
    destination.searchParams.set("sso", "google");

    const response = NextResponse.redirect(destination);

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    response.cookies.set({
      name: "vl_role",
      value: user.role || "CUSTOMER",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err) {
    console.error("[Google OAuth] Unexpected callback error:", err);
    const errorTarget = new URL("/login", origin);
    errorTarget.searchParams.set("error", "oauth_callback_failed");
    return NextResponse.redirect(errorTarget);
  }
}
