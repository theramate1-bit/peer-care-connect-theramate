# Complete Email Types Checklist for Theramate

## All Email Types in the Application

### 📋 Regular Booking Flow Emails

#### 1. Booking Confirmation - Client ✅
- **Email Type**: `booking_confirmation_client`
- **Sent To**: Client when booking is confirmed
- **Contains**: Session details, practitioner info, booking links, cancellation policy
- **When Sent**: After successful booking creation
- **Template Location**: `send-email/index.ts` lines 243-303
- **Trigger**: `NotificationSystem.sendBookingConfirmation(sessionId)`
- **Status**: ✅ Template exists

#### 2. Booking Confirmation - Practitioner ✅
- **Email Type**: `booking_confirmation_practitioner`
- **Sent To**: Practitioner when they receive a new booking
- **Contains**: Client info, session details, payment status
- **When Sent**: After successful booking creation
- **Template Location**: `send-email/index.ts` lines 305-358
- **Trigger**: `NotificationSystem.sendBookingConfirmation(sessionId)`
- **Status**: ✅ Template exists

### 💳 Payment Flow Emails

#### 3. Payment Confirmation - Client ✅
- **Email Type**: `payment_confirmation_client`
- **Sent To**: Client after successful payment
- **Contains**: Payment amount, session details, receipt info
- **When Sent**: After payment is processed
- **Template Location**: `send-email/index.ts` lines 360-418
- **Trigger**: `NotificationSystem.sendPaymentConfirmation(paymentId)`
- **Status**: ✅ Template exists

#### 4. Payment Received - Practitioner ✅
- **Email Type**: `payment_received_practitioner`
- **Sent To**: Practitioner when payment is received
- **Contains**: Payment breakdown, platform fee, earnings amount
- **When Sent**: After payment is processed
- **Template Location**: `send-email/index.ts` lines 420-472
- **Trigger**: `NotificationSystem.sendPaymentConfirmation(paymentId)`
- **Status**: ✅ Template exists

### ⏰ Reminder Emails

#### 5. Session Reminder - 24 Hours ✅
- **Email Type**: `session_reminder_24h`
- **Sent To**: Both client and practitioner
- **Contains**: Session details, preparation tips, directions link
- **When Sent**: 24 hours before session
- **Template Location**: `send-email/index.ts` lines 474-539
- **Trigger**: `NotificationSystem.scheduleSessionReminders(sessionId)`
- **Status**: ✅ Template exists

#### 6. Session Reminder - 2 Hours ⚠️
- **Email Type**: `session_reminder_2h`
- **Sent To**: Both client and practitioner
- **Contains**: Session details, last-minute reminders
- **When Sent**: 2 hours before session
- **Template Location**: `send-email/index.ts` lines 541-607
- **Trigger**: `NotificationSystem.scheduleSessionReminders(sessionId)`
- **Status**: ✅ Template exists (BUT code uses `session_reminder_1h` instead - see note below)

#### 7. Session Reminder - 1 Hour ✅
- **Email Type**: `session_reminder_1h`
- **Sent To**: Both client and practitioner
- **Contains**: Session details, urgent reminders
- **When Sent**: 1 hour before session
- **Template Location**: `send-email/index.ts` lines 609-674
- **Trigger**: `NotificationSystem.scheduleSessionReminders(sessionId)`
- **Status**: ✅ Template exists, ✅ Actually used in code

### ❌ Cancellation & Rescheduling Emails

#### 8. Cancellation Notification ✅
- **Email Type**: `cancellation`
- **Sent To**: Other party when session is cancelled
- **Contains**: Cancellation reason, refund info, rebooking links
- **When Sent**: When session is cancelled
- **Template Location**: `send-email/index.ts` lines 676-727
- **Trigger**: `NotificationSystem.sendCancellationNotification(sessionId, cancelledBy)`
- **Status**: ✅ Template exists

#### 9. Rescheduling Notification ✅
- **Email Type**: `rescheduling`
- **Sent To**: Both client and practitioner
- **Contains**: Original and new date/time, calendar links
- **When Sent**: When session is rescheduled
- **Template Location**: `send-email/index.ts` lines 729-780
- **Trigger**: `NotificationSystem.sendReschedulingNotification(sessionId, rescheduleData)`
- **Status**: ✅ Template exists

### 🤝 Peer Treatment Exchange Emails

#### 10. Peer Booking Confirmed - Client 🔴
- **Email Type**: `peer_booking_confirmed_client`
- **Sent To**: Client (practitioner requesting treatment)
- **Contains**: Session details, credits deducted info
- **When Sent**: When peer treatment booking is confirmed
- **Template Location**: `supabase/functions/send-email/index.ts` lines 774-831 (EXISTS IN OLD LOCATION)
- **Trigger**: `NotificationSystem.sendPeerBookingNotification(...)`
- **Status**: 🔴 **MISSING in peer-care-connect version** - Will throw error!

