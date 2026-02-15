# Frontend Locations Showing `pending_payment` Status

This document lists all places in the frontend where `pending_payment` status is displayed or used in UI logic.

## Display Locations (User-Visible)

### 1. **TherapistDashboard.tsx** (Line 76)
- **Location**: Status styling definition
- **Usage**: Defines visual styling for `pending_payment` status badge
- **Code**: 
  ```typescript
  pending_payment: "border-warning/25 bg-warning/10 text-warning"
  ```
- **Impact**: Sessions with `pending_payment` status will show with warning colors

### 2. **MySessions.tsx** (Lines 42, 913)
- **Location**: Client sessions page
- **Usage**: 
  - Type definition includes `pending_payment` (line 42)
  - Conditionally shows message button for `pending_payment` sessions (line 913)
- **Code**:
  ```typescript
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'pending_payment';
  
  {(session.status === 'scheduled' || session.status === 'confirmed' || session.status === 'pending_payment') && (
    <Button onClick={handleMessageTherapist}>Message</Button>
  )}
  ```
- **Impact**: Users see message button for sessions with `pending_payment` status

### 3. **ClientDashboard.tsx** (Lines 85, 104, 221, 227)
- **Location**: Client dashboard
- **Usage**: 
  - Includes `pending_payment` in queries for upcoming sessions (line 104)
  - Counts `pending_payment` sessions in upcoming count (line 227)
- **Code**:
  ```typescript
  .in('status' as any, ['scheduled', 'confirmed', 'pending_payment'])
  
  ['scheduled', 'confirmed', 'pending_payment'].includes(session.status)
  ```
- **Impact**: `pending_payment` sessions appear in upcoming sessions list and count

### 4. **BookingSuccess.tsx** (Line 465)
- **Location**: Booking success page
- **Usage**: Checks status display logic
- **Code**:
  ```typescript
  session.status === 'pending_payment' && (session.payment_status === 'completed' || session.payment_status === 'paid')
  ```
- **Impact**: Status display logic includes `pending_payment` check

## Query/Filter Locations (Not Directly Displayed)

These locations use `pending_payment` in database queries but don't directly display it:

1. **BookingCalendar.tsx** (Lines 81, 135) - Includes in status filter for calendar
2. **TherapistDashboard.tsx** (Lines 167, 266, 558) - Includes in session queries
3. **BookingFlow.tsx** (Lines 370, 436, 597, 610, 688) - Used in booking validation and slot checks
4. **GuestBookingFlow.tsx** (Lines 344, 398, 557, 572, 649) - Used in guest booking flow
5. **TreatmentExchangeBookingFlow.tsx** (Lines 369, 426) - Used in treatment exchange
6. **ExchangeAcceptanceModal.tsx** (Lines 327, 393, 486) - Used in exchange acceptance
7. **booking-validation.ts** (Lines 297, 312, 393, 398) - Used in validation logic
8. **slot-generation-utils.ts** (Line 55) - Filters expired pending_payment sessions
9. **slot-holding.ts** (Lines 147, 154) - Used in slot holding logic
10. **UnifiedBookingModal.tsx** (Lines 266, 297) - Used in booking modal
11. **payment-integration.ts** (Lines 71, 76) - Used in payment integration

## Recommendations

Since `pending_payment` is no longer used in client management, these locations should be updated:

1. **Remove from type definitions** (MySessions.tsx)
2. **Remove from status styling** (TherapistDashboard.tsx)
3. **Remove from queries** (ClientDashboard.tsx, all booking flows)
4. **Update status display logic** (BookingSuccess.tsx)
5. **Remove from validation/filtering logic** (booking-validation.ts, slot-generation-utils.ts, etc.)

