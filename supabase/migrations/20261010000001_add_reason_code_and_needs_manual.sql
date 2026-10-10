-- ==============================================================================
-- Migration: Add reason_code and needs_manual to translation_jobs
-- File: supabase/migrations/20261010000001_add_reason_code_and_needs_manual.sql
-- ==============================================================================

-- 1. Extend translation_job_status enum to include 'needs_manual'
DO $$ BEGIN
    ALTER TYPE translation_job_status ADD VALUE IF NOT EXISTS 'needs_manual';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add reason_code column to translation_jobs table if it does not already exist
ALTER TABLE translation_jobs ADD COLUMN IF NOT EXISTS reason_code TEXT;

-- 3. Create index on reason_code for analytical and triage querying
CREATE INDEX IF NOT EXISTS idx_translation_jobs_reason_code ON translation_jobs(reason_code);
