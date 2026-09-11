import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { memoryUsers } from "@/lib/auth/dev-store";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP rate limiting (Max 10 login attempts per IP per 5 minutes)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 5 * 60 * 1000);

    if (!rateLimit.success) {
      const waitMinutes = Math.ceil(rateLimit.resetInMs / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${waitMinutes} minutes.` },
        { status: 429 }
      );
    }

    // 2. Validate payload
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Please provide both email and password." }, { status: 400 });
    }

    const { email, password } = validation.data;

    // 3. Find user (DB with memory fallback)
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch {
      user = Array.from(memoryUsers.values()).find((u) => u.email === email) || null;
    }

    if (!user || !user.passwordHash) {
      // Return generic message to prevent email enumeration
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 4. Verify password with constant-time scrypt comparison
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 5. Create Session
    const sessionToken = await createSession(user.id);

    // 6. Set secure session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          accountType: user.accountType,
          role: user.role,
        },
      },
      { status: 200 }
    );

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
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in. Please try again." },
      { status: 500 }
    );
  }
}
