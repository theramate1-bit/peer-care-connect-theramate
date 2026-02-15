# Email Diagnostic Checklist - Immediate Actions

## Step 1: Check Supabase Edge Function Logs

**Location**: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions

**What to Look For**:
- [ ] Filter logs for `send-email` function
- [ ] Check for "RESEND_API_KEY not configured" errors
- [ ] Look for recent email send attempts (last 24 hours)
- [ ] Check for error messages or exceptions
- [ ] Note any patterns in failures

**Expected**: Should see logs showing email send attempts. If no logs, emails aren't being triggered.

---

## Step 2: Verify RESEND_API_KEY Secret

**Location**: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions

**What to Check**:
- [ ] Navigate to **Secrets** section
- [ ] Verify `RESEND_API_KEY` exists
- [ ] Verify key starts with `re_`
- [ ] Note the first 10 characters of the key (for comparison)

**If Missing**:
- Add secret: `RESEND_API_KEY`
- Value: Your Resend API key (starts with `re_`)
- Redeploy function after adding

---

## Step 3: Check Resend Dashboard

**Location**: https://resend.com/emails

**What to Check**:
- [ ] Recent email sends (last 7 days)
- [ ] Delivery status of recent emails
- [ ] Bounce/complaint rates
- [ ] API key status (https://resend.com/api-keys)

**Expected**: Should see recent email sends if system is working. If empty, emails aren't reaching Resend.

---

## Step 4: Test Email Function Directly

**Location**: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email

**Test Payload**:
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

**What to Check**:
- [ ] Click "Invoke" button
- [ ] Check response - should return `{"success": true, "emailId": "..."}`
- [ ] Check function logs for any errors
- [ ] Check your inbox for the test email

**If This Works**: Function is fine, issue is in webhook or triggering
**If This Fails**: Check RESEND_API_KEY secret and function logs

---

## Step 5: Check Webhook Logs

**Location**: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions

**What to Look For**:
- [ ] Filter logs for `stripe-webhook` function
- [ ] Look for recent `checkout.session.completed` events
- [ ] Check for "Failed to send" error messages
- [ ] Verify webhook is processing payments

**Expected**: Should see webhook processing payments and attempting to send emails.

---

## Common Issues and Fixes

### Issue: "RESEND_API_KEY not configured"
**Fix**: Add secret in Supabase Dashboard → Settings → Edge Functions → Secrets

### Issue: "Invalid email type"
**Fix**: Redeploy send-email function: `supabase functions deploy send-email`

### Issue: No emails in Resend Dashboard
**Fix**: Check API key validity, verify key is active in Resend Dashboard

### Issue: Webhook processes but no emails
**Fix**: This is the silent error swallowing issue - fixed in code changes

---

## Next Steps After Diagnosis

1. If RESEND_API_KEY is missing → Add it and redeploy
2. If function test fails → Check API key validity
3. If webhook shows errors → Review error messages
4. If everything looks fine but emails don't arrive → Check spam folder, verify email addresses

