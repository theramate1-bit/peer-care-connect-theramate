# Client Timeline vs Progress/Sessions Data Issue Analysis

## Problem
The client timeline shows data, but the Progress and Sessions pages do not show the same data.

## Root Cause

### Data Access Pattern Differences

1. **TheramateTimeline (Client Dashboard)** - ✅ Works
   - Uses: `userProfile.id` from `public.users` table
   - Location: `ClientDashboard.tsx` line 419
   - Query: `.eq('client_id', userProfile.id)`

2. **ClientProgressTracker (Progress Page)** - ❌ Doesn't show data
   - Uses: `userProfile.id` from `public.users` table  
   - Location: `ClientProgress.tsx` line 44
   - Query: `.eq('client_id', userProfile.id)`

3. **ClientSessions (Sessions Page)** - ❌ Doesn't show data
   - Uses: `user?.id` from `auth.users` (Supabase Auth)
   - Location: `ClientSessions.tsx` line 150
   - Query: `.eq('client_id', user?.id)`

### The Issue

Both `user.id` (from `auth.users`) and `userProfile.id` (from `public.users`) should be the same UUID, but:

1. **Timing Issue**: `userProfile` might be `null` when `user` exists, causing queries to fail silently
2. **RLS Policy**: RLS policies check `auth.uid()` which is the `auth.users` ID, so both should work IF the IDs match
3. **Data Mismatch**: If `client_id` in database doesn't match `auth.uid()`, RLS will block access

## Database State

From Supabase queries:
- `progress_metrics`: 10 records for 2 clients
- `client_sessions`: 14 records for 6 clients  
- `exercise_program_progress`: 0 records

Sample data exists for client `b2972fce-7eba-4617-bd1b-de9a54da80b4`:
- Has 3 progress_metrics
- Has 1 client_session

## RLS Policies

### progress_metrics
- ✅ Clients can view: `auth.uid() = client_id`
- ✅ Practitioners can view: `auth.uid() = practitioner_id`

### client_sessions  
- ✅ Clients can view: `auth.uid() = client_id`
- ✅ Therapists can view: `auth.uid() = therapist_id`

## Solution

### Option 1: Standardize on `user?.id` (Recommended)
Use `user?.id` consistently across all components since RLS policies check `auth.uid()`.

### Option 2: Add Fallback Logic
Use `user?.id || userProfile?.id` to handle timing issues.

### Option 3: Ensure userProfile is Loaded
Add loading checks to ensure `userProfile` is available before rendering components.

## Recommended Fix

Update `ClientProgress.tsx` to use `user?.id` with fallback:

```typescript
const clientId = user?.id || userProfile?.id;
```

This ensures:
1. Uses auth.users ID (which RLS checks)
2. Falls back to userProfile if user is null
3. Handles timing issues gracefully

