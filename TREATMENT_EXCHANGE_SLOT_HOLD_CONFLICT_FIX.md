# Treatment Exchange Slot Hold Conflict Fix

## 🔴 PROBLEM IDENTIFIED

When accepting a treatment exchange request, the system was failing with:
```
Error: Slot is no longer available - conflicts detected
```

### Root Cause

1. **Slot Hold Recreation Logic**: When accepting a request, if the slot hold doesn't exist or has expired, the code tries to recreate it (lines 687-709 in `treatment-exchange.ts`).

2. **Conflict Detection Issue**: When recreating the slot hold, `SlotHoldingService.holdSlot()` calls `checkSlotConflicts()`, which checks for:
   - Existing bookings
   - Active slot holds

3. **The Problem**: The existing slot hold (created when the request was sent) was still active, so when trying to recreate it, `checkSlotConflicts()` detected the existing slot hold as a conflict and threw an error.

4. **Additional Issue**: `checkSlotConflicts()` didn't check for blocked time, but blocked time was being detected separately. The slot might have become blocked since the request was created.

## ✅ FIXES APPLIED

### 1. Updated `checkSlotConflicts()` to Exclude Existing Slot Holds

**File**: `peer-care-connect/src/lib/slot-holding.ts`

**Changes**:
- Added optional `excludeRequestId` parameter to `checkSlotConflicts()`
- When provided, excludes slot holds with that `request_id` from conflict checks
- This prevents the existing slot hold from being detected as a conflict when recreating

**Code**:
```typescript
static async checkSlotConflicts(
  practitionerId: string,
  sessionDate: string,
  startTime: string,
  endTime: string,
  excludeRequestId?: string | null  // NEW: Exclude slot holds for this request
): Promise<SlotConflict[]> {
  // ...
  // Check active slot holds (exclude the one we're recreating if excludeRequestId is provided)
  let holdsQuery = supabase
    .from('slot_holds')
    .select('id, session_date, start_time, end_time, expires_at, status, request_id')
    .eq('practitioner_id', practitionerId)
    .eq('session_date', sessionDate)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString());
  
  if (excludeRequestId) {
    // Exclude slot holds with the same request_id (we're recreating this one)
    holdsQuery = holdsQuery.neq('request_id', excludeRequestId);
  }
  // ...
}
```

### 2. Updated `holdSlot()` to Pass Request ID

**File**: `peer-care-connect/src/lib/slot-holding.ts`

**Changes**:
- Updated `holdSlot()` to pass `normalizedRequestId` to `checkSlotConflicts()`
- This ensures the existing slot hold is excluded when recreating

**Code**:
```typescript
// Check for conflicts (exclude existing slot hold for this request if recreating)
const conflicts = await this.checkSlotConflicts(practitionerId, sessionDate, startTime, endTime, normalizedRequestId);
```

### 3. Added Blocked Time Check Before Recreating Slot Hold

**File**: `peer-care-connect/src/lib/treatment-exchange.ts`

**Changes**:
- Added blocked time check BEFORE recreating the slot hold
- If the slot is now blocked, fail early with a clear error message
- This prevents attempting to recreate a slot hold for a blocked time slot

**Code**:
```typescript
// If slot hold doesn't exist or has expired, check for blocked time first, then recreate it
if (!slotHold || (slotHold.expires_at && new Date(slotHold.expires_at) < new Date()) || slotHold.status !== 'active') {
  console.log('Slot hold not found or expired, checking availability before recreating for request:', requestId);
  
  // Check for blocked time BEFORE recreating the slot hold
  const { getBlocksForDate, isTimeSlotBlocked } = await import('./block-time-utils');
  const blocks = await getBlocksForDate(request.recipient_id, request.requested_session_date);
  const startTime = request.requested_start_time.includes(':') && request.requested_start_time.split(':').length === 3
    ? request.requested_start_time.substring(0, 5)
    : request.requested_start_time;
  
  if (isTimeSlotBlocked(startTime, request.duration_minutes, blocks, request.requested_session_date)) {
    throw new Error('This time slot is now blocked or unavailable. The request cannot be accepted.');
  }
  
  // ... rest of slot hold recreation logic
}
```

### 4. Enhanced Booking Status Checks

**File**: `peer-care-connect/src/lib/slot-holding.ts`

**Changes**:
- Updated `checkSlotConflicts()` to check for multiple booking statuses: `['scheduled', 'confirmed', 'in_progress', 'pending_payment']`
- Added filtering for expired `pending_payment` sessions
- This is more consistent with the booking validation logic in RPC functions

**Code**:
```typescript
// Check existing bookings
const { data: bookings, error: bookingError } = await supabase
  .from('client_sessions')
  .select('id, session_date, start_time, duration_minutes, status, expires_at')
  .eq('session_date', sessionDate)
  .in('status', ['scheduled', 'confirmed', 'in_progress', 'pending_payment'])  // Multiple statuses
  .or(`therapist_id.eq.${practitionerId},client_id.eq.${practitionerId}`);

// Filter out expired pending_payment sessions
if (b.status === 'pending_payment' && b.expires_at && new Date(b.expires_at) < new Date()) {
  continue;
}
```

## 📋 VERIFICATION

### Test Scenarios

1. **Accept Request with Existing Slot Hold**:
   - ✅ Should exclude existing slot hold from conflict checks
   - ✅ Should successfully recreate slot hold if expired
   - ✅ Should convert slot hold to booking

2. **Accept Request with Blocked Time**:
   - ✅ Should check for blocked time before recreating slot hold
   - ✅ Should fail with clear error message if slot is blocked
   - ✅ Should not attempt to recreate slot hold for blocked time

3. **Accept Request with Conflicting Booking**:
   - ✅ Should detect existing bookings as conflicts
   - ✅ Should fail with appropriate error message
   - ✅ Should not create slot hold if conflicts exist

## 🎯 IMPACT

### Before Fix
- ❌ Slot hold recreation failed due to detecting existing slot hold as conflict
- ❌ No blocked time check before recreating slot hold
- ❌ Inconsistent booking status checks (only checked 'scheduled')
- ❌ Poor error messages when slot becomes unavailable

### After Fix
- ✅ Slot hold recreation works correctly (excludes existing slot hold)
- ✅ Blocked time checked before recreating slot hold
- ✅ Consistent booking status checks (multiple statuses)
- ✅ Clear error messages when slot is blocked or unavailable
- ✅ Better handling of expired pending_payment sessions

## 📝 FILES MODIFIED

1. **`peer-care-connect/src/lib/slot-holding.ts`**:
   - Added `excludeRequestId` parameter to `checkSlotConflicts()`
   - Updated `holdSlot()` to pass request ID to conflict check
   - Enhanced booking status checks

2. **`peer-care-connect/src/lib/treatment-exchange.ts`**:
   - Added blocked time check before recreating slot hold
   - Improved error handling for blocked slots

## 🧪 TESTING RECOMMENDATIONS

1. **Test slot hold recreation**:
   - Create a treatment exchange request
   - Wait for slot hold to expire (or manually expire it)
   - Accept the request
   - Verify slot hold is recreated successfully

2. **Test blocked time detection**:
   - Create a treatment exchange request
   - Block the time slot on the recipient's calendar
   - Try to accept the request
   - Verify it fails with clear error message

3. **Test conflict detection**:
   - Create a treatment exchange request
   - Book the same time slot with another client
   - Try to accept the request
   - Verify it fails with conflict error

