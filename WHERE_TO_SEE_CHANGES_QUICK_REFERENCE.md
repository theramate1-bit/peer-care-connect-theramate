# Where to See the Changes - Quick Reference Guide

## 🎯 Quick Navigation: Where Each Feature Appears

---

## 1️⃣ **Service Duration Restrictions (30, 45, 60, 75, 90 minutes)**

### 📍 **Location 1: Service Management Page**
**Path**: Practitioner Dashboard → Services/Products → Create/Edit Service

**What to Look For:**
- Duration field should be a **dropdown** (not a number input)
- Dropdown should show exactly 5 options:
  - 30 minutes
  - 45 minutes
  - 60 minutes
  - 75 minutes
  - 90 minutes
- No other options should be available
- Cannot type custom values

**Visual Indicator**: 
```
Duration (minutes) [Dropdown ▼]
  ├─ 30 minutes
  ├─ 45 minutes
  ├─ 60 minutes
  ├─ 75 minutes
  └─ 90 minutes
```

---

## 2️⃣ **15-Minute Interval Slots**

### 📍 **Location 1: Marketplace Booking Flow**
**Path**: Marketplace → Select Practitioner → "Book Session" → Select Date

**What to Look For:**
- Time slots appear every 15 minutes
- Example times: 9:00, 9:15, 9:30, 9:45, 10:00, 10:15, 10:30, 10:45, 11:00...
- NOT just hourly: 9:00, 10:00, 11:00 (old behavior)

**Visual Indicator**:
```
Available Times:
[09:00] [09:15] [09:30] [09:45] [10:00] [10:15] [10:30] [10:45] [11:00] ...
```

### 📍 **Location 2: Guest Booking Flow**
**Path**: Marketplace → Select Practitioner → "Book as Guest" → Select Date

**What to Look For:**
- Same 15-minute intervals as authenticated booking
- Slots update based on availability

### 📍 **Location 3: Treatment Exchange Booking**
**Path**: Treatment Exchange → Accept Request → Select Date for Reciprocal Booking

**What to Look For:**
- 15-minute interval slots
- Respects practitioner's working hours

### 📍 **Location 4: Practice Client Management**
**Path**: Practitioner Dashboard → Clients → Create Booking

**What to Look For:**
- 15-minute interval slots when creating bookings for clients

---

## 3️⃣ **15-Minute Buffer Enforcement**

### 📍 **Location 1: Slot Availability (Visual)**
**Path**: Any Booking Flow → Select Date → View Available Slots

**What to Look For:**
- After booking a session, slots within 15 minutes after the session ends are **NOT available**
- Example: If you book 10:00-11:00 (60 min session):
  - ❌ 10:00 - Not available (overlap)
  - ❌ 10:15 - Not available (overlap)
  - ❌ 10:30 - Not available (overlap)
  - ❌ 10:45 - Not available (overlap)
  - ❌ 11:00 - Not available (buffer violation)
  - ❌ 11:15 - Not available (buffer violation)
  - ✅ 11:30 - Available (15 min after buffer ends)

**Visual Indicator**:
```
Available Times:
[09:00] [09:15] [09:30] [09:45] [10:00] [10:15] [10:30] [10:45] [11:00] [11:15] [11:30] ✓
                                                              ❌      ❌      ✅
                                                          (blocked) (blocked) (available)
```

### 📍 **Location 2: Error Messages**
**Path**: Any Booking Flow → Try to Book Within Buffer

**What to Look For:**
- Error message appears when trying to book within buffer
- Message: *"This time slot conflicts with an existing booking or violates the 15-minute buffer requirement. Please select another time."*

**Visual Indicator**:
```
❌ Error: This time slot conflicts with an existing booking 
   or violates the 15-minute buffer requirement. 
   Please select another time.
```

### 📍 **Location 3: Database (Backend)**
**Path**: Supabase Dashboard → SQL Editor

**What to Test:**
```sql
-- Create first booking
SELECT create_booking_with_validation(...);

-- Try to book within buffer (should fail)
SELECT create_booking_with_validation(...);
```

**Expected**: Second query returns error with buffer violation message

---

## 4️⃣ **Validation & Error Messages**

### 📍 **Location 1: Service Creation**
**Path**: Service Management → Create Service → Submit with Invalid Duration

**What to Look For:**
- Frontend: Dropdown prevents invalid selection
- If somehow invalid duration submitted: Error message appears

### 📍 **Location 2: Booking Creation**
**Path**: Booking Flow → Try Invalid Booking

