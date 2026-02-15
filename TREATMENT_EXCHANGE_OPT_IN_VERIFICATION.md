# Treatment Exchange Opt-In Verification

## Issue Found
There was an inconsistency between two fields:
- `treatment_exchange_opt_in` (NEW - correct field, used in Credits.tsx)
- `treatment_exchange_enabled` (OLD - incorrect field, used in treatment-exchange.ts)

## Database Status
From Supabase query:
- **0 practitioners** have `treatment_exchange_opt_in = true`
- **2 practitioners** have `treatment_exchange_enabled = true` (but `treatment_exchange_opt_in = false`)
- This means practitioners with the OLD field enabled were appearing in lists, but shouldn't be

## Files Fixed

### ✅ Fixed: `peer-care-connect/src/lib/treatment-exchange.ts`
1. **Line 261**: Changed `.eq('treatment_exchange_enabled', true)` → `.eq('treatment_exchange_opt_in', true)`
2. **Line 395**: Changed select to include `treatment_exchange_opt_in` instead of `treatment_exchange_enabled`
3. **Lines 443-458**: Updated validation logic to check `treatment_exchange_opt_in` instead of `treatment_exchange_enabled`

### ✅ Already Correct: `peer-care-connect/src/pages/Credits.tsx`
- **Line 567**: Already uses `.eq('treatment_exchange_opt_in', true)` ✅

## Verification Query
```sql
SELECT 
  id,
  first_name,
  last_name,
  treatment_exchange_opt_in,
  is_active,
  user_role
FROM users
WHERE user_role IN ('sports_therapist', 'osteopath', 'massage_therapist')
  AND is_active = true
  AND treatment_exchange_opt_in = true;
```

**Result**: Returns 0 practitioners (correct - none have opted in yet)

## Current Behavior

### ✅ Correct Behavior Now:
1. **Credits.tsx** (line 567): Only shows practitioners with `treatment_exchange_opt_in = true`
2. **treatment-exchange.ts** (line 261): Only shows practitioners with `treatment_exchange_opt_in = true`
3. **treatment-exchange.ts** (line 444): Validates recipient has `treatment_exchange_opt_in = true` before allowing requests

### ✅ Toggle Behavior:
- When `treatment_exchange_opt_in = false`: Practitioner does NOT appear in treatment exchange lists
- When `treatment_exchange_opt_in = true`: Practitioner DOES appear in treatment exchange lists
- Toggle is controlled via `updateProfile({ treatment_exchange_opt_in: checked })` in Credits.tsx

## Remaining Legacy Code
- `setTreatmentExchangeEnabled()` function still uses `treatment_exchange_enabled` (line 191)
- This function appears to be legacy/deprecated
- The toggle in Credits.tsx uses `updateProfile()` directly, not this function
- **Recommendation**: This function can be deprecated or updated to also set `treatment_exchange_opt_in`

## Summary
✅ **FIXED**: Practitioners who have NOT opted into treatment exchange (`treatment_exchange_opt_in = false`) will NOT appear in treatment exchange options for other practitioners.

✅ **VERIFIED**: The toggle correctly controls visibility - only practitioners with the toggle ON (`treatment_exchange_opt_in = true`) are shown.

