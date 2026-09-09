import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// 1. Users (synced via Clerk Webhook / Session)
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk user ID (e.g. user_2t...)
    email: text("email").notNull(),
    name: text("name"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
  ]
);

// 2. Documents (User-scoped document metadata and R2 storage references)
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    format: text("format").notNull(), // 'pdf' | 'png' | 'jpg'
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    // R2 Object Key strictly scoped: ${userId}/${documentId}/${filename}
    r2SourceKey: text("r2_source_key").notNull(),
    r2OutputKey: text("r2_output_key"),
    sha256Hash: text("sha256_hash").notNull(),
    pageCount: integer("page_count").default(1).notNull(),
    hasEmbeddedImages: boolean("has_embedded_images").default(false).notNull(),
    hasTables: boolean("has_tables").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("documents_user_id_idx").on(table.userId),
    index("documents_sha256_idx").on(table.sha256Hash),
  ]
);

// 3. Translation Jobs (State machine execution tracking)
export const translationJobs = pgTable(
  "translation_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceLang: text("source_lang").notNull(),
    targetLang: text("target_lang").notNull(),
    status: text("status", {
      enum: ["queued", "extracting", "translating", "rendering", "done", "error"],
    })
      .default("queued")
      .notNull(),
    progress: integer("progress").default(0).notNull(),
    currentStep: text("current_step").notNull(),
    providerUsed: text("provider_used"), // 'gemini-3.1-pro' | 'deepl' | etc.
    fidelityScore: integer("fidelity_score"), // 0-100
    fidelityBreakdown: jsonb("fidelity_breakdown"),
    ocrConfidence: integer("ocr_confidence"), // 0-100 (kept internal, never surfaced as badge)
    r2ResultKey: text("r2_result_key"),
    downloadToken: text("download_token").notNull(),
    errorMessage: text("error_message"),
    // Programmatic verification signature (prevents fake completion)
    verificationDigest: jsonb("verification_digest"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("jobs_user_id_idx").on(table.userId),
    index("jobs_document_id_idx").on(table.documentId),
    index("jobs_status_idx").on(table.status),
  ]
);

// 4. Job Status Events (Granular realtime event audit trail)
export const jobStatusEvents = pgTable(
  "job_status_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => translationJobs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("events_job_id_idx").on(table.jobId),
    index("events_user_id_idx").on(table.userId),
  ]
);

// 5. Language Pairs (Supported active source-target matrix)
export const languagePairs = pgTable(
  "language_pairs",
  {
    id: text("id").primaryKey(), // e.g. "en-ar"
    sourceLang: text("source_lang").notNull(),
    targetLang: text("target_lang").notNull(),
    sourceName: text("source_name").notNull(),
    targetName: text("target_name").notNull(),
    isRtl: boolean("is_rtl").default(false).notNull(),
    primaryProvider: text("primary_provider").default("gemini-3.1-pro").notNull(),
    fallbackProvider: text("fallback_provider").default("deepl").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("language_pairs_active_idx").on(table.isActive),
  ]
);

// 6. Retention Settings (Per-user auto-deletion preferences)
export const retentionSettings = pgTable(
  "retention_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    autoDeleteEnabled: boolean("auto_delete_enabled").default(false).notNull(), // Default: keep indefinitely
    retentionDays: integer("retention_days").default(30).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("retention_user_id_idx").on(table.userId),
  ]
);
