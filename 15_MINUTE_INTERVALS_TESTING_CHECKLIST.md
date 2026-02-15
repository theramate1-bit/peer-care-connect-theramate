# 15-Minute Intervals & Buffer Testing Checklist

## Overview
This checklist covers all testing scenarios for the 15-minute interval booking system, buffer enforcement, and service duration restrictions.

**Status**: Ready for Testing  
**Date**: January 31, 2025

---

## 🎯 Test Environment Setup

### Prerequisites
- [ ] Logged in as a practitioner (to test service creation)
- [ ] Logged in as a client/guest (to test booking)
- [ ] At least one practitioner with availability set
- [ ] At least one existing service/product created

---

## 📋 PART 1: Service Duration Restrictions

### Test Location: Service Management Page
**Path**: Practitioner Dashboard → Services/Products Management

### Test 1.1: Service Creation - Valid Durations
- [ ] Navigate to Service Management
- [ ] Click "Create New Service" or "Add Service"
- [ ] Fill in service name and details
- [ ] **Test Duration Dropdown:**
  - [ ] Verify dropdown shows only: 30, 45, 60, 75, 90 minutes
  - [ ] Select "30 minutes" → Should save successfully
  - [ ] Select "45 minutes" → Should save successfully
  - [ ] Select "60 minutes" → Should save successfully
  - [ ] Select "75 minutes" → Should save successfully
  - [ ] Select "90 minutes" → Should save successfully

**Expected Result**: ✅ Only 5 duration options available, all save successfully

### Test 1.2: Service Creation - Invalid Durations (Frontend)
- [ ] Try to edit HTML to add custom duration (if possible)
- [ ] Try to submit form with invalid duration
- [ ] **Expected**: Frontend validation should prevent submission

**Expected Result**: ✅ Frontend blocks invalid durations

### Test 1.3: Service Editing - Duration Restrictions
- [ ] Edit an existing service
- [ ] Change duration dropdown
- [ ] Verify only 30, 45, 60, 75, 90 options available
- [ ] Save changes

**Expected Result**: ✅ Can only select allowed durations

### Test 1.4: Database-Level Enforcement
**Test via Supabase Dashboard SQL Editor:**
```sql
-- This should FAIL
INSERT INTO practitioner_products (practitioner_id, name, duration_minutes, price_amount)
VALUES ('your-practitioner-id', 'Test Service', 25, 5000);
```
- [ ] Run the SQL above with invalid duration (25 minutes)
- [ ] **Expected**: Should fail with CHECK constraint violation

**Expected Result**: ✅ Database rejects invalid durations

---

## 📋 PART 2: 15-Minute Interval Slot Generation

### Test Location: Booking Flows
**Paths**: 
- Marketplace Booking (`/marketplace` or booking modal)
- Guest Booking Flow
- Treatment Exchange Booking

### Test 2.1: Marketplace Booking - Slot Intervals
- [ ] Navigate to marketplace
- [ ] Select a practitioner
- [ ] Click "Book Session"
- [ ] Select a service (30, 45, 60, 75, or 90 minutes)
- [ ] Select a date
- [ ] **Check Available Time Slots:**
  - [ ] Verify slots appear every 15 minutes
  - [ ] Example: 9:00, 9:15, 9:30, 9:45, 10:00, 10:15, etc.
  - [ ] Verify NO hourly-only slots (should not see only 9:00, 10:00, 11:00)

**Expected Result**: ✅ Slots available every 15 minutes

### Test 2.2: Guest Booking - Slot Intervals
- [ ] Navigate to marketplace as guest (not logged in)
- [ ] Select a practitioner
- [ ] Click "Book as Guest"
- [ ] Select service and date
- [ ] **Check Available Time Slots:**
  - [ ] Verify 15-minute intervals
  - [ ] Verify slots are properly filtered

**Expected Result**: ✅ Guest booking shows 15-minute intervals

### Test 2.3: Treatment Exchange - Slot Intervals
- [ ] Navigate to Treatment Exchange
- [ ] Accept or create an exchange request
- [ ] Select date for reciprocal booking
- [ ] **Check Available Time Slots:**
  - [ ] Verify 15-minute intervals
  - [ ] Verify slots respect working hours

