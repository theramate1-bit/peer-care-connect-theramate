# 🚨 URGENT: RESEND_API_KEY Secret Missing

## Problem Identified

The Edge Function is failing with this exact error:
```
RESEND_API_KEY not configured. Please add it to Edge Function secrets in Supabase Dashboard.
```

**Status**: Edge Function deployed (v14), but emails cannot be sent because the API key secret is missing.

## ✅ Immediate Fix Required (2 Minutes)

### Step 1: Add RESEND_API_KEY Secret

1. **Go to Supabase Dashboard:**
   - Direct link: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions

2. **Navigate to Secrets:**
   - Scroll down to the **"Secrets"** section
   - Click **"Add Secret"** button

3. **Add the Secret:**
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
   - Click **"Save"**

### Step 2: Verify It's Set

1. Check that `RESEND_API_KEY` appears in the secrets list
2. The value should show as `re_PtKC1C...` (first 10 characters)

### Step 3: Test Immediately

Run the test script:
```bash
node test-resend-function.js
```

Or test via Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email
2. Click **"Invoke"**
3. Use this payload:
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

## Expected Result After Fix

✅ **Status: 200 OK**
✅ **Response**: `{"success": true, "emailId": "...", "message": "Email sent successfully"}`
✅ **Email appears in Resend Dashboard**: https://resend.com/emails

## Why Emails Weren't Sending

The Edge Function code is correct and deployed. The only missing piece is the `RESEND_API_KEY` secret. Once added, emails will work immediately.

## Verification Checklist

After adding the secret:
- [ ] Secret `RESEND_API_KEY` appears in Supabase Dashboard
- [ ] Test with `delivered@resend.dev` succeeds (Status 200)
- [ ] Email appears in Resend Dashboard
- [ ] Email logged in `email_logs` table with `resend_email_id`
- [ ] Real booking test sends emails successfully

## Current Email Domain

Emails will send from: **`Peer Care Connect <onboarding@resend.dev>`**

This is Resend's test domain and works immediately without verification. For production, verify your domain (`theramate.co.uk`) in Resend Dashboard.

