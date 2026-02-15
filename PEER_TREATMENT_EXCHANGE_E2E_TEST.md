# Peer Treatment Exchange - End-to-End Test Plan

## Test Environment Setup
- Two practitioner accounts needed:
  - Practitioner A (requester)
  - Practitioner B (recipient)
- Both should have subscription credits available

---

## Test Scenario 1: Request Flow ✅

### Steps:
1. **Login as Practitioner A**
   - Navigate to `/credits` page
   - Click "Find Peer Practitioners" card or "Search Practitioners" button

2. **Search and Select Practitioner**
   - Verify practitioners list loads
   - ✅ Verify specializations display with secondary badges
   - ✅ Verify "Send Request" button is visible
   - Click on a practitioner card
   - Click "Send Request" button

3. **Fill Request Form**
   - ✅ Verify modal title: "Request Peer Treatment"
   - ✅ Verify description mentions they can accept/decline
   - Enter session date
   - Enter start time
   - Select duration (e.g., 60 minutes)
   - Enter session type (optional)
   - Add notes (optional)
   - ✅ Verify cost shows credits (from subscription)
   - Click "Send Request"

4. **Verify Request Creation**
   - ✅ Success toast: "Treatment exchange request sent! [Name] will review your request. Credits will only be deducted if the request is accepted."
   - ✅ Modal closes
   - ✅ Request appears in "My Peer Sessions" sidebar under "Pending Requests"
   - ✅ Credits NOT deducted yet (verify balance unchanged)
   - ✅ Slot held temporarily

---

## Test Scenario 2: Review Flow ✅

### Steps:
1. **Login as Practitioner B (Recipient)**
   - ✅ Verify notification appears (if notification system active)
   - Navigate to Exchange Requests page (`/practice/exchange-requests`)

2. **View Received Requests**
   - ✅ Should see request in "Received" tab
   - ✅ Request shows:
     - Requester name
     - Session date and time
     - Duration
     - Session type
     - Notes
     - Status: "Pending"

3. **Request Details**
   - Click on request
   - ✅ Verify all details visible
   - ✅ Verify "Accept" and "Decline" buttons available

---

## Test Scenario 3: Accept Flow ✅

### Steps:
1. **Accept Request**
   - On Exchange Requests page
   - Click "Accept" button on pending request
   - Add optional response notes
   - Confirm acceptance

2. **Verify Acceptance**
   - ✅ Success toast: "Exchange request accepted!"
   - ✅ Request status changes to "accepted"
   - ✅ Credits transferred:
     - Practitioner A's credits decreased
     - Practitioner B's credits increased
   - ✅ Session created in `client_sessions` with `is_peer_booking=true`
   - ✅ Session created in `mutual_exchange_sessions`
   - ✅ Notification sent to Practitioner A

3. **Verify Session Display**
   - As Practitioner A: Navigate to `/credits`
   - ✅ Verify session appears in "My Peer Sessions" sidebar under "Confirmed Sessions"
   - ✅ Session shows correct details
   - As Practitioner B: Same verification

---

## Test Scenario 4: Reject Flow ✅

### Steps:
1. **Send Another Request** (as Practitioner A to Practitioner C)
   - Follow Test Scenario 1 steps

2. **Reject Request** (as Practitioner C)
   - Navigate to Exchange Requests page
   - Click "Decline" button
   - Add optional reason
   - Confirm decline

3. **Verify Rejection**
   - ✅ Success toast: "Exchange request declined"
   - ✅ Request status changes to "declined"
   - ✅ Slot hold released
   - ✅ NO credits deducted from Practitioner A
   - ✅ Notification sent to Practitioner A
   - ✅ Request disappears from pending list

---

## Test Scenario 5: UI/UX Validation ✅

### Verify:
1. **Specializations Display**
   - ✅ Specializations show with `secondary` variant badges
   - ✅ Shows up to 3 specializations with "+X more" indicator
   - ✅ Matches marketplace styling

2. **Credits Information**
   - ✅ Shows credit cost clearly
   - ✅ Shows "from subscription" text
   - ✅ Button text: "Send Request" (not "Book Session")

3. **Pending Requests in Sidebar**
   - ✅ Shows pending requests separately from confirmed sessions
   - ✅ Shows both sent and received requests
   - ✅ "View All Requests" link works

4. **Navigation**
   - ✅ "Exchange Requests" link visible in practitioner navigation
   - ✅ Link to `/practice/exchange-requests` works

---

## Test Scenario 6: Edge Cases ⚠️

### Test:
1. **Insufficient Credits**
   - Try to send request with insufficient credits
   - ✅ Should show error and disable button

2. **Self-Booking**
   - Try to send request to yourself
   - ✅ Should show error: "Cannot book a session with yourself"

3. **Duplicate Requests**
   - Send request to same practitioner twice
   - ✅ Should handle gracefully (prevent duplicate pending requests)

4. **Expired Requests**
   - Wait 24+ hours or manually expire request
   - ✅ Request should expire
   - ✅ Slot hold released

---

## Database Verification Queries

Run these to verify data integrity:

```sql
-- Check treatment exchange requests
SELECT * FROM treatment_exchange_requests 
ORDER BY created_at DESC LIMIT 10;

-- Check client_sessions for peer bookings
SELECT * FROM client_sessions 
WHERE is_peer_booking = true 
ORDER BY created_at DESC LIMIT 10;

-- Check mutual exchange sessions
SELECT * FROM mutual_exchange_sessions 
ORDER BY created_at DESC LIMIT 10;

-- Check credits transactions
SELECT * FROM credit_transactions 
WHERE reference_type = 'exchange' 
ORDER BY created_at DESC LIMIT 10;

-- Check slot holds
SELECT * FROM slot_holds 
ORDER BY created_at DESC LIMIT 10;
```

---

## Success Criteria

All tests should pass:
- ✅ Requests create correctly with status 'pending'
- ✅ Credits checked but NOT deducted on request
- ✅ Credits transferred correctly on acceptance
- ✅ Sessions created in both tables on acceptance
- ✅ Notifications sent at each step
- ✅ UI updates in real-time
- ✅ Reject flow works correctly
- ✅ Specializations display correctly
- ✅ Navigation links work
- ✅ No data corruption or race conditions

---

## Known Issues to Watch For

1. **Timing Issues**: Real-time updates might have slight delays
2. **Notification Delivery**: Verify notifications table has entries
3. **Credit Balance Sync**: Refresh page after credit operations
4. **Slot Hold Expiration**: 10-minute holds, verify they expire correctly