**Expected Result**: ✅ Treatment exchange shows 15-minute intervals

### Test 2.4: Slot Generation with Different Service Durations
- [ ] Create/select a 30-minute service
- [ ] Check available slots → Should show 15-minute intervals
- [ ] Create/select a 45-minute service
- [ ] Check available slots → Should show 15-minute intervals
- [ ] Create/select a 60-minute service
- [ ] Check available slots → Should show 15-minute intervals
- [ ] Create/select a 75-minute service
- [ ] Check available slots → Should show 15-minute intervals
- [ ] Create/select a 90-minute service
- [ ] Check available slots → Should show 15-minute intervals

**Expected Result**: ✅ All service durations show 15-minute interval slots

---

## 📋 PART 3: 15-Minute Buffer Enforcement

### Test Location: Booking Creation & Conflict Detection

### Test 3.1: Buffer Enforcement - Frontend Slot Filtering
**Setup**: Create a booking first
1. [ ] Book a session at 10:00 AM for 60 minutes (ends at 11:00 AM)
2. [ ] Try to book another session
3. [ ] **Check Available Slots:**
   - [ ] Verify 10:00 AM is NOT available (overlap)
   - [ ] Verify 10:15 AM is NOT available (overlap)
   - [ ] Verify 10:30 AM is NOT available (overlap)
   - [ ] Verify 10:45 AM is NOT available (overlap)
   - [ ] Verify 11:00 AM is NOT available (buffer violation - within 15 min)
   - [ ] Verify 11:15 AM is NOT available (buffer violation - within 15 min)
   - [ ] Verify 11:30 AM IS available (15 minutes after buffer ends)

**Expected Result**: ✅ Slots within 15 minutes after booking end are blocked

### Test 3.2: Buffer Enforcement - Database Level
**Test via Supabase SQL:**
```sql
-- First, create a booking
SELECT create_booking_with_validation(
  p_therapist_id := 'your-therapist-id',
  p_client_id := 'your-client-id',
  p_client_name := 'Test Client',
  p_client_email := 'test@example.com',
  p_session_date := CURRENT_DATE + 1,
  p_start_time := '10:00'::time,
  p_duration_minutes := 60,  -- Ends at 11:00
  p_session_type := 'Test Session',
  p_price := 50.00
);

-- Then try to book within buffer (should FAIL)
SELECT create_booking_with_validation(
  p_therapist_id := 'your-therapist-id',
  p_client_id := 'your-client-id',
  p_client_name := 'Test Client 2',
  p_client_email := 'test2@example.com',
  p_session_date := CURRENT_DATE + 1,
  p_start_time := '11:00'::time,  -- Starts exactly when previous ends (buffer violation)
  p_duration_minutes := 60,
  p_session_type := 'Test Session 2',
  p_price := 50.00
);
```
- [ ] Run first query (should succeed)
- [ ] Run second query (should fail with CONFLICT_BOOKING error)
- [ ] Verify error message mentions "15-minute buffer requirement"

**Expected Result**: ✅ Database rejects bookings within 15-minute buffer

### Test 3.3: Buffer Enforcement - Different Scenarios
**Scenario A: Booking starts during buffer period**
- [ ] Create booking: 10:00-11:00 (60 min)
- [ ] Try to book: 11:05 (within 15-min buffer)
- [ ] **Expected**: Should be rejected

**Scenario B: Booking ends during buffer period**
- [ ] Create booking: 10:00-10:30 (30 min)
- [ ] Try to book: 10:20 (overlaps)
- [ ] **Expected**: Should be rejected (overlap)

**Scenario C: Booking after buffer period**
- [ ] Create booking: 10:00-11:00 (60 min)
- [ ] Try to book: 11:30 (30 min after, beyond buffer)
- [ ] **Expected**: Should succeed

**Expected Result**: ✅ All buffer scenarios work correctly

### Test 3.4: Multiple Bookings - Buffer Chain
- [ ] Book session 1: 9:00-9:30 (30 min)
- [ ] Book session 2: 9:45-10:15 (30 min) - Should succeed (15 min after session 1)
- [ ] Book session 3: 10:30-11:00 (30 min) - Should succeed (15 min after session 2)
- [ ] Try to book session 4: 10:15-10:45 - Should fail (overlaps session 3)

