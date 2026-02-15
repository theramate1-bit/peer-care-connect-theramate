# 🔴 EMAIL ISSUE - ROOT CAUSE FOUND

## Critical Discovery

**Date:** January 2025  
**Status:** 🔴 **WEBHOOK RETURNING 401 UNAUTHORIZED**

---

## 🔍 What I Found Using Supabase MCP

### Edge Function Logs Show:
```
POST | 401 | https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook
Execution time: 167ms
```

**This means:**
- ✅ Stripe IS calling the webhook (webhook is configured)
- ❌ Webhook is **rejecting requests with 401 Unauthorized**
- ❌ Webhook never processes the events
- ❌ Emails never get sent

---

## 🎯 Root Cause

The webhook handler is returning **401 Unauthorized** because:

**Looking at the code** (`peer-care-connect/supabase/functions/stripe-webhook/index.ts` lines 320-326):

```typescript
if (!stripeSignature && req.method === "POST") {
  console.error("❌ POST request without stripe-signature header - not a valid Stripe webhook");
  return new Response(JSON.stringify({ error: "Missing Stripe signature header" }), {
    status: 401,
  });
}
```

**Possible causes:**
1. **Missing `stripe-signature` header** (unlikely - Stripe always sends this)
2. **Missing `STRIPE_WEBHOOK_SECRET`** in Supabase secrets
3. **Signature verification failing** (wrong secret or signature mismatch)
4. **Webhook secret mismatch** between Stripe and Supabase

---

## 🛠️ Immediate Fix Steps

### Step 1: Verify STRIPE_WEBHOOK_SECRET is Set

**Action:** Check if the secret exists in Supabase

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Click "Secrets" tab
3. Look for: `STRIPE_WEBHOOK_SECRET`
4. **If missing:** Add it (get from Stripe Dashboard)

### Step 2: Get Webhook Secret from Stripe

**Action:** Get the correct webhook signing secret

1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint: `https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook`
3. Click on it
4. Click "Reveal" next to "Signing secret"
5. Copy the secret (starts with `whsec_`)

### Step 3: Add Secret to Supabase

**Action:** Add the webhook secret to Supabase Edge Function secrets

**Via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Click "Secrets" tab
3. Click "Add new secret"
4. Key: `STRIPE_WEBHOOK_SECRET`
5. Value: `whsec_...` (from Stripe)
6. Save

**Via CLI:**
```bash
cd peer-care-connect
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### Step 4: Verify Webhook is Active in Stripe

**Action:** Ensure webhook is enabled and has correct events

1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint
3. Verify:
   - ✅ Status: **Active** (not disabled)
   - ✅ Events: `checkout.session.completed` is selected
   - ✅ Endpoint URL is correct

### Step 5: Test Webhook

**Action:** Create a test booking and monitor logs

1. Create a test booking
2. Complete payment
3. **Immediately** check:
   - Supabase logs: Should show 200 (not 401)
   - Stripe Dashboard → Webhooks → Recent events: Should show success
   - Email logs: Should show emails sent

---

## 📋 Verification Checklist

After fixing:

- [ ] `STRIPE_WEBHOOK_SECRET` exists in Supabase secrets
- [ ] Secret matches Stripe Dashboard webhook signing secret
- [ ] Webhook endpoint is active in Stripe
- [ ] `checkout.session.completed` event is enabled
- [ ] Webhook logs show 200 (not 401)
- [ ] Payment records created in database
- [ ] Email logs show emails sent
- [ ] Emails arrive in inbox

---

## 🔍 Code Analysis

**Webhook Handler Logic:**
1. Line 316: Gets `stripe-signature` header
2. Line 320: Checks if signature exists
3. Line 334: Gets `STRIPE_WEBHOOK_SECRET` from env
4. Line 343: Verifies both exist
5. Line 357: Verifies signature using Stripe SDK

**If any step fails → 401 error**

---

## 🚀 Expected Flow After Fix

1. User completes payment
2. Stripe sends webhook with `stripe-signature` header
3. Webhook receives request
4. Webhook verifies signature using `STRIPE_WEBHOOK_SECRET`
5. ✅ **Signature verified → 200 OK**
6. Webhook processes `checkout.session.completed` event
7. Webhook updates session status
8. Webhook sends 4 emails
9. Emails logged and delivered

---

## 📊 Current Status

- ✅ Email function works
- ✅ Resend API configured
- ✅ Webhook code includes email sending
- ✅ Stripe is calling webhook
- ❌ **Webhook returning 401** ← **THIS IS THE PROBLEM**
- ❌ Emails not being sent

---

## 🎯 Next Action

**IMMEDIATE:** Check if `STRIPE_WEBHOOK_SECRET` is set in Supabase secrets

If missing → Add it  
If exists → Verify it matches Stripe Dashboard  
If matches → Check signature verification logic  

---

**Status:** 🔴 **AWAITING WEBHOOK SECRET CONFIGURATION**  
**Priority:** 🔴 **CRITICAL** - This is blocking all booking emails
