# Diagnostic Function Deployment Steps

## Function Created
✅ `peer-care-connect/supabase/functions/check-resend-config/index.ts`

## Deployment via Supabase Dashboard

Since Docker isn't running, deploy via dashboard:

1. **Go to Supabase Dashboard**:
   - https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions

2. **Deploy check-resend-config function**:
   - Click "Deploy a new function" or upload the function
   - Function name: `check-resend-config`
   - Or use: Supabase CLI when Docker is running

3. **After deployment, test it**:
   ```bash
   # Via HTTP
   curl https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/check-resend-config \
     -H "apikey: YOUR_ANON_KEY"
   ```

## Alternative: Test via Existing Function

We can also test by sending a test email through the send-email function (if it has the updated code deployed) and checking the response config field.

