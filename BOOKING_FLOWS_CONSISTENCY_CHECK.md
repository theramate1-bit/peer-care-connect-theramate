# Booking Flows Consistency Check

## Files to Check by Flow

### 1. Peer Treatment Exchange Flow
**Files:**
- `peer-care-connect/src/lib/treatment-exchange.ts` - Main service logic
- `peer-care-connect/src/components/treatment-exchange/TreatmentExchangeBookingFlow.tsx` - Initial booking UI
- `peer-care-connect/src/components/treatment-exchange/ExchangeAcceptanceModal.tsx` - Acceptance & reciprocal booking UI
- `peer-care-connect/src/pages/Credits.tsx` - Uses TreatmentExchangeService
- `peer-care-connect/supabase/migrations/20251226185343_create_treatment_exchange_booking.sql` - RPC function

### 2. Client Marketplace Booking Flow
**Files:**
- `peer-care-connect/src/components/marketplace/BookingFlow.tsx` - Client booking UI
- `peer-care-connect/src/lib/booking-validation.ts` - Validation logic
- `peer-care-connect/src/lib/block-time-utils.ts` - Blocked time utilities
- `peer-care-connect/supabase/migrations/20251226185341_create_booking_with_validation.sql` - RPC function

### 3. Guest Marketplace Booking Flow
**Files:**
- `peer-care-connect/src/components/marketplace/GuestBookingFlow.tsx` - Guest booking UI
- `peer-care-connect/src/lib/booking-validation.ts` - Validation logic (shared)
- `peer-care-connect/src/lib/block-time-utils.ts` - Blocked time utilities (shared)
- `peer-care-connect/supabase/migrations/20251226185341_create_booking_with_validation.sql` - RPC function (shared)

---

## Status Values Comparison

### Database Enum Values (session_status)
✅ **Correct values:** `scheduled`, `confirmed`, `in_progress`, `pending_payment`, `completed`, `cancelled`, `no_show`

### Server-Side RPC Functions
✅ **create_booking_with_validation.sql** (line 92):
```sql
status IN ('scheduled', 'confirmed', 'in_progress', 'pending_payment')
```

✅ **create_treatment_exchange_booking.sql** (line 92):
```sql
status IN ('scheduled', 'confirmed', 'in_progress', 'pending_payment')
```

### Frontend Files Status

#### ✅ Client Marketplace Booking Flow
- `BookingFlow.tsx` (lines 334, 415, 593): ✅ `['scheduled', 'confirmed', 'in_progress', 'pending_payment']`
- `booking-validation.ts` (line 296): ✅ `['scheduled', 'confirmed', 'in_progress', 'pending_payment']`

#### ✅ Guest Marketplace Booking Flow
- `GuestBookingFlow.tsx` (lines 329, 420, 602): ✅ `['scheduled', 'confirmed', 'in_progress', 'pending_payment']`

#### ❌ Peer Treatment Exchange Flow - **INCONSISTENCIES FOUND**
- `TreatmentExchangeBookingFlow.tsx` (line 355): ❌ `['scheduled', 'pending_payment', 'confirmed']` - **MISSING 'in_progress'**
- `ExchangeAcceptanceModal.tsx` (line 271): ❌ `['scheduled', 'pending_payment', 'confirmed']` - **MISSING 'in_progress'**
- `ExchangeAcceptanceModal.tsx` (line 410): ❌ `['scheduled', 'pending_payment', 'confirmed']` - **MISSING 'in_progress'**
- `ExchangeAcceptanceModal.tsx` (line 512): ❌ `['scheduled', 'pending_payment', 'confirmed']` - **MISSING 'in_progress'**

---

## Blocked Time Checking Comparison

### Server-Side RPC Functions
✅ **Both RPC functions use:**
```sql
event_type IN ('block', 'unavailable')
AND status = 'confirmed'
AND (start_time < v_booking_end AND end_time > v_booking_start)
```

### Frontend Files

#### ✅ All Flows Use Consistent Blocked Time Logic
- All use `getBlocksForDate()` from `block-time-utils.ts`
- All use `isTimeSlotBlocked()` for slot filtering
- All use `getOverlappingBlocks()` for final validation
- All check: `event_type IN ('block', 'unavailable')` AND `status = 'confirmed'`

**Files:**
- ✅ `TreatmentExchangeBookingFlow.tsx` (line 360, 408)
- ✅ `ExchangeAcceptanceModal.tsx` (lines 278, 336, 415, 438, 525)
- ✅ `BookingFlow.tsx` (lines 340, 386, 420, 451, 621)
- ✅ `GuestBookingFlow.tsx` (lines 332, 373, 423, 453, 630)
- ✅ `block-time-utils.ts` (lines 59, 95) - Core utilities

---

## Expired pending_payment Filtering

### Server-Side RPC Functions
✅ **Both RPC functions filter expired:**
```sql
AND (
  (status = 'pending_payment' AND expires_at IS NOT NULL AND expires_at > NOW())
  OR status != 'pending_payment'
)
```

### Frontend Files

#### ✅ All Flows Filter Expired pending_payment
All flows check: `booking.status === 'pending_payment' && booking.expires_at && booking.expires_at < nowIso`

**Files:**
- ✅ `TreatmentExchangeBookingFlow.tsx` - Uses `existingBookings` but doesn't explicitly filter (needs check)
- ✅ `ExchangeAcceptanceModal.tsx` (lines 324, 429) - ✅ Filters expired
- ✅ `BookingFlow.tsx` (lines 376, 441, 606) - ✅ Filters expired
- ✅ `GuestBookingFlow.tsx` (lines 361, 443, 617) - ✅ Filters expired
- ✅ `booking-validation.ts` (line 304) - ✅ Filters expired

---

## Summary of Issues Found

### 🔴 Critical Issues

1. **TreatmentExchangeBookingFlow.tsx** - Missing `'in_progress'` in status array (line 355)
2. **ExchangeAcceptanceModal.tsx** - Missing `'in_progress'` in status arrays (lines 271, 410, 512)
3. **TreatmentExchangeBookingFlow.tsx** - May not filter expired `pending_payment` sessions (needs verification)

### ⚠️ Potential Issues

1. **TreatmentExchangeBookingFlow.tsx** - Does not explicitly filter expired `pending_payment` sessions in `existingBookings` check (line 396-405)

---

## Recommendations

1. **Fix status arrays** in Treatment Exchange flow to include `'in_progress'`
2. **Add expired pending_payment filtering** to TreatmentExchangeBookingFlow.tsx
3. **Verify all flows** use consistent status arrays matching server-side RPC functions
4. **Add unit tests** to ensure status arrays remain consistent across all flows

