export interface MemoryUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  role: string;
  accountType: string;
  companyName: string | null;
  phone: string | null;
  isGuest: boolean;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorySession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface MemoryResetToken {
  email: string;
  token: string;
  expires: Date;
}

export interface MemoryVerificationToken {
  identifier: string; // email
  token: string;
  expires: Date;
}

export interface MemoryAuditEvent {
  id: string;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: Date;
}

// Global in-memory storage to survive hot-reloads and support offline dev/demo preview
const globalForMemory = globalThis as unknown as {
  memoryUsers?: Map<string, MemoryUser>;
  memorySessions?: Map<string, MemorySession>;
  memoryResetTokens?: Map<string, MemoryResetToken>;
  memoryVerificationTokens?: Map<string, MemoryVerificationToken>;
  memoryAuditEvents?: MemoryAuditEvent[];
};

export const memoryUsers = globalForMemory.memoryUsers ?? new Map<string, MemoryUser>();
export const memorySessions = globalForMemory.memorySessions ?? new Map<string, MemorySession>();
export const memoryResetTokens = globalForMemory.memoryResetTokens ?? new Map<string, MemoryResetToken>();
export const memoryVerificationTokens = globalForMemory.memoryVerificationTokens ?? new Map<string, MemoryVerificationToken>();
export const memoryAuditEvents = globalForMemory.memoryAuditEvents ?? [];

if (process.env.NODE_ENV !== "production") {
  globalForMemory.memoryUsers = memoryUsers;
  globalForMemory.memorySessions = memorySessions;
  globalForMemory.memoryResetTokens = memoryResetTokens;
  globalForMemory.memoryVerificationTokens = memoryVerificationTokens;
  globalForMemory.memoryAuditEvents = memoryAuditEvents;
}
