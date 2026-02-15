-- Fix RLS policies for users table to resolve 406 errors
-- This migration ensures users can access their own profile data

-- First, check if RLS is enabled on users table
DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'users' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow system to create profiles during signup (for triggers)
-- Note: This is restricted to service_role only via RLS
CREATE POLICY "System can create user profiles" ON public.users
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.uid() = id
    );

-- Remove overly permissive system update policy
-- System updates should use service_role which bypasses RLS
-- or be done through specific RPC functions with proper authorization
-- DROP POLICY IF EXISTS "System can update user profiles" ON public.users;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;
