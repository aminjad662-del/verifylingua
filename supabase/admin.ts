import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Creates an administrative, service-role Supabase client.
 *
 * CAUTION: Bypasses Row Level Security (RLS). Use exclusively in secure backend
 * contexts such as Inngest background workers, queue consumers, and Stripe webhooks.
 * NEVER expose this or import this in client-side code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Lazily initialized singleton proxy for supabaseAdmin.
 * Bypasses Row Level Security (RLS) using SUPABASE_SERVICE_ROLE_KEY.
 */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createAdminClient>, {
  get(_target, prop) {
    const client = createAdminClient();
    return (client as any)[prop];
  },
});
