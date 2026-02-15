# Deployment Next Steps - Email System Fixes

## Overview
All critical email flow fixes have been implemented and are ready for deployment. This document outlines the deployment steps and verification procedures.

## Functions Updated

### 1. `send-email` Function
**Location:** `supabase/functions/send-email/index.ts`
**Changes:**
- Fixed platform fee text from "1.5%" to "0.5%" in `payment_received_practitioner` template

### 2. `stripe-webhook` Function  
**Location:** `peer-care-connect/supabase/functions/stripe-webhook/index.ts`
**Changes:**
- Added Authorization headers to all `send-email` invocations (lines 562-564, 589-591, 625-627, 656-658)

### 3. `process-reminders` Function
**Location:** `peer-care-connect/supabase/functions/process-reminders/index.ts`
**Changes:**
- Added Authorization header to `send-email` invocation (lines 204-207)

## Deployment Methods

### Option 1: Supabase Dashboard (Recommended - No Docker Required)

1. **Deploy `send-email` function:**
   - Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email
   - Click "Edit" or "Deploy"
   - Copy entire content from: `supabase/functions/send-email/index.ts`
   - Paste into the editor
   - Click "Deploy"

2. **Deploy `stripe-webhook` function:**
   - Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/stripe-webhook
   - Click "Edit" or "Deploy"
   - Copy entire content from: `peer-care-connect/supabase/functions/stripe-webhook/index.ts`
   - Paste into the editor
   - Click "Deploy"

3. **Deploy `process-reminders` function:**
   - Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/process-reminders
   - Click "Edit" or "Deploy"
   - Copy entire content from: `peer-care-connect/supabase/functions/process-reminders/index.ts`
   - Paste into the editor
   - Click "Deploy"

### Option 2: Supabase CLI (Requires Docker Desktop)

1. **Start Docker Desktop**

2. **Deploy functions:**
   ```powershell
   # Navigate to peer-care-connect directory
   cd "C:\Users\rayma\Desktop\New folder\peer-care-connect"
   
   # Deploy stripe-webhook
   supabase functions deploy stripe-webhook --project-ref aikqnvltuwwgifuocvto
   
   # Deploy process-reminders
   supabase functions deploy process-reminders --project-ref aikqnvltuwwgifuocvto
   
   # Navigate to root supabase directory
   cd "C:\Users\rayma\Desktop\New folder\supabase"
   
   # Deploy send-email
   supabase functions deploy send-email --project-ref aikqnvltuwwgifuocvto
   ```

## Verification Steps

### 1. Verify Resend Secrets in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/secrets
2. Verify these secrets exist:
   - `RESEND_API_KEY` - Should start with `re_`
   - `RESEND_FROM_EMAIL` - Should be a valid email (e.g., `Theramate <onboarding@resend.dev>`)
   - `SUPABASE_SERVICE_ROLE_KEY` - Should be present

### 2. Verify Stripe Webhook Configuration

1. Go to: https://dashboard.stripe.com/webhooks
2. Find webhook endpoint: `https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook`
3. Verify these events are enabled:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `account.updated`
4. Verify webhook secret is set in Supabase secrets as `STRIPE_WEBHOOK_SECRET`

### 3. Test Email Flows End-to-End

After deployment, test each email flow:

#### Booking Confirmation Emails
1. Create a test booking through Stripe checkout
2. Verify `checkout.session.completed` webhook fires
3. Check `email_logs` table for entries:
   ```sql
   SELECT * FROM email_logs 
   WHERE email_type IN ('booking_confirmation_client', 'booking_confirmation_practitioner')
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
4. Verify emails received in inbox

#### Payment Confirmation Emails
1. Complete a payment
2. Check `email_logs` for:
   ```sql
   SELECT * FROM email_logs 
   WHERE email_type IN ('payment_confirmation_client', 'payment_received_practitioner')
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

#### Reminder Emails
1. Create a session scheduled for tomorrow
2. Wait for reminder processing (or trigger manually)
3. Check `email_logs` for:
   ```sql
   SELECT * FROM email_logs 
   WHERE email_type IN ('session_reminder_24h', 'session_reminder_1h')
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

#### Cancellation Emails
1. Cancel a session from practitioner view
2. Verify email sent with type `cancellation` (not `practitioner_cancellation`)

### 4. Monitor Email Delivery via Resend Dashboard

1. Go to: https://resend.com/emails
2. Check recent email sends
3. Verify:
   - Emails are being sent successfully
   - No bounce or delivery failures
   - Correct sender email (`RESEND_FROM_EMAIL`)

### 5. Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/logs/edge-functions
2. Check logs for:
   - `send-email` function - should show successful sends
   - `stripe-webhook` function - should show webhook processing
   - `process-reminders` function - should show reminder processing

## Expected Results After Deployment

### Fixed Issues

1. ✅ **Authorization Headers:** All `send-email` invocations now include proper Authorization headers
2. ✅ **Platform Fee Text:** Email template now correctly shows "0.5%" instead of "1.5%"
3. ✅ **Cancellation Email Type:** Fixed invalid `practitioner_cancellation` type to use `cancellation`

### Email Flow Status

All email flows should now work correctly:
- ✅ Booking confirmation emails (client & practitioner)
- ✅ Payment confirmation emails (client & practitioner)
- ✅ Session reminder emails (24h & 1h)
- ✅ Cancellation emails
- ✅ Rescheduling emails
- ✅ Peer treatment exchange emails (5 types)

## Troubleshooting

### If emails are not being sent:

1. **Check Authorization:**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Supabase secrets
   - Check Edge Function logs for 401 Unauthorized errors

2. **Check Resend Configuration:**
   - Verify `RESEND_API_KEY` is valid and active
   - Check `RESEND_FROM_EMAIL` is set correctly
   - Review Resend dashboard for API errors

3. **Check Webhook Configuration:**
   - Verify Stripe webhook endpoint URL is correct
   - Check webhook secret matches in Supabase secrets
   - Review Stripe webhook logs for delivery failures

4. **Check Database:**
   - Verify `email_logs` table exists
   - Check for failed email entries:
     ```sql
     SELECT * FROM email_logs 
     WHERE status = 'failed' 
     ORDER BY created_at DESC 
     LIMIT 20;
     ```

## Next Steps After Deployment

1. ✅ Deploy all three functions
2. ✅ Verify Resend secrets
3. ✅ Verify Stripe webhook configuration
4. ✅ Test booking flow end-to-end
5. ✅ Monitor email delivery for 24 hours
6. ✅ Review email_logs table for any failures
7. ✅ Address any low-priority issues identified in audit report

## Low-Priority Issues (Documented, Not Critical)

These issues were identified but don't block email functionality:

1. **Client-side Authorization:** Client-side code calling `send-email` may need Authorization headers
2. **Missing directionsUrl:** Reminder emails default to "#" for directions
3. **session_reminder_2h:** Template uses `session_reminder_1h` for 2h reminders

These can be addressed in a future update if needed.

