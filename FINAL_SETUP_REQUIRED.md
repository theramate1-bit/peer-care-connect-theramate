# Resend API Integration - Final Setup Required

## ✅ Completed Automatically

1. ✅ **Edge Function Deployed** - `send-email` function updated and deployed (version 13)
2. ✅ **Database Migration** - Column already renamed (migration already applied previously)
3. ✅ **Code Updated** - All Maileroo references replaced with Resend API

## ⚠️ One Manual Step Required

### Add RESEND_API_KEY Secret

The Edge Function needs the Resend API key as a secret. This must be done via Supabase Dashboard:

**Steps:**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Scroll to **Secrets** section
3. Click **Add Secret**
4. Add:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
5. Click **Save**

**Alternative (if you have Supabase CLI linked):**
```bash
supabase secrets set RESEND_API_KEY=re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ --project-ref aikqnvltuwwgifuocvto
```

## ✅ Ready to Test

Once the secret is added, the email system will be fully operational. You can test by:

1. **Creating a test booking** in the app
2. **Invoking the function directly** via Supabase Dashboard:
   - Go to Edge Functions → `send-email` → Invoke
   - Use test payload from `RESEND_SETUP.md`

## 📝 Summary

- ✅ Code migrated from Maileroo to Resend
- ✅ Edge Function deployed (version 13)
- ✅ Database schema updated
- ⏳ **Add RESEND_API_KEY secret** (one manual step)
- ✅ Ready to send emails after secret is added

## 🎯 What Works Now

All email types will work once the secret is added:
- Booking confirmations (client & practitioner)
- Payment confirmations
- Session reminders (24h & 1h)
- Cancellations & rescheduling

