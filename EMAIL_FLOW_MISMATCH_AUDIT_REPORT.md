# Email Flow Mismatch Audit Report

**Date:** November 17, 2025  
**Status:** Complete Audit of All Email Flows  
**Project:** Theramate (Peer Care Connect)

## Executive Summary

Comprehensive audit of all email flows across Stripe webhooks, code implementation, Resend API, and Supabase configuration. This report identifies mismatches and provides fixes.

**Total Email Types Audited:** 13  
**Critical Issues Found:** 2  
**Medium Issues Found:** 1  
**Low Issues Found:** 3

---

## Batch 1: Booking Confirmation Emails ✅

### 1.1 `booking_confirmation_client`

**Status:** ✅ **FIXED** - Authorization headers added to webhook

**Files Checked:**
- `peer-care-connect/supabase/functions/stripe-webhook/index.ts` (lines 562-584) ✅
- `supabase/functions/send-email/index.ts` (lines 399-453) ✅
- `peer-care-connect/src/pages/BookingSuccess.tsx` (fallback trigger) ✅
- `peer-care-connect/src/lib/notification-system.ts` (lines 205-231) ⚠️

**Findings:**
- ✅ Stripe webhook `checkout.session.completed` triggers email correctly
- ✅ Authorization header now passed to `send-email` function in webhook
- ✅ Email template exists and matches expected data structure
- ✅ Resend API key check implemented (throws error if missing)
- ✅ Resend sender email has default fallback: `Theramate <onboarding@resend.dev>`
- ✅ Email logged in `email_logs` table
- ⚠️ **ISSUE:** NotificationSystem.sendEmailNotification() doesn't pass Authorization header (client-side code - may work with user session)

**Data Structure Match:**
- ✅ Webhook passes: sessionId, sessionType, sessionDate, sessionTime, sessionPrice, sessionDuration, sessionLocation, practitionerName, bookingUrl, calendarUrl, messageUrl
- ✅ Template expects: sessionType, sessionDate, sessionTime, sessionDuration, sessionPrice, sessionLocation, practitionerName, bookingUrl, calendarUrl, messageUrl
- ✅ Match: All required fields present

### 1.2 `booking_confirmation_practitioner`

**Status:** ✅ **FIXED** - Authorization headers added to webhook

**Files Checked:**
- `peer-care-connect/supabase/functions/stripe-webhook/index.ts` (lines 589-611) ✅
- `supabase/functions/send-email/index.ts` (lines 454-508) ✅

**Findings:**
- ✅ Same checks as 1.1 - all pass
- ✅ Practitioner email extracted correctly from session data
- ✅ Email sent even if client is guest (no user account) - uses `client_email` field

**Data Structure Match:**
- ✅ Webhook passes: sessionId, sessionType, sessionDate, sessionTime, sessionPrice, sessionDuration, clientName, clientEmail, paymentStatus, bookingUrl, messageUrl
- ✅ Template expects: sessionType, sessionDate, sessionTime, sessionDuration, sessionPrice, clientName, clientEmail, paymentStatus, bookingUrl, messageUrl
- ✅ Match: All required fields present

---

## Batch 2: Payment Confirmation Emails ✅

### 2.1 `payment_confirmation_client`

**Status:** ✅ **FIXED** - Authorization headers added to webhook

**Files Checked:**
- `peer-care-connect/supabase/functions/stripe-webhook/index.ts` (lines 625-645) ✅
- `supabase/functions/send-email/index.ts` (lines 509-561) ✅

**Findings:**
- ✅ Triggered from same webhook as booking confirmation
- ✅ Payment data correctly extracted from Stripe session
- ✅ Payment amount formatted correctly (£) - converted from cents
- ✅ Payment ID included in email data

**Data Structure Match:**
- ✅ Webhook passes: sessionId, paymentId, paymentAmount, sessionType, sessionDate, sessionTime, sessionLocation, practitionerName, bookingUrl
- ✅ Template expects: paymentAmount, sessionType, sessionDate, sessionTime, paymentId, practitionerName, bookingUrl
- ✅ Match: All required fields present

### 2.2 `payment_received_practitioner`

**Status:** ✅ **FIXED** - Authorization headers added to webhook

**Files Checked:**
- `peer-care-connect/supabase/functions/stripe-webhook/index.ts` (lines 656-674) ✅
- `supabase/functions/send-email/index.ts` (lines 562-615) ✅

