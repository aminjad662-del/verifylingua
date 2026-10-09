-- ==============================================================================
-- Migration: Storage Bucket Setup for 'translated_documents'
-- File: supabase/migrations/20261006000001_storage_translated_documents.sql
-- ==============================================================================

-- 1. Create the 'translated_documents' storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'translated_documents',
    'translated_documents',
    true, -- Public bucket for direct download via public URL
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

-- 2. Storage Bucket RLS Policies for 'translated_documents'

-- Policy: Allow inserts (uploads) into translated_documents
DROP POLICY IF EXISTS "Allow upload to translated_documents" ON storage.objects;
CREATE POLICY "Allow upload to translated_documents"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'translated_documents');

-- Policy: Allow reads (public downloads) from translated_documents
DROP POLICY IF EXISTS "Allow read from translated_documents" ON storage.objects;
CREATE POLICY "Allow read from translated_documents"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'translated_documents');

-- Policy: Allow updates to objects in translated_documents
DROP POLICY IF EXISTS "Allow update to translated_documents" ON storage.objects;
CREATE POLICY "Allow update to translated_documents"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'translated_documents');

-- Policy: Allow deletions from translated_documents
DROP POLICY IF EXISTS "Allow delete from translated_documents" ON storage.objects;
CREATE POLICY "Allow delete from translated_documents"
    ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'translated_documents');
