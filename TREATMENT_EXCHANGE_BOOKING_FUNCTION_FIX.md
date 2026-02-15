# Treatment Exchange Booking Function Overload Fix

## 🔴 PROBLEM IDENTIFIED

PostgreSQL couldn't determine which version of `create_treatment_exchange_booking` to use because there were two versions with different parameter orders:

### Version 1 (Older):
```
p_therapist_id, p_client_id, p_client_name, p_client_email, 
p_client_phone, p_session_date, p_start_time, p_duration_minutes, 
p_session_type, p_price, ...
```

### Version 2 (Newer):
```
p_therapist_id, p_client_id, p_client_name, p_client_email, 
p_session_date, p_start_time, p_duration_minutes, p_session_type, 
p_price, p_client_phone, ...
```

**Error**: `Could not choose the best candidate function between: public.create_treatment_exchange_booking(...)`

## ✅ FIX APPLIED

### Migration: `fix_duplicate_create_treatment_exchange_booking`

1. **Dropped both duplicate functions** using `CASCADE` to remove all dependencies
2. **Created single correct version** with parameter order:
   - `p_therapist_id`
   - `p_client_id`
   - `p_client_name`
   - `p_client_email`
   - `p_session_date`
   - `p_start_time`
   - `p_duration_minutes`
   - `p_session_type`
   - `p_price` (DEFAULT 0)
   - `p_client_phone` (DEFAULT NULL)
   - `p_notes` (DEFAULT NULL)
   - `p_is_peer_booking` (DEFAULT true)
   - `p_credit_cost` (DEFAULT 0)
   - `p_exchange_request_id` (DEFAULT NULL)
   - `p_mutual_exchange_session_id` (DEFAULT NULL)
   - `p_idempotency_key` (DEFAULT NULL)

### Frontend Code

The frontend code in `treatment-exchange.ts` already uses named parameters, so it will work correctly with the new function:

```typescript
const { data: bookingResult, error: bookingError } = await supabase
  .rpc('create_treatment_exchange_booking', {
    p_therapist_id: request.requester_id,
    p_client_id: recipientId,
    p_client_name: clientName,
    p_client_email: clientEmail,
    p_client_phone: null,
    p_session_date: bookingData.session_date,
    p_start_time: bookingData.start_time,
    p_duration_minutes: bookingData.duration_minutes,
    p_session_type: bookingData.session_type || request.session_type,
    p_price: 0,
    p_notes: bookingData.notes || null,
    p_is_peer_booking: true,
    p_credit_cost: requiredCredits,
    p_exchange_request_id: exchangeRequestId,
    p_mutual_exchange_session_id: session.id,
    p_idempotency_key: idempotencyKey
  });
```

Since we're using named parameters, the order doesn't matter, but having a single function eliminates the ambiguity.

## 📋 VERIFICATION

### Function Check
After migration, there should be only ONE version of `create_treatment_exchange_booking`:
```sql
SELECT COUNT(*) 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'create_treatment_exchange_booking';
-- Should return: 1
```

### Function Signature
The function should have this exact signature:
```
create_treatment_exchange_booking(
  p_therapist_id uuid,
  p_client_id uuid,
  p_client_name text,
  p_client_email text,
  p_session_date date,
  p_start_time time without time zone,
  p_duration_minutes integer,
  p_session_type text,
  p_price numeric DEFAULT 0,
  p_client_phone text DEFAULT NULL::text,
  p_notes text DEFAULT NULL::text,
  p_is_peer_booking boolean DEFAULT true,
  p_credit_cost integer DEFAULT 0,
  p_exchange_request_id uuid DEFAULT NULL::uuid,
  p_mutual_exchange_session_id uuid DEFAULT NULL::uuid,
  p_idempotency_key text DEFAULT NULL::text
)
```

## 🎯 IMPACT

### Before Fix
- ❌ PostgreSQL couldn't determine which function to use
- ❌ Reciprocal exchange bookings failed with function ambiguity error
- ❌ Two conflicting function definitions in database

### After Fix
- ✅ Single function definition eliminates ambiguity
- ✅ Reciprocal exchange bookings should work correctly
- ✅ Function signature matches frontend expectations
- ✅ All parameters have defaults where appropriate

## 📝 FILES MODIFIED

1. **Database Migration**: `fix_duplicate_create_treatment_exchange_booking`
   - Dropped duplicate functions
   - Created single correct version

2. **Frontend Code**: `peer-care-connect/src/lib/treatment-exchange.ts`
   - No changes needed (already uses named parameters)

## 🧪 TESTING RECOMMENDATIONS

1. **Test reciprocal exchange booking**:
   - Accept a treatment exchange request
   - Book the reciprocal session
   - Verify no function ambiguity errors
   - Verify session is created successfully

2. **Check database**:
   - Verify only one function exists
   - Verify function signature matches expected order

