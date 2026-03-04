-- Add is_premium column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Update RLS if necessary (usually not needed if existing policies allow selecting all columns)
-- Profiles are already viewable/updatable by owners.

-- Optional: Create a view or index if needed, but for a boolean it's usually fine.
