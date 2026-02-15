# Stripe Connect Embedded Onboarding - Implementation Comparison

## Overview
This document compares your Stripe Connect embedded onboarding implementation against the official Stripe documentation.

## ✅ **Core Implementation - MATCHES DOCUMENTATION**

### 1. Account Creation (Server-side) ✅

**Documentation Requirements:**
- Use Accounts v2 API (`/v2/core/accounts`) with `merchant` configuration
- OR use Accounts v1 with `controller` properties
- Set `dashboard: 'none'` for fully embedded (no Stripe Dashboard access)
- Set `requirement_collection: 'application'` for platform-owned requirements

**Your Implementation:**
- ✅ **Lines 610-659**: Attempts Accounts v2 API first with correct configuration:
  - Uses `/v2/core/accounts` endpoint
  - Sets `dashboard: 'none'` ✅
  - Configures `merchant` and `recipient` capabilities ✅
  - Sets `defaults.responsibilities.fees_collector: 'application'` ✅
  - Sets `defaults.responsibilities.losses_collector: 'application'` ✅
  - Uses correct API version header: `2025-11-17.preview` ✅

- ✅ **Lines 686-712**: Falls back to Accounts v1 Custom with correct configuration:
  - Uses `controller.stripe_dashboard.type: 'none'` ✅
  - Sets `controller.requirement_collection: 'application'` ✅
  - Sets `controller.losses.payments: 'application'` ✅
  - Sets `controller.fees.payer: 'application'` ✅
  - Requests `card_payments` and `transfers` capabilities ✅

**Verdict:** ✅ **FULLY COMPLIANT** - Your account creation matches the documentation perfectly.

---

### 2. Account Session Creation (Server-side) ✅

**Documentation Requirements:**
```javascript
stripe.accountSessions.create({
  account: '{{CONNECTEDACCOUNT_ID}}',
  components: {
    account_onboarding: {
      enabled: true
    }
  }
});
```

**Your Implementation:**
- ✅ **Lines 2054-2057**: Creates Account Session correctly:
  ```typescript
  accountSession = await stripe.accountSessions.create({
    account: accountId,
    components: componentsConfig, // Includes account_onboarding.enabled: true
  });
  ```

- ✅ **Lines 1978-2004**: Properly handles `disable_stripe_user_authentication`:
  - Only enables when `requirement_collection === 'application'` ✅
  - Correctly synchronizes between `account_onboarding` and `payouts` components ✅
  - Validates account type before enabling features ✅

**Verdict:** ✅ **FULLY COMPLIANT** - Account Session creation matches documentation.

---

### 3. Frontend Component Rendering (Client-side) ✅

**Documentation Requirements:**
```javascript
// Initialize ConnectJS
const stripeConnectInstance = loadConnectAndInitialize({
  publishableKey,
  fetchClientSecret,
});

// Create component
const accountOnboarding = stripeConnectInstance.create('account-onboarding');
accountOnboarding.setOnExit(() => {
  console.log('User exited the onboarding flow');
});
container.appendChild(accountOnboarding);
```

**Your Implementation:**
- ✅ **Lines 137-148** (`EmbeddedStripeOnboarding.tsx`): Initializes ConnectJS correctly:
  ```typescript
  const instance = loadConnectAndInitialize({
    publishableKey,
    fetchClientSecret,
    appearance: { /* ... */ }
  });
  ```

- ✅ **Lines 189-197**: Creates and mounts component correctly:
  ```typescript
  const accountOnboarding = stripeConnectInstance.create('account-onboarding');
  accountOnboarding.setOnExit(() => { /* ... */ });
  container.appendChild(accountOnboarding);
  ```

**Verdict:** ✅ **FULLY COMPLIANT** - Component rendering matches documentation.

---

## ⚠️ **Optional Features - NOT IMPLEMENTED (But Not Required)**

The documentation shows several optional features that you haven't implemented. These are **optional** and don't affect core functionality:

### 1. Collection Options
**Documentation Example:**
```javascript
accountOnboarding.setCollectionOptions({
  fields: 'eventually_due',
  futureRequirements: 'include',
});
```

**Your Implementation:** ❌ Not implemented
**Impact:** Low - You're using default collection behavior (collects `currently_due` requirements)

**Recommendation:** Consider implementing if you want to collect all requirements upfront (`eventually_due`) instead of incrementally.

---

### 2. Step Change Handler (Analytics)
**Documentation Example:**
```javascript
accountOnboarding.setOnStepChange((stepChange) => {
  console.log(`User entered: ${stepChange.step}`);
});
```

