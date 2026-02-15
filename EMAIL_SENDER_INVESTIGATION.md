# Email Sender Configuration Investigation Results

## 🔍 What I Found Using MCP Tools

### Database Check
✅ Found recent booking emails in `email_logs` table:
- Email ID: `acb3f161-d25a-4808-baa5-1ede1bbcfbe1`
- Status: `sent`
- **Issue**: Metadata doesn't currently store the `from_email` address

### Code Analysis
✅ Current code at line 109:
```typescript
const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Peer Care Connect <onboarding@resend.dev>'
```

### Function Logs
✅ Checked Edge Function logs - shows HTTP status codes but not console.log output

---

## ✅ What I've Done

1. **Added Logging** to the Edge Function:
   - Now logs: `📧 Sender email configured: ...`
   - Now logs: `📧 RESEND_FROM_EMAIL env var: SET` or `NOT SET`
   - Now stores `from_email` in metadata for future emails

2. **Updated Metadata Storage**:
   - Future emails will store the actual `from_email` used
   - Will also store whether `RESEND_FROM_EMAIL` env var was set

---

## 🔍 How to Check What's Actually Configured

### Method 1: Check Supabase Secrets Directly (Best)
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Scroll to **Secrets** section
3. Look for `RESEND_FROM_EMAIL`
   - **If it exists**: Note the value
   - **If missing**: That's why it's using `onboarding@resend.dev`

### Method 2: Check Resend Dashboard
1. Go to: https://resend.com/emails
2. Find email ID: `acb3f161-d25a-4808-baa5-1ede1bbcfbe1`
3. Check the **"From"** field - this shows what was actually used

### Method 3: Check Function Logs (After Redeploy)
1. Redeploy the function (with new logging code)
2. Send a test booking email
3. Check logs: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
4. Filter for `send-email` function
5. Look for the console.log messages showing the sender email

### Method 4: Query Metadata (After Redeploy)
After the updated function is deployed and sends an email:
```sql
SELECT 
  metadata->'from_email' as from_email_used,
  metadata->'resend_from_email_env_set' as env_var_was_set,
  created_at
FROM email_logs 
WHERE metadata->'from_email' IS NOT NULL
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🔧 Next Steps to Fix

### If `RESEND_FROM_EMAIL` is NOT set:
1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Click **Add Secret**
3. Name: `RESEND_FROM_EMAIL`
4. Value: `Peer Care Connect <noreply@theramate.co.uk>` (or your preferred address)
5. **IMPORTANT**: Format must be: `Display Name <email@domain.com>`

### If `RESEND_FROM_EMAIL` IS set but wrong format:
1. Delete the existing `RESEND_FROM_EMAIL` secret
2. Add it again with correct format: `Peer Care Connect <noreply@theramate.co.uk>`

### After Fixing:
1. **Redeploy the Edge Function** (to pick up the secret):
   - Via Dashboard: Go to Functions → send-email → Redeploy
   - Or wait for next deployment (secrets are live, but function restart helps)
   
2. **Send a Test Email** and verify:
   - Check Resend Dashboard for actual "From" address
   - Check function logs for console.log output
   - Check email_logs metadata for `from_email` field

---

## 💡 Why This Might Not Work

1. **Secret not picked up**: Function might need restart/redeploy
2. **Wrong format**: Must be `Display Name <email@domain.com>`
3. **Domain not verified**: `theramate.co.uk` must be verified in Resend Dashboard
4. **Secret in wrong place**: Must be in Edge Functions secrets, not project settings

---

## 📊 Expected Result

Once fixed correctly:
- ✅ Function logs show: `📧 RESEND_FROM_EMAIL env var: SET`
- ✅ Function logs show: `📧 Sender email configured: Peer Care Connect <noreply@theramate.co.uk>`
- ✅ Resend Dashboard shows: `From: Peer Care Connect <noreply@theramate.co.uk>`
- ✅ Email recipients see: `From: Peer Care Connect <noreply@theramate.co.uk>`