#### 11. Peer Credits Deducted 🔴
- **Email Type**: `peer_credits_deducted`
- **Sent To**: Client (practitioner requesting treatment)
- **Contains**: Credits deducted amount, session details
- **When Sent**: When peer booking is confirmed
- **Template Location**: `supabase/functions/send-email/index.ts` lines 833-882 (EXISTS IN OLD LOCATION)
- **Trigger**: `NotificationSystem.sendPeerBookingNotification(...)`
- **Status**: 🔴 **MISSING in peer-care-connect version** - Will throw error!

#### 12. Peer Booking Confirmed - Practitioner 🔴
- **Email Type**: `peer_booking_confirmed_practitioner`
- **Sent To**: Practitioner providing treatment
- **Contains**: Session details, credits earned info
- **When Sent**: When peer treatment booking is confirmed
- **Template Location**: `supabase/functions/send-email/index.ts` lines 774-831 (EXISTS IN OLD LOCATION)
- **Trigger**: `NotificationSystem.sendPeerBookingNotification(...)`
- **Status**: 🔴 **MISSING in peer-care-connect version** - Will throw error!

#### 13. Peer Credits Earned 🔴
- **Email Type**: `peer_credits_earned`
- **Sent To**: Practitioner providing treatment
- **Contains**: Credits earned amount, session details
- **When Sent**: When peer booking is confirmed
- **Template Location**: `supabase/functions/send-email/index.ts` lines 884-934 (EXISTS IN OLD LOCATION)
- **Trigger**: `NotificationSystem.sendPeerBookingNotification(...)`
- **Status**: 🔴 **MISSING in peer-care-connect version** - Will throw error!

#### 14. Peer Booking Cancelled - Refunded 🔴
- **Email Type**: `peer_booking_cancelled_refunded`
- **Sent To**: Both client and practitioner
- **Contains**: Cancellation details, credit refund info
- **When Sent**: When peer booking is cancelled
- **Template Location**: `supabase/functions/send-email/index.ts` lines 936-993 (EXISTS IN OLD LOCATION)
- **Trigger**: `NotificationSystem.sendPeerCancellationNotification(...)`
- **Status**: 🔴 **MISSING in peer-care-connect version** - Will throw error!

---

## Verification Checklist

### Regular Booking Emails
- [ ] `booking_confirmation_client` - Test send and verify template
- [ ] `booking_confirmation_practitioner` - Test send and verify template
- [ ] `payment_confirmation_client` - Test send and verify template
- [ ] `payment_received_practitioner` - Test send and verify template

### Reminder Emails
- [ ] `session_reminder_24h` - Test scheduling and verify delivery
- [ ] `session_reminder_1h` - Test scheduling and verify delivery
- [ ] `session_reminder_2h` - ⚠️ Template exists but NOT used in code (uses 1h instead)

### Cancellation/Rescheduling
- [ ] `cancellation` - Test cancellation flow and verify email
- [ ] `rescheduling` - Test reschedule flow and verify email

### Peer Treatment Emails
- [ ] `peer_booking_confirmed_client` - Check if template exists in peer-care-connect version
- [ ] `peer_credits_deducted` - Check if template exists in peer-care-connect version
- [ ] `peer_booking_confirmed_practitioner` - Check if template exists in peer-care-connect version
- [ ] `peer_credits_earned` - Check if template exists in peer-care-connect version
- [ ] `peer_booking_cancelled_refunded` - Check if template exists in peer-care-connect version

---

## Issues Found

### 1. Peer Email Templates Missing 🔴 CRITICAL
- **Issue**: All 5 peer booking email templates are **MISSING** from `peer-care-connect/supabase/functions/send-email/index.ts`
- **Location**: Templates exist in `supabase/functions/send-email/index.ts` (old location)
- **Impact**: All peer booking emails will **FAIL** with error: `Unknown email type: peer_booking_confirmed_client`
- **Action Needed**: **URGENT** - Copy all 5 peer email templates from old location to new location

### 2. Session Reminder - 2 Hours ⚠️
- **Issue**: Template exists (`session_reminder_2h`) but code uses `session_reminder_1h` instead
- **Action Needed**: Either remove 2h template (unused) or update code to use it

---

## Next Steps

1. **Verify Peer Email Templates**: Check if peer booking email templates exist in `peer-care-connect/supabase/functions/send-email/index.ts`
2. **Test Each Email Type**: Send test emails for each type to verify:
   - Template renders correctly
   - Links work
   - Data is populated correctly
   - Sender address is correct (should be `noreply@theramate.co.uk`)
3. **Fix Missing Templates**: Add any missing peer booking templates if needed
4. **Test End-to-End**: Test actual booking/payment/cancellation flows to verify emails are sent

