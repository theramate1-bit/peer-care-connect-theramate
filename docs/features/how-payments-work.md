# How the Payment System Works

A guide to understanding payment processing for junior developers.

## Overview

The payment system handles all financial transactions using Stripe. It processes payments for bookings, manages subscriptions, and handles refunds.

## Key Concepts

### Payment Flow
1. Client selects service and books
2. Booking created with 'pending' status
3. Stripe PaymentIntent created
4. Client pays via Stripe
5. Webhook confirms payment
6. Booking status updated to 'confirmed'

### Pricing Structure
- **Service Price** - Base price set by practitioner
- **Platform Fee** - Percentage taken by platform
- **Practitioner Earnings** = Service Price - Platform Fee

## High-Level Flow

```
1. Client books session
   ↓
2. Calculate pricing (service + platform fee)
   ↓
3. Create booking record (status: 'pending')
   ↓
4. Create Stripe PaymentIntent
   ↓
5. Client pays via Stripe
   ↓
6. Stripe webhook confirms payment
   ↓
7. Booking status → 'confirmed'
   ↓
8. Practitioner notified
```

## Key Components

### 1. Booking Service
**Location:** `src/services/bookingService.ts`

**Main Function:**
```typescript
const { booking, paymentIntent } = await createBooking({
  serviceId: 'service-123',
  clientId: 'client-456',
  sessionDate: new Date('2025-02-15T14:00:00'),
  clientNotes: 'Lower back pain'
});
```

**What it does:**
1. Validates service exists
2. Calculates pricing
3. Creates booking record
4. Creates Stripe PaymentIntent
5. Returns booking + payment details

### 2. Stripe Integration

#### Payment Intent Creation
```typescript
// Backend creates PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000, // £50.00 in pence
  currency: 'gbp',
  metadata: {
    booking_id: booking.id,
    client_id: clientId,
    practitioner_id: practitionerId
  }
});
```

#### Frontend Payment
```typescript
// Client-side payment processing
const { error } = await stripe.confirmPayment({
  clientSecret: paymentIntent.client_secret,
  payment_method: {
    card: cardElement
  }
});
```

### 3. Webhook Handler
**Location:** `supabase/functions/stripe-webhook/index.ts`

**Handles Events:**
- `payment_intent.succeeded` - Payment confirmed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `checkout.session.completed` - Subscription created

## Step-by-Step Breakdown

### Step 1: Booking Creation

```typescript
// Client selects service and time
const booking = await createBooking({
  serviceId: selectedService.id,
  clientId: currentUser.id,
  sessionDate: selectedDate,
  clientNotes: 'Lower back pain'
});

// Booking created with:
// - status: 'pending'
// - total_price_pence: 5000
// - platform_fee_pence: 500
// - practitioner_earnings_pence: 4500
```

### Step 2: Payment Intent

```typescript
// Stripe PaymentIntent created
const paymentIntent = {
  id: 'pi_1234567890',
  client_secret: 'pi_1234567890_secret_...',
  amount: 5000,
  currency: 'gbp',
  status: 'requires_payment_method'
};
```

### Step 3: Client Payment

```typescript
// Client completes payment
const { error } = await stripe.confirmPayment({
  clientSecret: paymentIntent.client_secret,
  payment_method: {
    card: cardElement
  }
});

if (error) {
  // Handle payment error
} else {
  // Payment successful, wait for webhook
}
```

### Step 4: Webhook Confirmation

```typescript
// Stripe sends webhook to backend
// Event: payment_intent.succeeded
{
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_1234567890',
      metadata: {
        booking_id: 'booking-123'
      }
    }
  }
}

// Backend updates booking
await supabase
  .from('session_bookings')
  .update({ status: 'confirmed' })
  .eq('id', booking_id);
```

## Pricing Calculation

### Platform Fee
```typescript
// Platform fee is a percentage of service price
const platformFeePercentage = 0.10; // 10%
const platformFee = Math.round(servicePrice * platformFeePercentage);
```

### Practitioner Earnings
```typescript
// Practitioner gets service price minus platform fee
const practitionerEarnings = servicePrice - platformFee;
```

### Example
```typescript
Service Price: £50.00 (5000 pence)
Platform Fee (10%): £5.00 (500 pence)
Practitioner Earnings: £45.00 (4500 pence)
```

## Payment States

### Booking States
- `pending` - Created, awaiting payment
- `confirmed` - Payment received
- `completed` - Session finished
- `cancelled` - Cancelled by user
- `refunded` - Payment refunded

### Payment Intent States
- `requires_payment_method` - Needs payment method
- `requires_confirmation` - Needs confirmation
- `processing` - Payment processing
- `succeeded` - Payment successful
- `requires_action` - Needs additional action (3D Secure)

## Refunds

### Process Refund
```typescript
// Create refund via Stripe
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: 5000, // Full refund
  reason: 'requested_by_customer'
});

// Update booking status
await supabase
  .from('session_bookings')
  .update({ status: 'refunded' })
  .eq('id', bookingId);
```

## Common Questions

**Q: What happens if payment fails?**
A: Booking remains 'pending'. Client can retry payment or booking expires.

**Q: How are platform fees calculated?**
A: Percentage of service price (typically 10%). Set in `config/platform-fees.ts`.

**Q: When does practitioner get paid?**
A: Practitioners receive earnings after session is completed. Payouts handled separately.

**Q: Can bookings be refunded?**
A: Yes, via Stripe refund API. Booking status updated to 'refunded'.

## Related Files

- `src/services/bookingService.ts` - Booking creation
- `src/lib/stripe.ts` - Stripe utilities
- `supabase/functions/stripe-webhook/index.ts` - Webhook handler
- `config/platform-fees.ts` - Fee configuration

## Security Notes

- **Never store card details** - Stripe handles all card data
- **Verify webhooks** - Always verify Stripe webhook signatures
- **Use metadata** - Store booking IDs in PaymentIntent metadata
- **Idempotency** - Handle duplicate webhook events gracefully

## Next Steps

- Read `src/services/bookingService.ts`
- Understand Stripe PaymentIntent flow
- Review webhook handler
- Study refund process

---

**Last Updated:** 2025-02-09
