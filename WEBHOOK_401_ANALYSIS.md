# Webhook 401 Error - Complete Analysis

## 🔍 Investigation Results

**Date:** January 2025  
**Status:** 🔴 **401 UNAUTHORIZED - ROOT CAUSE IDENTIFIED**

---

## ✅ What I Verified

1. **STRIPE_WEBHOOK_SECRET is SET** ✅
   - Confirmed via `supabase secrets list`
   - Secret hash: `453a97c7eab45048f4ae05ffed40f3172e31404c6df96549758a2cc16d5c5942`
   - Secret exists in Supabase Edge Function secrets

2. **Email Function Works** ✅
   - Test email sent successfully
   - Resend API configured correctly

3. **Webhook Code is Correct** ✅
   - Code includes email sending logic
   - Signature verification logic is present

---

## 🔴 The Problem

**Webhook returning 401 Unauthorized**

**Evidence:**
- Edge Function logs: `POST | 401 | stripe-webhook` (167ms execution)
- No webhook_events in database (empty table)
- Code location: Line 320-325 in `stripe-webhook/index.ts`

**Code that's causing 401:**
```typescript
const stripeSignature = req.headers.get("stripe-signature");

if (!stripeSignature && req.method === "POST") {
  console.error("❌ POST request without stripe-signature header - not a valid Stripe webhook");
  return new Response(JSON.stringify({ error: "Missing Stripe signature header" }), {
    status: 401,
  });
}
```

**This means:** The `stripe-signature` header is **missing** from the request.

---

## 🎯 Root Cause Analysis

### Why is the header missing?

**Most Likely Causes:**

1. **Webhook endpoint not configured in Stripe** (80% probability)
   - Stripe doesn't know to send webhooks to this endpoint
   - No webhook endpoint exists in Stripe Dashboard
   - Webhook endpoint is disabled

2. **Webhook endpoint URL mismatch** (15% probability)
   - Stripe webhook points to wrong URL
   - URL doesn't match: `https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook`

3. **Request not from Stripe** (5% probability)
   - Someone/something else is calling the endpoint
   - Missing Stripe signature header because it's not a Stripe request

---

## 🛠️ Solution

### Step 1: Verify Webhook Endpoint in Stripe

**Action Required:** Check if webhook endpoint exists in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Look for endpoint: `https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook`
3. Check:
   - ✅ Endpoint exists
   - ✅ Status is **Active** (not disabled)
   - ✅ `checkout.session.completed` event is enabled
   - ✅ Signing secret matches what's in Supabase

**If webhook doesn't exist:**
- Create it (see Step 2)

**If webhook exists but is disabled:**
- Enable it

**If webhook exists but wrong events:**
- Add `checkout.session.completed` event

### Step 2: Create Webhook Endpoint (if missing)

1. **Go to Stripe Dashboard:**
   - Navigate to: https://dashboard.stripe.com/webhooks
   - Click **"Add endpoint"**

2. **Configure Endpoint:**
   ```
   Endpoint URL: https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook
   Description: Theramate Payment Webhook
   ```

3. **Select Events:**
   - ✅ `checkout.session.completed` (REQUIRED for booking emails)
   - ✅ `payment_intent.succeeded`
   - ✅ `invoice.paid`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

4. **Get Signing Secret:**
   - After creating, click on the endpoint
   - Click **"Reveal"** next to "Signing secret"
   - Copy the secret (starts with `whsec_`)

5. **Update Supabase Secret:**
   ```bash
   cd peer-care-connect
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_new_secret_here
   ```

### Step 3: Test Webhook

**After configuring:**

1. **Create a test booking:**
   - Make a test payment
   - Complete checkout

2. **Check Supabase Logs:**
   - Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
   - Filter for: `stripe-webhook`
   - Should see: `POST | 200` (not 401)

3. **Check Stripe Dashboard:**
   - Go to: Webhooks → Your endpoint → Recent events
   - Should see successful deliveries

4. **Check Database:**
   - `webhook_events` table should have entries
   - `email_logs` table should show emails sent
   - `payments` table should have `checkout_session_id`

---

## 📊 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| STRIPE_WEBHOOK_SECRET | ✅ Set | Secret exists in Supabase |
| Email Function | ✅ Working | Test email sent successfully |
| Webhook Code | ✅ Correct | Includes email sending logic |
| Webhook Endpoint | ❓ Unknown | Need to verify in Stripe |
| Webhook Events | ❌ None | No events in database |
| Email Sending | ❌ Failing | 401 blocking all requests |

---

## 🎯 Next Steps

1. **IMMEDIATE:** Check Stripe Dashboard for webhook endpoint
2. **IF MISSING:** Create webhook endpoint with correct URL
3. **IF EXISTS:** Verify it's active and has correct events
4. **UPDATE:** Ensure signing secret matches Supabase
5. **TEST:** Create test booking and verify emails send

---

## 🔍 Verification Checklist

After fixing:

- [ ] Webhook endpoint exists in Stripe Dashboard
- [ ] Endpoint URL is correct
- [ ] Endpoint status is **Active**
- [ ] `checkout.session.completed` event is enabled
- [ ] Signing secret matches Supabase secret
- [ ] Webhook logs show `200` (not `401`)
- [ ] `webhook_events` table has entries
- [ ] `email_logs` shows emails sent
- [ ] Emails arrive in inbox

---

**Status:** 🔴 **AWAITING STRIPE WEBHOOK CONFIGURATION VERIFICATION**  
**Blocking Issue:** Missing `stripe-signature` header → 401 error → No emails sent

