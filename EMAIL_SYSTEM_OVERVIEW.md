# Email System - High Level Overview

## 🎯 Purpose
This document explains how our email sending system works at a high level, perfect for onboarding junior developers.

---

## 📋 Architecture Overview

Our email system follows a **centralized, serverless architecture**:

```
┌─────────────────┐
│  Event Triggers │  (User actions, webhooks, cron jobs)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notification    │  (Frontend/Backend logic)
│ System          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ send-email      │  (Supabase Edge Function)
│ Edge Function   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Resend API     │  (Email service provider)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Recipient      │  (User's inbox)
└─────────────────┘
```

---

## 🔄 How It Works (Step by Step)

### 1. **Something Happens** (Trigger)
An event occurs that requires sending an email:
- ✅ User completes a booking payment
- ✅ Session reminder time arrives
- ✅ User cancels a booking
- ✅ Session is rescheduled
- ✅ Payment is processed

### 2. **Notification System Called**
Our `NotificationSystem` class (in `src/lib/notification-system.ts`) is invoked:
- It gathers all the data needed for the email
- It calls the `send-email` Edge Function

**Example:**
```typescript
// When booking is confirmed
NotificationSystem.sendBookingConfirmation(sessionId)
```

### 3. **Edge Function Processes Request**
The `send-email` Edge Function (`supabase/functions/send-email/index.ts`):
- ✅ Validates the request (email type, recipient, data)
- ✅ Generates the HTML email template
- ✅ Calls Resend API to send the email
- ✅ Logs the email to our database (`email_logs` table)
- ✅ Returns success/failure

### 4. **Resend Delivers Email**
Resend (our email service provider):
- ✅ Sends the email to the recipient
- ✅ Returns an email ID for tracking
- ✅ Handles delivery, bounces, etc.

---

## 🎨 Key Components

### **1. NotificationSystem** (`src/lib/notification-system.ts`)
**Purpose:** Frontend/backend logic that decides when to send emails

