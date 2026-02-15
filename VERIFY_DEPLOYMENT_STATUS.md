# Verify Deployment Status - Quick Check

## How to Verify Webhook Function is Deployed with Fixes

### Method 1: Check Function Code in Dashboard

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/stripe-webhook
2. Click **"Edit"** or view the code
3. Search for: `[CRITICAL]` or `[SUCCESS]`
4. **If found**: ✅ Function is deployed with fixes
5. **If not found**: ❌ Old code still deployed

### Method 2: Check Function Logs

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for `stripe-webhook`
3. Look for recent log entries
4. **Check format**:
   - ✅ New format: `[SUCCESS]` or `[CRITICAL]` prefixes
   - ❌ Old format: Just `Failed to send` without prefixes

### Method 3: Test with Real Booking

1. Create a test booking with payment
2. Check webhook logs immediately after
3. Look for:
   - ✅ `[SUCCESS]` messages with email IDs
   - ❌ `Failed to send` without `[CRITICAL]` prefix (old code)

---

## What the Fixed Code Looks Like

### In stripe-webhook/index.ts (around line 562-590):

**Fixed Version** (should be deployed):
```typescript
try {
  const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-email', {
    headers: {
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: { ... }
  });

  if (emailError) {
    console.error(`[CRITICAL] Failed to send booking_confirmation_client to ${clientEmail}:`, emailError);
  } else if (emailResponse && !emailResponse.success) {
    console.error(`[CRITICAL] Email send returned failure for booking_confirmation_client to ${clientEmail}:`, emailResponse.error);
  } else if (emailResponse?.success) {
    console.log(`[SUCCESS] Booking confirmation email sent to client ${clientEmail} (ID: ${emailResponse.emailId})`);
  }
} catch (emailErr) {
  console.error(`[CRITICAL] Exception sending booking_confirmation_client to ${clientEmail}:`, emailErr);
}
```

**Old Version** (if still deployed):
```typescript
await supabase.functions.invoke('send-email', {
  headers: {
    Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
  },
  body: { ... }
}).catch(err => console.error('Failed to send client booking email:', err));
```

---

## Quick Verification Steps

1. **Check Code**: View function code in dashboard → Search for `[CRITICAL]`
2. **Check Logs**: View recent webhook logs → Look for `[SUCCESS]` format
3. **Test Booking**: Create test booking → Check logs for new format

---

## If Old Code Still Deployed

**Deploy Again**:
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/stripe-webhook
2. Copy entire content from: `peer-care-connect/supabase/functions/stripe-webhook/index.ts`
3. Paste and deploy

---

**Check these to verify deployment!**

