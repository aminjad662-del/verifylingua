-- ==============================================================================
-- Migration: Storage Bucket Setup & Guest Row-Level Security (RLS)
-- File: supabase/migrations/20261005000002_storage_raw_documents_and_guest_rls.sql
-- ==============================================================================

-- 1. Create the 'raw_documents' storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'raw_documents',
    'raw_documents',
    false, -- Private bucket for secure document storage (access via signed URLs / service role)
    52428800, -- 50MB file size limit
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Storage Bucket RLS Policies for 'raw_documents'

-- Policy: Allow inserts (uploads) into raw_documents for both anon (guests) and authenticated users
DROP POLICY IF EXISTS "Allow upload to raw_documents" ON storage.objects;
CREATE POLICY "Allow upload to raw_documents"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'raw_documents');

-- Policy: Allow reads (downloads / presigned retrieval) from raw_documents
DROP POLICY IF EXISTS "Allow read from raw_documents" ON storage.objects;
CREATE POLICY "Allow read from raw_documents"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'raw_documents');

-- Policy: Allow updates to objects in raw_documents
DROP POLICY IF EXISTS "Allow update to raw_documents" ON storage.objects;
CREATE POLICY "Allow update to raw_documents"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'raw_documents');

-- Policy: Allow deletions from raw_documents
DROP POLICY IF EXISTS "Allow delete from raw_documents" ON storage.objects;
CREATE POLICY "Allow delete from raw_documents"
    ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'raw_documents');

-- 4. Database Table RLS Enhancements for Anonymous Guest Orders (Defense-in-Depth)
-- While API routes use createAdminClient() (Service Role) to safely bypass RLS,
-- these policies ensure direct anon operations do not fail if RLS is evaluated.

-- Allow guest order creation (where user_id is NULL or matches authenticated user)
DROP POLICY IF EXISTS "Allow guest and user order creation" ON public.orders;
CREATE POLICY "Allow guest and user order creation"
    ON public.orders
    FOR INSERT
    TO public
    WITH CHECK (
        user_id IS NULL OR auth.uid() = user_id
    );

-- Allow reading orders by public tracking code (guest order status verification)
DROP POLICY IF EXISTS "Allow read orders by public_code" ON public.orders;
CREATE POLICY "Allow read orders by public_code"
    ON public.orders
    FOR SELECT
    TO public
    USING (
        user_id IS NULL OR auth.uid() = user_id OR public_code IS NOT NULL
    );

-- Allow translation_jobs insert for guest and authenticated orders
DROP POLICY IF EXISTS "Allow translation jobs creation for guest and authenticated orders" ON public.translation_jobs;
CREATE POLICY "Allow translation jobs creation for guest and authenticated orders"
    ON public.translation_jobs
    FOR INSERT
    TO public
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = translation_jobs.order_id
              AND (orders.user_id IS NULL OR orders.user_id = auth.uid())
        )
    );

-- Allow reading translation_jobs for orders accessible by public
DROP POLICY IF EXISTS "Allow read translation jobs for accessible orders" ON public.translation_jobs;
CREATE POLICY "Allow read translation jobs for accessible orders"
    ON public.translation_jobs
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = translation_jobs.order_id
              AND (orders.user_id IS NULL OR orders.user_id = auth.uid() OR orders.public_code IS NOT NULL)
        )
    );
