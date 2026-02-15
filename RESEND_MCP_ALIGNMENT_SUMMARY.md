# Resend MCP Alignment - Quick Reference

## ✅ Verification Complete

### User Type Handling Verification

**Application Email System** - ✅ **FULLY SUPPORTS ALL USER TYPES**

1. **Clients** ✅
   - Uses `client.email` from users table for authenticated users
   - Uses `client_email` field for guest bookings
   - All client email types supported (booking, payment, reminders, etc.)

2. **Practitioners** ✅
   - Uses `practitioner.email` from users table
   - All practitioner email types supported (booking notifications, payment receipts, etc.)

3. **Guests** ✅
   - Uses `client_email` field directly (no user account required)
   - Email links include email parameter for guest access
   - Supports: booking confirmations, payment confirmations, cancellations, rescheduling

**Resend MCP Server** - ⚠️ **NO USER TYPE AWARENESS**
- Generic tool only
- Manual email composition required
- No templates or user-specific handling

---

## 📋 Action Items

### Immediate Actions Required

1. **Verify API Key** 🔴
   - Check Supabase secret: `RESEND_API_KEY`
   - Update MCP config if different from Supabase
   - Document correct key

2. **Add Default Sender to MCP** 🟡
   - Update MCP config: `--sender="Theramate <onboarding@resend.dev>"`
   - Aligns with app default

3. **Fix Display Name Consistency** 🟡
   - Decide: `Theramate` vs `Peer Care Connect`
   - Update code/docs to match

### Recommended Actions

4. **Document Usage Guidelines** ✅
   - See `RESEND_MCP_ALIGNMENT_AUDIT.md` section 7
   - MCP for ad-hoc/admin emails
   - App system for all transactional emails

5. **Consider SDK Migration** (Future)
   - Migrate app to Resend SDK for consistency
   - Keep email logging functionality

---

## 🎯 Usage Guidelines

### Use Resend MCP When:
- ✅ Sending ad-hoc/admin emails
- ✅ One-off notifications
- ✅ Manual email sending from Cursor
- ✅ Testing email delivery
- ✅ Non-transactional communications

### Use App Email System When:
- ✅ Booking confirmations
- ✅ Payment receipts
- ✅ Session reminders
- ✅ Cancellation/rescheduling notifications
- ✅ Peer treatment emails
- ✅ Any transactional email with templates
- ✅ Emails to clients, practitioners, or guests

---

## 📊 Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| API Key Alignment | ⚠️ Needs Verification | Different keys documented |
| Sender Email | ⚠️ MCP Missing Default | App has default |
| Display Name | ⚠️ Inconsistent | Code vs docs mismatch |
| User Type Handling | ✅ App Fully Supports | MCP has none |
| API Implementation | ✅ Both Work | SDK vs fetch |
| Email Templates | ✅ App Has 13+ | MCP has none |

---

## 📄 Full Audit Report

See `RESEND_MCP_ALIGNMENT_AUDIT.md` for complete details.

