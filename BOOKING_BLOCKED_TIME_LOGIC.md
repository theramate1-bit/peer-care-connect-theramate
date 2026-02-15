# Booking & Blocked Time Logic Documentation

This document outlines the blocked time checking and booking flow logic for all three marketplaces:
1. **Guest Bookings** (non-authenticated users)
2. **Client Bookings** (authenticated clients)
3. **Treatment Exchange** (practitioner-to-practitioner bookings)

## Table of Contents
- [Blocked Time Utilities](#blocked-time-utilities)
- [Guest Booking Flow](#guest-booking-flow)
- [Client Booking Flow](#client-booking-flow)
- [Treatment Exchange Booking Flow](#treatment-exchange-booking-flow)
- [Common Patterns](#common-patterns)
- [Important Considerations](#important-considerations)

---

## Blocked Time Utilities

**File:** `peer-care-connect/src/lib/block-time-utils.ts`

### Key Functions

#### `getBlocksForDate(practitionerId, date)`
Fetches all blocked/unavailable time for a practitioner on a specific date.

**Parameters:**
- `practitionerId: string` - The practitioner's user ID
- `date: string` - Date in YYYY-MM-DD format

**Returns:** `Promise<BlockedTime[]>` - Array of blocked time events

**Query Logic:**
- Fetches from `calendar_events` table
- Filters: `event_type IN ('block', 'unavailable')` AND `status = 'confirmed'`
- Uses overlap logic: `block.start < endOfDay AND block.end > startOfDay`
- Orders by `start_time` ascending

#### `isTimeSlotBlocked(slotTime, slotDurationMinutes, blocks, sessionDate)`
Checks if a specific time slot overlaps with any blocked periods.

**Parameters:**
- `slotTime: string` - Time in HH:MM format (e.g., "14:00")
- `slotDurationMinutes: number` - Duration of the slot in minutes
- `blocks: BlockedTime[]` - Array of blocked time events
- `sessionDate: string` - Date in YYYY-MM-DD format

**Returns:** `boolean` - `true` if slot is blocked, `false` otherwise

**Overlap Logic:**
```typescript
// Slot overlaps block if: blockStart < slotEnd AND blockEnd > slotStart
const overlaps = blockStart < slotEnd && blockEnd > slotStart;
```

**Important Notes:**
- Creates slot times in UTC to match database timestamps
- Validates all inputs before checking
- Logs detailed overlap information for debugging

#### `getOverlappingBlocks(practitionerId, sessionDate, startTime, durationMinutes)`
Fetches blocks that overlap with a specific booking time range.

**Parameters:**
- `practitionerId: string` - The practitioner's user ID
- `sessionDate: string` - Date in YYYY-MM-DD format
- `startTime: string` - Start time in HH:MM format
- `durationMinutes: number` - Duration in minutes

**Returns:** `Promise<BlockedTime[]>` - Array of overlapping blocks

**Use Case:** Final validation before creating a booking to prevent race conditions

---

## Guest Booking Flow

**File:** `peer-care-connect/src/components/marketplace/GuestBookingFlow.tsx`

### Time Slot Generation

**Function:** `fetchAvailableTimeSlots()`

**Process:**
1. Validates `session_date` and `selectedServiceId` are present
2. Gets service duration from selected service
3. Fetches practitioner availability from `practitioner_availability` table
4. Gets existing bookings for the date (statuses: `['scheduled', 'confirmed', 'in_progress', 'pending_payment']`)
5. **Fetches blocked time:** `await getBlocksForDate(practitioner.user_id, bookingData.session_date)`
6. Generates time slots based on working hours
7. For each slot:
   - Checks if slot fits within working hours (duration-aware)
   - Checks if slot is booked (overlaps with existing bookings)
   - **Checks if slot is blocked:** `isTimeSlotBlocked(timeString, serviceDuration, blocks, bookingData.session_date)`
   - Only adds slot if `!isBooked && !isBlocked`

**Fallback:** `generateDefaultTimeSlots()` - Uses 9 AM to 6 PM if no availability data

### Pre-Booking Validation

**Function:** `handleBooking()`

**Blocked Time Check:**
```typescript
// Double-check for blocked/unavailable time
const blocks = await getOverlappingBlocks(
  practitioner.user_id,
  bookingData.session_date,
  bookingData.start_time,
  bookingData.duration_minutes
);

if (blocks.length > 0) {
  const blockType = blocks[0].event_type === 'block' ? 'blocked' : 'unavailable';
  const blockMessage = blocks[0].title
    ? `This time slot is ${blockType}: ${blocks[0].title}. Please select another time.`
    : `This time slot is ${blockType}. Please select another time.`;
  toast.error(blockMessage);
  setStep(1); // Go back to step 1 to reselect time
  return;
}
```

### Real-Time Updates

**Subscription:** Listens to `calendar_events` table changes for blocked time updates
- Event types: `'block'`, `'unavailable'`
- Refreshes time slots when blocks are added/removed

---

## Client Booking Flow

**File:** `peer-care-connect/src/components/marketplace/BookingFlow.tsx`

### Time Slot Generation

**Function:** `fetchAvailableTimeSlots()`

**Process:** (Identical to Guest Booking Flow)
1. Validates `session_date` and `selectedServiceId` are present
2. Gets service duration from selected service
3. Fetches practitioner availability
4. Gets existing bookings (same statuses as guest flow)
5. **Fetches blocked time:** `await getBlocksForDate(practitioner.user_id, bookingData.session_date)`
6. Generates time slots based on working hours
7. For each slot:
   - Checks duration fit
   - Checks booking conflicts
   - **Checks blocked time:** `isTimeSlotBlocked(timeString, serviceDuration, blocks, bookingData.session_date)`
   - Only adds if `!isBooked && !isBlocked`

**Fallback:** `generateDefaultTimeSlots()` - Same 9 AM to 6 PM default

### Pre-Booking Validation

**Function:** `handleBooking()`

**Blocked Time Check:**
```typescript
// Check for blocked/unavailable time
const blocks = await getOverlappingBlocks(
  practitioner.user_id,
  bookingData.session_date,
  bookingData.start_time,
  bookingData.duration_minutes
);

if (blocks.length > 0) {
  const blockType = blocks[0].event_type === 'block' ? 'blocked' : 'unavailable';
  const blockMessage = blocks[0].title 
    ? `This time slot is ${blockType}: ${blocks[0].title}. Please select another time.`
    : `This time slot is ${blockType}. Please select another time.`;
  toast.error(blockMessage);
  setStep(1); // Go back to step 1 to reselect time
  return;
}
```

### Real-Time Updates

**Subscription:** Listens to `calendar_events` table changes
- Same pattern as guest bookings
- Refreshes when blocks are added/removed/modified

---

## Treatment Exchange Booking Flow

**File:** `peer-care-connect/src/components/treatment-exchange/TreatmentExchangeBookingFlow.tsx`

### Time Slot Generation

**Function:** `fetchAvailableTimeSlots()`

**Process:**
1. Validates `session_date` and `selectedServiceId` are present
2. Gets service duration
3. Fetches practitioner availability
4. Gets existing bookings for **both** practitioners (recipient and requester)
5. **Fetches blocked time for recipient:** `await getBlocksForDate(recipientPractitioner.user_id, bookingData.session_date)`
6. Generates time slots based on working hours
7. For each slot:
   - Checks duration fit
   - Checks booking conflicts (for both practitioners)
   - **Checks blocked time:** `isTimeSlotBlocked(timeString, serviceDuration, blocks, bookingData.session_date)`
   - Only adds if `!isBooked && !isBlocked`

**Important:** Treatment exchange checks blocked time for the **recipient practitioner** (the one being booked)

### Pre-Booking Validation

**Function:** `handleBooking()`

**Blocked Time Check:**
```typescript
// Check for blocked/unavailable time on recipient's calendar
const blocks = await getOverlappingBlocks(
  recipientPractitioner.user_id, // Note: recipient, not requester
  bookingData.session_date,
  bookingData.start_time,
  bookingData.duration_minutes
);

if (blocks.length > 0) {
  const blockType = blocks[0].event_type === 'block' ? 'blocked' : 'unavailable';
  toast.error(`This time slot is ${blockType} for ${recipientPractitioner.first_name}. Please select another time.`);
  setStep(1);
  return;
}
```

### Real-Time Updates

**Subscription:** Listens to `calendar_events` for recipient practitioner
- Filters by recipient's `user_id`
- Refreshes time slots when blocks change

---

## Common Patterns

### 1. Status Arrays for Bookings

All flows use the same status array to check for existing bookings:
```typescript
['scheduled', 'confirmed', 'in_progress', 'pending_payment']
```

**Important:** Expired `pending_payment` sessions are filtered out:
```typescript
const nowIso = new Date().toISOString();
if (booking.status === 'pending_payment' && booking.expires_at && booking.expires_at < nowIso) {
  return false; // Skip expired pending payments
}
```

### 2. Duration-Aware Overlap Detection

All flows check if bookings overlap considering duration:
```typescript
const bookingStart = parseInt(booking.start_time.split(':')[0]);
const bookingEnd = bookingStart + Math.ceil(booking.duration_minutes / 60);
// Overlap: bookingStart < slotEnd && bookingEnd > slotStart
return bookingStart < slotEndHour && bookingEnd > hour;
```

### 3. Blocked Time Check Pattern

All flows follow this pattern:
1. Fetch blocks: `getBlocksForDate(practitionerId, date)`
2. Check each slot: `isTimeSlotBlocked(slotTime, duration, blocks, date)`
3. Final validation: `getOverlappingBlocks(practitionerId, date, time, duration)`

### 4. Error Handling

All flows:
- Show user-friendly error messages with block title if available
- Return user to step 1 to reselect time
- Log detailed information for debugging

---

## Important Considerations

### Timezone Handling

- **Blocked times** are stored in UTC in the database
- **Slot times** are created in UTC: `${date}T${hour}:${minute}:00Z`
- **Working hours** may be in practitioner's local timezone
- The `isTimeSlotBlocked` function handles UTC conversion automatically

### Date Format

- **Always use:** `YYYY-MM-DD` format (e.g., "2026-01-03")
- HTML date inputs return this format automatically
- Database stores dates in this format

### Block Types

- **`'block'`**: Practitioner manually blocked time (e.g., "Lunch", "Personal Time")
- **`'unavailable'`**: System-generated unavailable periods
- Both types are treated identically in booking logic

### Status Requirements

- Only blocks with `status = 'confirmed'` are considered
- Pending or cancelled blocks are ignored
- This allows practitioners to "draft" blocks without affecting availability

### Real-Time Updates

All flows subscribe to real-time changes:
- `calendar_events` table changes (for blocks)
- `client_sessions` table changes (for bookings)
- `practitioner_availability` table changes (for working hours)

**Channel naming:**
- Guest: `availability-guest-${practitionerId}-${date}`
- Client: `availability-${practitionerId}-${date}`
- Treatment Exchange: `availability-treatment-exchange-${recipientId}-${date}`

### Performance Considerations

- Blocks are fetched once per date selection
- Cached in component state until date changes
- Real-time subscriptions are cleaned up on unmount
- Overlap checks are efficient (O(n) where n = number of blocks)

---

## Debugging

### Console Logs

All flows include detailed logging:

**Blocked Time Detection:**
- `[BLOCKED TIME] getBlocksForDate called:` - When blocks are fetched
- `[BLOCKED TIME] *** FOUND BLOCKS ***:` - When blocks are found
- `[BLOCKED TIME] *** OVERLAP DETECTED ***:` - When a slot overlaps a block
- `[BLOCKED TIME] *** SLOT IS BLOCKED ***:` - When a slot is excluded

**Booking Flow Logs:**
- `[GUEST BOOKING] Slot excluded - BLOCKED:` - Guest booking slot exclusion
- `[CLIENT BOOKING] Slot excluded - BLOCKED:` - Client booking slot exclusion
- `[GUEST BOOKING] Generated time slots:` - Final slot list for guests
- `[CLIENT BOOKING] Generated time slots:` - Final slot list for clients

### Common Issues

1. **No slots showing:**
   - Check if all slots are blocked/booked
   - Verify working hours are set for that day
   - Check console for block detection logs

2. **Slots showing when they shouldn't:**
   - Verify block `status = 'confirmed'`
   - Check block `event_type` is `'block'` or `'unavailable'`
   - Verify date format matches (YYYY-MM-DD)

3. **Timezone issues:**
   - Ensure blocked times are stored in UTC
   - Check `isTimeSlotBlocked` is using UTC for slot times
   - Verify practitioner timezone in `practitioner_availability`

---

## Files Reference

### Core Utilities
- `peer-care-connect/src/lib/block-time-utils.ts` - Blocked time checking functions

### Booking Flows
- `peer-care-connect/src/components/marketplace/GuestBookingFlow.tsx` - Guest bookings
- `peer-care-connect/src/components/marketplace/BookingFlow.tsx` - Client bookings
- `peer-care-connect/src/components/treatment-exchange/TreatmentExchangeBookingFlow.tsx` - Treatment exchange

### Validation
- `peer-care-connect/src/lib/booking-validation.ts` - Booking validation logic
- `peer-care-connect/supabase/migrations/*_create_booking_with_validation.sql` - RPC function for server-side validation

### Database Tables
- `calendar_events` - Stores blocked/unavailable time
- `client_sessions` - Stores bookings
- `practitioner_availability` - Stores working hours

---

## Making Edits

When editing booking flows, ensure:

1. **Blocked time is always checked:**
   - In `fetchAvailableTimeSlots()` - Filter slots
   - In `handleBooking()` - Final validation before booking

2. **Status arrays are consistent:**
   - Use: `['scheduled', 'confirmed', 'in_progress', 'pending_payment']`
   - Filter expired `pending_payment` sessions

3. **Real-time subscriptions are set up:**
   - Subscribe to `calendar_events` changes
   - Clean up on unmount

4. **Error messages are user-friendly:**
   - Include block title if available
   - Return user to time selection step

5. **Logging is maintained:**
   - Keep debug logs for troubleshooting
   - Use consistent log prefixes

---

**Last Updated:** 2025-01-03
**Maintained By:** Development Team