**Your Implementation:** ❌ Not implemented
**Impact:** Low - Useful for analytics but not required for functionality

**Recommendation:** Consider adding for better user journey tracking.

---

### 3. Custom Terms of Service URLs
**Documentation Example:**
```javascript
accountOnboarding.setFullTermsOfServiceUrl('{{URL}}');
accountOnboarding.setRecipientTermsOfServiceUrl('{{URL}}');
accountOnboarding.setPrivacyPolicyUrl('{{URL}}');
```

**Your Implementation:** ❌ Not implemented
**Impact:** Medium - Users see Stripe's default terms instead of your custom terms

**Recommendation:** Implement if you want to customize the terms shown to users (requires incorporating Stripe's service agreement into your terms).

---

### 4. Prefill Information
**Documentation Requirements:**
- Prefill account information when creating the account (name, address, etc.)

**Your Implementation:** ⚠️ **PARTIALLY IMPLEMENTED**
- ✅ Sets `contact_email` when creating account (line 624)
- ❌ Doesn't prefill other information like `display_name`, `identity.business_details.registered_name`, etc.

**Impact:** Low - Users can still enter information manually

**Recommendation:** Consider prefilling `display_name` and other available fields from user profile data.

---

## 🔍 **Differences from Documentation Examples**

### 1. API Version
**Documentation:** Uses `2025-04-30.preview` for Accounts v2
**Your Implementation:** Uses `2025-11-17.preview` (line 615)
**Verdict:** ✅ **BETTER** - You're using a newer API version

### 2. Account Configuration Structure
**Documentation Example (v2):**
```json
{
  "configuration": {
    "customer": {},
    "merchant": { "capabilities": { "card_payments": { "requested": true } } }
  }
}
```

**Your Implementation:**
- ✅ Includes `merchant` configuration ✅
- ✅ Includes `recipient` configuration (for transfers) ✅
- ❌ Doesn't include `customer` configuration

**Impact:** Low - Only needed if you want to charge connected accounts using subscriptions
**Recommendation:** Add `customer` configuration if you plan to charge connected accounts.

---

## 📋 **Summary**

### ✅ **Core Requirements - 100% Compliant**
1. ✅ Account creation (v2 and v1 fallback)
2. ✅ Account Session creation
3. ✅ Frontend component initialization and rendering
4. ✅ Proper configuration for fully embedded onboarding
5. ✅ Correct handling of `disable_stripe_user_authentication`

### ⚠️ **Optional Features - Not Implemented**
1. ❌ Collection options (`eventually_due` vs `currently_due`)
2. ❌ Step change handlers (analytics)
3. ❌ Custom terms of service URLs
4. ⚠️ Limited prefilling (only email)

### 🎯 **Overall Verdict**

**Your implementation is FULLY COMPLIANT with Stripe's embedded onboarding documentation.**

All core requirements are met:
- ✅ Accounts v2 API with proper configuration
- ✅ Accounts v1 Custom fallback with correct controller properties
- ✅ Account Session creation with `account_onboarding` enabled
- ✅ Frontend component properly initialized and rendered
- ✅ Correct handling of `disable_stripe_user_authentication` feature

The optional features you haven't implemented are not required for the onboarding flow to work correctly. They would enhance the user experience and provide better analytics, but your current implementation is production-ready.

---

## 🔧 **Recommended Enhancements (Optional)**

1. **Add collection options** if you want upfront onboarding:
   ```typescript
   accountOnboarding.setCollectionOptions({
     fields: 'eventually_due',
     futureRequirements: 'include',
   });
   ```

2. **Add step change handler** for analytics:
   ```typescript
   accountOnboarding.setOnStepChange((stepChange) => {
     // Track user progress
     analytics.track('onboarding_step', { step: stepChange.step });
   });
   ```

3. **Prefill more account information** from user profile:
   ```typescript
   // In handleCreateConnectAccount
   display_name: `${firstName} ${lastName}`,
   identity: {
     business_details: {
       registered_name: businessName || `${firstName} ${lastName}`
     }
   }
   ```

4. **Add customer configuration** if you plan to charge connected accounts:
   ```typescript
   configuration: {
     customer: {},
     merchant: { /* ... */ }
   }
   ```

---

## ✅ **Conclusion**

Your Stripe Connect embedded onboarding implementation **matches the documentation** for all core requirements. The implementation is production-ready and follows Stripe's best practices for fully embedded onboarding with Custom accounts.

