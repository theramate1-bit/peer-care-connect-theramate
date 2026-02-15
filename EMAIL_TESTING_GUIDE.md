# Complete Email Testing Guide

## ✅ Status: All Templates Fixed and Ready

### Templates Completed
- ✅ 9 Regular booking/payment emails
- ✅ 5 Peer treatment exchange emails
- ✅ All 14 email types now have templates

---

## Testing Methods

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Edge Functions**:
   - https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions/send-email

2. **Click "Invoke" button**

3. **Use Test Payloads** (see below)

4. **Check Response**:
   - Should return `{"success": true, "emailId": "..."}`
   - Check function logs for any errors

5. **Verify Email**:
   - Check inbox at `rayman196823@gmail.com`
   - Verify sender is: `Peer Care Connect <noreply@theramate.co.uk>`

---

## Test Payloads for All Email Types

### 1. Booking Confirmation - Client
```json
{
  "emailType": "booking_confirmation_client",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionDuration": 60,
    "sessionPrice": 50,
    "practitionerName": "John Doe",
    "bookingUrl": "https://theramate.co.uk/my-bookings",
    "calendarUrl": "#",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```

### 2. Booking Confirmation - Practitioner
```json
{
  "emailType": "booking_confirmation_practitioner",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "John Doe",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionDuration": 60,
    "sessionPrice": 50,
    "clientName": "Jane Smith",
    "clientEmail": "jane@example.com",
    "paymentStatus": "Paid",
    "bookingUrl": "https://theramate.co.uk/practice/sessions",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```

### 3. Payment Confirmation - Client
```json
{
  "emailType": "payment_confirmation_client",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "paymentAmount": 50,
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "paymentId": "pi_test123",
    "practitionerName": "John Doe",
    "bookingUrl": "https://theramate.co.uk/my-bookings"
  }
}
```

### 4. Payment Received - Practitioner
```json
{
  "emailType": "payment_received_practitioner",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "John Doe",
  "data": {
    "paymentAmount": 50,
    "platformFee": 1.95,
    "practitionerAmount": 48.05,
    "clientName": "Jane Smith",
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "paymentId": "pi_test123"
  }
}
```

### 5. Session Reminder - 24 Hours
```json
{
  "emailType": "session_reminder_24h",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-16",
    "sessionTime": "14:00",
    "sessionDuration": 60,
    "practitionerName": "John Doe",
    "practitionerFirstName": "John",
    "clientFirstName": "Test",
    "bookingUrl": "https://theramate.co.uk/my-bookings",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```

### 6. Session Reminder - 1 Hour
```json
{
  "emailType": "session_reminder_1h",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-16",
    "sessionTime": "14:00",
    "sessionDuration": 60,
    "practitionerName": "John Doe",
    "practitionerFirstName": "John",
    "clientFirstName": "Test",
    "bookingUrl": "https://theramate.co.uk/my-bookings",
    "messageUrl": "https://theramate.co.uk/messages"
  }
}
```

### 7. Cancellation
```json
{
  "emailType": "cancellation",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "practitionerName": "John Doe",
    "cancellationReason": "Client request"
  }
}
```

### 8. Rescheduling
```json
{
  "emailType": "rescheduling",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "originalDate": "2025-02-15",
    "originalTime": "14:00",
    "newDate": "2025-02-16",
    "newTime": "15:00",
    "practitionerName": "John Doe",
    "bookingUrl": "https://theramate.co.uk/my-bookings",
    "calendarUrl": "#"
  }
}
```

### 9. Peer Booking Confirmed - Client
```json
{
  "emailType": "peer_booking_confirmed_client",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionId": "test-123",
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionDuration": 60,
    "practitionerName": "John Doe",
    "paymentAmount": 2,
    "bookingUrl": "https://theramate.co.uk/credits#peer-treatment",
    "calendarUrl": "#"
  }
}
```

### 10. Peer Credits Deducted
```json
{
  "emailType": "peer_credits_deducted",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "practitionerName": "John Doe",
    "paymentAmount": 2
  }
}
```

### 11. Peer Booking Confirmed - Practitioner
```json
{
  "emailType": "peer_booking_confirmed_practitioner",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "John Doe",
  "data": {
    "sessionId": "test-123",
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "sessionDuration": 60,
    "clientName": "Jane Smith",
    "clientEmail": "jane@example.com",
    "paymentAmount": 2,
    "bookingUrl": "https://theramate.co.uk/practice/sessions/test-123"
  }
}
```

### 12. Peer Credits Earned
```json
{
  "emailType": "peer_credits_earned",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "John Doe",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "clientName": "Jane Smith",
    "paymentAmount": 2
  }
}
```

### 13. Peer Booking Cancelled - Refunded
```json
{
  "emailType": "peer_booking_cancelled_refunded",
  "recipientEmail": "rayman196823@gmail.com",
  "recipientName": "Test User",
  "data": {
    "sessionType": "Massage Therapy",
    "sessionDate": "2025-02-15",
    "sessionTime": "14:00",
    "practitionerName": "John Doe",
    "clientName": "Jane Smith",
    "refundAmount": 2,
    "cancellationReason": "Practitioner request"
  }
}
```

---

## What to Check When Testing

### ✅ Email Delivery
- Email arrives in inbox
- No spam folder

### ✅ Sender Address
- Should show: `Peer Care Connect <noreply@theramate.co.uk>`
- NOT: `onboarding@resend.dev`

### ✅ Email Content
- Template renders correctly
- All data fields populated
- Links work (when clicked)
- Styling looks good
- Mobile responsive

### ✅ Email Logs
Check `email_logs` table:
```sql
SELECT 
  email_type,
  recipient_email,
  status,
  resend_email_id,
  created_at,
  metadata->'from_email' as from_email_used
FROM email_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## Quick Test Checklist

Test these key scenarios:
- [ ] Booking confirmation sent to client
- [ ] Booking confirmation sent to practitioner
- [ ] Payment confirmation sent to client
- [ ] Payment received sent to practitioner
- [ ] 24h reminder sent
- [ ] 1h reminder sent
- [ ] Cancellation email sent
- [ ] Rescheduling email sent
- [ ] Peer booking confirmed (client)
- [ ] Peer credits deducted
- [ ] Peer booking confirmed (practitioner)
- [ ] Peer credits earned
- [ ] Peer booking cancelled with refund

---

## Troubleshooting

### If emails don't send:
1. Check `RESEND_API_KEY` secret is set
2. Check `RESEND_FROM_EMAIL` secret is set (optional)
3. Check function logs for errors
4. Verify recipient email is valid
5. Check Resend Dashboard for delivery status

### If sender is wrong:
- Verify `RESEND_FROM_EMAIL` secret value: `Peer Care Connect <noreply@theramate.co.uk>`
- Check function logs: `📧 Sender email configured: ...`
- Redeploy function after setting secret

### If template errors:
- Check function logs for template generation errors
- Verify all required `data` fields are provided
- Check email type matches exactly (case-sensitive)

---

## Summary

✅ **All 14 email templates are complete**
✅ **Base URL updated to theramate.co.uk**
✅ **RESEND_FROM_EMAIL secret configured**
✅ **Ready for testing**

**Next**: Deploy function and test all email types via Supabase Dashboard!

