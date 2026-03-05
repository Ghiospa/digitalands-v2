-- ============================================
-- Digitalands v2 - Complete Migrations
-- Run in Supabase SQL Editor — ALL idempotent
-- ============================================

-- ─── PROFILES ─────────────────────────────────────────────────────

-- 1. Add onboarding + Stripe Connect fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE;

-- ─── PROPERTIES ───────────────────────────────────────────────────

-- 2. Ensure published column exists with correct default
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- 3. Public read policy (anon users can browse published properties)
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

-- ─── ACTIVITIES ───────────────────────────────────────────────────

-- 4. Ensure published column exists
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- 5. Public read policy for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published activities" ON activities;
CREATE POLICY "Public read published activities"
    ON activities FOR SELECT
    USING (published = true);

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

-- 6. Add Stripe payment tracking fields
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS platform_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS manager_payout INTEGER DEFAULT 0;

-- 7. Add booking metadata fields
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS guests INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS months INTEGER DEFAULT NULL;

-- 8. Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own bookings" ON bookings;
CREATE POLICY "Users read own bookings"
    ON bookings FOR SELECT
    USING (user_id = auth.uid());

-- Service role (API) handles INSERT/UPDATE — bypasses RLS by default

-- ─── PAYMENTS ─────────────────────────────────────────────────────

-- 9. Payments audit table
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

-- 10. Reviews table (properties + activities)
-- Drop and recreate to ensure correct schema (safe: CASCADE drops dependent objects)
DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT reviews_one_target CHECK (
        (property_id IS NOT NULL AND activity_id IS NULL) OR
        (property_id IS NULL AND activity_id IS NOT NULL)
    )
);

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

-- 11. Performance indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);
CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_published ON activities(published);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_checkout ON bookings(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_guest ON payments(guest_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_manager ON payments(manager_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_activity ON reviews(activity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ─── ACTIVITIES — missing columns ─────────────────────────────────

-- 12. Add columns that the app uses but weren't in the original CREATE TABLE
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS slots JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT NULL;

-- ─── BOOKINGS — missing columns ───────────────────────────────────

-- 13. Activity booking support
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS activity_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS time_slot TEXT DEFAULT NULL;

-- 14. Managers can read bookings for their own activities
DROP POLICY IF EXISTS "Managers read activity bookings" ON bookings;
CREATE POLICY "Managers read activity bookings"
    ON bookings FOR SELECT
    USING (
        activity_id IN (
            SELECT id FROM activities WHERE owner_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_bookings_activity ON bookings(activity_id);
