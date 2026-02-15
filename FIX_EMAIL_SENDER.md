# Fix Email Sender Address Issue

## Problem
- `RESEND_FROM_EMAIL` secret is set in Supabase
- But emails still show wrong sender address

## Root Cause
The Edge Function might need to be redeployed to pick up the secret, or the secret format might be incorrect.

## Solution Steps

### 1. Verify Secret Format in Supabase
Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions

Check `RESEND_FROM_EMAIL` secret value - it should be:
```
Peer Care Connect <noreply@theramate.co.uk>
```
or
```
Theramate <noreply@theramate.co.uk>
```

⚠️ **Important**: The format MUST include the display name AND email in angle brackets:
- ✅ Correct: `Peer Care Connect <noreply@theramate.co.uk>`
- ❌ Wrong: `noreply@theramate.co.uk` (missing display name)

### 2. Redeploy Edge Function
The function needs to be redeployed to pick up the secret:

```bash
cd peer-care-connect/supabase
supabase functions deploy send-email
```

### 3. Check Function Logs
After redeploying, check the logs:
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Filter for `send-email` function
3. Look for the log messages:
   - `📧 Sender email configured: ...`
   - `📧 RESEND_FROM_EMAIL env var: SET` or `NOT SET`

### 4. Verify Domain in Resend
Make sure `theramate.co.uk` is verified:
1. Go to: https://resend.com/domains
2. Check if `theramate.co.uk` shows as "Verified"
3. If not verified, add DNS records and wait for verification

### 5. Test After Fix
Send a test booking email and check:
1. Resend Dashboard: https://resend.com/emails
2. Look at the "From" field
3. Should show: `Peer Care Connect <noreply@theramate.co.uk>`

## Common Issues

### Issue 1: Secret Not Picked Up
- **Solution**: Redeploy the function after setting/updating the secret

### Issue 2: Wrong Format
- **Solution**: Use format: `Display Name <email@domain.com>`

### Issue 3: Domain Not Verified
- **Solution**: Verify domain in Resend Dashboard first

### Issue 4: Cached Secret
- **Solution**: Delete and re-add the secret, then redeploy

