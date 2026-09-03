import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { memorySessions, memoryUsers } from "@/lib/auth/dev-store";

export const SESSION_COOKIE_NAME = "vl_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountType: string;
  companyName: string | null;
  phone: string | null;
  isGuest: boolean;
  createdAt: Date;
}

/**
 * Creates a new session in PostgreSQL (with fallback to memory session)
 */
export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  // Always store in memory cache for instant resilience
  memorySessions.set(sessionToken, {
    id: `sess_${Date.now()}`,
    sessionToken,
    userId,
    expires,
  });

  try {
    await prisma.session.create({
      data: {
        sessionToken,
        userId,
        expires,
      },
    });
  } catch (error) {
    console.warn("Notice: Database session write skipped (resilient fallback active):", error);
  }

  return sessionToken;
}

/**
 * Validates a session token and retrieves the associated user, stripping sensitive data.
 */
export async function getSessionUser(token: string): Promise<SafeUser | null> {
  if (!token) return null;

  // 1. Try database
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            accountType: true,
            companyName: true,
            phone: true,
            isGuest: true,
            createdAt: true,
          },
        },
      },
    });

    if (session && session.expires >= new Date()) {
      return session.user;
    }
  } catch {
    // Database offline, check memory session
  }

  // 2. Fallback to in-memory session cache
  const memSession = memorySessions.get(token);
  if (memSession && memSession.expires >= new Date()) {
    const memUser = memoryUsers.get(memSession.userId);
    if (memUser) {
      return {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        role: memUser.role,
        accountType: memUser.accountType,
        companyName: memUser.companyName,
        phone: memUser.phone,
        isGuest: memUser.isGuest,
        createdAt: memUser.createdAt,
      };
    }
  }

  return null;
}

/**
 * Invalidates and removes a session.
 */
export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  memorySessions.delete(token);

  try {
    await prisma.session.delete({
      where: { sessionToken: token },
    });
  } catch {
    // Ignore error if database is offline or session not found
  }
}

/**
 * Server component / route helper to get currently authenticated user from incoming cookie.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await getSessionUser(token);
  } catch {
    return null;
  }
}
