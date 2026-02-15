# Email Fix Deployment Guide

## Changes Made

### ✅ Fixed Webhook Error Handling

**File**: `peer-care-connect/supabase/functions/stripe-webhook/index.ts`

**Changes**:
- Replaced all `.catch()` calls with proper error handling
- Added response validation for all email sends
- Improved logging with email IDs and context
- All 4 email sends now properly validate responses:
  1. Client booking confirmation
  2. Practitioner booking confirmation
  3. Client payment confirmation
  4. Practitioner payment received

**Before**:
```typescript
await supabase.functions.invoke('send-email', {...})
  .catch(err => console.error('Failed:', err));
```

**After**:
```typescript
const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-email', {...});

if (emailError) {
  console.error(`[CRITICAL] Failed to send email:`, emailError);
} else if (emailResponse && !emailResponse.success) {
  console.error(`[CRITICAL] Email send returned failure:`, emailResponse.error);
} else if (emailResponse?.success) {
  console.log(`[SUCCESS] Email sent (ID: ${emailResponse.emailId})`);
}
```

---

## Deployment Steps

### Step 1: Deploy Stripe Webhook Function

```bash
cd peer-care-connect
supabase functions deploy stripe-webhook
```

**Verify Deployment**:
- Check Supabase Dashboard → Edge Functions → stripe-webhook
- Review deployment logs for errors
- Verify function is active

### Step 2: Verify Send-Email Function

**Check Email Types**:
The `send-email` function should support these types:
- ✅ `booking_confirmation_client`
- ✅ `booking_confirmation_practitioner`
- ✅ `payment_confirmation_client`
- ✅ `payment_received_practitioner`

**If Missing Types**:
```bash
cd peer-care-connect
supabase functions deploy send-email
```

### Step 3: Verify Configuration

**Check Secrets**:
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Verify `RESEND_API_KEY` exists
3. Verify key starts with `re_`
4. Check `RESEND_FROM_EMAIL` format if set (should be: `Display Name <email@domain.com>`)

**If Secrets Missing**:
- Add `RESEND_API_KEY` secret
- Redeploy functions after adding secrets

---

## Testing After Deployment

### Test 1: Direct Function Test

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email
2. Click "Invoke"
3. Use test payload:
```json
{
  "emailType": "booking_confirmation_client",
  "recipientEmail": "your-email@example.com",
  "recipientName": "Test User",
  "data": {
    "sessionId": "test-123",
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionPrice": 50,
    "sessionDuration": 60,
    "practitionerName": "John Doe",
    "bookingUrl": "https://theramate.co.uk/my-bookings",
    "calendarUrl": "#",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```
4. Check response - should return `{"success": true, "emailId": "..."}`
5. Check your inbox

### Test 2: Webhook Logs

1. Create a test booking/payment
2. Check webhook logs: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
3. Filter for `stripe-webhook`
4. Look for:
   - `[SUCCESS]` log messages with email IDs
   - `[CRITICAL]` error messages if emails fail
5. Verify emails arrive in inboxes

### Test 3: End-to-End Booking Flow

1. Complete a test booking with payment
2. Check webhook processes payment
3. Verify emails sent to both client and practitioner
4. Check email logs show success
5. Verify emails arrive in inboxes

---

## What to Look For in Logs

### Success Indicators:
```
[SUCCESS] Booking confirmation email sent to client email@example.com (ID: abc-123)
[SUCCESS] Booking confirmation email sent to practitioner email@example.com (ID: def-456)
[SUCCESS] Payment confirmation email sent to client email@example.com (ID: ghi-789)
[SUCCESS] Payment received email sent to practitioner email@example.com (ID: jkl-012)
```

### Failure Indicators:
```
[CRITICAL] Failed to send booking_confirmation_client to email@example.com: [error details]
[CRITICAL] Email send returned failure for booking_confirmation_client to email@example.com: [error details]
```

### Common Errors:

1. **"RESEND_API_KEY not configured"**
   - Fix: Add secret in Supabase Dashboard
   - Redeploy function after adding

2. **"Invalid email type"**
   - Fix: Redeploy send-email function
   - Verify all email types exist in code

3. **401 Unauthorized**
   - Fix: Check service role key is set correctly
   - Verify function authentication settings

---

## Monitoring

### After Deployment, Monitor:

1. **Webhook Logs** (Daily)
   - Check for `[CRITICAL]` errors
   - Verify `[SUCCESS]` messages appear
   - Look for patterns in failures

2. **Resend Dashboard** (Daily)
   - Check email delivery rates
   - Monitor bounce/complaint rates
   - Verify API key status

3. **Email Logs Table** (Weekly)
   - Query `email_logs` table
   - Check failure rates
   - Review error messages

---

## Rollback Plan

If issues occur after deployment:

1. **Revert Webhook Function**:
   ```bash
   git checkout HEAD~1 peer-care-connect/supabase/functions/stripe-webhook/index.ts
   supabase functions deploy stripe-webhook
   ```

2. **Check Previous Version**:
   - Review git history
   - Redeploy previous working version
   - Investigate differences

---

## Success Criteria

✅ **Deployment Successful When**:
- Webhook function deploys without errors
- Test email via dashboard succeeds
- Webhook logs show `[SUCCESS]` messages
- Booking flow sends emails that arrive
- No `[CRITICAL]` errors in logs

---

## Next Steps

1. **Deploy webhook function** (with fixed error handling)
2. **Test email function** (verify all types work)
3. **Monitor logs** (check for errors)
4. **Test booking flow** (end-to-end verification)
5. **Set up alerts** (for future failures)

---

**Status**: ✅ Code fixes complete, ready for deployment

