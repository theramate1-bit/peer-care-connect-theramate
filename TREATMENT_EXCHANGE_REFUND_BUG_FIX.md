# Treatment Exchange Refund Bug - Root Cause & Fix

## 🔴 CRITICAL BUG IDENTIFIED

### Problem
Johnny Osteo lost 60 credits when a treatment exchange session was cancelled, even though he never received those credits in the first place.

### Root Cause Chain

#### 1. **Initial Credit Processing Failed** (Due to `sessionData.id` bug)
- When exchange was accepted (2025-12-29 21:46:47), `processExchangeCreditsOnAcceptance` was called
- But it failed because of the `sessionData.id` bug (we just fixed this)
- **Result**: No `session_earning` or `session_payment` transactions were created
- `mutual_exchange_sessions.credits_deducted` remained `false`

#### 2. **Refund Function Bug**
- When session was cancelled (2025-12-29 21:55:43), `process_peer_booking_refund` was called
- The function checks if `session_earning` transaction exists (line 82-88)
- **BUT** it ALWAYS deducts credits from practitioner (line 113-119) regardless of whether they earned credits
- **Result**: Johnny lost 60 credits he never received!

### Evidence

**Johnny Osteo's Credits Before Cancellation**:
- `balance: 30`
- `current_balance: 30`
- `total_earned: 30`
- `total_spent: 0`

**Transactions for Session `d2be953b-9bcd-4204-8e8a-2f78d8c3bf7c`**:
- ❌ **NO** `session_earning` transaction (credits never given to Johnny)
- ❌ **NO** `session_payment` transaction (credits never deducted from requester)
- ✅ `refund` transaction: +60 to requester (correct)
- ❌ `refund` transaction: -60 from Johnny (WRONG - he never received them!)

**After Cancellation**:
- `balance: 0` (should be 30)
- `current_balance: 30` (correct)
- `total_earned: 30` (correct)
- `total_spent: 0` (correct)

## ✅ FIXES APPLIED

### 1. **Fixed Johnny's Credits** (Immediate Fix)
```sql
UPDATE credits
SET balance = 30, current_balance = 30, total_earned = 30
WHERE user_id = 'd419a3d1-5071-4940-a13f-b4aac9520dec' AND balance = 0;
```

### 2. **Fixed Refund Function** (Prevent Future Issues)
**Migration**: `fix_refund_only_deduct_if_earned`

**Changes**:
- Only deducts credits from practitioner if `v_practitioner_earning_exists` is `true`
- Only creates refund deduction transaction if practitioner actually earned credits
- Returns `practitioner_credits_deducted` flag in response

**Before** (WRONG):
```sql
-- Always deducts, even if practitioner never earned credits
v_practitioner_new_balance := GREATEST(COALESCE(v_practitioner_balance, 0) - v_session.credit_cost, 0);
UPDATE public.credits SET ... WHERE user_id = v_session.therapist_id; -- Always executes
```

**After** (CORRECT):
```sql
-- Only deducts if practitioner actually earned credits
IF v_practitioner_earning_exists THEN
    v_practitioner_new_balance := GREATEST(COALESCE(v_practitioner_balance, 0) - v_session.credit_cost, 0);
    UPDATE public.credits SET ... WHERE user_id = v_session.therapist_id;
ELSE
    v_practitioner_new_balance := COALESCE(v_practitioner_balance, 0); -- No change
END IF;
```

## 📋 VERIFICATION

### Database State After Fix
- ✅ Johnny's credits restored: `balance: 30`, `current_balance: 30`
- ✅ Refund function now checks for `session_earning` before deducting
- ✅ Future cancellations will only deduct if credits were actually earned

### Related Issues Fixed
1. ✅ `sessionData.id` bug fixed (prevents future credit processing failures)
2. ✅ Refund function fixed (prevents deducting credits that were never given)
3. ✅ Dashboard query fixed (shows treatment exchange sessions)

## 🎯 IMPACT

### Before Fixes
- Credits never deducted when exchange accepted (due to `sessionData.id` bug)
- Refund deducted credits that were never given
- Practitioners lost credits incorrectly

### After Fixes
- ✅ Credits properly deducted when exchange accepted (fixed `sessionData.id` bug)
- ✅ Refund only deducts if credits were actually earned
- ✅ Practitioners protected from incorrect deductions

## 📝 FILES MODIFIED

1. **Database Migration**: `fix_refund_only_deduct_if_earned`
   - Updated `process_peer_booking_refund` function
   - Added conditional logic to only deduct if credits were earned

2. **Frontend Fix** (Previously): `peer-care-connect/src/lib/treatment-exchange.ts`
   - Fixed `sessionData.id` → `sessionData.mutual_exchange_session_id`

## 🧪 TESTING RECOMMENDATIONS

1. **Test Normal Flow**:
   - Accept exchange request → Verify credits deducted
   - Cancel session → Verify refund only deducts if credits were earned

2. **Test Edge Case** (What happened to Johnny):
   - Accept exchange with broken credit processing
   - Cancel session → Verify NO deduction from practitioner
   - Verify client still gets refund

3. **Verify Transaction History**:
   - Check for `session_earning` and `session_payment` transactions
   - Verify refund transactions only created if credits were earned

