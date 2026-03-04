-- Add map_url to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Add meeting_point to activities
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS meeting_point TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS meeting_point_url TEXT;
