-- Fix overly permissive RLS policy on users table
-- This migration removes the dangerous "System can update user profiles" policy
-- that allowed any authenticated user to update any profile

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can update user profiles" ON public.users;

-- System updates should be done through:
-- 1. Service role (bypasses RLS)
-- 2. Specific RPC functions with proper authorization
-- 3. Users updating their own profiles (already covered by existing policy)

-- Add comment explaining the security change
COMMENT ON POLICY "Users can update their own profile" ON public.users IS 
  'Users can only update their own profile. System updates must use service_role or authorized RPC functions.';

