# Environment Variables Setup Guide

## 🚨 CRITICAL: Edge Functions are currently failing due to missing environment variables

### Current Status
- ✅ Supabase URL: `https://aikqnvltuwwgifuocvto.supabase.co`
- ✅ Supabase Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ❌ **STRIPE_SECRET_KEY**: Missing
- ❌ **SUPABASE_SERVICE_ROLE_KEY**: Missing

## 🔑 Required Keys

### 1. Supabase Service Role Key
**Location**: [https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/api](https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/api)

**Steps**:
1. Go to Supabase Dashboard
2. Select your project "theramate1@gmail.com's Project"
3. Navigate to **Settings** → **API**
4. Copy the **service_role** key (starts with `eyJ...`)

### 2. Stripe Secret Key
**Location**: [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

**Steps**:
1. Go to Stripe Dashboard
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_test_...` for test mode)

### 3. Groq API Key (for AI SOAP Notes Generation)
**Location**: [https://console.groq.com/keys](https://console.groq.com/keys)

**Steps**:
1. Go to Groq Console
2. Sign up for a free account (if you don't have one)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your API key (starts with `gsk_...`)

**Note**: Groq offers a free tier with generous limits, perfect for SOAP note generation. No credit card required for basic usage.

## ⚙️ Setting Environment Variables

### Option A: Supabase Dashboard (Recommended)
1. Go to [https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions](https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions)
2. Add these environment variables:
   - **Key**: `STRIPE_SECRET_KEY` | **Value**: `sk_test_your_key_here`
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY` | **Value**: `eyJ_your_service_role_key_here`
   - **Key**: `GROQ_API_KEY` | **Value**: `gsk_your_groq_api_key_here`

### Option B: Local .env File
Update your `.env` file with the actual values:
```bash
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJ_your_actual_service_role_key_here
GROQ_API_KEY=gsk_your_actual_groq_key_here
```

## 🧪 Testing

### Before Setup
```bash
node ../test-scripts/test-edge-functions-with-keys.js
```
**Expected**: 500 errors with authentication issues

### After Setup
```bash
node ../test-scripts/test-edge-functions-with-keys.js
```
**Expected**: 401 errors (which means functions are working correctly!)

## 🚀 Deployment

After setting environment variables:
```bash
./deploy-edge-functions-final.ps1
```

## 📊 Current Edge Function Status

| Function | Status | Issue |
|----------|--------|-------|
| check-subscription | ❌ 500 | Missing environment variables |
| create-checkout | ❌ 500 | Missing environment variables |
| customer-portal | ❌ 500 | Missing environment variables |
| soap-notes | ❌ 500 | Missing GROQ_API_KEY (if using AI features) |

## 🎯 Next Steps

1. **Get the keys** from Supabase, Stripe, and Groq dashboards
2. **Set environment variables** in Supabase Dashboard
3. **Test Edge Functions** with the test script
4. **Deploy updated functions** using the PowerShell script
5. **Test OAuth flow** in production
6. **Test AI SOAP Notes** generation (requires Pro plan)

## 🔍 Troubleshooting

### If you still get 500 errors after setting keys:
- Check that keys are copied correctly (no extra spaces)
- Verify keys are set in Supabase Dashboard
- Redeploy Edge Functions after setting variables

### If you get 401 errors:
- **This is GOOD!** It means your functions are working
- 401 means "authentication required" which is correct behavior
- Test with a real authenticated user session
