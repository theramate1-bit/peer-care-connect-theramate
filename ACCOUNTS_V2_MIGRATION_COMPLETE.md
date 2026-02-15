# Accounts v2 Migration Complete - Official Implementation Only

## Summary

The Stripe Connect onboarding implementation has been updated to use **ONLY** the official Accounts v2 API, with **NO fallbacks** to Accounts v1. This matches the official Stripe documentation exactly.

## Changes Made

### 1. Account Creation (Server-side) ✅

**Before:** 
- Attempted Accounts v2 API
- Fell back to Accounts v1 Custom if v2 failed
- Used Stripe SDK for v1 fallback

**After:**
- Uses **ONLY** Accounts v2 API (`/v2/core/accounts`)
- **NO fallbacks** - returns error if v2 fails
- Matches official documentation exactly:
  - Uses `dashboard: 'none'` for fully embedded
  - Uses `configuration.merchant` for payment capabilities
  - Uses `defaults.responsibilities` to set fees_collector and losses_collector
  - Uses `identity` to set country and entity_type
  - Includes `display_name` and `identity.business_details.registered_name` prefilling
  - Uses official API version: `2025-04-30.preview`

**Key Changes:**
- Removed all Accounts v1 fallback code
- Removed Stripe SDK usage for account creation (using direct HTTP calls for v2)
- Added proper prefilling of `display_name` and `registered_name`
- Added `customer` configuration (optional, for future subscription charging)
- Updated error handling to only handle v2 errors

### 2. Account Verification (Server-side) ✅

**Before:**
- Used Stripe SDK `stripe.accounts.retrieve()` (v1 API)
- Checked for `account.type === 'custom'` and `account.controller`
- Used v1 concepts like `requirement_collection`

**After:**
- Uses Accounts v2 API (`GET /v2/core/accounts/{id}`)
- Checks for `account.dashboard === 'none'` (v2 format)
- Checks `account.defaults.responsibilities` (v2 format)
- Validates Accounts v2 structure correctly

**Key Changes:**
- Replaced SDK calls with direct HTTP calls to v2 API
- Updated validation logic to use v2 account structure
- Removed references to v1 concepts (`type`, `controller`, `requirement_collection`)

### 3. Account Session Creation (Server-side) ✅

**Before:**
- Used Stripe SDK `stripe.accounts.retrieve()` to verify account
- Checked for `account.type === 'custom'` and `account.controller.requirement_collection`
- Used v1 concepts for validation

**After:**
- Uses Accounts v2 API to retrieve account details
- Checks for `account.dashboard === 'none'` (v2 format)
- Validates `account.defaults.responsibilities` (v2 format)
- Enables `disable_stripe_user_authentication` based on v2 account structure

**Key Changes:**
- Replaced SDK calls with direct HTTP calls to v2 API
- Updated validation to use v2 account structure
- Updated feature detection logic for `disable_stripe_user_authentication`

## Implementation Details

### Account Creation Request (Accounts v2)

```typescript
POST https://api.stripe.com/v2/core/accounts
Headers:
  Authorization: Bearer {SECRET_KEY}
  Stripe-Version: 2025-04-30.preview
  Content-Type: application/json

Body:
{
  "include": [
    "configuration.customer",
    "configuration.merchant",
    "identity",
    "requirements"
  ],
  "contact_email": "user@example.com",
  "display_name": "User Name",
  "dashboard": "none",
  "identity": {
    "business_details": {
      "registered_name": "User Name"
    },
    "country": "GB",
    "entity_type": "individual"
  },
  "configuration": {
    "customer": {},
    "merchant": {
      "capabilities": {
        "card_payments": {
          "requested": true
        }
      }
    }
  },
  "defaults": {
    "currency": "gbp",
    "responsibilities": {
      "fees_collector": "application",
      "losses_collector": "application"
    },
    "locales": ["en-GB"]
  }
}
```

### Account Verification (Accounts v2)

```typescript
GET https://api.stripe.com/v2/core/accounts/{account_id}
Headers:
  Authorization: Bearer {SECRET_KEY}
  Stripe-Version: 2025-04-30.preview
```

**Validation:**
- `account.dashboard === 'none'` ✅ (fully embedded)
- `account.defaults.responsibilities.fees_collector === 'application'` ✅
- `account.defaults.responsibilities.losses_collector === 'application'` ✅

## Benefits

1. **Official Implementation**: Uses only the official Accounts v2 API as documented
2. **No Legacy Code**: Removed all Accounts v1 fallback logic
3. **Consistent Structure**: All accounts use the same v2 structure
4. **Future-Proof**: Aligned with Stripe's latest API version
5. **Better Error Handling**: Clear errors when v2 API fails (no confusing fallback behavior)

## Breaking Changes

⚠️ **Important**: This change removes fallback support for Accounts v1. If the Accounts v2 API fails, the system will return an error instead of falling back to v1.

**Impact:**
- New account creation will only work with Accounts v2 API
- Existing v1 accounts will need to be migrated or recreated
- Error messages are clearer (no fallback confusion)

## Testing Checklist

- [ ] Create new account using Accounts v2 API
- [ ] Verify account has `dashboard: 'none'`
- [ ] Verify account has correct `defaults.responsibilities`
- [ ] Test Account Session creation with v2 account
- [ ] Test embedded onboarding component rendering
- [ ] Verify `disable_stripe_user_authentication` works correctly
- [ ] Test error handling when v2 API fails

## Files Modified

- `supabase/functions/stripe-payment/index.ts`
  - `handleCreateConnectAccount()` - Updated to use only Accounts v2
  - `handleCreateAccountSession()` - Updated to verify v2 accounts

## Documentation References

- [Stripe Embedded Onboarding (Accounts v2)](https://docs.stripe.com/connect/embedded-onboarding?accounts-namespace=v2)
- [Accounts v2 API Reference](https://docs.stripe.com/api/v2/core/accounts.md)
- [Account Sessions API](https://docs.stripe.com/api/account_sessions.md)

## Next Steps

1. Test the implementation in staging environment
2. Monitor for any Accounts v2 API errors
3. Update any documentation that references Accounts v1
4. Consider migrating existing v1 accounts to v2 (if needed)

