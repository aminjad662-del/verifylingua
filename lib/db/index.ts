import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { createScopedDataClient, ScopedDataClient } from "./data-isolation";

// Global database connection singleton
const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/verifylingua";

// Lazy connection to prevent build-time or offline crashes
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(client, { schema });

export * from "./schema";
export * from "./data-isolation";

export default db;