**Findings:**
- ✅ Platform fee calculated correctly (0.5% or from application_fee_amount)
- ✅ Practitioner amount calculated correctly (total - platform fee)
- ✅ Payment breakdown accurate

**Data Structure Match:**
- ✅ Webhook passes: paymentAmount, platformFee, practitionerAmount, clientName, sessionType, sessionDate, paymentId
- ✅ Template expects: paymentAmount, platformFee, practitionerAmount, clientName, sessionType, sessionDate, paymentId
- ✅ Match: All required fields present

**Note:** Template shows "Platform Fee (1.5%)" but code calculates 0.5% - **MINOR MISMATCH** (template text vs actual calculation)

---

## Batch 3: Session Reminder Emails ⚠️

### 3.1 `session_reminder_24h`

**Status:** ⚠️ **ISSUE FOUND** - Missing Authorization header

**Files Checked:**
- `peer-care-connect/supabase/functions/process-reminders/index.ts` (lines 202-229) ⚠️
- `peer-care-connect/src/lib/notification-system.ts` (lines 280-334) ✅
- `supabase/functions/send-email/index.ts` (lines 616-675) ✅

**Findings:**
- ✅ Reminders scheduled in `reminders` table
- ⚠️ **ISSUE:** Cron job function `process-reminders` doesn't pass Authorization header when invoking `send-email`
- ✅ 24-hour calculation correct
- ✅ Email sent to both client and practitioner
- ✅ Template exists and matches data structure

**Data Structure Match:**
- ✅ process-reminders passes: sessionId, sessionType, sessionDate, sessionTime, sessionDuration, practitionerName, sessionLocation, bookingUrl, messageUrl
- ✅ Template expects: sessionType, sessionDate, sessionTime, sessionDuration, practitionerName, sessionLocation, bookingUrl, directionsUrl
- ⚠️ **MINOR:** Template expects `directionsUrl` but process-reminders doesn't pass it (uses `#` fallback)

### 3.2 `session_reminder_1h`

**Status:** ⚠️ **ISSUE FOUND** - Missing Authorization header

**Files Checked:**
- Same as 3.1
- `supabase/functions/send-email/index.ts` (lines 676-735) ✅

**Findings:**
- ✅ Same as 3.1 but for 1-hour reminder
- ⚠️ **NOTE:** Code schedules reminders at 24h, 2h, and 1h, but only 24h and 1h templates exist. The 2h reminder uses `session_reminder_1h` template (determined by message content check)

**Data Structure Match:**
- ✅ Same as 3.1

---

## Batch 4: Cancellation & Rescheduling Emails ⚠️

### 4.1 `cancellation`

**Status:** ⚠️ **POTENTIAL ISSUE** - Client-side code may not pass Authorization

**Files Checked:**
- `peer-care-connect/src/lib/notification-system.ts` (lines 339-397) ⚠️
- `peer-care-connect/src/pages/MyBookings.tsx` (line 869) ⚠️
- `peer-care-connect/src/components/sessions/SessionDetailView.tsx` (line 440) ⚠️
- `supabase/functions/send-email/index.ts` (lines 736-788) ✅

**Findings:**
- ✅ Triggered when session cancelled
- ✅ Cancellation reason included
- ✅ Refund amount included if applicable
- ⚠️ **ISSUE:** Client-side code calls `supabase.functions.invoke()` without explicit Authorization header (relies on user session token)

**Data Structure Match:**
- ✅ NotificationSystem passes: sessionId, sessionType, sessionDate, sessionTime, practitionerName, cancellationReason, refundAmount
- ✅ Template expects: sessionType, sessionDate, sessionTime, practitionerName, cancellationReason, refundAmount
- ✅ Match: All required fields present

**Note:** `SessionDetailView.tsx` uses email type `practitioner_cancellation` which doesn't exist in validEmailTypes - **CRITICAL MISMATCH**

### 4.2 `rescheduling`

**Status:** ⚠️ **POTENTIAL ISSUE** - Client-side code may not pass Authorization

**Files Checked:**
- `peer-care-connect/src/lib/notification-system.ts` (lines 402-450) ⚠️
- `peer-care-connect/src/lib/reschedule-service.ts` (line 205) ⚠️
- `supabase/functions/send-email/index.ts` (lines 789-841) ✅

**Findings:**
- ✅ Original and new date/time included
- ✅ Calendar links updated
- ⚠️ **ISSUE:** Client-side code doesn't pass explicit Authorization header

