# Email Not Sending - Root Cause Analysis

## 🔍 Diagnostic Results

**Date:** January 2025  
**Status:** 🔴 **ISSUE IDENTIFIED**

---

## ✅ What's Working

1. **Edge Function (`send-email`) is functional**
   - ✅ Test email sent successfully
   - ✅ Email ID received: `b5208d20-a4af-4ce5-b13b-41852211522a`
   - ✅ Resend API key is configured correctly
   - ✅ 18 emails successfully sent recently

2. **Email Infrastructure**
   - ✅ Resend API is accessible
   - ✅ Email templates are working
   - ✅ Database logging is working

---

## 🔴 The Problem

**Confirmed bookings are NOT triggering emails.**

### Evidence:
- ✅ 3 confirmed sessions found in database
- ❌ **0 email logs** for these sessions
- ❌ Sessions: 
  - `5c38621a-acbb-45be-86b8-5860f5377929` (rayman196823@gmail.com)
  - `b25662bc-6d96-4465-b5fa-f56df10fe200` (rayman196823@gmail.com)
  - `b4dd5e17-213b-455b-be46-45fd6eb5aa29` (rayman196823@gmail.com)

### Root Cause Analysis:

The webhook code **DOES** include email sending logic (lines 566-696), but emails aren't being sent. Possible reasons:

1. **Webhook not being triggered** - Stripe may not be calling the webhook
2. **Webhook failing silently** - Errors caught but not logged properly
3. **Conditional logic preventing emails** - Some condition not met
4. **Webhook deployed but old version** - Code may not be deployed

---

## 🔍 Investigation Steps

### Step 1: Check Webhook Logs

**Action:** Check if webhook is being called at all

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for: `stripe-webhook`
3. Look for:
   - `[SUCCESS]` messages (emails sent)
   - `[CRITICAL]` messages (email failures)
   - `checkout.session.completed` events
   - Any errors or exceptions

**What to look for:**
- If NO logs: Webhook isn't being called → Check Stripe webhook configuration
- If logs show errors: Webhook is failing → Fix the errors
- If logs show success but no emails: Email function is failing silently

### Step 2: Check Stripe Webhook Configuration

**Action:** Verify Stripe is configured to call your webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint
3. Check:
   - ✅ Endpoint URL is correct: `https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook`
   - ✅ Event: `checkout.session.completed` is enabled
   - ✅ Webhook is active (not disabled)
   - ✅ Recent events show successful deliveries

**What to look for:**
- If webhook not configured: Add it
- If webhook disabled: Enable it
- If events failing: Check webhook secret

### Step 3: Check Webhook Code Deployment

**Action:** Verify the latest code is deployed

**Location:** `peer-care-connect/supabase/functions/stripe-webhook/index.ts`

**Key Code Sections:**
- Lines 566-598: Sends booking confirmation to client
- Lines 605-637: Sends booking confirmation to practitioner
- Lines 653-685: Sends payment confirmation to client
- Lines 696-728: Sends payment received to practitioner

**Deploy Command:**
```bash
cd peer-care-connect
npx supabase functions deploy stripe-webhook
```

### Step 4: Check Webhook Conditions

**Action:** Verify all conditions are met for emails to send

Looking at the code (line 451), emails only send if:
1. ✅ `clientSessionId` exists in metadata
2. ✅ Session data is fetched successfully
3. ✅ Client email exists
4. ✅ Practitioner email exists (for practitioner emails)

**Check these in webhook logs:**
- Is `session_id` in metadata?
- Is session data fetched successfully?
- Are email addresses present?

---

## 🛠️ Immediate Fixes

### Fix 1: Add Better Logging

The webhook has error handling but may be swallowing errors. Add more logging:

```typescript
// Before email sending
console.log(`[DEBUG] Attempting to send emails for session ${clientSessionId}`);
console.log(`[DEBUG] Client email: ${clientEmail}`);
console.log(`[DEBUG] Practitioner email: ${practitionerEmail}`);

// After email sending
if (emailError) {
  console.error(`[CRITICAL] Email error details:`, JSON.stringify(emailError, null, 2));
}
```

### Fix 2: Verify Webhook Secret

Check if `STRIPE_WEBHOOK_SECRET` is set correctly:

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Check Secrets tab
3. Verify `STRIPE_WEBHOOK_SECRET` exists and matches Stripe dashboard

### Fix 3: Test Webhook Manually

Create a test script to manually trigger the webhook:

```javascript
// test-webhook-manual.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://aikqnvltuwwgifuocvto.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // Use service role key for testing
);

// Simulate webhook event
const testEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'test_session_id',
      customer_email: 'test@example.com',
      amount_total: 5000,
      metadata: {
        session_id: 'YOUR_SESSION_ID', // Use one of the confirmed sessions
        client_user_id: '...',
        practitioner_id: '...',
        // ... other metadata
      }
    }
  }
};

// Call webhook function
supabase.functions.invoke('stripe-webhook', {
  body: testEvent
}).then(console.log).catch(console.error);
```

---

## 📋 Checklist

- [ ] Check Supabase Edge Function logs for `stripe-webhook`
- [ ] Check Stripe Dashboard for webhook events
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set
- [ ] Verify `RESEND_API_KEY` is set (already confirmed ✅)
- [ ] Check if webhook code is deployed (latest version)
- [ ] Verify `session_id` is in Stripe metadata
- [ ] Check if client/practitioner emails exist in database
- [ ] Test webhook manually with test script
- [ ] Check Resend Dashboard for any failed sends

---

## 🎯 Most Likely Causes (Ranked)

1. **Webhook not being called by Stripe** (60% probability)
   - Webhook not configured in Stripe
   - Webhook URL incorrect
   - Webhook disabled

2. **Webhook failing silently** (30% probability)
   - Errors caught but not logged
   - Missing email addresses
   - Session data not found

3. **Old code deployed** (10% probability)
   - Webhook function not updated
   - Missing email sending code

---

## 🚀 Next Steps

1. **IMMEDIATE:** Check Supabase logs for webhook activity
2. **IMMEDIATE:** Check Stripe Dashboard for webhook events
3. **IF NO WEBHOOK LOGS:** Configure webhook in Stripe
4. **IF WEBHOOK LOGS EXIST:** Check for errors and fix them
5. **TEST:** Create a test booking and monitor logs in real-time

---

## 📞 Quick Debug Commands

```bash
# Check recent email logs
node diagnose-email-issues.js

# Test email function directly
# (Already done - works ✅)

# Check webhook logs
# Go to Supabase Dashboard → Logs → Edge Functions → stripe-webhook
```

---

**Last Updated:** January 2025  
**Status:** 🔴 Awaiting webhook log investigation

