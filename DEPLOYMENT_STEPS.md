# Resend API Integration - Deployment Steps

## ✅ Code Changes Completed

All code changes have been completed:
- ✅ Edge Function updated to use Resend API
- ✅ Database migration created
- ✅ Documentation cleaned up

## 📋 Manual Deployment Steps Required

### Step 1: Add Resend API Key Secret

**Via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions
2. Navigate to **Secrets** section
3. Click **Add Secret**
4. Add:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
5. Click **Save**

**Via CLI (if you have Supabase CLI configured):**
```bash
supabase secrets set RESEND_API_KEY=re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ --project-ref aikqnvltuwwgifuocvto
```

### Step 2: Deploy Edge Function

**Option A: Via Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions
2. Click on **send-email** function
3. Upload the updated `supabase/functions/send-email/index.ts` file
4. Or use the code editor to paste the updated code

**Option B: Via Supabase CLI (if configured)**
```bash
cd "C:\Users\rayma\Desktop\New folder"
supabase functions deploy send-email --project-ref aikqnvltuwwgifuocvto
```

### Step 3: Apply Database Migration

**Option A: Via Supabase SQL Editor**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/editor
2. Open SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250211_rename_maileroo_to_resend.sql`
4. Click **Run**

**Option B: Via Supabase CLI (if configured)**
```bash
supabase db push --project-ref aikqnvltuwwgifuocvto
```

### Step 4: Test Email Sending

**Test via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions
2. Click on **send-email** function
3. Click **Invoke**
4. Use this test payload:
```json
{
  "emailType": "booking_confirmation_client",
  "recipientEmail": "your-email@example.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionPrice": 50,
    "sessionDuration": 60,
    "practitionerName": "John Doe",
    "bookingUrl": "https://theramate.co.uk/my-bookings",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```

**Or test via a real booking:**
- Create a test booking in the app
- Both client and practitioner should receive confirmation emails

## ✅ Verification Checklist

After deployment, verify:
- [ ] `RESEND_API_KEY` secret is set in Supabase
- [ ] Edge Function `send-email` is deployed with latest code
- [ ] Database migration applied (check `email_logs` table has `resend_email_id` column)
- [ ] Test email sent successfully
- [ ] Email appears in Resend dashboard: https://resend.com/emails
- [ ] Email logged in `email_logs` table

## 🎯 Quick Reference

- **Project Ref**: `aikqnvltuwwgifuocvto`
- **Edge Function**: `send-email`
- **API Key**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`
- **Migration File**: `supabase/migrations/20250211_rename_maileroo_to_resend.sql`
- **Setup Docs**: `RESEND_SETUP.md`

## 🚨 Important Notes

1. **Remove old Maileroo secrets** (optional cleanup):
   - `MAILEROO_API_KEY` (no longer needed)
   - `MAILEROO_FROM_EMAIL` (no longer needed)

2. **Default Sender Email**: The function uses `Peer Care Connect <onboarding@resend.dev>` by default. This works immediately without domain verification.

3. **Production Domain**: When ready, verify your domain in Resend and set `RESEND_FROM_EMAIL` secret to use your custom domain.

## 🆘 Troubleshooting

If emails don't send:
1. Check Edge Function logs in Supabase Dashboard
2. Verify `RESEND_API_KEY` secret is set correctly
3. Check Resend dashboard for delivery status
4. Verify `email_logs` table for error messages

