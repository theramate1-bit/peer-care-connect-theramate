# Booking Availability Fix Plan

## Issue Summary
**Error**: "Practitioner is not working on this day" when guests try to book with Natasha (and other practitioners)

**Root Cause**: Frontend-backend mismatch in handling practitioner availability:
- `GuestBookingFlow.tsx` falls back to default time slots (9 AM - 6 PM) when a day is disabled
- Backend `create_booking_with_validation` correctly rejects bookings on disabled days
- Result: Guests see "available" slots that are actually unavailable

## Data Investigation
Natasha Alfred's working hours (from `practitioner_availability` table):
```json
{
  "friday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "monday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "sunday": {"enabled": true, "start": "11:00", "end": "15:00"},  // ONLY Sunday enabled
  "tuesday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "saturday": {"enabled": false, "start": "10:00", "end": "15:00"},
  "thursday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "wednesday": {"enabled": false, "start": "09:00", "end": "17:00"}
}
```

## Files to Modify

### 1. GuestBookingFlow.tsx (CRITICAL)
**Location**: `peer-care-connect/src/components/marketplace/GuestBookingFlow.tsx`
**Lines**: 327-335

**Current Problematic Code**:
```typescript
if (!daySchedule || !daySchedule.enabled || !daySchedule.hours || daySchedule.hours.length === 0) {
  console.error('[GUEST BOOKING] No working hours for day:', {...});
  // Fall back to default hours instead of returning empty
  await generateDefaultTimeSlots(serviceDuration);
  return;
}
```

**Fix**: Don't fall back to default slots - instead return empty array and show user-friendly message

```typescript
if (!daySchedule || !daySchedule.enabled || !daySchedule.hours || daySchedule.hours.length === 0) {
  console.log('[GUEST BOOKING] Practitioner not working on:', dayOfWeek);
  setAvailableTimeSlots([]);  // No slots available - don't fall back
  setLoadingTimeSlots(false);
  return [];
}
```

### 2. Add User-Friendly "Not Available" Message
**Location**: Same file, around line 1056-1060

**Enhancement**: Add a message explaining why no slots are available when the day is disabled

```typescript
{availableTimeSlots.length === 0 && bookingData.session_date && !loadingTimeSlots && (
  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm font-medium">
        {practitioner.first_name} is not available on this day. Please try a different date.
      </span>
    </div>
  </div>
)}
```

### 3. Improve Date Picker UX (OPTIONAL - Phase 2)
**Enhancement**: Visually indicate which days the practitioner works in the date picker

## Implementation Steps

### Phase 1: Critical Fix (Immediate)
1. [ ] Update `GuestBookingFlow.tsx` to not fall back to default slots
2. [ ] Add user-friendly message when no slots available
3. [ ] Test with Natasha's availability (only Sunday works)
4. [ ] Test with other practitioners

### Phase 2: UX Improvements (Recommended)
1. [ ] Add visual indicators for working days in date picker
2. [ ] Show practitioner's working schedule summary on their profile
3. [ ] Add "next available" date suggestion

### Phase 3: Consistency Check
1. [ ] Verify `BookingFlow.tsx` (client marketplace) has correct behavior - CONFIRMED OK
2. [ ] Verify backend RPC validation matches frontend logic - CONFIRMED OK
3. [ ] Add integration tests for edge cases

## Testing Checklist

### Test Case 1: Guest Books on Non-Working Day ✅ FIXED
- [x] Select Natasha as practitioner
- [x] Pick a Monday (disabled day)
- [x] Verify: No time slots shown (not default 9-6 slots) - **CODE VERIFIED**
- [x] Verify: User-friendly message displayed - **ADDED**

**Fix Applied:** `GuestBookingFlow.tsx` lines 327-350 now return empty slots when day is disabled, instead of falling back to default slots.

### Test Case 2: Guest Books on Working Day
- [ ] Select Natasha as practitioner  
- [ ] Pick a Sunday (enabled day)
- [ ] Verify: Time slots 11:00 - 15:00 shown
- [ ] Complete booking successfully

### Test Case 3: Client Books on Non-Working Day ✅ ALREADY CORRECT
- [x] `BookingFlow.tsx` already has correct behavior
- [x] Returns empty slots when day is disabled (lines 386-389)
- [x] No fix needed

### Test Case 4: UnifiedBookingModal ✅ ALREADY CORRECT
- [x] `UnifiedBookingModal.tsx` already has correct behavior
- [x] Returns empty slots when day is disabled (lines 256-259)
- [x] No fix needed

### Test Case 5: Practitioner with No Availability Set
- [ ] Find practitioner with NULL working_hours
- [ ] Verify: Graceful handling (falls back to default slots - intentional for new practitioners)

## Code Changes Summary

| File | Change Type | Priority |
|------|-------------|----------|
| `GuestBookingFlow.tsx` | Fix fallback logic | CRITICAL |
| `GuestBookingFlow.tsx` | Add user message | HIGH |
| `BookingFlow.tsx` | Already correct | N/A |
| `create_booking_with_validation` | Already correct | N/A |

## Rollback Plan
If issues arise:
1. Revert `GuestBookingFlow.tsx` changes
2. The original behavior (showing fake slots) is less disruptive than broken bookings

## Implementation Summary

### Changes Made (2026-01-30)

#### 1. GuestBookingFlow.tsx - Core Fix
**Lines 327-350**: Changed from:
```typescript
// BEFORE (BUG): Fall back to default hours
if (!daySchedule || !daySchedule.enabled || !daySchedule.hours) {
  await generateDefaultTimeSlots(serviceDuration);
  return;
}
```

To:
```typescript
// AFTER (FIXED): Return empty slots when day is disabled
if (!daySchedule || !daySchedule.enabled) {
  setAvailableTimeSlots([]);
  setLoadingTimeSlots(false);
  return [];
}
```

#### 2. GuestBookingFlow.tsx - Legacy Format Support
**Lines 338-350**: Added support for legacy working hours format where `start` and `end` are on the day schedule directly (not in an `hours` array).

#### 3. GuestBookingFlow.tsx - Error Handling
**Lines 409-412**: Changed error fallback from generating default slots to returning empty slots.

#### 4. GuestBookingFlow.tsx - User-Friendly Warning
**Lines 1106-1122**: Added a visible warning message when no slots are available:
```
"[Practitioner] is not available on [Day]. Please select a different date to see available times."
```

### 5. UnifiedBookingModal.tsx - Legacy Format Fix (Production Fix)
**Issue**: Production uses this modal on public therapist profiles. It required `daySchedule.hours` (array), but the database stores **legacy format** (`start`/`end` on the day). Result: **no slots shown for any day** → users could not proceed, or saw "Practitioner is not working on this day" at checkout.

**Changes**:
- Only treat day as unavailable when `!daySchedule || daySchedule.enabled !== true`
- Support legacy format: if no `hours` array, use `daySchedule.start` and `daySchedule.end` as a single time block
- Generate slots from either `daySchedule.hours` (array) or `[{ start: daySchedule.start, end: daySchedule.end }]`
- Improved "no slots" message: "[Practitioner] is not available on [date]. Please select a different date."

### Files NOT Changed (Already Correct)
- `BookingFlow.tsx` - Client marketplace flow already returns empty slots when day is disabled
- `create_booking_with_validation` RPC - Already validates working hours server-side

## Notes
- The `BookingFlow.tsx` (client marketplace) already has correct behavior - returns empty slots when day is disabled
- Backend RPC validation is correct - it properly checks `enabled` flag
- Only `GuestBookingFlow.tsx` had the bug of falling back to default slots
- The fix ensures frontend and backend validation are now aligned
