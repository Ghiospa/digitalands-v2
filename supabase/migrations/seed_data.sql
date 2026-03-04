-- 1. Table Creations & Type Corrections

-- Ensure IDs are TEXT and not UUID to match frontend constants (p1, p2, etc.)
DO $$ 
BEGIN
    -- For properties
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.properties ALTER COLUMN id TYPE TEXT;
    END IF;
    -- For activities
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.activities ALTER COLUMN id TYPE TEXT;
    END IF;

    -- Surgical correction: If columns exist but with WRONG type (like jsonb), drop them.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'specs' AND data_type = 'jsonb') THEN
        ALTER TABLE public.properties DROP COLUMN specs;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'amenities' AND data_type = 'jsonb') THEN
        ALTER TABLE public.properties DROP COLUMN amenities;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'highlights' AND data_type = 'jsonb') THEN
        ALTER TABLE public.properties DROP COLUMN highlights;
    END IF;

    -- Fix owner_id constraint if it exists (allow null for seed data)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'owner_id' AND is_nullable = 'NO') THEN
        ALTER TABLE public.properties ALTER COLUMN owner_id DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'owner_id' AND is_nullable = 'NO') THEN
        ALTER TABLE public.activities ALTER COLUMN owner_id DROP NOT NULL;
    END IF;

    -- Fix title constraint in activities (if it exists and is NOT NULL)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'title' AND is_nullable = 'NO') THEN
        ALTER TABLE public.activities ALTER COLUMN title DROP NOT NULL;
    END IF;
END $$;

-- Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    comune TEXT NOT NULL,
    price_per_night INTEGER NOT NULL
);

-- Add missing columns to properties if they don't exist
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS specs TEXT[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS highlights TEXT[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS arch_color TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to activities if they don't exist
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS price INTEGER;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS emoji TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- Ensure RLS is enabled and public viewing is allowed
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone" ON public.properties FOR SELECT USING (true);
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;
CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);

-- 2. Seed Data for Properties
INSERT INTO public.properties (id, name, location, comune, price_per_night, image_url, arch_color, specs, description, highlights, amenities, long_description, map_url)
VALUES 
('p1', 'Villa Barocca Heritage', 'Ragusa Ibla', 'Ragusa', 180, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', 'rgba(212,168,83,0.18)', ARRAY['100 Mbps', 'Workstation', 'A/C centralizzata'], 'Una dimora storica nel cuore di Ragusa Ibla...', ARRAY['Connessione testata 100Mbps', 'Tavolo da lavoro ergonomico'], ARRAY['WiFi Fibra', 'Cucina completa'], 'Soggiorna in un pezzo di storia siciliana...', 'https://goo.gl/maps/ragusa1'),
('p2', 'Masseria Modica Hills', 'Modica Alta', 'Modica', 140, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 'rgba(180,130,60,0.18)', ARRAY['150 Mbps', 'Home office privativo'], 'Immersa nelle campagne modicane...', ARRAY['Ufficio privato silenzioso', 'Piscina a sfioro'], ARRAY['WiFi Starlink', 'Piscina'], 'La quiete della campagna modicana...', 'https://goo.gl/maps/modica1'),
('p3', 'Casa sul Mare Pozzallo', 'Pozzallo Lungomare', 'Pozzallo', 120, 'https://images.unsplash.com/photo-1548013146-72479768bada', 'rgba(53,140,220,0.2)', ARRAY['200 Mbps', 'Vista mare 180°'], 'Addormentati col rumore delle onde...', ARRAY['Fronte spiaggia', 'Terrazza coperta attrezzata'], ARRAY['WiFi 200Mbps', 'Climatizzazione'], 'Questo appartamento è stato progettato...', 'https://goo.gl/maps/pozzallo1')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    comune = EXCLUDED.comune,
    price_per_night = EXCLUDED.price_per_night,
    image_url = EXCLUDED.image_url,
    map_url = EXCLUDED.map_url;

-- 3. Seed Data for Activities
INSERT INTO public.activities (id, name, category, description, price, duration, emoji, image_url, meeting_point)
VALUES 
('surf-mondello', 'Surf — Mondello Beach', 'Surf', 'Lezione di surf per principianti e intermedi...', 65, '2h', '🏄', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f', 'Mondello Beach, Viale Regina Elena'),
('etna-trekking', 'Trekking Etna', 'Escursioni', 'Escursione guidata sul vulcano attivo più alto d''Europa...', 55, '6h', '🌋', 'https://images.unsplash.com/photo-1516912481808-3406841bd33c', 'Rifugio Sapienza, Piazzale Funivia'),
('street-food-palermo', 'Street Food Tour — Palermo', 'Food & Wine', 'Tour gastronomico nei mercati storici di Palermo...', 40, '2h 30min', '🍋', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', 'Teatro Massimo, Piazza Verdi')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    emoji = EXCLUDED.emoji,
    meeting_point = EXCLUDED.meeting_point;

-- 4. Sample Reviews
-- Note: You'll need valid user_ids to link these if RLS is on for inserts, 
-- but for seeding we can just insert them. We'll use a placeholder or assume a user exists.
-- For this demonstration, we'll just insert if there's at least one profile.

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.reviews (user_id, entity_type, entity_id, rating, comment)
        VALUES 
        (v_user_id, 'property', 'p1', 5, 'Posto incredibile! La connessione è velocissima e il borgo è un sogno.'),
        (v_user_id, 'property', 'p2', 4, 'Masseria bellissima, pace assoluta. Perfetto per concentrarsi.'),
        (v_user_id, 'activity', 'surf-mondello', 5, 'Prima volta sul surf, esperienza fantastica!'),
        (v_user_id, 'activity', 'etna-trekking', 5, 'Vista mozzafiato, la guida era molto preparata.')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
