# Quick Wins Implementation - User Feedback

**Date:** 2025-02-09  
**Priority:** High  
**Estimated Time:** 1-2 days per item

## 1. Fix Date Display Bug ⚠️

**Issue:** Calendar showing incorrect day of week  
**Files to Check:**
- `src/components/booking/CalendarTimeSelector.tsx` (line 331: `startingDayOfWeek = firstDay.getDay()`)
- `src/components/booking/EnhancedBookingCalendar.tsx` (line 418: `startingDayOfWeek = firstDay.getDay()`)
- `src/components/BookingCalendar.tsx` (line 613: `startOfWeek(monthStart, { weekStartsOn: 1 })`)

**Problem:** JavaScript's `getDay()` returns 0-6 (Sunday-Saturday), but calendar might expect Monday-Sunday (1-7)

**Fix:**
```typescript
// Current (potentially buggy):
const startingDayOfWeek = firstDay.getDay();

// Fixed (Monday = 0):
const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
```

**Test:** Verify calendar shows correct day of week for all months

---

## 2. Improve "Fix" Button UX ✅

**Issue:** "Fix" button hard to find (hidden on mobile, only shows on hover)  
**File:** `src/components/profile/ProfileCompletionWidget.tsx` (lines 300-309)

**Current Code:**
```typescript
<Button 
  variant="ghost" 
  size="sm" 
  onClick={check.action}
  className="h-8 px-2 text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
>
  Fix <ArrowRight className="ml-1 h-3 w-3" />
</Button>
```

**Fix Options:**

### Option A: Always Visible (Recommended)
```typescript
<Button 
  variant="outline" 
  size="sm" 
  onClick={check.action}
  className="h-8 px-3 text-primary"
>
  Fix <ArrowRight className="ml-1 h-3 w-3" />
</Button>
```

### Option B: Replace with Checkbox (User Suggestion)
```typescript
<label className="flex items-center gap-2 cursor-pointer">
  <input 
    type="checkbox" 
    checked={false}
    onChange={check.action}
    className="h-4 w-4 text-primary"
  />
  <span className="text-sm text-primary">Mark as complete</span>
</label>
```

**Recommendation:** Option A (always visible button) - clearer action than checkbox

---

## 3. Add Stripe T&C Visibility 📋

**Issue:** Terms unclear during onboarding  
**File:** `src/components/onboarding/PaymentSetupStep.tsx`

**Fix:** Add clear terms acceptance section

```typescript
<div className="space-y-4">
  <div className="flex items-start gap-2">
    <input 
      type="checkbox" 
      id="stripe-terms"
      required
      className="mt-1"
    />
    <label htmlFor="stripe-terms" className="text-sm">
      I agree to{' '}
      <a 
        href="https://stripe.com/gb/legal/connect-account" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary underline"
      >
        Stripe's Connected Account Agreement
      </a>
      {' '}and{' '}
      <a 
        href="https://stripe.com/gb/legal" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary underline"
      >
        Stripe Services Agreement
      </a>
    </label>
  </div>
</div>
```

---

## 4. Add Payment Notifications 💰

**Issue:** Practitioners not notified when payments received  
**File:** `supabase/functions/stripe-webhook/index.ts`

**Current:** Webhook processes payment but doesn't notify practitioner

**Fix:** Add notification when payment succeeds

```typescript
// In payment_intent.succeeded handler:
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  const bookingId = paymentIntent.metadata?.booking_id;
  const practitionerId = paymentIntent.metadata?.practitioner_id;
  
  // ... existing payment processing ...
  
  // Add notification
  if (practitionerId) {
    await supabase
      .from('notifications')
      .insert({
        user_id: practitionerId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `You received £${(paymentIntent.amount / 100).toFixed(2)} for booking #${bookingId}`,
        metadata: {
          booking_id: bookingId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      });
  }
}
```

---

## Implementation Checklist

- [ ] Fix date display bug in all calendar components
- [ ] Update ProfileCompletionWidget "Fix" button UX
- [ ] Add Stripe T&C acceptance to onboarding
- [ ] Add payment notifications to webhook handler
- [ ] Test all fixes with user scenarios
- [ ] Update documentation

---

**Created By:** BMad Method V6  
**Date:** 2025-02-09
