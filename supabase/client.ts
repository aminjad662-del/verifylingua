import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Creates a browser-side Supabase client for Client Components.
 * Uses `@supabase/ssr` to automatically handle auth cookie storage and synchronization.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined."
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
