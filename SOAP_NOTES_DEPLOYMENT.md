# SOAP Notes Deployment Guide

## ✅ Completed Steps

1. ✅ **GROQ_API_KEY Secret Set** - Successfully configured in Supabase
   - Verified via `supabase secrets list`
   - Secret is encrypted and ready for Edge Functions

2. ✅ **Code Updated** - Function uses official Vercel AI SDK
   - Uses `npm:ai` (official Vercel AI SDK)
   - Uses `npm:@ai-sdk/groq` for Groq provider
   - Uses `npm:zod` for schema validation
   - Location: `supabase/functions/soap-notes/index.ts`

## 🚀 Deployment Steps

### Option 1: Supabase Dashboard (Recommended - No Docker Required)

1. **Navigate to Edge Functions**:
   - Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/functions

2. **Select soap-notes function**:
   - Click on `soap-notes` in the functions list

3. **Deploy the updated code**:
   - Open the code editor
   - Copy the entire contents of `supabase/functions/soap-notes/index.ts`
   - Paste into the editor (replace existing code)
   - Click **Deploy** button

4. **Verify deployment**:
   - Check the function logs for any errors
   - Look for successful deployment confirmation

### Option 2: Supabase CLI (Requires Docker Desktop)

If Docker Desktop is running:

```powershell
cd "C:\Users\rayma\Desktop\New folder\peer-care-connect"
supabase functions deploy soap-notes --project-ref aikqnvltuwwgifuocvto
```

## 🧪 Testing After Deployment

### Test the Function

1. **Navigate to Client Management**:
   - Go to Practice → Client Management
   - Select a client
   - Go to the AI Assistant tab

2. **Test SOAP Generation**:
   - Enter or transcribe a sample transcript
   - Click "Generate SOAP Notes"
   - Verify the AI generates structured SOAP notes

### Sample Test Transcript

```
Patient reports lower back pain that started 3 days ago after lifting heavy boxes. 
Pain is sharp, 7/10 intensity, worse with bending forward. 
No numbness or tingling. 
Physical exam shows limited forward flexion, muscle tension in lumbar paraspinals. 
ROM testing reveals 40 degrees forward flexion (normal 90 degrees).
```

### Expected Response

The function should return:
```json
{
  "subjective": "Chief complaint: Lower back pain...",
  "objective": "Physical examination findings...",
  "assessment": "Clinical impression: Acute low back strain...",
  "plan": "Treatment plan: Ice therapy, gentle stretching..."
}
```

## ✅ Verification Checklist

- [ ] GROQ_API_KEY secret is set (✅ Already done)
- [ ] Function code is deployed
- [ ] Function logs show no errors
- [ ] SOAP notes generate successfully from test transcript
- [ ] All four sections (S, O, A, P) are populated
- [ ] Error handling works correctly

## 🔍 Troubleshooting

### If SOAP generation fails:

1. **Check function logs**:
   - Supabase Dashboard → Functions → soap-notes → Logs
   - Look for error messages

2. **Verify API key**:
   ```powershell
   supabase secrets list --project-ref aikqnvltuwwgifuocvto | findstr GROQ
   ```

3. **Check Pro plan requirement**:
   - Function requires Pro or Clinic plan subscription
   - Verify user has active subscription

4. **Test API key directly**:
   - Visit https://console.groq.com/docs
   - Test API key with a simple request

## 📝 Notes

- The function uses Groq's `llama-3.3-70b-versatile` model
- Temperature is set to 0.3 for consistent clinical documentation
- Max tokens: 2000 (sufficient for comprehensive SOAP notes)
- Function includes comprehensive error handling and validation

