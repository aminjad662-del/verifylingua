import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { prisma } from "@/lib/prisma";
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { memoryUsers } from "@/lib/auth/dev-store";
import { recordAuthAuditEvent } from "@/lib/auth/audit";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const callbackUrl =
    requestUrl.searchParams.get("callbackUrl") ||
    requestUrl.searchParams.get("returnUrl") ||
    requestUrl.searchParams.get("redirect") ||
    "/translate";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  if (code && process.env.NODE_ENV !== "test") {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        const email = data.user.email?.toLowerCase();
        if (email) {
          const provider = (data.user.app_metadata?.provider as string) || "oauth";
          const name =
            (data.user.user_metadata?.full_name as string) ||
            (data.user.user_metadata?.name as string) ||
            email.split("@")[0];

          let user = null;

          try {
            user = await prisma.user.findUnique({ where: { email } });
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
                  email,
                  name,
                  role: "CUSTOMER",
                  accountType: "INDIVIDUAL",
                  isGuest: false,
                  emailVerified: new Date(),
                  creditsAvailable: 5,
                },
              });

              await prisma.account.create({
                data: {
                  userId: user.id,
                  type: "oauth",
                  provider,
                  providerAccountId: data.user.id,
                },
              }).catch(() => null);
            }

            // Bind guest orders
            await prisma.order.updateMany({
              where: { guestEmail: email, userId: null },
              data: { userId: user.id },
            }).catch(() => null);
          } catch {
            let memUser = Array.from(memoryUsers.values()).find((u) => u.email === email);
            if (!memUser) {
              const memId = `usr_${provider}_${Date.now()}`;
              memUser = {
                id: memId,
                email,
                name,
                passwordHash: "",
                role: "CUSTOMER",
                accountType: "INDIVIDUAL",
                companyName: null,
                phone: null,
                isGuest: false,
                emailVerified: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              memoryUsers.set(memId, memUser);
            }
            user = memUser;
          }

          // Create session
          const sessionToken = await createSession(user.id);

          await recordAuthAuditEvent({
            userId: user.id,
            action: `SSO_CALLBACK_SUCCESS_${provider.toUpperCase()}`,
            ipAddress: ip,
            userAgent,
            details: { email, provider },
          }).catch(() => null);

          const destination = new URL(callbackUrl, requestUrl.origin);
          destination.searchParams.set("sso", provider);
          destination.searchParams.set("authenticated", "true");

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
        }
      }
    } catch (err) {
      console.error("[OAuth Callback] Code exchange error:", err);
    }

    // Direct Google OAuth code exchange fallback (for Authorized redirect URI pointing to /api/auth/callback)
    if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      try {
        const canonicalOrigin =
          requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1"
            ? requestUrl.origin
            : (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
                ? process.env.NEXTAUTH_URL
                : "https://verifylingua.pages.dev");
        const redirectUri =
          process.env.GOOGLE_REDIRECT_URI || `${canonicalOrigin}/api/auth/callback`;

        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          if (tokenData.access_token) {
            const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            if (userinfoRes.ok) {
              const profile = await userinfoRes.json();
              const verifiedEmail = profile.email?.trim().toLowerCase();
              const displayName = profile.name?.trim() || verifiedEmail?.split("@")[0] || "Google User";

              if (verifiedEmail) {
                let user = null;
                try {
                  user = await prisma.user.findUnique({ where: { email: verifiedEmail } });
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
                        creditsAvailable: 5,
                      },
                    });

                    await prisma.account.create({
                      data: {
                        userId: user.id,
                        type: "oauth",
                        provider: "google",
                        providerAccountId: profile.sub || `google_${Date.now()}`,
                      },
                    }).catch(() => null);
                  }
                } catch {
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
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    memoryUsers.set(memId, memUser);
                  }
                  user = memUser;
                }

                const sessionToken = await createSession(user.id);

                await recordAuthAuditEvent({
                  userId: user.id,
                  action: "SSO_CALLBACK_SUCCESS_GOOGLE_DIRECT",
                  ipAddress: ip,
                  userAgent,
                  details: { email: verifiedEmail, provider: "google" },
                }).catch(() => null);

                const destination = new URL(callbackUrl, requestUrl.origin);
                destination.searchParams.set("sso", "google");
                destination.searchParams.set("authenticated", "true");

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
              }
            }
          }
        }
      } catch (directErr) {
        console.error("[OAuth Callback] Direct Google code exchange fallback error:", directErr);
      }
    }
  }

  // Fallback if code exchange fails
  const redirectTarget = new URL("/login", requestUrl.origin);
  redirectTarget.searchParams.set("error", "oauth_callback_failed");
  return NextResponse.redirect(redirectTarget);
}
