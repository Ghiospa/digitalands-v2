-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('activity', 'property')),
    entity_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    profiles_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- 2. Authenticated users can insert their own reviews
CREATE POLICY "Users can insert their own reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE 
USING (auth.uid() = user_id);

-- Create a view or index for performance if needed
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON public.reviews(entity_type, entity_id);

-- Explicitly grant access to anon and authenticated roles
GRANT ALL ON public.reviews TO anon, authenticated, service_role;
