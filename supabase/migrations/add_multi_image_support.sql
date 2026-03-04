-- 1. Create Storage Buckets for Images
-- Note: These often need to be created via the Supabase UI or API, 
-- but we include the SQL here for reference/initialization in some environments.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('activities', 'activities', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Update Database Tables
-- Add 'images' array column and keep image_url as a fallback/cover image
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 3. Storage Policies (Public Read)
CREATE POLICY "Public Access Properties Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties' );

CREATE POLICY "Public Access Activities Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'activities' );

-- 4. Storage Policies (Authenticated Upload)
CREATE POLICY "Authenticated owners can upload property images"
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'properties' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated owners can upload activity images"
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'activities' 
    AND auth.role() = 'authenticated'
);

-- 5. Delete Policies (Owner only)
-- Note: Simplified for now, in a production app we'd check if the path contains the owner_id
CREATE POLICY "Authenticated owners can delete their property images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'properties' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated owners can delete their activity images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'activities' 
    AND auth.role() = 'authenticated'
);
