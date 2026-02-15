# Resend Email Integration Setup

## Overview
This project uses Resend API for sending transactional emails including booking confirmations, payment receipts, session reminders, and notifications to both clients and practitioners.

## Setup Steps

### 1. Add Resend API Key to Supabase Secrets

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions)
2. Navigate to **Settings → Edge Functions**
3. Scroll to **Secrets** section
4. Click **Add Secret**
5. Add the following:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ`

### 2. Configure Sender Email (Optional)

For production, you can verify your domain in Resend and use a custom sender email:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add and verify your domain (e.g., `theramate.co.uk`)
3. Add DNS records as provided by Resend (SPF, DKIM, DMARC)
4. Once verified, add another secret:
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `Peer Care Connect <noreply@yourdomain.com>`

**Note**: For testing, the default sender `Peer Care Connect <onboarding@resend.dev>` works without domain verification.

### 3. Deploy Edge Function

```bash
# Navigate to supabase directory
cd supabase

# Deploy the send-email function
supabase functions deploy send-email
```

### 4. Apply Database Migration

```bash
# Apply the migration to rename maileroo_email_id to resend_email_id
supabase db push
```

Or manually run the migration `20250211_rename_maileroo_to_resend.sql` in Supabase SQL Editor.

### 5. Test Email Sending

You can test email sending by:
1. Creating a test booking through the app
2. Or invoking the Edge Function directly via Supabase Dashboard:
   - Go to **Edge Functions → send-email → Invoke**
   - Use this test payload:
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
       "practitionerName": "John Doe"
     }
   }
   ```

## Email Types Supported

The system supports the following email types:

- `booking_confirmation_client` - Sent to clients when a booking is confirmed
- `booking_confirmation_practitioner` - Sent to practitioners when they receive a new booking
- `payment_confirmation_client` - Sent to clients after successful payment
- `payment_received_practitioner` - Sent to practitioners when payment is received
- `session_reminder_24h` - Reminder sent 24 hours before session
- `session_reminder_1h` - Reminder sent 1 hour before session
- `cancellation` - Sent when a session is cancelled
- `rescheduling` - Sent when a session is rescheduled

## How Resend API Works

### API Endpoint
- **URL**: `https://api.resend.com/emails`
- **Method**: POST
- **Authentication**: Bearer token (`Authorization: Bearer {RESEND_API_KEY}`)

### Request Format
```json
{
  "from": "Peer Care Connect <onboarding@resend.dev>",
  "to": ["recipient@example.com"],
  "subject": "Your booking is confirmed",
  "html": "<html>...</html>"
}
```

### Response Format
```json
{
  "id": "email_id_here"
}
```

### Advantages of Resend

1. **Simple API**: Clean, straightforward REST API
2. **No Domain Verification Required for Testing**: Can use `onboarding@resend.dev` immediately
3. **Good Deliverability**: Excellent email delivery rates
4. **Email Logging**: All sent emails are logged in `email_logs` table
5. **Error Handling**: Comprehensive error messages for debugging
6. **Production Ready**: Easy to verify domain for production use

## Email Logging

All emails are logged to the `email_logs` table with:
- Email type
- Recipient email and name
- Subject
- Resend email ID (for tracking)
- Status (sent/failed)
- Timestamp
- Full metadata including Resend API response

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set in Supabase secrets
2. **Check Logs**: View Edge Function logs in Supabase Dashboard
3. **Check Resend Dashboard**: View delivery status at [resend.com](https://resend.com)
4. **Verify Email Logs**: Check `email_logs` table for error messages

### Common Errors

- **"RESEND_API_KEY not configured"**: Add the secret in Supabase Dashboard
- **"Resend API error: ..."**: Check Resend API response in logs for specific error
- **Domain verification errors**: Only applies if using custom domain; `onboarding@resend.dev` works without verification

## Production Considerations

For production:
1. Verify your domain in Resend Dashboard
2. Update `RESEND_FROM_EMAIL` secret with your verified domain email
3. Monitor email delivery rates in Resend Dashboard
4. Set up webhooks (optional) for delivery status updates
5. Consider adding email templates for better maintainability

## Cost

Resend offers:
- Free tier: 3,000 emails/month
- Paid plans start at $20/month for 50,000 emails
- Pay-as-you-go available

This setup should handle booking confirmations, payment confirmations, reminders, and all other transactional emails efficiently and reliably.

