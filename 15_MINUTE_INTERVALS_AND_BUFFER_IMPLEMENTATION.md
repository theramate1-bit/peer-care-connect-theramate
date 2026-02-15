# 15-Minute Intervals and Buffer Implementation Summary

## Overview
This document summarizes the implementation of 15-minute booking intervals and 15-minute buffer enforcement between appointments across the Theramate platform.

## Changes Made

### 1. Slot Generation Utility (`peer-care-connect/src/lib/slot-generation-utils.ts`)
**NEW FILE** - Created a centralized utility for generating booking slots with:
- 15-minute interval slot generation
- 15-minute buffer enforcement after every appointment
- Support for service durations: 30, 45, 60, 75, 90 minutes

**Key Functions:**
- `generate15MinuteSlots()` - Generates slots every 15 minutes with buffer enforcement
- `generateDefault15MinuteSlots()` - Default 9 AM - 6 PM slot generation
- `hasBookingConflict()` - Checks for conflicts including buffer time

### 2. Booking Flow Updates

#### Marketplace Booking Flow (`peer-care-connect/src/components/marketplace/BookingFlow.tsx`)
- Updated `generateDefaultTimeSlots()` to use 15-minute intervals
- Updated `fetchAvailableTimeSlots()` to use 15-minute intervals
- Updated validation to enforce allowed durations (30, 45, 60, 75, 90)

#### Guest Booking Flow (`peer-care-connect/src/components/marketplace/GuestBookingFlow.tsx`)
- Updated `generateDefaultTimeSlots()` to use 15-minute intervals
- Updated `fetchAvailableTimeSlots()` to use 15-minute intervals
- Updated validation to enforce allowed durations

#### Treatment Exchange Booking Flow (`peer-care-connect/src/components/treatment-exchange/TreatmentExchangeBookingFlow.tsx`)
- Updated `generateDefaultTimeSlots()` to use 15-minute intervals
- Updated `fetchAvailableTimeSlots()` to use 15-minute intervals

#### Exchange Acceptance Modal (`peer-care-connect/src/components/treatment-exchange/ExchangeAcceptanceModal.tsx`)
- Updated `generateDefaultTimeSlots()` to use 15-minute intervals
- Updated `fetchAvailableTimeSlots()` to use 15-minute intervals

### 3. Service Management Updates

#### Service Management Component (`peer-care-connect/src/components/practitioner/ServiceManagement.tsx`)
- Changed duration input from number input to Select dropdown
- Restricted options to: 30, 45, 60, 75, 90 minutes only
- Removed ability to enter custom durations

### 4. Validation Updates

#### Booking Validation (`peer-care-connect/src/lib/booking-validation.ts`)
- Updated duration validation to only allow: 30, 45, 60, 75, 90 minutes
- Changed from range check (15-480) to explicit allowed values

#### Validators (`peer-care-connect/src/lib/validators.ts`)
- Updated `sessionSchema` to enforce allowed durations using `z.refine()`
- Updated `productSchema` to enforce allowed durations

#### Validation Schema (`peer-care-connect/src/lib/validation.ts`)
- Updated `sessionBookingSchema` to enforce allowed durations

### 5. Database Migration (`peer-care-connect/supabase/migrations/20250131_enforce_15min_buffer_and_durations.sql`)
**NEW MIGRATION** - Adds:
- Duration validation in `create_booking_with_validation` RPC
- 15-minute buffer enforcement in conflict checking
- Database constraints on `practitioner_products` and `practitioner_product_durations` tables

**Note:** The migration file needs to be updated to match the exact signature of the existing `create_booking_with_validation` function. The current implementation provides the logic that should be integrated.

## User Journey Impact

### For Guests/Clients:
✅ **More booking flexibility** - Can book at 9:00, 9:15, 9:30, etc. instead of only hourly
✅ **Clearer duration options** - Only 5 standard durations to choose from
✅ **Better availability** - More granular slots mean more booking opportunities

### For Practitioners:
✅ **Automatic buffer management** - System enforces 15-minute breaks between sessions
✅ **Standardized durations** - Easier to price and manage services
✅ **Better schedule density** - Can fit more appointments with proper buffers

## Technical Details

### Buffer Enforcement Logic
The buffer is enforced in two places:
1. **Frontend (slot generation)** - Slots are filtered out if they would violate the buffer
2. **Backend (RPC validation)** - Final validation ensures no buffer violations

### Conflict Detection
A conflict occurs if:
1. New booking overlaps with existing booking (direct overlap)
2. New booking starts within 15 minutes after existing booking ends
3. Existing booking starts within 15 minutes after new booking ends

### Allowed Service Durations
- 30 minutes
- 45 minutes
- 60 minutes
- 75 minutes
- 90 minutes

## Testing Checklist

- [ ] Test marketplace booking with 15-minute intervals
- [ ] Test guest booking with 15-minute intervals
- [ ] Test treatment exchange booking with 15-minute intervals
- [ ] Verify buffer enforcement prevents back-to-back bookings
- [ ] Verify service creation only allows allowed durations
- [ ] Test booking creation with buffer violations (should fail)
- [ ] Test booking creation with invalid durations (should fail)
- [ ] Verify existing bookings still work correctly

## Migration Notes

⚠️ **Important:** The database migration needs to be reviewed and updated to match the exact signature of the existing `create_booking_with_validation` function. The migration file provides the logic but may need adjustments based on the actual function implementation.

## Next Steps

1. Review and update the database migration to match existing function signature
2. Test all booking flows with the new 15-minute intervals
3. Verify buffer enforcement works correctly
4. Update any existing services that don't match allowed durations
5. Monitor for any edge cases or issues

