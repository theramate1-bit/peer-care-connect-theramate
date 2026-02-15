# Check Resend Emails for ray87 Bookings

**Date**: January 2025  
**Purpose**: Verify email delivery status for ray87's bookings via Resend

---

## Method 1: Resend Dashboard (Easiest)

### Step 1: Navigate to Resend Dashboard
1. Go to: **https://resend.com/emails**
2. Log in with your Resend account

### Step 2: Search for ray87 Emails
1. Use the search/filter feature in the dashboard
2. Search for: `ray87` in the recipient email field
3. Or filter by date range (last 7-30 days)

### Step 3: Check Email Status
For each email found, check:
- ✅ **Status**: `delivered`, `opened`, `clicked` = Success
- ❌ **Status**: `bounced`, `complained`, `failed` = Failure
- 📧 **Recipient**: Should match ray87 email address
- 📅 **Sent At**: Timestamp when email was sent
- 📝 **Subject**: Should contain booking/payment confirmation

### Step 4: Verify Email Content
Click on each email to view:
- **From**: Should be `Theramate <noreply@theramate.co.uk>` or similar
- **To**: ray87 email address
- **Subject**: Booking confirmation, payment confirmation, etc.
- **Body**: Should contain session details

---

## Method 2: Supabase email_logs Table

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/sql/new
2. Log in to Supabase

### Step 2: Run Query
```sql
SELECT 
  email_type,
  recipient_email,
  status,
  resend_email_id,
  error_message,
  created_at,
  sent_at,
  metadata
FROM email_logs
WHERE recipient_email ILIKE '%ray87%'
   OR recipient_email ILIKE '%ray%'
ORDER BY created_at DESC
LIMIT 20;
```

### Step 3: Analyze Results
- ✅ **status = 'sent'** + **resend_email_id** present = Email sent successfully
- ❌ **status = 'failed'** = Email failed (check `error_message`)
- ⏳ **status = 'pending'** = Email still processing

### Step 4: Verify with Resend API
If you have `resend_email_id` values, you can verify them:
1. Get your Resend API key from: https://resend.com/api-keys
2. Use the script: `check-ray87-resend-emails.js` (requires API key)
3. Or use curl:
```bash
curl -X GET "https://api.resend.com/emails/{email_id}" \
  -H "Authorization: Bearer re_your_api_key"
```

---

## Method 3: Check Webhook Logs

### Step 1: Open Edge Function Logs
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for: `stripe-webhook`

### Step 2: Search for ray87
1. Use browser search (Ctrl+F / Cmd+F)
2. Search for: `ray87`
3. Or search for: `[SUCCESS]` to find successful email sends

### Step 3: Check Log Messages
Look for:
- ✅ `[SUCCESS] Booking confirmation email sent to client [email] (ID: [email_id])`
- ✅ `[SUCCESS] Booking confirmation email sent to practitioner [email] (ID: [email_id])`
- ❌ `[CRITICAL] Failed to send...` = Email failed

---

## Method 4: Direct Resend API Check (If You Have API Key)

### Step 1: Get API Key
1. Go to: https://resend.com/api-keys
2. Copy your API key (starts with `re_`)

### Step 2: Run Script
```bash
# Windows PowerShell
$env:RESEND_API_KEY="re_your_key_here"
node check-ray87-resend-emails.js

# Or set it inline
RESEND_API_KEY=re_your_key_here node check-ray87-resend-emails.js
```

### Step 3: Check Output
The script will:
1. Query Supabase `email_logs` for ray87 emails
2. Verify each email with Resend API
3. Show delivery status and details

---

## Expected Results

### ✅ Success Indicators:
- Emails appear in Resend Dashboard with status `delivered`
- `email_logs` shows `status = 'sent'` with `resend_email_id`
- Webhook logs show `[SUCCESS]` messages with email IDs
- Emails received in ray87's inbox

### ❌ Failure Indicators:
- Emails show `bounced` or `failed` in Resend
- `email_logs` shows `status = 'failed'` with error messages
- Webhook logs show `[CRITICAL]` error messages
- No emails in Resend Dashboard (emails never reached Resend)

---

## Troubleshooting

### If No Emails Found in Resend:
1. **Check if webhook was triggered**:
   - Look for `checkout.session.completed` events in webhook logs
   - Verify Stripe webhook endpoint is configured

2. **Check if emails are being sent**:
   - Check `email_logs` table for any entries
   - Check webhook logs for `[SUCCESS]` or `[CRITICAL]` messages

3. **Check Resend API key**:
   - Verify `RESEND_API_KEY` secret exists in Supabase
   - Test API key validity: https://resend.com/api-keys

### If Emails Show as Failed:
1. **Check error message** in Resend Dashboard
2. **Verify sender email** is verified in Resend
3. **Check Resend status**: https://status.resend.com
4. **Review webhook logs** for specific error details

---

## Quick Checklist

- [ ] Checked Resend Dashboard for ray87 emails
- [ ] Verified email delivery status
- [ ] Checked Supabase `email_logs` table
- [ ] Reviewed webhook logs for `[SUCCESS]` messages
- [ ] Verified emails received in inbox (if possible)
- [ ] Checked for any `[CRITICAL]` errors in logs

---

**Next Steps**: Based on findings, either:
1. ✅ **If emails sent successfully**: System is working correctly
2. ❌ **If emails failed**: Check error messages and fix issues
3. ⚠️ **If no emails found**: Verify webhook is triggering and email function is being called