**Expected Result**: ✅ Buffer chain works correctly

---

## 📋 PART 4: Booking Validation & Error Messages

### Test Location: All Booking Flows

### Test 4.1: Invalid Duration Error
- [ ] Try to create booking with invalid duration (if frontend allows)
- [ ] **Expected Error**: "Service duration must be 30, 45, 60, 75, or 90 minutes"

**Expected Result**: ✅ Clear error message for invalid duration

### Test 4.2: Buffer Violation Error
- [ ] Create a booking
- [ ] Try to book within 15-minute buffer
- [ ] **Expected Error**: "This time slot conflicts with an existing booking or violates the 15-minute buffer requirement. Please select another time."

**Expected Result**: ✅ Clear error message mentions buffer requirement

### Test 4.3: Overlap Error
- [ ] Create a booking
- [ ] Try to book overlapping time
- [ ] **Expected Error**: Should mention conflict or overlap

**Expected Result**: ✅ Clear error for overlapping bookings

---

## 📋 PART 5: UI/UX Verification

### Test Location: All Booking Interfaces

### Test 5.1: Time Slot Display
- [ ] Check time slot picker/selector
- [ ] Verify slots are displayed clearly
- [ ] Verify 15-minute intervals are visible
- [ ] Verify format: HH:MM (e.g., "09:15", "09:30", "09:45")

**Expected Result**: ✅ Slots clearly displayed in 15-minute increments

### Test 5.2: Duration Selector
- [ ] Check service duration selector
- [ ] Verify dropdown shows: 30, 45, 60, 75, 90 minutes
- [ ] Verify no other options available
- [ ] Verify labels are clear (e.g., "30 minutes", "45 minutes")

**Expected Result**: ✅ Duration selector shows only allowed options

### Test 5.3: Slot Availability Indicators
- [ ] Check if unavailable slots are visually distinct
- [ ] Verify blocked slots (due to buffer) are not selectable
- [ ] Verify available slots are clearly marked

**Expected Result**: ✅ Clear visual distinction between available/unavailable slots

---

## 📋 PART 6: Edge Cases & Special Scenarios

### Test 6.1: Working Hours Boundaries
- [ ] Set practitioner availability: 9:00 AM - 5:00 PM
- [ ] Try to book 90-minute session starting at 4:00 PM
- [ ] **Expected**: Should be rejected (ends at 5:30 PM, outside hours)
- [ ] Try to book 90-minute session starting at 3:30 PM
- [ ] **Expected**: Should succeed (ends at 5:00 PM, within hours)

**Expected Result**: ✅ Slots respect working hours with buffer

### Test 6.2: Same-Day Bookings
- [ ] Try to book multiple sessions on the same day
- [ ] Verify buffer is enforced between all sessions
- [ ] Verify slots update in real-time as bookings are made

**Expected Result**: ✅ Buffer enforced for all same-day bookings

### Test 6.3: Cancelled/Expired Bookings
- [ ] Create a booking with status "pending_payment"
- [ ] Let it expire (or cancel it)
- [ ] Verify slot becomes available again
- [ ] Verify buffer is recalculated

**Expected Result**: ✅ Expired/cancelled bookings free up slots

### Test 6.4: Treatment Exchange Buffer
- [ ] Create treatment exchange booking
- [ ] Verify buffer is enforced for reciprocal booking
- [ ] Verify both practitioner and client slots respect buffer

**Expected Result**: ✅ Buffer enforced in treatment exchange

---

## 📋 PART 7: Database Verification

### Test Location: Supabase Dashboard SQL Editor

