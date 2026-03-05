-- ============================================
-- Digitalands v2 - Complete Migrations
-- Run in Supabase SQL Editor — ALL idempotent
-- ============================================
-- Schema verified against real DB on 2026-03-05
-- ============================================

-- ─── PROFILES ─────────────────────────────────────────────────────

-- 1. Add onboarding + Stripe Connect fields (safe if already exist)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE;

-- ─── PROPERTIES ───────────────────────────────────────────────────

-- 2. Ensure published column exists with correct default
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- 3. Public read policy
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published properties" ON properties;
CREATE POLICY "Public read published properties"
    ON properties FOR SELECT
    USING (published = true);

DROP POLICY IF EXISTS "Managers insert own properties" ON properties;
CREATE POLICY "Managers insert own properties"
    ON properties FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Managers update own properties" ON properties;
CREATE POLICY "Managers update own properties"
    ON properties FOR UPDATE
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Managers delete own properties" ON properties;
CREATE POLICY "Managers delete own properties"
    ON properties FOR DELETE
    USING (auth.uid() = owner_id);

-- Also allow managers to read their own unpublished properties
DROP POLICY IF EXISTS "Managers read own properties" ON properties;
CREATE POLICY "Managers read own properties"
    ON properties FOR SELECT
    USING (auth.uid() = owner_id);

-- ─── ACTIVITIES ───────────────────────────────────────────────────
-- Real schema already has: id(text), owner_id(uuid), title, name, category,
-- price, description, image_url, published, created_at, duration, emoji,
-- meeting_point, meeting_point_url, images(text[])
-- MISSING: slots, location

-- 4. Add missing columns
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS slots JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT NULL;

-- 5. Activity RLS policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published activities" ON activities;
CREATE POLICY "Public read published activities"
    ON activities FOR SELECT
    USING (published = true);

-- Managers can read ALL their own activities (including unpublished)
DROP POLICY IF EXISTS "Managers read own activities" ON activities;
CREATE POLICY "Managers read own activities"
    ON activities FOR SELECT
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Managers insert own activities" ON activities;
CREATE POLICY "Managers insert own activities"
    ON activities FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Managers update own activities" ON activities;
CREATE POLICY "Managers update own activities"
    ON activities FOR UPDATE
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Managers delete own activities" ON activities;
CREATE POLICY "Managers delete own activities"
    ON activities FOR DELETE
    USING (auth.uid() = owner_id);

-- ─── BOOKINGS ─────────────────────────────────────────────────────
-- Real schema already has: id(uuid), user_id, property_id(uuid),
-- activity_id(uuid), property_name, activity_name, check_in(date),
-- check_out(date), total_price, status, created_at,
-- stripe_checkout_session_id, stripe_payment_intent_id,
-- payment_status, platform_fee, manager_payout
-- MISSING: category, emoji, guests, months, time_slot

-- 6. Add missing booking metadata fields
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS guests INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS months INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS time_slot TEXT DEFAULT NULL;

-- 7. Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own bookings" ON bookings;
CREATE POLICY "Users read own bookings"
    ON bookings FOR SELECT
    USING (user_id = auth.uid());

-- Managers can read bookings for their activities
-- Note: cast activity_id (uuid) to text to compare with activities.id (text)
DROP POLICY IF EXISTS "Managers read activity bookings" ON bookings;
CREATE POLICY "Managers read activity bookings"
    ON bookings FOR SELECT
    USING (
        activity_id::text IN (
            SELECT id FROM activities WHERE owner_id = auth.uid()
        )
    );

-- Service role (API) handles INSERT/UPDATE — bypasses RLS by default

-- ─── PAYMENTS ─────────────────────────────────────────────────────

-- 8. Payments audit table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    manager_payout INTEGER NOT NULL,
    currency TEXT DEFAULT 'eur',
    status TEXT DEFAULT 'pending',
    manager_stripe_account_id TEXT,
    guest_user_id UUID,
    manager_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers read own payments" ON payments;
CREATE POLICY "Managers read own payments"
    ON payments FOR SELECT
    USING (manager_user_id = auth.uid());

DROP POLICY IF EXISTS "Guests read own payments" ON payments;
CREATE POLICY "Guests read own payments"
    ON payments FOR SELECT
    USING (guest_user_id = auth.uid());

-- ─── REVIEWS ──────────────────────────────────────────────────────
-- Real schema uses entity_type + entity_id (polymorphic pattern)
-- DO NOT drop or recreate — just ensure RLS policies exist

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews"
    ON reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users insert own reviews" ON reviews;
CREATE POLICY "Users insert own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ─── INDEXES ──────────────────────────────────────────────────────

-- 9. Performance indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);
CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_published ON activities(published);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_activity ON bookings(activity_id);
CREATE INDEX IF NOT EXISTS idx_bookings_checkout ON bookings(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_guest ON payments(guest_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_manager ON payments(manager_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
