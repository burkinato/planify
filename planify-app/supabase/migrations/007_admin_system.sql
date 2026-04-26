-- ================================================================
-- Planify — Migration: Admin System & Finance
-- ================================================================

-- 1. Finance Table (Revenue/Expense Tracking)
CREATE TABLE IF NOT EXISTS public.admin_finance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    description TEXT,
    entry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Invoices Table (Manual Billing)
CREATE TABLE IF NOT EXISTS public.admin_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invoice_no TEXT UNIQUE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    billing_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    items JSONB, -- List of items/services
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.admin_finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invoices ENABLE ROW LEVEL SECURITY;

-- 4. Admin Access Policies (Using profile role)
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Finance Policies
CREATE POLICY "Admins can manage finance"
ON public.admin_finance
FOR ALL
USING (public.is_admin());

-- Invoices Policies
CREATE POLICY "Admins can manage invoices"
ON public.admin_invoices
FOR ALL
USING (public.is_admin());

-- Update Profiles Policies to allow Admin view
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin());

-- Update Projects Policies to allow Admin view
CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
USING (public.is_admin());

-- 5. Seed Admin User (Note: Password hashing is usually handled by Auth, 
-- but we can insert into auth.users with a placeholder or handle via UI. 
-- For this exercise, we provide the SQL to set the role for an existing email if found)

-- This block will update the role to admin if the user exists.
-- The user should be created via the Auth UI or Signup first.
-- To create the user directly in SQL (Not recommended for production but for dev):
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token)
VALUES (
  gen_random_uuid(),
  'admin@pixoraco.com',
  crypt('Sifre123$$', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Pixor"}',
  now(),
  now(),
  'authenticated',
  ''
);
*/

-- IMPORTANT: Run this manually in SQL editor to promote the user:
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@pixoraco.com');
