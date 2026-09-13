// In-memory Stripe subscription ledger for instant local / offline state
export interface MemorySubscription {
  userId: string;
  plan: string;
  status: string;
  pageQuota: number;
  pagesUsed: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const globalForStripe = globalThis as unknown as {
  memorySubscriptions?: Map<string, MemorySubscription>;
};

export const memorySubscriptions =
  globalForStripe.memorySubscriptions ?? new Map<string, MemorySubscription>();

if (process.env.NODE_ENV !== "production") {
  globalForStripe.memorySubscriptions = memorySubscriptions;
}

export async function withDbTimeout<T>(promise: Promise<T>, timeoutMs = 250): Promise<T | null> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    return await Promise.race([promise, timeout]);
  } catch {
    return null;
  }
}
