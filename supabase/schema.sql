-- =============================================================
-- Casa Tarongers 1967 — Supabase Production Schema
-- Tables: reservations, availability_blocks, reservation_activity, admin_users
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE: reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INTEGER NOT NULL CHECK (guests_count >= 1 AND guests_count <= 20),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'contacted', 'confirmed', 'rejected', 'cancelled')),
    internal_notes JSONB DEFAULT '[]'::jsonb,
    privacy_accepted BOOLEAN DEFAULT TRUE,
    terms_accepted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_dates_order CHECK (check_out > check_in)
);

-- 2. TABLE: availability_blocks (manual date blocks by owners)
CREATE TABLE IF NOT EXISTS public.availability_blocks (
    id TEXT PRIMARY KEY,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    reason TEXT NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'Familia Tarongers',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_block_dates CHECK (check_out > check_in)
);

-- 3. TABLE: reservation_activity (audit trail for all actions)
CREATE TABLE IF NOT EXISTS public.reservation_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id TEXT,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: admin_users (whitelist of allowed family administrators)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial admin users
INSERT INTO public.admin_users (email, role)
VALUES 
    ('acivit@coac.net', 'admin'),
    ('familia@casatarongers1967.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================================
-- Indexes for Performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations (check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON public.reservations (guest_email);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_availability_blocks_dates ON public.availability_blocks (check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservation_activity_resid ON public.reservation_activity (reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_activity_created_at ON public.reservation_activity (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);

-- =============================================================
-- Row Level Security (RLS) Configuration
-- =============================================================
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can insert pending requests" ON public.reservations;
DROP POLICY IF EXISTS "Public can view availability dates" ON public.reservations;
DROP POLICY IF EXISTS "Full access for authenticated or anon service" ON public.reservations;
DROP POLICY IF EXISTS "Public can view active blocks" ON public.availability_blocks;
DROP POLICY IF EXISTS "Full access to blocks" ON public.availability_blocks;
DROP POLICY IF EXISTS "Full access to activity" ON public.reservation_activity;
DROP POLICY IF EXISTS "Read admin users" ON public.admin_users;

-- Reservations policies
-- 1. Public insert: Only pending status allowed
CREATE POLICY "Public can insert pending requests"
ON public.reservations
FOR INSERT
TO anon, authenticated
WITH CHECK (
    status = 'pending'
);

-- 2. Public view: Anyone can see check_in, check_out, status for calendar calculation
CREATE POLICY "Public can view availability dates"
ON public.reservations
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Modify reservations: Allowed for authenticated users and service
CREATE POLICY "Modify reservations"
ON public.reservations
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Delete reservations"
ON public.reservations
FOR DELETE
TO anon, authenticated
USING (true);

-- Availability Blocks policies
CREATE POLICY "Public can view blocks"
ON public.availability_blocks
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Manage blocks"
ON public.availability_blocks
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Activity policies
CREATE POLICY "Activity log access"
ON public.reservation_activity
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admin Users policies
CREATE POLICY "Admin users check"
ON public.admin_users
FOR SELECT
TO anon, authenticated
USING (true);

-- Trigger to update updated_at on reservations
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.reservations;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Notify PostgREST schema cache to reload
NOTIFY pgrst, 'reload schema';
