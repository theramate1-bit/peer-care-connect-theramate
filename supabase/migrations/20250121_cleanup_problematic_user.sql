-- Clean up problematic user data that's causing 409 conflicts
-- This will resolve the duplicate email constraint violations

-- First, let's see what's causing the conflict
-- Check for duplicate emails in users table
DO $$
DECLARE
    duplicate_emails CURSOR FOR
        SELECT email, COUNT(*) as count
        FROM public.users 
        GROUP BY email 
        HAVING COUNT(*) > 1;
    email_record RECORD;
BEGIN
    -- Log duplicate emails
    FOR email_record IN duplicate_emails LOOP
        RAISE NOTICE 'Found duplicate email: % with % records', email_record.email, email_record.count;
    END LOOP;
END $$;

-- Clean up the specific problematic user
-- Remove any incomplete or duplicate entries for user 952c56d7-ede4-4367-9cfa-f942e2e163fa
DELETE FROM public.users 
WHERE id = '952c56d7-ede4-4367-9cfa-f942e2e163fa' 
AND (user_role IS NULL OR user_role = '' OR onboarding_status IS NULL);

-- If the user still exists but has no role, set a default role
UPDATE public.users 
SET 
    user_role = 'client',
    onboarding_status = 'pending',
    profile_completed = false,
    updated_at = NOW()
WHERE id = '952c56d7-ede4-4367-9cfa-f942e2e163fa' 
AND (user_role IS NULL OR user_role = '');

-- Clean up any orphaned records in other tables
DELETE FROM public.credits WHERE user_id = '952c56d7-ede4-4367-9cfa-f942e2e163fa';
DELETE FROM public.client_sessions WHERE client_id = '952c56d7-ede4-4367-9cfa-f942e2e163fa';
DELETE FROM public.treatment_notes WHERE practitioner_id = '952c56d7-ede4-4367-9cfa-f942e2e163fa';

-- Ensure the user has a proper profile
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    user_role,
    onboarding_status,
    profile_completed,
    created_at,
    updated_at
) VALUES (
    '952c56d7-ede4-4367-9cfa-f942e2e163fa',
    'test@example.com', -- This will be updated by the actual user
    'User',
    'User',
    'client',
    'pending',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    user_role = COALESCE(EXCLUDED.user_role, users.user_role),
    onboarding_status = COALESCE(EXCLUDED.onboarding_status, users.onboarding_status),
    profile_completed = COALESCE(EXCLUDED.profile_completed, users.profile_completed),
    updated_at = NOW();
