import { prisma } from "@/lib/prisma";
import { memoryAuditEvents } from "@/lib/auth/dev-store";

export type AuthAuditAction =
  | "REGISTRATION_ATTEMPT"
  | "REGISTRATION_SUCCESS"
  | "REGISTRATION_BLOCKED_BOT"
  | "REGISTRATION_BLOCKED_VELOCITY"
  | "REGISTRATION_BLOCKED_RATELIMIT"
  | "EMAIL_VERIFICATION_SENT"
  | "EMAIL_VERIFICATION_SUCCESS"
  | "EMAIL_VERIFICATION_FAILED"
  | "EMAIL_VERIFICATION_RESENT"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_SUCCESS"
  | "LOGOUT";

export interface LogAuthAuditEventParams {
  userId?: string | null;
  action: AuthAuditAction;
  resourceType?: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown> | null;
}

/**
 * Persists an immutable security audit event into the database
 * with resilient memory fallback for tests and offline operations.
 */
export async function recordAuthAuditEvent(params: LogAuthAuditEventParams): Promise<void> {
  const {
    userId = null,
    action,
    resourceType = "UserAuth",
    resourceId = null,
    ipAddress = null,
    userAgent = null,
    details = null,
  } = params;

  const eventRecord = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    action,
    resourceType,
    resourceId,
    ipAddress,
    userAgent,
    details: details ? (details as Record<string, unknown>) : null,
    createdAt: new Date(),
  };

  // Always keep in memory buffer for fast assertions & resilience
  memoryAuditEvents.push(eventRecord);

  if (!process.env.VITEST) {
    try {
      await prisma.auditEvent.create({
        data: {
          userId,
          action,
          resourceType,
          resourceId,
          ipAddress,
          userAgent,
          details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        },
      });
    } catch (err) {
      console.warn("Notice: Prisma audit log write skipped (memory store active):", err);
    }
  }
}

/**
 * Retrieves recent authentication audit events for an authenticated user
 */
export async function getUserAuthAuditEvents(userId: string, email?: string): Promise<Array<{
  id: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}>> {
  if (!process.env.VITEST) {
    try {
      const records = await prisma.auditEvent.findMany({
        where: {
          OR: [
            { userId },
            ...(email ? [{ action: { startsWith: "EMAIL_" } }, { action: { startsWith: "REGISTRATION_" } }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      if (records && records.length > 0) {
        return records.map((r) => ({
          id: r.id,
          action: r.action,
          ipAddress: r.ipAddress,
          userAgent: r.userAgent,
          details: r.details as Record<string, unknown> | null,
          createdAt: r.createdAt,
        }));
      }
    } catch {
      // Fall through to memory store
    }
  }

  // Fallback to memory store
  const matched = memoryAuditEvents
    .filter((e) => {
      if (e.userId === userId) return true;
      if (email && e.details && (e.details as any).email === email) return true;
      return false;
    })
  return matched.map((m) => ({
    id: m.id,
    action: m.action,
    ipAddress: m.ipAddress ?? null,
    userAgent: m.userAgent ?? null,
    details: (m.details as Record<string, unknown> | null) ?? null,
    createdAt: m.createdAt,
  }));
}
