-- Migration: Prevent Duplicate Active Subscriptions
-- Date: 2025-02-20
-- Purpose: Ensure users can only have one active subscription at a time
-- This prevents revenue loss and subscription confusion

-- Step 1: Create a function to check for existing active subscriptions
CREATE OR REPLACE FUNCTION public.check_duplicate_active_subscription(
  p_user_id UUID,
  p_exclude_subscription_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- Count active subscriptions for this user, excluding the one being updated (if any)
  SELECT COUNT(*) INTO active_count
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (p_exclude_subscription_id IS NULL OR id != p_exclude_subscription_id);
  
  -- Return true if there are active subscriptions (duplicate found)
  RETURN active_count > 0;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.check_duplicate_active_subscription IS 
  'Checks if a user has an existing active subscription. Returns true if duplicate found, false otherwise.';

-- Step 2: Create a function to deactivate existing active subscriptions
-- This is called before creating/activating a new subscription
CREATE OR REPLACE FUNCTION public.deactivate_existing_subscriptions(
  p_user_id UUID,
  p_new_subscription_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  deactivated_count INTEGER;
BEGIN
  -- Deactivate all active subscriptions for this user, except the new one
  UPDATE public.subscriptions
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (p_new_subscription_id IS NULL OR id != p_new_subscription_id);
  
  GET DIAGNOSTICS deactivated_count = ROW_COUNT;
  
  RETURN deactivated_count;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION public.deactivate_existing_subscriptions IS 
  'Deactivates all existing active subscriptions for a user, except the new one being created. Returns count of deactivated subscriptions.';

-- Step 3: Create a trigger function that prevents multiple active subscriptions
CREATE OR REPLACE FUNCTION public.prevent_duplicate_active_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check when status is being set to 'active'
  IF NEW.status = 'active' THEN
    -- Check if user already has an active subscription (excluding this one if updating)
    IF public.check_duplicate_active_subscription(
      NEW.user_id,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END
    ) THEN
      -- If duplicate found, deactivate the old ones
      PERFORM public.deactivate_existing_subscriptions(NEW.user_id, NEW.id);
      
      -- Log the action
      RAISE NOTICE 'Deactivated existing active subscriptions for user % before activating subscription %', 
        NEW.user_id, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.prevent_duplicate_active_subscriptions IS 
  'Trigger function that automatically deactivates existing active subscriptions when a new one is activated.';

-- Step 4: Create trigger on subscriptions table
DROP TRIGGER IF EXISTS prevent_duplicate_active_subscriptions_trigger ON public.subscriptions;

CREATE TRIGGER prevent_duplicate_active_subscriptions_trigger
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_active_subscriptions();

COMMENT ON TRIGGER prevent_duplicate_active_subscriptions_trigger ON public.subscriptions IS 
  'Automatically prevents multiple active subscriptions per user by deactivating old ones when a new one is activated.';

-- Step 5: Create a unique partial index for additional enforcement
-- This ensures database-level uniqueness for active subscriptions
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_user
  ON public.subscriptions (user_id)
  WHERE status = 'active';

COMMENT ON INDEX idx_subscriptions_one_active_per_user IS 
  'Ensures only one active subscription per user at the database level.';

-- Step 6: Add a helpful view for checking subscription status
CREATE OR REPLACE VIEW public.active_subscriptions AS
SELECT 
  s.*,
  u.email as user_email
FROM public.subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active';

COMMENT ON VIEW public.active_subscriptions IS 
  'View showing all active subscriptions with user email for easy monitoring.';

-- Step 7: Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20250220_prevent_duplicate_subscriptions completed successfully';
  RAISE NOTICE 'Created functions: check_duplicate_active_subscription, deactivate_existing_subscriptions';
  RAISE NOTICE 'Created trigger: prevent_duplicate_active_subscriptions_trigger';
  RAISE NOTICE 'Created unique index: idx_subscriptions_one_active_per_user';
  RAISE NOTICE 'Users can now only have one active subscription at a time';
END $$;

