-- ==============================================================================
-- Enterprise Database Schema: Document Translation SaaS
-- Step 1.1: Core Orders & Translation Workflow Tables with Row-Level Security
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerated Types
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending',
        'paid',
        'processing',
        'completed',
        'cancelled',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE translation_job_status AS ENUM (
        'pending',
        'extracting',
        'translating',
        'qa',
        'rendering',
        'completed',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Trigger Function: Automatically synchronize updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. Table Definition: orders
-- Tracks customer payment sessions, lifecycle state, and owner association
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    public_code TEXT NOT NULL UNIQUE DEFAULT UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 10)),
    stripe_session_id TEXT UNIQUE,
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. Table Definition: translation_jobs
-- Tracks asynchronous multi-phase document extraction, AI translation, QA, and rendering
-- ==============================================================================
CREATE TABLE IF NOT EXISTS translation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    status translation_job_status NOT NULL DEFAULT 'pending',
    current_phase TEXT NOT NULL DEFAULT 'pending',
    error_log JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. High-Performance B-Tree & Partial Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_public_code ON orders(public_code);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_translation_jobs_order_id ON translation_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_status ON translation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_created_at ON translation_jobs(created_at DESC);

-- ==============================================================================
-- 7. Automated Timestamps Triggers
-- ==============================================================================
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_translation_jobs_updated_at ON translation_jobs;
CREATE TRIGGER trigger_translation_jobs_updated_at
    BEFORE UPDATE ON translation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. Row Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: orders
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders"
    ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders"
    ON orders
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;
CREATE POLICY "Users can delete their own orders"
    ON orders
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id
    );

-- ------------------------------------------------------------------------------
-- RLS: translation_jobs
-- Ensures users can strictly read, create, update, and manage only jobs
-- associated with orders they legitimately own.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own translation jobs" ON translation_jobs;
CREATE POLICY "Users can view their own translation jobs"
    ON translation_jobs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = translation_jobs.order_id
              AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create translation jobs for their own orders" ON translation_jobs;
CREATE POLICY "Users can create translation jobs for their own orders"
    ON translation_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = translation_jobs.order_id
              AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own translation jobs" ON translation_jobs;
CREATE POLICY "Users can update their own translation jobs"
    ON translation_jobs
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = translation_jobs.order_id
              AND orders.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = translation_jobs.order_id
              AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own translation jobs" ON translation_jobs;
CREATE POLICY "Users can delete their own translation jobs"
    ON translation_jobs
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = translation_jobs.order_id
              AND orders.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- Optional: Realtime publication for reactive client updates
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders, translation_jobs;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;