**Data Structure Match:**
- ✅ NotificationSystem passes: sessionId, sessionType, originalDate, originalTime, newDate, newTime, practitionerName, bookingUrl, calendarUrl
- ✅ Template expects: sessionType, originalDate, originalTime, newDate, newTime, practitionerName, bookingUrl, calendarUrl
- ✅ Match: All required fields present

---

## Batch 5: Peer Treatment Exchange Emails ✅

### 5.1 `peer_booking_confirmed_client`

**Status:** ✅ Template exists, ⚠️ Authorization header issue

**Files Checked:**
- `peer-care-connect/src/lib/notification-system.ts` (lines 1065-1083) ⚠️
- `supabase/functions/send-email/index.ts` (lines 842-900) ✅

**Findings:**
- ✅ Template exists (was missing in old audit - now present)
- ✅ Credits deducted amount included
- ✅ Trigger location identified: NotificationSystem.sendPeerBookingNotification()
- ⚠️ **ISSUE:** Client-side code doesn't pass explicit Authorization header

**Data Structure Match:**
- ✅ NotificationSystem passes: sessionId, sessionType, sessionDate, sessionTime, sessionDuration, practitionerName, paymentAmount (credits)
- ✅ Template expects: sessionType, sessionDate, sessionTime, sessionDuration, practitionerName, paymentAmount
- ✅ Match: All required fields present

### 5.2 `peer_booking_confirmed_practitioner`

**Status:** ✅ Template exists, ⚠️ Authorization header issue

**Files Checked:**
- `peer-care-connect/src/lib/notification-system.ts` (lines 1102-1120) ⚠️
- `supabase/functions/send-email/index.ts` (lines 901-960) ✅

**Findings:**
- ✅ Template exists
- ✅ Credits earned amount included
- ⚠️ **ISSUE:** Client-side code doesn't pass explicit Authorization header

**Data Structure Match:**
- ✅ Match: All required fields present

### 5.3 `peer_credits_deducted`

**Status:** ✅ Template exists, ⚠️ Authorization header issue

**Files Checked:**
- `peer-care-connect/src/lib/notification-system.ts` (lines 1085-1100) ⚠️
- `supabase/functions/send-email/index.ts` (lines 961-1011) ✅

**Findings:**
- ✅ Template exists
- ✅ Triggered separately from booking confirmation (sends both emails)
- ⚠️ **ISSUE:** Client-side code doesn't pass explicit Authorization header

### 5.4 `peer_credits_earned`

**Status:** ✅ Template exists, ⚠️ Authorization header issue

**Files Checked:**
- `peer-care-connect/src/lib/notification-system.ts` (lines 1122-1140) ⚠️
- `supabase/functions/send-email/index.ts` (lines 1012-1063) ✅

**Findings:**
- ✅ Template exists
- ✅ Triggered separately from booking confirmation
- ⚠️ **ISSUE:** Client-side code doesn't pass explicit Authorization header

### 5.5 `peer_booking_cancelled_refunded`

**Status:** ✅ Template exists, ⚠️ Authorization header issue

**Files Checked:**
- `peer-care-connect/src/lib/notification-system.ts` (lines 1169-1205) ⚠️
- `supabase/functions/send-email/index.ts` (lines 1064-1123) ✅

**Findings:**
- ✅ Template exists
- ✅ Refund amount included
- ✅ Trigger location identified: NotificationSystem.sendPeerCancellationNotification()
- ⚠️ **ISSUE:** Client-side code doesn't pass explicit Authorization header

---

## Cross-Cutting Checks

### Resend Configuration ✅

**Status:** ✅ Code checks implemented

**Findings:**
- ✅ `RESEND_API_KEY` secret check implemented (throws error if missing)
- ✅ `RESEND_FROM_EMAIL` secret has default fallback: `Theramate <onboarding@resend.dev>`
- ⚠️ **MANUAL CHECK REQUIRED:** Verify secrets are set in Supabase Dashboard
- ⚠️ **MANUAL CHECK REQUIRED:** Verify Resend domain is verified
- ⚠️ **MANUAL CHECK REQUIRED:** Check Resend API limits

### Supabase Configuration ✅

**Status:** ✅ Verified

**Findings:**
- ✅ `send-email` edge function deployed (version 27)
- ✅ `stripe-webhook` edge function deployed (version 87) - **NEEDS UPDATE** with Authorization header fixes
- ✅ Service role key available to webhook function
- ✅ `email_logs` table exists with correct schema (verified via SQL query)

