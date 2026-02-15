# How the Booking System Works

A step-by-step guide to understanding the booking flow for junior developers.

## Overview

The booking system allows clients to schedule therapy sessions with practitioners. It handles:
- Service selection
- Date/time selection
- Payment processing
- Confirmation

## High-Level Flow

```
1. Client selects practitioner
   ↓
2. Client selects service
   ↓
3. Client picks date/time
   ↓
4. Client confirms booking
   ↓
5. Payment processed
   ↓
6. Booking confirmed
```

## Key Components

### 1. BookingFlow Component
**Location:** `src/components/marketplace/BookingFlow.tsx`

**Purpose:** Main booking interface

**Key State:**
- `step` - Current step in booking process
- `bookingData` - Booking information
- `selectedServiceId` - Selected service
- `services` - Available services

**Flow:**
1. Load practitioner services
2. Show service selection
3. Show date/time picker
4. Show confirmation
5. Process payment
6. Create booking

### 2. Booking Service
**Location:** `src/services/bookingService.ts`

**Purpose:** Handles booking creation and payment

**Key Functions:**
- `createBooking()` - Creates booking record
- `createStripePaymentIntent()` - Sets up payment

### 3. Slot Generation
**Location:** `src/lib/slot-generation-utils.ts`

**Purpose:** Generates available time slots

**Key Function:**
- `generate15MinuteSlots()` - Creates time slots with 15-minute intervals

## Step-by-Step Breakdown

### Step 1: Service Selection

```typescript
// User selects a service
const selectedService = services.find(s => s.id === selectedServiceId);

// Service has:
// - name
// - price
// - duration_minutes
// - description
```

### Step 2: Date/Time Selection

```typescript
// System generates available slots
const slots = generate15MinuteSlots(
  startTime,      // "09:00"
  endTime,        // "18:00"
  duration,       // 60 minutes
  existingBookings,
  blockedTimes,
  sessionDate
);

// User selects a slot
const selectedSlot = "14:00";
```

### Step 3: Booking Creation

```typescript
// Create booking record
const booking = await createBooking({
  serviceId: selectedService.id,
  clientId: currentUser.id,
  sessionDate: selectedDate,
  startTime: selectedSlot
});

// Create payment intent
const paymentIntent = await createStripePaymentIntent({
  amount: booking.total_price_pence,
  booking_id: booking.id
});
```

### Step 4: Payment Processing

```typescript
// User completes payment via Stripe
// Webhook confirms payment
// Booking status updated to "confirmed"
```

## Key Concepts

### Time Slots
- Generated in 15-minute intervals
- Must respect:
  - Working hours
  - Existing bookings
  - Blocked times
  - Buffer times (15 min between sessions)

### Booking States
- `pending` - Created, awaiting payment
- `confirmed` - Payment received
- `completed` - Session finished
- `cancelled` - Cancelled by user
- `refunded` - Payment refunded

### Pricing
- Service base price
- Platform fee (percentage)
- Practitioner earnings = base price - platform fee

## Common Questions

**Q: How are available slots calculated?**
A: The system checks:
1. Working hours
2. Existing bookings
3. Blocked time periods
4. Buffer requirements

**Q: What happens if two people book the same slot?**
A: The first booking locks the slot. The second booking will fail validation.

**Q: How does payment work?**
A: Stripe handles payment. We create a PaymentIntent, user pays, webhook confirms.

## Related Files

- `src/components/booking/BookingCalendar.tsx` - Calendar UI
- `src/lib/booking-validation.ts` - Validation logic
- `src/lib/slot-generation-utils.ts` - Slot generation
- `supabase/functions/stripe-webhooks/index.ts` - Payment webhook

## Next Steps

- Read the code in `BookingFlow.tsx`
- Trace through a booking creation
- Understand the validation logic
- Review the payment flow

---

**Last Updated:** 2025-02-09
