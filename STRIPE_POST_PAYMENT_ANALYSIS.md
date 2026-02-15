# Stripe Connect Post-Payment Flow Analysis

## Issues Found

### 🔴 Issue 1: Webhook Doesn't Send Emails

**Problem**: The webhook handler updates booking status and creates notifications, but **doesn't send confirmation emails**.

**Location**: `peer-care-connect/supabase/functions/stripe-webhook/index.ts` lines 354-414

**Current Behavior**:
- ✅ Updates `client_sessions` status to 'scheduled'
- ✅ Updates `client_sessions` payment_status to 'completed'
- ✅ Creates in-app notifications for client and practitioner
- ❌ **Does NOT send booking confirmation emails**
- ❌ **Does NOT send payment confirmation emails**

**Impact**: Clients and practitioners don't receive email confirmations after payment.

---

### 🔴 Issue 2: Status Mismatch Between Webhook and BookingSuccess

**Problem**: Webhook sets status to 'scheduled', but BookingSuccess tries to set it to 'confirmed'.

**Webhook** (line 361):
```typescript
status: 'scheduled',
```

**BookingSuccess** (line 95):
```typescript
status: 'confirmed', // Auto-confirm after successful payment
```

**Impact**: 
- If webhook runs first: Status = 'scheduled'
- If BookingSuccess runs: Status = 'confirmed'
- Race condition: Which one wins?

---

### 🔴 Issue 3: Duplicate Work

**Problem**: Both webhook and BookingSuccess page try to:
- Update booking status
- Create notifications (webhook only)
- Send emails (BookingSuccess only)

**Impact**: 
- Potential duplicate notifications (if both run)
- Missing emails if only webhook runs
- Inconsistent behavior depending on which runs first

---

### ⚠️ Issue 4: Stripe Connect Transfers

**Status**: **Automatically handled by Stripe Connect** ✅

When using Stripe Connect with `application_fee_amount` and `destination`:
- Stripe **automatically** transfers funds to practitioner's Connect account
- No manual transfer creation needed
- Funds go directly to practitioner (minus platform fee)

**Verification Needed**:
- Check if checkout sessions are created with `payment_intent_data.destination`
- Verify application_fee is set correctly

---

## Recommended Fix

### Option 1: Send Emails from Webhook (Recommended) ✅

**Why**: Webhook is the authoritative source for payment completion. It should handle all post-payment actions.

**Changes Needed**:
1. Invoke `send-email` Edge Function from webhook
2. Send booking confirmation emails
3. Send payment confirmation emails
4. Update status to 'confirmed' (not 'scheduled')
5. Remove duplicate logic from BookingSuccess page

### Option 2: Keep BookingSuccess Logic (Fallback)

**Why**: Provides redundancy if webhook fails.

**Changes Needed**:
1. Add idempotency check in BookingSuccess
2. Only send emails if webhook hasn't already done it
3. Check payment status before updating

---

## Current Flow

### When Payment Succeeds:

1. **Stripe sends webhook** (`checkout.session.completed`)
   - Updates `client_sessions` status → 'scheduled' ❌ (should be 'confirmed')
   - Updates `client_sessions` payment_status → 'completed' ✅
   - Creates notifications ✅
   - **Does NOT send emails** ❌

2. **Client redirected to BookingSuccess page**
   - Checks payment status
   - Updates `client_sessions` status → 'confirmed' ✅
   - Sends booking confirmation emails ✅
   - Sends payment confirmation emails ✅
   - Creates conversation ✅

**Problem**: If client doesn't visit BookingSuccess, emails never send!

---

## What Should Happen

### Proper Flow:

1. **Stripe sends webhook** (`checkout.session.completed`)
   - Update `client_sessions` status → 'confirmed' ✅
   - Update `client_sessions` payment_status → 'completed' ✅
   - Create in-app notifications ✅
   - **Send booking confirmation emails** ✅
   - **Send payment confirmation emails** ✅

2. **Client redirected to BookingSuccess page**
   - Display success message
   - Show booking details
   - Provide navigation links
   - **Do NOT duplicate webhook work**

---

## Files to Fix

1. `peer-care-connect/supabase/functions/stripe-webhook/index.ts`
   - Add email sending logic
   - Change status from 'scheduled' to 'confirmed'
   - Invoke send-email Edge Function

2. `peer-care-connect/src/pages/BookingSuccess.tsx`
   - Add idempotency check
   - Only update if webhook hasn't already done it
   - Or remove duplicate logic entirely

