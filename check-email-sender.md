# Booking Email Sender Address - Confirmation

## ✅ Current Sender Address

Based on the code in `peer-care-connect/supabase/functions/send-email/index.ts` (line 109):

```typescript
const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Peer Care Connect <onboarding@resend.dev>'
```

**All booking emails are currently sent from:**
```
Peer Care Connect <onboarding@resend.dev>
```

## 📧 What This Means

1. **Default Sender**: `onboarding@resend.dev` is Resend's test domain
2. **No Domain Verification Needed**: Works immediately for testing
3. **Display Name**: "Peer Care Connect" appears as the sender name
4. **Email Address**: `onboarding@resend.dev` appears as the actual email

## 🔍 Verification

From the database query, I found recent booking emails:
- Email ID: `acb3f161-d25a-4808-baa5-1ede1bbcfbe1`
- Status: `sent`
- Sent to: `delivered@resend.dev`

To verify the actual sender address:
1. Go to: https://resend.com/emails
2. Search for email ID: `acb3f161-d25a-4808-baa5-1ede1bbcfbe1`
3. Check the "From" field in the email details

## 🎯 To Change the Sender Email

If you want to use a custom domain (e.g., `theramate.co.uk`):

1. **Verify Domain in Resend:**
   - Go to: https://resend.com/domains
   - Add domain: `theramate.co.uk`
   - Add DNS records (SPF, DKIM, DMARC)

2. **Set Environment Variable:**
   ```bash
   supabase secrets set RESEND_FROM_EMAIL="Peer Care Connect <noreply@theramate.co.uk>"
   ```

3. **Or in Supabase Dashboard:**
   - Settings → Edge Functions → Secrets
   - Add: `RESEND_FROM_EMAIL`
   - Value: `Peer Care Connect <noreply@theramate.co.uk>`

## ✅ Current Status

**Sender Email**: `Peer Care Connect <onboarding@resend.dev>`
**Status**: ✅ Working (test domain, no verification needed)
**Production Ready**: ⚠️ Should upgrade to verified domain for better deliverability

