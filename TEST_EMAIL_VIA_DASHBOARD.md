# Test Email Function via Supabase Dashboard

Since local testing has network connectivity issues, test directly via Supabase Dashboard.

## Test Method: Supabase Dashboard

### Step 1: Go to Email Function

1. Navigate to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email
2. Click **"Invoke"** button (or "Test" tab)

### Step 2: Test Client Booking Confirmation

**Payload**:
```json
{
  "emailType": "booking_confirmation_client",
  "recipientEmail": "delivered@resend.dev",
  "recipientName": "Test User",
  "data": {
    "sessionId": "test-dashboard-123",
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

**Expected Result**:
```json
{
  "success": true,
  "emailId": "abc-123-def-456",
  "message": "Email sent successfully"
}
```

### Step 3: Test Practitioner Booking Confirmation

**Payload**:
```json
{
  "emailType": "booking_confirmation_practitioner",
  "recipientEmail": "delivered@resend.dev",
  "recipientName": "Test Practitioner",
  "data": {
    "sessionId": "test-dashboard-123",
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionPrice": 50,
    "sessionDuration": 60,
    "clientName": "Jane Smith",
    "clientEmail": "jane@example.com",
    "paymentStatus": "completed",
    "bookingUrl": "https://theramate.co.uk/practice/sessions/test-123",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```

### Step 4: Check Function Logs

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for `send-email`
3. Look for:
   - ✅ Success messages
   - ❌ Error messages
   - Check for "RESEND_API_KEY" errors

### Step 5: Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Verify test emails appear
3. Check delivery status

---

## Test Webhook Email Sending

### Check Webhook Logs

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for `stripe-webhook`
3. Look for recent payment completions
4. Check for new log format:
   - `[SUCCESS]` messages with email IDs
   - `[CRITICAL]` error messages (if failures)

### Expected Webhook Log Format

**Success**:
```
[SUCCESS] Booking confirmation email sent to client email@example.com (ID: abc-123)
[SUCCESS] Booking confirmation email sent to practitioner email@example.com (ID: def-456)
[SUCCESS] Payment confirmation email sent to client email@example.com (ID: ghi-789)
[SUCCESS] Payment received email sent to practitioner email@example.com (ID: jkl-012)
```

**Failure** (if secret issue):
```
[CRITICAL] Failed to send booking_confirmation_client to email@example.com: RESEND_API_KEY not configured
```

---

## Verification Checklist

- [ ] Email function test via dashboard succeeds
- [ ] Response shows `"success": true` with email ID
- [ ] Resend Dashboard shows email activity
- [ ] Webhook logs show `[SUCCESS]` messages (if booking completed)
- [ ] No `[CRITICAL]` errors in webhook logs
- [ ] Emails arrive in inboxes

---

## If Tests Fail

### Error: "RESEND_API_KEY not configured"
- Verify secret exists: Settings → Edge Functions → Secrets
- Check secret name is exactly: `RESEND_API_KEY`
- Redeploy function after adding/updating secret

### Error: "Invalid email type"
- Redeploy send-email function
- Verify all email types exist in code

### Error: "Failed to send a request"
- Check Supabase status
- Verify function is deployed
- Check function logs for details

---

## Success Criteria

✅ **Email Function Working When**:
- Dashboard test returns `{"success": true, "emailId": "..."}`
- Resend Dashboard shows email activity
- No errors in function logs

✅ **Webhook Working When**:
- Webhook logs show `[SUCCESS]` messages
- Email IDs are logged
- No `[CRITICAL]` errors

✅ **End-to-End Working When**:
- Booking creates emails that arrive
- Both client and practitioner receive emails
- Payment confirmations sent

---

**Test via Dashboard to bypass local network issues!**