**Schema Verified:**
- id (uuid, primary key)
- email_type (varchar, required)
- recipient_email (varchar, required)
- recipient_name (text, nullable)
- subject (text, required)
- resend_email_id (text, nullable)
- status (varchar, nullable)
- sent_at (timestamp, nullable)
- delivered_at (timestamp, nullable)
- opened_at (timestamp, nullable)
- clicked_at (timestamp, nullable)
- error_message (text, nullable)
- metadata (jsonb, nullable)
- created_at (timestamp, nullable)

### Stripe Webhook Configuration ⚠️

**Status:** ⚠️ **MANUAL CHECK REQUIRED**

**Findings:**
- ✅ `checkout.session.completed` webhook handler exists in code
- ✅ Webhook secret (`STRIPE_WEBHOOK_SECRET`) check implemented
- ⚠️ **MANUAL CHECK REQUIRED:** Verify webhook configured in Stripe Dashboard
- ⚠️ **MANUAL CHECK REQUIRED:** Verify webhook endpoint points to correct Supabase function URL
- ⚠️ **MANUAL CHECK REQUIRED:** Verify webhook events logged in `webhook_events` table (currently empty)

**Webhook Endpoint Should Be:**
```
https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/stripe-webhook
```

### Code Consistency ⚠️

**Status:** ⚠️ **ISSUES FOUND**

**Findings:**

1. ✅ **FIXED:** All `send-email` invocations in `stripe-webhook` function now include Authorization header
2. ⚠️ **ISSUE:** `process-reminders` function doesn't pass Authorization header (line 204)
3. ⚠️ **ISSUE:** Client-side code (NotificationSystem, MyBookings, etc.) doesn't pass explicit Authorization headers (may work with user session tokens)
4. ✅ Email types match between `validEmailTypes` array and switch cases (all 13 types present)
5. ✅ Data structures match between triggers and templates (verified for all batches)
6. ✅ Error handling consistent across all flows
7. ❌ **CRITICAL:** `SessionDetailView.tsx` uses email type `practitioner_cancellation` which doesn't exist in `validEmailTypes` - will fail
8. ⚠️ **MINOR:** Template text says "Platform Fee (1.5%)" but code calculates 0.5%

**Email Types Consistency:**
- ✅ All 13 email types in `validEmailTypes` array have corresponding switch cases
- ✅ All switch cases are in `validEmailTypes` array
- ❌ Missing from validEmailTypes: `practitioner_cancellation` (used in SessionDetailView.tsx)
- ⚠️ Note: `session_reminder_2h` template doesn't exist, but code schedules 2h reminders (uses 1h template based on message content)

---

## Critical Issues Summary

### ✅ CRITICAL ISSUES (FIXED)

1. **Missing Email Type: `practitioner_cancellation`** ✅ **FIXED**
   - **Location:** `peer-care-connect/src/components/sessions/SessionDetailView.tsx` (line 440)
   - **Issue:** Code tried to send email type `practitioner_cancellation` which doesn't exist in `validEmailTypes`
   - **Impact:** Email would fail with "Invalid emailType" error
   - **Fix Applied:** Changed to use `cancellation` type with cancellationReason field

2. **Missing Authorization Header in `process-reminders`** ✅ **FIXED**
   - **Location:** `peer-care-connect/supabase/functions/process-reminders/index.ts` (line 204)
   - **Issue:** Function invoked `send-email` without Authorization header
   - **Impact:** Reminder emails would fail with 401 Unauthorized
   - **Fix Applied:** Added Authorization header with service role key

### ✅ MEDIUM ISSUES (FIXED)

3. **Platform Fee Text Mismatch** ✅ **FIXED**
   - **Location:** `supabase/functions/send-email/index.ts` (line 592)
   - **Issue:** Template said "Platform Fee (1.5%)" but code calculates 0.5%
   - **Impact:** Confusing for practitioners
   - **Fix Applied:** Updated template text to match actual calculation (0.5%)

### ⚠️ LOW ISSUES (Nice to Fix)

4. **Client-Side Authorization Headers**
   - **Location:** Multiple files (NotificationSystem, MyBookings, SessionDetailView, etc.)
   - **Issue:** Client-side code doesn't pass explicit Authorization headers
   - **Impact:** May work if Supabase automatically adds user session tokens, but inconsistent
   - **Fix:** Verify if Supabase client automatically adds auth headers, or add explicitly

5. **Missing `directionsUrl` in Reminder Emails**
   - **Location:** `peer-care-connect/supabase/functions/process-reminders/index.ts`
   - **Issue:** Template expects `directionsUrl` but process-reminders doesn't pass it
   - **Impact:** Directions link shows "#" instead of actual URL
   - **Fix:** Add directionsUrl generation to process-reminders

