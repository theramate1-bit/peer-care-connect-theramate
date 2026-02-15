# End-to-End Email Test Plan for ray87 Bookings

**Date**: January 2025  
**Purpose**: Verify email system works end-to-end for existing bookings

---

## Test Approach

Since local testing has network limitations, use Supabase Dashboard and direct verification.

---

## Step 1: Verify Webhook Function is Deployed with Fixes

### Via Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/stripe-webhook
2. Click **"Edit"** or view code
3. Search for: `[CRITICAL]` or `[SUCCESS]`
4. **If found**: ✅ Fixes are deployed
5. **If not found**: ❌ Deploy the fixed code

### Expected Code (around line 587-590):
```typescript
if (emailError) {
  console.error(`[CRITICAL] Failed to send booking_confirmation_client to ${clientEmail}:`, emailError);
} else if (emailResponse && !emailResponse.success) {
  console.error(`[CRITICAL] Email send returned failure:`, emailResponse.error);
} else if (emailResponse?.success) {
  console.log(`[SUCCESS] Booking confirmation email sent to client ${clientEmail} (ID: ${emailResponse.emailId})`);
}
```

---

## Step 2: Check Recent Bookings for ray87

### Via Supabase Dashboard SQL Editor:

```sql
SELECT 
  cs.id,
  cs.client_email,
  cs.status,
  cs.payment_status,
  cs.created_at,
  cs.session_date,
  cs.start_time,
  p.checkout_session_id,
  p.payment_status as payment_status_from_payments,
  p.metadata->>'session_id' as session_id_in_metadata
FROM client_sessions cs
LEFT JOIN payments p ON p.metadata->>'session_id' = cs.id::text
WHERE cs.client_email LIKE '%ray87%'
   OR cs.client_email LIKE '%ray%'
ORDER BY cs.created_at DESC
LIMIT 10;
```

**What to Look For**:
- ✅ Bookings with `payment_status = 'completed'`
- ✅ Check if `session_id` is in payment metadata
- ✅ Check if emails should have been sent

---

## Step 3: Check Email Logs

### Via Supabase Dashboard SQL Editor:

```sql
SELECT 
  email_type,
  recipient_email,
  status,
  resend_email_id,
  error_message,
  created_at,
  sent_at
FROM email_logs
WHERE recipient_email LIKE '%ray87%'
   OR recipient_email LIKE '%ray%'
ORDER BY created_at DESC
LIMIT 20;
```

**What to Look For**:
- ✅ Emails with `status = 'sent'` and `resend_email_id` present
- ❌ Emails with `status = 'failed'` - check `error_message`
- ⏳ Emails with `status = 'pending'` - may still be processing

---

## Step 4: Check Webhook Logs

### Via Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for: `stripe-webhook`
3. Look for recent `checkout.session.completed` events
4. Check for:
   - ✅ `[SUCCESS]` messages with email IDs
   - ❌ `[CRITICAL]` error messages
   - 📅 "Confirming client session after payment" messages

**Expected Log Format**:
```
📅 Confirming client session after payment: [session_id]
✅ Client session confirmed: [session_id]
[SUCCESS] Booking confirmation email sent to client [email] (ID: [email_id])
[SUCCESS] Booking confirmation email sent to practitioner [email] (ID: [email_id])
```

---

## Step 5: Test Email Function Directly

### Via Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email
2. Click **"Invoke"** or **"Test"**
3. Use this payload:
```json
{
  "emailType": "booking_confirmation_client",
  "recipientEmail": "delivered@resend.dev",
  "recipientName": "Test User",
  "data": {
    "sessionId": "test-123",
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionPrice": 50,
    "sessionDuration": 60,
    "practitionerName": "Test Practitioner",
    "bookingUrl": "https://theramate.co.uk/my-bookings",
    "calendarUrl": "#",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```

**Expected Result**:
```json
{
  "success": true,
  "emailId": "abc-123-def-456",
  "message": "Email sent successfully"
}
```

---

## Step 6: Create Test Booking (If Needed)

If no recent bookings found, create a test booking:

1. Use the booking flow in the app
2. Complete payment
3. Check webhook logs immediately after
4. Verify emails are sent

---

## Verification Checklist

- [ ] Webhook function deployed with `[CRITICAL]`/`[SUCCESS]` logging
- [ ] Recent bookings found for ray87
- [ ] Payment records have `session_id` in metadata
- [ ] Email logs show sent emails (if table exists)
- [ ] Webhook logs show `[SUCCESS]` messages
- [ ] Email function test succeeds via dashboard
- [ ] Resend Dashboard shows email activity

---

## Troubleshooting

### If No Emails in Logs:

1. **Check if webhook is being triggered**:
   - Look for `checkout.session.completed` events in webhook logs
   - Verify Stripe webhook is configured correctly

2. **Check if session_id is in metadata**:
   - Query payments table for `session_id` in metadata
   - Verify `stripe-payment` function is including it

3. **Check if session exists**:
   - Verify `client_sessions` record exists
   - Check if `payment_status = 'completed'`

4. **Check email function**:
   - Test directly via dashboard
   - Verify `RESEND_API_KEY` secret is set

---

## Expected Results

### ✅ Success Indicators:

- Webhook logs show `[SUCCESS]` messages with email IDs
- Email logs show `status = 'sent'` with `resend_email_id`
- Resend Dashboard shows email activity
- Emails arrive in inboxes

### ❌ Failure Indicators:

- Webhook logs show `[CRITICAL]` errors
- Email logs show `status = 'failed'` with error messages
- No webhook events for recent payments
- `session_id` missing from payment metadata

---

**Use this plan to verify the email system end-to-end!**


