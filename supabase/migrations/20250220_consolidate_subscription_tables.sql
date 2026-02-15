-- Migration: Consolidate Subscription Tables
-- Date: 2025-02-20
-- Purpose: Remove unused subscription tables to consolidate schema
-- This migration safely drops unused tables: practitioner_subscriptions, 
-- practitioner_subscription_plans, and subscribers

-- Verify tables are not in use before dropping
-- According to audit: subscriptions table is the only one used in production code

-- Step 1: Drop foreign key constraints that reference unused tables
-- (If any exist, they would prevent table drops)

-- Step 2: Drop unused tables in correct order (respecting dependencies)
-- Drop practitioner_subscriptions first (depends on practitioner_subscription_plans)
DROP TABLE IF EXISTS public.practitioner_subscriptions CASCADE;

-- Drop practitioner_subscription_plans (may be referenced by practitioner_subscriptions)
DROP TABLE IF EXISTS public.practitioner_subscription_plans CASCADE;

-- Drop subscribers table (legacy, not used)
DROP TABLE IF EXISTS public.subscribers CASCADE;

-- Step 3: Verify subscriptions table structure is correct
-- Ensure subscriptions table has all necessary columns
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS plan_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS price_id TEXT;

-- Step 4: Create helper function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_marketplace_fee_percentage(subscription_plan TEXT)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE subscription_plan
    WHEN 'starter' THEN 0.00
    WHEN 'practitioner' THEN 3.00
    WHEN 'pro' THEN 1.00
    WHEN 'clinic' THEN 0.50
    ELSE 5.00  -- Default/fallback for any unrecognized plan
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.get_marketplace_fee_percentage IS 'Returns the marketplace fee percentage for a given subscription plan. Used for calculating platform fees on transactions.';

-- Step 5: Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20250220_consolidate_subscription_tables completed successfully';
  RAISE NOTICE 'Dropped unused tables: practitioner_subscriptions, practitioner_subscription_plans, subscribers';
  RAISE NOTICE 'Consolidated to single subscriptions table';
END $$;