6. **`session_reminder_2h` Template Missing**
   - **Location:** Code schedules 2h reminders but no template exists
   - **Issue:** 2h reminders use 1h template based on message content check
   - **Impact:** Works but inconsistent
   - **Fix:** Either create 2h template or remove 2h reminder scheduling

---

## Fixes Applied

### ✅ Priority 1: Critical Fixes (COMPLETED)

1. **Fixed `process-reminders` Authorization Header** ✅
   - **File:** `peer-care-connect/supabase/functions/process-reminders/index.ts`
   - **Change:** Added Authorization header with service role key to `send-email` invocation
   - **Status:** Fixed and ready for deployment

2. **Fixed `practitioner_cancellation` Email Type** ✅
   - **File:** `peer-care-connect/src/components/sessions/SessionDetailView.tsx`
   - **Change:** Changed email type from `practitioner_cancellation` to `cancellation`
   - **Status:** Fixed - now uses valid email type

### ✅ Priority 2: Medium Fixes (COMPLETED)

3. **Fixed Platform Fee Text** ✅
   - **File:** `supabase/functions/send-email/index.ts`
   - **Change:** Updated template text from "Platform Fee (1.5%)" to "Platform Fee (0.5%)"
   - **Status:** Fixed - template now matches actual calculation

### Priority 3: Low Priority Fixes

4. **Add directionsUrl to Reminder Emails**
   - Add directions URL generation to process-reminders function

5. **Verify Client-Side Auth**
   - Test if client-side Supabase automatically adds Authorization headers
   - If not, add explicitly to all client-side invocations

---

## Testing Recommendations

1. **Test Stripe Webhook Flow**
   - Create a test booking via Stripe Checkout
   - Verify webhook receives `checkout.session.completed`
   - Verify all 4 emails sent (booking client, booking practitioner, payment client, payment practitioner)
   - Check `email_logs` table for entries
   - Verify emails arrive in inbox

2. **Test Reminder System**
   - Create a session for tomorrow
   - Verify reminder scheduled in `reminders` table
   - Manually trigger `process-reminders` function
   - Verify reminder emails sent
   - Check for 401 errors in logs

3. **Test Cancellation Flow**
   - Cancel a session as client
   - Verify cancellation email sent to practitioner
   - Cancel a session as practitioner (check for `practitioner_cancellation` error)

4. **Test Peer Treatment Flow**
   - Create a peer treatment booking
   - Verify all peer emails sent
   - Check for any 401 errors

5. **Verify Resend Configuration**
   - Check Supabase Dashboard for `RESEND_API_KEY` secret
   - Check Supabase Dashboard for `RESEND_FROM_EMAIL` secret
   - Verify Resend domain verification
   - Check Resend dashboard for email delivery status

---

## Conclusion

The email system audit is complete. All critical and medium priority issues have been fixed:

✅ **Fixed Issues:**
1. Authorization header added to `process-reminders` function
2. Invalid email type `practitioner_cancellation` changed to `cancellation`
3. Platform fee text corrected from 1.5% to 0.5%

**Remaining Low Priority Issues:**
- Client-side code doesn't pass explicit Authorization headers (may work with user session tokens)
- Missing `directionsUrl` in reminder emails (uses "#" fallback)
- `session_reminder_2h` template missing (uses 1h template based on message check)

**Next Steps:**
1. ✅ Critical fixes completed
2. Deploy updated functions (`stripe-webhook`, `process-reminders`, `send-email`)
3. Test all email flows end-to-end
4. Verify Resend secrets in Supabase Dashboard
5. Verify Stripe webhook configuration
6. Monitor email delivery via Resend dashboard
7. Address low priority issues as needed

---

## Appendix: Email Type Reference

### Valid Email Types (13 total)
1. `booking_confirmation_client`
2. `booking_confirmation_practitioner`
3. `payment_confirmation_client`
4. `payment_received_practitioner`
5. `session_reminder_24h`
6. `session_reminder_1h`
7. `cancellation`
8. `rescheduling`
9. `peer_booking_confirmed_client`
10. `peer_booking_confirmed_practitioner`
11. `peer_credits_deducted`
12. `peer_credits_earned`
13. `peer_booking_cancelled_refunded`

### Invalid Email Types Found in Code
- `practitioner_cancellation` (used in SessionDetailView.tsx) - **NOT IN VALID LIST**

