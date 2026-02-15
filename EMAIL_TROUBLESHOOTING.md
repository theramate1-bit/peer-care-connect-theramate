# Email Delivery Troubleshooting Guide

## 🚨 Issue: Users Not Receiving Emails

Based on the logs, the Edge Function is returning 500 errors. Here's how to diagnose and fix the issue.

## Step 1: Verify RESEND_API_KEY Secret is Set

**CRITICAL:** The most common cause is a missing API key secret.

### Check in Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Scroll to **Secrets** section
3. **Verify** `RESEND_API_KEY` exists
4. **If missing**, add it:
   - Click **Add Secret**
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
   - Click **Save**

### Verify API Key Validity:
- The key should start with `re_`
- Full key: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
- Check Resend Dashboard: https://resend.com/api-keys to verify key status

## Step 2: Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email
2. Click **Logs** tab
3. Look for error messages:
   - `RESEND_API_KEY not configured` → Secret missing
   - `Resend API error: ...` → Check error details
   - `validation_error` → Domain not verified or recipient restriction

## Step 3: Test with Resend Test Addresses

Resend provides special test addresses that work immediately:

### Test Addresses:
- **delivered@resend.dev** - Simulates successful delivery
- **bounced@resend.dev** - Simulates a hard bounce
- **complained@resend.dev** - Simulates spam complaint

### Test via Supabase Dashboard:
1. Go to Edge Functions → `send-email` → **Invoke**
2. Use this test payload:
```json
{
  "emailType": "booking_confirmation_client",
  "recipientEmail": "delivered@resend.dev",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionPrice": 50,
    "sessionDuration": 60,
    "practitionerName": "John Doe"
  }
}
```

If this works → API key is valid, issue is with recipient addresses
If this fails → API key or configuration issue

## Step 4: Check Email Logs Database

Query the `email_logs` table to see detailed error information:

```sql
SELECT 
  id,
  email_type,
  recipient_email,
  status,
  error_message,
  resend_email_id,
  metadata->'resend_response' as resend_error,
  created_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 20;
```

**Look for:**
- `status = 'failed'` → Check `error_message` column
- `resend_email_id = null` → Email wasn't sent by Resend
- `metadata->'resend_response'` → Contains Resend API error details

## Step 5: Common Errors and Solutions

### Error: "RESEND_API_KEY not configured"
**Solution:** Add the secret in Supabase Dashboard (Step 1)

### Error: "validation_error" - "You can only send testing emails to your own email address"
**Solution:** 
- The `onboarding@resend.dev` domain can only send to verified email addresses
- For testing: Use `delivered@resend.dev`, `bounced@resend.dev`, etc.
- For production: Verify your domain in Resend Dashboard

### Error: "invalid_api_key" or 401 Unauthorized
**Solution:**
- Verify API key is correct: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
- Check key hasn't been revoked in Resend Dashboard
- Ensure key has "Sending access" permissions

### Error: 403 Forbidden
**Solution:**
- API key may have restrictions
- Check Resend Dashboard for key permissions
- Ensure "Full access" or "Sending access" is enabled

## Step 6: Verify Domain Status (if using custom domain)

If you've set up a custom domain:
1. Go to: https://resend.com/domains
2. Check domain verification status
3. Ensure DNS records (SPF, DKIM, DMARC) are correct
4. Wait for verification to complete

## Step 7: Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Check if emails appear in the log
3. Check delivery status:
   - **Sent** → Email was sent by Resend
   - **Delivered** → Email reached recipient
   - **Bounced** → Email bounced (invalid address)
   - **Failed** → Check error message

## Step 8: Enhanced Error Logging

The updated Edge Function now:
- ✅ Logs detailed error information
- ✅ Stores errors in `email_logs` table
- ✅ Logs API key presence (first 10 chars only)
- ✅ Handles response parsing errors

## Quick Fix Checklist

- [ ] **RESEND_API_KEY secret is set** in Supabase Dashboard
- [ ] API key value is correct: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
- [ ] Edge Function is deployed (version 13+)
- [ ] Test with `delivered@resend.dev` works
- [ ] Check `email_logs` table for error messages
- [ ] Check Resend Dashboard for delivery status
- [ ] Check Edge Function logs for detailed errors

## Immediate Action Required

**Most Likely Issue:** `RESEND_API_KEY` secret is NOT set in Supabase.

**Fix:**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Add secret: `RESEND_API_KEY` = `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
3. Deploy the updated function (already done)
4. Test immediately with `delivered@resend.dev`

After adding the secret, emails should start working!

