# Resend MCP and Email System Alignment Audit

**Date**: January 2025  
**Status**: Complete Audit Report

## Executive Summary

This audit compares the Resend MCP server configuration with the application's email system (`supabase/functions/send-email`) to identify alignment issues and provide recommendations.

---

## 1. API Key Verification

### Current Configuration

**Resend MCP Server:**
- **API Key**: `re_4ngyBKcH_LAyyNXLykaVsnnhf3Eu2bQbn`
- **Source**: Hardcoded in MCP config (`C:\Users\rayma\.cursor\mcp.json`)
- **Location**: CLI argument `--key=re_4ngyBKcH_LAyyNXLykaVsnnhf3Eu2bQbn`

**Application Email System:**
- **API Key**: `RESEND_API_KEY` (from Supabase secrets)
- **Documented Key**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ` (in `RESEND_SETUP.md`)
- **Source**: Supabase Edge Function secrets

### ⚠️ Issue Found: API Key Mismatch

**Status**: 🔴 **CRITICAL** - Different API keys configured

- **MCP Key**: `re_4ngyBKcH_LAyyNXLykaVsnnhf3Eu2bQbn`
- **App Key**: `re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ` (documented)

**Impact**: 
- Both systems may be using different Resend accounts
- Email tracking and analytics will be split across accounts
- Billing may be split if using different accounts

**Recommendation**: 
1. Verify which API key is actually set in Supabase secrets
2. Update MCP config to use the same key as Supabase
3. Document the correct key in both places

---

## 2. Sender Email Configuration

### Current Configuration

**Resend MCP Server:**
- **Default Sender**: ❌ **NOT CONFIGURED**
- **Source**: No `--sender` CLI arg or `SENDER_EMAIL_ADDRESS` env var
- **Behavior**: Will prompt user for sender email each time
- **Config Location**: `C:\Users\rayma\.cursor\mcp.json`

**Application Email System:**
- **Default Sender**: `Theramate <onboarding@resend.dev>`
- **Fallback**: Uses `RESEND_FROM_EMAIL` Supabase secret if set
- **Documented Default**: `Peer Care Connect <onboarding@resend.dev>` (in some docs)
- **Production Option**: `Peer Care Connect <noreply@theramate.co.uk>` (if secret set)
- **Code Location**: `supabase/functions/send-email/index.ts` line 237

### ⚠️ Issues Found

1. **No Default Sender in MCP**: MCP will prompt for sender each time, causing friction
2. **Inconsistent Display Names**: 
   - App uses: `Theramate` (in code)
   - Docs mention: `Peer Care Connect` (in documentation)
3. **Production Sender**: App can use `noreply@theramate.co.uk` if secret is set, but MCP doesn't have this configured

**Recommendation**:
1. Add default sender to MCP config: `--sender="Theramate <onboarding@resend.dev>"`
2. Align display name: Update app code to use `Peer Care Connect` consistently, or update docs to match `Theramate`
3. For production: Add `--sender="Peer Care Connect <noreply@theramate.co.uk>"` to MCP config once domain is verified

---

## 3. API Implementation Comparison

### Resend MCP Server (`mcp-send-email/index.ts`)

**Implementation**: Resend SDK (`resend` npm package)
```typescript
import { Resend } from 'resend';
const resend = new Resend(apiKey);
const response = await resend.emails.send({
  from: fromEmail,
  to: recipientEmail,
  subject: subject,
  text: text,
  html: html,
});
```

**Features**:
- ✅ TypeScript type safety
- ✅ Official SDK with built-in error handling
- ✅ Automatic API versioning
- ✅ Structured error objects
- ✅ Supports: `to`, `from`, `subject`, `text`, `html`, `cc`, `bcc`, `replyTo`, `scheduledAt`

**Error Handling**:
- Checks `response.error` property
- Throws error with JSON stringified error details
- Returns email ID from `response.data?.id`

### Application Email System (`supabase/functions/send-email/index.ts`)

**Implementation**: Raw `fetch()` API calls
```typescript
const resendResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: fromEmail,
    to: [recipientEmail],
    subject: template.subject,
    html: template.html,
  }),
});
```

**Features**:
- ⚠️ Manual API calls (no SDK)
- ⚠️ Manual error parsing
- ✅ 30-second timeout handling
- ✅ Rate limit detection (429 status)
- ✅ Retry logic mentioned in docs but not implemented in current code
- ✅ Email logging to database

**Error Handling**:
- Checks `resendResponse.ok`
- Parses JSON response manually
- Handles 429 (rate limit) specifically
- Logs errors to `email_logs` table
- Extracts error message from `resendData.message || resendData.error`

### Comparison Summary

| Feature | MCP (SDK) | App (Fetch) | Winner |
|---------|-----------|-------------|--------|
| Type Safety | ✅ Yes | ❌ No | MCP |
| Error Handling | ✅ Structured | ⚠️ Manual | MCP |
| Retry Logic | ⚠️ Not implemented | ⚠️ Not implemented | Tie |
| Timeout Handling | ⚠️ Not implemented | ✅ 30s timeout | App |
| Email Logging | ❌ No | ✅ Yes | App |
| API Versioning | ✅ Automatic | ⚠️ Manual | MCP |
| Code Complexity | ✅ Simple | ⚠️ More verbose | MCP |

**Recommendation**: 
- **Short-term**: Keep both implementations as-is (they work)
- **Long-term**: Migrate app to use Resend SDK for consistency, better error handling, and type safety
- **Hybrid**: Use SDK but keep email logging functionality

---

## 4. User Type Handling

### Resend MCP Server

**User Type Awareness**: ❌ **NONE**
- Generic email sending tool
- No templates for different user types
- No awareness of clients vs practitioners vs guests
- Manual email composition required

**Use Cases**:
- Ad-hoc/admin emails
- One-off notifications
- Manual email sending from Cursor Agent mode
- Testing email delivery

### Application Email System

**User Type Awareness**: ✅ **FULL SUPPORT**

**Supported Email Types** (13+ types):

**Client Emails:**
- `booking_confirmation_client` - Booking confirmed
- `payment_confirmation_client` - Payment received
- `session_reminder_24h` - 24-hour reminder
- `session_reminder_1h` - 1-hour reminder
- `cancellation` - Session cancelled
- `rescheduling` - Session rescheduled
- `peer_booking_confirmed_client` - Peer treatment booked
- `peer_credits_deducted` - Credits deducted
- `peer_booking_cancelled_refunded` - Peer booking cancelled

**Practitioner Emails:**
- `booking_confirmation_practitioner` - New booking received
- `payment_received_practitioner` - Payment received
- `session_reminder_24h` - 24-hour reminder
- `session_reminder_1h` - 1-hour reminder
- `cancellation` - Session cancelled
- `rescheduling` - Session rescheduled
- `peer_booking_confirmed_practitioner` - Peer treatment booking
- `peer_credits_earned` - Credits earned
- `peer_booking_cancelled_refunded` - Peer booking cancelled

**Guest User Support**: ✅ **YES**
- Uses `client_email` field for guest bookings
- No authentication required
- Email links include email parameter for guest access

**Template System**: ✅ **YES**
- HTML templates for each email type
- Dynamic data injection
- Consistent branding
- Responsive design

### Comparison Summary

| Feature | MCP | App | Winner |
|---------|-----|-----|--------|
| User Type Awareness | ❌ No | ✅ Yes | App |
| Templates | ❌ No | ✅ 13+ templates | App |
| Guest Support | ❌ N/A | ✅ Yes | App |
| Branding | ❌ Manual | ✅ Consistent | App |
| Transactional Emails | ❌ Not suitable | ✅ Perfect | App |

**Recommendation**: 
- **MCP**: Use for ad-hoc/admin emails only
- **App System**: Use for all transactional emails (bookings, payments, reminders)
- **Clear Separation**: Document when to use each system

---

## 5. Alignment Recommendations

### Priority 1: Critical Issues

1. **✅ Verify API Key Consistency**
   - Check actual Supabase secret value
   - Update MCP config to match Supabase key
   - Document correct key in both places

2. **✅ Add Default Sender to MCP**
   - Update MCP config: `--sender="Theramate <onboarding@resend.dev>"`
   - Align with app default sender
   - For production: `--sender="Peer Care Connect <noreply@theramate.co.uk>"`

3. **✅ Fix Display Name Inconsistency**
   - Decide on: `Theramate` vs `Peer Care Connect`
   - Update code and docs to match
   - Current code uses `Theramate`, docs mention `Peer Care Connect`

### Priority 2: Improvements

4. **Consider Migrating App to SDK**
   - Benefits: Type safety, better errors, consistency
   - Keep email logging functionality
   - Add retry logic with SDK

5. **Document Usage Guidelines**
   - When to use MCP (ad-hoc/admin)
   - When to use app system (transactional)
   - User type handling for each

### Priority 3: Future Enhancements

6. **Add Retry Logic to Both**
   - MCP: Implement exponential backoff
   - App: Already documented but not implemented

7. **Unify Error Handling**
   - Standardize error formats
   - Consistent logging

---

## 6. Configuration Updates Needed

### MCP Config Update (`C:\Users\rayma\.cursor\mcp.json`)

**Current:**
```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node",
      "args": [
        "C:\\Users\\rayma\\Desktop\\New folder\\mcp-send-email\\build\\index.js",
        "--key=re_4ngyBKcH_LAyyNXLykaVsnnhf3Eu2bQbn"
      ]
    }
  }
}
```

**Recommended:**
```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node",
      "args": [
        "C:\\Users\\rayma\\Desktop\\New folder\\mcp-send-email\\build\\index.js",
        "--key=re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ",
        "--sender=Theramate <onboarding@resend.dev>"
      ]
    }
  }
}
```

**For Production (after domain verification):**
```json
{
  "mcpServers": {
    "resend": {
      "type": "command",
      "command": "node",
      "args": [
        "C:\\Users\\rayma\\Desktop\\New folder\\mcp-send-email\\build\\index.js",
        "--key=re_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ",
        "--sender=Peer Care Connect <noreply@theramate.co.uk>"
      ]
    }
  }
}
```

---

## 7. Usage Guidelines

### When to Use Resend MCP Server

✅ **Use MCP for:**
- Ad-hoc/admin emails
- One-off notifications
- Manual email sending from Cursor
- Testing email delivery
- Non-transactional communications

❌ **Don't use MCP for:**
- Booking confirmations
- Payment receipts
- Session reminders
- Cancellation notifications
- Any transactional emails

### When to Use Application Email System

✅ **Use App System for:**
- All transactional emails
- Booking confirmations (client & practitioner)
- Payment confirmations
- Session reminders
- Cancellation/rescheduling notifications
- Peer treatment emails
- Any email with templates

❌ **Don't use App System for:**
- Ad-hoc/admin emails
- Manual one-off emails
- Testing (unless testing templates)

---

## 8. Verification Checklist

- [ ] Verify Supabase `RESEND_API_KEY` secret matches documented key
- [ ] Update MCP config with correct API key
- [ ] Add default sender to MCP config
- [ ] Align display name (`Theramate` vs `Peer Care Connect`)
- [ ] Test MCP email sending with new config
- [ ] Test app email system still works
- [ ] Document final configuration
- [ ] Update team on usage guidelines

---

## 9. Summary

### Current State
- ⚠️ API keys may differ (needs verification)
- ⚠️ MCP has no default sender
- ⚠️ Display name inconsistency
- ✅ Both systems functional
- ✅ App system has comprehensive template support

### Recommended Actions
1. Verify and align API keys
2. Add default sender to MCP
3. Fix display name consistency
4. Document usage guidelines
5. Consider SDK migration for app (future)

### Expected Outcome
- Consistent API key usage
- Aligned sender email configuration
- Clear separation of use cases
- Better developer experience
- Consistent branding

---

**Next Steps**: Implement configuration updates and verify alignment.

