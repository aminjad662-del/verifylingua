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
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorySession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

// Global in-memory storage to survive hot-reloads and support offline dev/demo preview
const globalForMemory = globalThis as unknown as {
  memoryUsers?: Map<string, MemoryUser>;
  memorySessions?: Map<string, MemorySession>;
};

export const memoryUsers = globalForMemory.memoryUsers ?? new Map<string, MemoryUser>();
export const memorySessions = globalForMemory.memorySessions ?? new Map<string, MemorySession>();

if (process.env.NODE_ENV !== "production") {
  globalForMemory.memoryUsers = memoryUsers;
  globalForMemory.memorySessions = memorySessions;
}
