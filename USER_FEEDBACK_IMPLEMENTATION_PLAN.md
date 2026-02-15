# User Feedback Implementation Plan

**Date:** 2025-02-09  
**Status:** Ready for Implementation

## Quick Wins (1-2 days each)

### 1. Fix Date Display Bug
**File:** `src/components/booking/BookingCalendar.tsx` or similar  
**Issue:** Calendar showing incorrect day of week  
**Fix:** Check date formatting logic, ensure timezone handling

### 2. Add Stripe T&C Visibility
**File:** `src/components/onboarding/PaymentSetupStep.tsx`  
**Issue:** Terms unclear during onboarding  
**Fix:** Add clear link/checkbox for Stripe terms

### 3. Improve "Fix" Button UX
**File:** `src/components/profile/ProfileCompletionWidget.tsx`  
**Issue:** "Fix" button hard to find  
**Fix:** Replace with checkbox or inline edit button

### 4. Add Payment Notifications
**File:** `supabase/functions/stripe-webhook/index.ts`  
**Issue:** Practitioners not notified of payments  
**Fix:** Add notification when `payment_intent.succeeded` event received

## Medium Effort (3-5 days each)

### 5. Auto-Complete Sessions
**File:** `supabase/functions/process-reminders/index.ts` or new function  
**Issue:** Sessions need manual completion  
**Fix:** Create scheduled function to auto-complete sessions after end time

### 6. Attendance Tracking
**Files:** 
- `src/components/session/SessionDetailView.tsx`
- Database migration for attendance fields
**Issue:** Need arrived/checked out tracking  
**Fix:** Add attendance status fields and UI controls

### 7. Treatment Exchange Rating Fix
**File:** `src/lib/treatment-exchange/matching.ts`  
**Issue:** 0-star new users can't exchange  
**Fix:** Allow 0-star users to exchange with each other, or start with 1-star default

### 8. Pre-Visit Questionnaire
**Files:**
- `src/components/booking/IntakeForm.tsx` (enhance existing)
- Database migration for questionnaire responses
**Issue:** Need pre-booking questionnaire  
**Fix:** Add questionnaire step before booking confirmation

## Higher Effort (1-2 weeks each)

### 9. Freestyle SOAP Notes
**Files:**
- `src/components/session/LiveSOAPNotes.tsx`
- `src/components/session/SOAPNotesTemplate.tsx`
**Issue:** Need option for custom SOAP notes  
**Fix:** Add "Freestyle" mode toggle, allow custom sections

### 10. Body Chart Feature
**Files:**
- New component: `src/components/session/BodyChart.tsx`
- Database migration for body chart data
**Issue:** Need visual body mapping  
**Fix:** Implement interactive body chart with pain/issue markers

### 11. Custom Progress Measurements
**Files:**
- `src/lib/metric-extraction.ts`
- `src/components/client/ProgressInsights.tsx`
- Database migration for custom metrics
**Issue:** Limited to ROM, strength, pain  
**Fix:** Allow practitioners to define custom metric types

### 12. Custom Exercises
**Files:**
- `src/components/practice/HEPCreator.tsx`
- `src/lib/hep-service.ts`
- Database migration for custom exercises
**Issue:** Can't add custom exercises  
**Fix:** Add "Create Custom Exercise" feature with video/image upload

### 13. Rescheduling Improvements
**File:** `src/components/booking/RescheduleBooking.tsx`  
**Issue:** Should offer reschedule instead of refund  
**Fix:** Add "Reschedule" option when practitioner cancels

### 14. Exercise Library Deduplication
**File:** `supabase/migrations/` (new migration)  
**Issue:** Duplicate exercises in library  
**Fix:** Create migration to identify and merge duplicates

## Implementation Order

### Sprint 1 (Week 1): Critical Fixes
1. Fix date display bug
2. Fix rating tier mismatch
3. Add payment notifications
4. Improve "Fix" button UX

### Sprint 2 (Week 2): Automation & Tracking
5. Auto-complete sessions
6. Attendance tracking
7. Treatment exchange rating fix
8. Add Stripe T&C clarity

### Sprint 3 (Week 3-4): Core Enhancements
9. Freestyle SOAP notes
10. Custom progress measurements
11. Pre-visit questionnaire

### Sprint 4 (Week 5-6): Advanced Features
12. Body chart feature
13. Custom exercises
14. Rescheduling improvements
15. Exercise library deduplication

## Technical Considerations

### Database Changes Required
- Attendance tracking fields
- Custom metrics schema
- Body chart data storage
- Custom exercises table
- Questionnaire responses

### New Components Needed
- `BodyChart.tsx` - Interactive body mapping
- `CustomMetricCreator.tsx` - Custom metric definition
- `CustomExerciseCreator.tsx` - Exercise creation with media
- `PreVisitQuestionnaire.tsx` - Questionnaire component

### New Edge Functions
- `auto-complete-sessions` - Scheduled function for auto-completion
- `process-attendance` - Handle attendance updates

## Testing Requirements

### Unit Tests
- Date formatting logic
- Rating tier calculations
- Auto-completion logic
- Attendance tracking

### Integration Tests
- Payment notification flow
- Treatment exchange with new users
- Session auto-completion
- Questionnaire submission

### E2E Tests
- Complete booking flow with questionnaire
- Treatment exchange flow
- Session completion flow
- Attendance tracking flow

## Success Criteria

### Phase 1 (Sprint 1)
- ✅ Zero critical bugs
- ✅ All quick wins implemented
- ✅ User testing confirms fixes

### Phase 2 (Sprint 2)
- ✅ Automation working
- ✅ Tracking features functional
- ✅ Treatment exchange accessible

### Phase 3 (Sprint 3-4)
- ✅ Core enhancements live
- ✅ User satisfaction improved
- ✅ Feature adoption metrics positive

---

**Plan Created By:** BMad Method V6  
**Date:** 2025-02-09