**What it does:**
- Contains methods like `sendBookingConfirmation()`, `sendPaymentConfirmation()`, etc.
- Fetches session/user data from database
- Calls the Edge Function with proper data structure
- Handles errors gracefully (doesn't crash if email fails)

**Key Methods:**
- `sendBookingConfirmation(sessionId)` - Sends booking emails to client & practitioner
- `sendPaymentConfirmation(sessionId)` - Sends payment receipt emails
- `sendCancellationNotification(...)` - Sends cancellation emails
- `sendReschedulingNotification(...)` - Sends rescheduling emails

### **2. send-email Edge Function** (`supabase/functions/send-email/index.ts`)
**Purpose:** Serverless function that actually sends emails

**What it does:**
- Receives email requests from frontend/backend
- Validates the email type and data
- Generates HTML email templates
- Sends email via Resend API
- Logs email to database
- Handles retries for failed sends

**Key Features:**
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Rate limit handling (429 errors)
- ✅ Input validation
- ✅ Database logging

### **3. Resend API**
**Purpose:** Third-party email delivery service

**What it does:**
- Actually delivers emails to recipients
- Provides email tracking IDs
- Handles bounces, spam filtering, etc.

**Configuration:**
- API Key stored in Supabase secrets (`RESEND_API_KEY`)
- Sender email: `Theramate <onboarding@resend.dev>` (or custom domain)

---

## 📧 Email Types We Send

We support **13 different email types**:

### Booking & Payment Emails
1. `booking_confirmation_client` - Client gets booking confirmation
2. `booking_confirmation_practitioner` - Practitioner gets new booking notification
3. `payment_confirmation_client` - Client gets payment receipt
4. `payment_received_practitioner` - Practitioner gets payment notification

### Session Reminders
5. `session_reminder_24h` - 24 hours before session
6. `session_reminder_1h` - 1 hour before session

### Session Changes
7. `cancellation` - When booking is cancelled
8. `rescheduling` - When session is rescheduled

### Peer Treatment Exchange
9. `peer_booking_confirmed_client`
10. `peer_booking_confirmed_practitioner`
11. `peer_credits_deducted`
12. `peer_credits_earned`
13. `peer_booking_cancelled_refunded`

---

## 🚀 Common Trigger Points

### **1. Stripe Webhook** (Primary for bookings)
**File:** `supabase/functions/stripe-webhook/index.ts`

**When:** After successful payment
**Sends:**
- Booking confirmation (client)
- Booking confirmation (practitioner)
- Payment confirmation (client)
- Payment received (practitioner)

**Why:** Most reliable - Stripe guarantees delivery

### **2. BookingSuccess Page** (Fallback)
**File:** `src/pages/BookingSuccess.tsx`

**When:** User lands on success page
**Sends:** Same as webhook (if webhook hasn't processed yet)

**Why:** Backup in case webhook is delayed/fails

### **3. Cron Job** (Reminders)
**File:** `supabase/functions/process-reminders/index.ts`

**When:** Scheduled times (24h before, 1h before)
**Sends:** Session reminder emails

**Why:** Automated reminders

### **4. User Actions** (Cancellations, etc.)
**Files:** Various (MyBookings.tsx, SessionDetailView.tsx, etc.)

**When:** User cancels/reschedules
**Sends:** Cancellation/rescheduling emails

**Why:** Immediate notification of changes

---

## 🔐 Security & Configuration

### **Environment Variables (Secrets)**
Stored in Supabase Edge Function secrets:

1. **`RESEND_API_KEY`** (Required)
   - API key from Resend dashboard
   - Used to authenticate with Resend

2. **`RESEND_FROM_EMAIL`** (Optional)
   - Custom sender email
   - Default: `Theramate <onboarding@resend.dev>`
   - Production: `Theramate <noreply@theramate.co.uk>`

### **CORS Protection**
- Edge Function validates request origins
- Only allows requests from configured domains

---

## 📊 Email Logging

Every email is logged to the `email_logs` table:

**Fields:**
- `email_type` - Which email was sent
- `recipient_email` - Who received it
- `subject` - Email subject line
- `resend_email_id` - Tracking ID from Resend
- `status` - 'sent', 'failed', etc.
- `sent_at` - Timestamp
- `metadata` - Additional data (template data, response, etc.)

**Why:** 
- Debugging failed emails
- Tracking delivery
- Audit trail

---

## 🛡️ Error Handling

### **Retry Logic**
- **3 attempts** maximum
- **Exponential backoff** (2s, 4s, 8s delays)
- **Rate limit handling** (429 errors)
- **No retry** for validation errors (4xx)

### **Graceful Failures**
- Email failures **don't crash** the booking flow
- Errors are logged but don't block user actions
- Frontend shows success even if email fails (non-critical)

---

## 🔍 How to Debug Email Issues

### **1. Check Email Logs**
```sql
SELECT * FROM email_logs 
WHERE recipient_email = 'user@example.com' 
ORDER BY sent_at DESC;
```

### **2. Check Resend Dashboard**
- Visit: https://resend.com/emails
- See delivery status, bounces, opens

### **3. Check Edge Function Logs**
- Supabase Dashboard → Edge Functions → send-email → Logs
- See detailed error messages

### **4. Test Email Function**
```typescript
// In browser console or test script
await supabase.functions.invoke('send-email', {
  body: {
    emailType: 'booking_confirmation_client',
    recipientEmail: 'test@example.com',
    recipientName: 'Test User',
    data: { /* session data */ }
  }
});
```

---

## 📝 Key Takeaways for Juniors

1. **Centralized System**: All emails go through one Edge Function (`send-email`)
2. **Template-Based**: Each email type has a template function
3. **Idempotent**: Same email won't be sent twice (checks status before sending)
4. **Non-Blocking**: Email failures don't break user flows
5. **Logged**: Every email is tracked in database
6. **Retry Logic**: Automatic retries for transient failures
7. **Service Provider**: We use Resend (not building our own email server)

---

## 🎓 Learning Path

1. **Start Here:** Read `supabase/functions/send-email/index.ts` - see how emails are sent
2. **Then:** Read `src/lib/notification-system.ts` - see how emails are triggered
3. **Then:** Check `supabase/functions/stripe-webhook/index.ts` - see primary trigger
4. **Finally:** Test by creating a booking and watching the logs

---

## ❓ Common Questions

**Q: Can I send emails directly from the frontend?**  
A: No, always use the Edge Function. Frontend calls `supabase.functions.invoke('send-email', ...)`

**Q: How do I add a new email type?**  
A: 
1. Add email type to `validEmailTypes` array in Edge Function
2. Create template function `generateEmailTemplate()`
3. Add trigger in appropriate place (NotificationSystem, webhook, etc.)

**Q: What if Resend is down?**  
A: Emails will fail, but user actions still succeed. We log failures and can retry later.

**Q: How do I test emails?**  
A: Use `delivered@resend.dev` - Resend's test email that always works.

---

## 🔗 Related Files

- **Edge Function:** `supabase/functions/send-email/index.ts`
- **Notification System:** `src/lib/notification-system.ts`
- **Webhook Handler:** `supabase/functions/stripe-webhook/index.ts`
- **Reminder Cron:** `supabase/functions/process-reminders/index.ts`
- **Email Templates:** Inside `send-email/index.ts` (generateEmailTemplate function)

---

**Last Updated:** January 2025  
**Status:** ✅ Production Ready

