-- ============================================
-- Stripe Connect Integration - Supabase Migrations
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Add Stripe Connect fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE;

-- 2. Add payment tracking to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS platform_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS manager_payout INTEGER DEFAULT 0;

-- 3. Create payments audit table
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

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_checkout ON bookings(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

-- 5. RLS for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers read own payments"
    ON payments FOR SELECT
    USING (manager_user_id = auth.uid());

CREATE POLICY "Guests read own payments"
    ON payments FOR SELECT
    USING (guest_user_id = auth.uid());
