# Email Not Sending - Action Plan

## 🔍 Root Cause Identified

**Problem:** Confirmed bookings are not triggering emails.

**Evidence:**
- ✅ Email function works (tested successfully)
- ✅ Client emails exist (rayman196823@gmail.com)
- ✅ Practitioner emails exist (theramate1@gmail.com)
- ❌ **No payment records** found for confirmed sessions
- ❌ **No emails** sent for confirmed sessions

**Conclusion:** The Stripe webhook is likely **not being called** or **not processing these sessions correctly**.

---

## 🎯 Most Likely Causes

### 1. **Webhook Not Configured in Stripe** (80% probability)
- Stripe doesn't know where to send webhook events
- Webhook endpoint not set up
- `checkout.session.completed` event not enabled

### 2. **session_id Missing from Stripe Metadata** (15% probability)
- When creating checkout session, `session_id` not added to metadata
- Webhook can't find which session to confirm
- Code at line 451 checks: `session.metadata?.session_id`

### 3. **Webhook Failing Silently** (5% probability)
- Webhook is called but errors are caught and not logged
- Payment records not created
- Emails not sent

---

## 🛠️ Immediate Actions Required

### Action 1: Check Stripe Webhook Configuration ⚠️ **CRITICAL**

**Steps:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Check if webhook endpoint exists:
   - URL: `https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook`
   - Status: **Active** (not disabled)
   - Events: `checkout.session.completed` is enabled

**If webhook doesn't exist:**
1. Click "Add endpoint"
2. Enter URL: `https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Save
5. Copy the webhook signing secret
6. Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

**If webhook exists but disabled:**
- Enable it
- Verify events are selected

---

### Action 2: Verify session_id in Checkout Metadata ⚠️ **IMPORTANT**

**Location:** Where checkout sessions are created (likely in booking flow)

**Check:**
```typescript
// When creating Stripe checkout session, ensure:
metadata: {
  session_id: clientSessionId,  // ← THIS MUST BE PRESENT
  client_user_id: clientId,
  practitioner_id: practitionerId,
  // ... other metadata
}
```

**If missing:**
- Add `session_id` to metadata when creating checkout
- This is required for webhook to know which session to confirm

---

### Action 3: Check Supabase Edge Function Logs

**Steps:**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for: `stripe-webhook`
3. Look for:
   - `checkout.session.completed` events
   - `[SUCCESS]` messages (emails sent)
   - `[CRITICAL]` messages (errors)
   - Any exceptions

**What to look for:**
- **If NO logs:** Webhook not being called → Fix Action 1
- **If logs show errors:** Fix the errors
- **If logs show success but no emails:** Check email function logs

---

### Action 4: Test Webhook Manually

**Create a test booking and monitor:**
1. Create a test booking in your app
2. Complete payment
3. **Immediately** check:
   - Supabase logs for webhook activity
   - Stripe Dashboard → Webhooks → Recent events
   - Email logs in database

**Or use this test script:**
```javascript
// test-webhook-manual.js
// (Create this to manually trigger webhook with test data)
```

---

## 📋 Verification Checklist

After fixing, verify:

- [ ] Stripe webhook is configured and active
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Supabase secrets
- [ ] `checkout.session.completed` event is enabled
- [ ] `session_id` is in checkout metadata
- [ ] Webhook logs show activity when booking is made
- [ ] Payment records are created in `payments` table
- [ ] Email logs show emails sent
- [ ] Emails arrive in inbox (check spam too)

---

## 🔧 Code Locations to Check

### 1. Checkout Session Creation
**Find where:** Stripe checkout sessions are created
**Check:** `metadata.session_id` is included

### 2. Webhook Handler
**File:** `peer-care-connect/supabase/functions/stripe-webhook/index.ts`
**Lines:** 451-728 (email sending logic)
**Status:** Code looks correct, but may not be executing

### 3. Email Function
**File:** `supabase/functions/send-email/index.ts`
**Status:** ✅ Working (tested successfully)

---

## 🚀 Quick Fix Steps

1. **Check Stripe Dashboard** → Webhooks → Verify endpoint exists
2. **If missing:** Add webhook endpoint
3. **Add webhook secret** to Supabase secrets
4. **Verify metadata** includes `session_id` when creating checkout
5. **Test** with a new booking
6. **Monitor** logs in real-time

---

## 📊 Expected Flow After Fix

1. User completes payment
2. Stripe sends `checkout.session.completed` webhook
3. Webhook receives event
4. Webhook finds `session_id` in metadata
5. Webhook updates session status to `confirmed`
6. Webhook creates payment record
7. Webhook sends 4 emails:
   - Booking confirmation (client)
   - Booking confirmation (practitioner)
   - Payment confirmation (client)
   - Payment received (practitioner)
8. Emails logged to `email_logs` table
9. Emails delivered via Resend

---

## 🎯 Success Criteria

✅ Webhook logs show `checkout.session.completed` events  
✅ Payment records created in `payments` table  
✅ Email logs show emails sent  
✅ Emails arrive in inboxes  
✅ No errors in webhook logs  

---

**Status:** 🔴 **AWAITING WEBHOOK CONFIGURATION CHECK**  
**Next Step:** Check Stripe Dashboard for webhook configuration

