# Direct Booking Guest Access Fix

## Issue
The direct booking link `/book/johnny-osteo` should allow anyone to book without an account, but the query was filtering by a non-existent `user_role = 'practitioner'`.

## Fix Applied

### 1. Updated DirectBooking.tsx Query
**File:** `peer-care-connect/src/pages/public/DirectBooking.tsx`

**Changed:**
```typescript
// Before (incorrect)
.eq('user_role', 'practitioner')

// After (correct)
.in('user_role', ['sports_therapist', 'massage_therapist', 'osteopath'])
```

**Reason:** The database enum `user_role` doesn't include 'practitioner'. Valid practitioner roles are:
- `sports_therapist`
- `massage_therapist`
- `osteopath`

### 2. Verified Public Access
- ✅ Route `/book/:slug` is **public** (not wrapped in `SimpleProtectedRoute`)
- ✅ Component handles both authenticated and guest users:
  - Authenticated users → `BookingFlow`
  - Guest users → `GuestBookingFlow`
- ✅ RLS policy "Allow public read of practitioner profiles" allows unauthenticated access

## How It Works

1. **Unauthenticated User Visits** `/book/johnny-osteo`
2. **DirectBooking Component:**
   - Fetches practitioner by `booking_slug`
   - Checks if user is authenticated (`user` from `useAuth()`)
   - If not authenticated → renders `GuestBookingFlow`
   - If authenticated → renders `BookingFlow`

3. **GuestBookingFlow:**
   - Collects guest information (name, email, phone)
   - Creates guest user account via `upsert_guest_user` RPC
   - Processes booking without requiring account creation
   - Handles payment and booking creation

## Testing

✅ **Database Query Test:**
```sql
SELECT * FROM users 
WHERE booking_slug = 'johnny-osteo'
  AND user_role IN ('sports_therapist', 'massage_therapist', 'osteopath')
  AND is_active = true
  AND profile_completed = true;
```
**Result:** Successfully returns practitioner data

✅ **RLS Policy Verification:**
- Policy "Allow public read of practitioner profiles" allows public SELECT
- Conditions: `is_active = true`, `profile_completed = true`, `onboarding_status = 'completed'`

## Status

✅ **FIXED** - Direct booking links now work for unauthenticated users

Anyone can now visit `https://theramate.co.uk/book/johnny-osteo` and book without creating an account.