### Test 7.1: Function Exists
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_booking_with_validation';
```
- [ ] Run query
- [ ] **Expected**: Function exists

**Expected Result**: ✅ Function exists

### Test 7.2: Constraints Exist
```sql
SELECT tc.table_name, tc.constraint_name, cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_name = 'check_duration_allowed';
```
- [ ] Run query
- [ ] **Expected**: Constraints exist on both tables

**Expected Result**: ✅ Constraints exist

### Test 7.3: Direct RPC Test
```sql
-- Test with invalid duration
SELECT create_booking_with_validation(
  p_therapist_id := 'test-id',
  p_client_id := 'test-id',
  p_client_name := 'Test',
  p_client_email := 'test@test.com',
  p_session_date := CURRENT_DATE + 1,
  p_start_time := '10:00',
  p_duration_minutes := 25,  -- Invalid
  p_session_type := 'Test',
  p_price := 50.00
);
```
- [ ] Run query
- [ ] **Expected**: Returns error with INVALID_DURATION code

**Expected Result**: ✅ RPC validates durations correctly

---

## 📋 PART 8: Integration Testing

### Test 8.1: End-to-End Booking Flow
1. [ ] Practitioner creates service (60 minutes)
2. [ ] Client navigates to marketplace
3. [ ] Client selects practitioner
4. [ ] Client sees 15-minute interval slots
5. [ ] Client selects slot (e.g., 10:00 AM)
6. [ ] Client completes booking
7. [ ] Verify booking created successfully
8. [ ] Try to book another session at 11:00 AM (within buffer)
9. [ ] Verify second booking is rejected

**Expected Result**: ✅ Complete flow works with buffer enforcement

### Test 8.2: Multiple Users Booking Same Practitioner
- [ ] User A books session at 10:00 AM (60 min, ends 11:00 AM)
- [ ] User B tries to book at 10:30 AM (overlap)
- [ ] **Expected**: User B booking rejected
- [ ] User B tries to book at 11:00 AM (buffer violation)
- [ ] **Expected**: User B booking rejected
- [ ] User B tries to book at 11:30 AM (after buffer)
- [ ] **Expected**: User B booking succeeds

**Expected Result**: ✅ Buffer enforced across multiple users

---

## 📋 PART 9: Performance & Load Testing

### Test 9.1: Slot Generation Performance
- [ ] Test with practitioner having many existing bookings
- [ ] Verify slot generation is fast (< 1 second)
- [ ] Verify no UI freezing or delays

**Expected Result**: ✅ Slot generation performs well

### Test 9.2: Concurrent Booking Attempts
- [ ] Have two users try to book same slot simultaneously
- [ ] Verify only one succeeds
- [ ] Verify other gets appropriate error

**Expected Result**: ✅ Concurrent bookings handled correctly

---

## 📋 PART 10: Browser Console Verification

### Test Location: Browser Developer Tools

### Test 10.1: Slot Generation Logs
- [ ] Open browser console
- [ ] Navigate to booking flow
- [ ] Check for slot generation logs
- [ ] Verify no errors in console
- [ ] Verify slot generation messages (if any)

**Expected Result**: ✅ No console errors, clean slot generation

### Test 10.2: API Call Verification
- [ ] Open Network tab
- [ ] Make a booking
- [ ] Check RPC call to `create_booking_with_validation`
- [ ] Verify request includes correct duration
- [ ] Verify response is correct

**Expected Result**: ✅ API calls work correctly

---

## ✅ Testing Summary

### Critical Tests (Must Pass)
- [ ] Service duration restrictions work
- [ ] 15-minute intervals displayed
- [ ] 15-minute buffer enforced
- [ ] Database constraints active
- [ ] Error messages clear

### Important Tests (Should Pass)
- [ ] All booking flows show 15-minute intervals
- [ ] Buffer works in all scenarios
- [ ] UI displays correctly
- [ ] Edge cases handled

### Nice-to-Have Tests
- [ ] Performance is good
- [ ] Concurrent bookings work
- [ ] Console is clean

---

## 🐛 Bug Reporting Template

If you find issues, report with:
1. **Test Number**: (e.g., Test 3.1)
2. **Location**: (e.g., Marketplace Booking)
3. **Steps to Reproduce**: (detailed steps)
4. **Expected Result**: (what should happen)
5. **Actual Result**: (what actually happened)
6. **Screenshots**: (if applicable)
7. **Console Errors**: (if any)
8. **Browser/Device**: (e.g., Chrome on Windows)

---

## 📝 Notes

- All tests should be performed in a test/staging environment first
- Test with real practitioner and client accounts
- Verify both authenticated and guest booking flows
- Check mobile responsiveness if applicable
- Test with different timezones if multi-timezone support exists

---

**Last Updated**: January 31, 2025  
**Status**: Ready for Testing