**What to Look For:**
- **Invalid Duration Error**: "Service duration must be 30, 45, 60, 75, or 90 minutes"
- **Buffer Violation Error**: "This time slot conflicts with an existing booking or violates the 15-minute buffer requirement"
- **Overlap Error**: "This time slot is already booked"

---

## 🗺️ **Complete User Journey Map**

### **Journey 1: Practitioner Creates Service**
```
1. Login as Practitioner
   ↓
2. Navigate to Services/Products
   ↓
3. Click "Create New Service"
   ↓
4. Fill in service details
   ↓
5. Select Duration from Dropdown
   ✅ SEE: Only 5 options (30, 45, 60, 75, 90)
   ↓
6. Save Service
   ✅ SEE: Service created successfully
```

### **Journey 2: Client Books Session**
```
1. Navigate to Marketplace
   ↓
2. Select Practitioner
   ↓
3. Click "Book Session"
   ↓
4. Select Service (with duration)
   ↓
5. Select Date
   ↓
6. View Available Time Slots
   ✅ SEE: Slots every 15 minutes (9:00, 9:15, 9:30...)
   ↓
7. Select Time Slot
   ↓
8. Complete Booking
   ✅ SEE: Booking confirmation
```

### **Journey 3: Buffer Enforcement Test**
```
1. Create First Booking (10:00-11:00)
   ✅ SEE: Booking created
   ↓
2. Try to Book Second Session
   ↓
3. Select Same Date
   ↓
4. View Available Slots
   ✅ SEE: 11:00 and 11:15 NOT available (buffer)
   ✅ SEE: 11:30 IS available (after buffer)
   ↓
5. Try to Select 11:00
   ✅ SEE: Error message about buffer violation
```

---

## 🔍 **Quick Verification Tests**

### **Test 1: Service Duration Dropdown** (30 seconds)
1. Go to Service Management
2. Create/Edit service
3. Check duration field
4. ✅ Should see dropdown with 5 options only

### **Test 2: 15-Minute Slots** (30 seconds)
1. Go to Marketplace
2. Start booking
3. Select date
4. ✅ Should see slots: 9:00, 9:15, 9:30, 9:45, 10:00...

### **Test 3: Buffer Enforcement** (1 minute)
1. Create a booking (10:00-11:00)
2. Try to book again
3. Check available slots
4. ✅ 11:00 and 11:15 should be blocked
5. ✅ 11:30 should be available

---

## 📱 **Mobile vs Desktop**

### **Desktop View:**
- Time slots may appear in a grid or list
- Duration dropdown clearly visible
- Error messages in toast/alert

### **Mobile View:**
- Time slots in scrollable list
- Duration dropdown in form
- Error messages in modal/toast

**Note**: Test on both if applicable

---

## 🎨 **Visual Indicators Summary**

| Feature | Visual Indicator | Where to See |
|---------|-----------------|--------------|
| **Duration Restrictions** | Dropdown with 5 options | Service Management |
| **15-Min Intervals** | Slots: 9:00, 9:15, 9:30... | All Booking Flows |
| **Buffer Enforcement** | Slots blocked after bookings | All Booking Flows |
| **Error Messages** | Toast/Alert with message | Booking Attempts |

---

## 🚨 **Common Issues to Watch For**

### **Issue 1: Still Seeing Hourly Slots**
- **Symptom**: Only seeing 9:00, 10:00, 11:00 (not 15-min intervals)
- **Check**: Browser cache, refresh page, check console for errors

### **Issue 2: Can Type Custom Duration**
- **Symptom**: Duration field is a text input, not dropdown
- **Check**: Service Management component, verify it's using Select component

### **Issue 3: Buffer Not Enforced**
- **Symptom**: Can book back-to-back sessions
- **Check**: Database migration applied, RPC function updated

### **Issue 4: Invalid Duration Accepted**
- **Symptom**: Can create service with 25, 20, etc. minutes
- **Check**: Frontend validation, database constraints

---

## ✅ **Success Criteria Checklist**

- [ ] Service duration dropdown shows only 5 options
- [ ] Time slots appear every 15 minutes
- [ ] Slots within 15 minutes after booking are blocked
- [ ] Error messages mention buffer requirement
- [ ] Database rejects invalid durations
- [ ] All booking flows show 15-minute intervals
- [ ] Buffer works for all service durations (30, 45, 60, 75, 90)

---

**Last Updated**: January 31, 2025  
**Quick Reference**: Use this guide to quickly verify all changes are visible and working

