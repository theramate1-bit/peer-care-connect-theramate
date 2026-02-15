# Google Calendar Integration Setup Guide

## Overview

Your Google Calendar integration is now fully implemented with automatic two-way synchronization. Practitioners and clients can connect their Google Calendars, and the system will:

- **Pull events from Google Calendar** → Sync to internal bookings
- **Push internal bookings** → Create events in Google Calendar
- **Auto-refresh tokens** → Keep the connection active
- **Match existing calendars** → Automatically detect and sync with existing calendar

## ✅ What's Been Implemented

1. **Database Migration** (`supabase/migrations/20250120_calendar_sync_setup.sql`)
   - `calendar_sync_configs` table for OAuth tokens and sync settings
   - `practitioner_availability` table for working hours
   - `calendar_events` table for tracking synced events

2. **Edge Function** (`supabase/functions/google-calendar-sync/index.ts`)
   - OAuth flow handling (get auth URL, exchange code, refresh tokens)
   - Two-way calendar sync (fetch from Google, push to Google)
   - Automatic token refresh

3. **Frontend Services**
   - `GoogleCalendarService` - Client-side API wrapper
   - Updated `CalendarIntegrationService` with real API calls
   - Enhanced `CalendarSettings` page with connect/disconnect UI

## 🔑 Required Environment Variables

You need to add these to your **Supabase Edge Functions** environment variables:

1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions

2. Add these environment variables:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
APP_URL=https://your-production-domain.com (or http://localhost:3000 for dev)
```

## 📋 Google Cloud Console Setup

### Step 1: Get Your OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**

### Step 2: Configure OAuth Client

**Application type:** Web application

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
https://aikqnvltuwwgifuocvto.supabase.co/functions/v1/google-calendar-sync
http://localhost:3000/auth/google-calendar-callback
https://your-production-domain.com/auth/google-calendar-callback
```

### Step 3: Enable Google Calendar API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### Step 4: Copy Credentials

1. Copy the **Client ID** and **Client Secret**
2. Add them to Supabase Edge Functions environment variables (see above)

## 🚀 Deployment Steps

### 1. Deploy Database Migration

```bash
cd peer-care-connect
npx supabase db push
```

Or apply manually via Supabase Dashboard:
- Go to SQL Editor
- Run the migration: `supabase/migrations/20250120_calendar_sync_setup.sql`

### 2. Deploy Edge Function

```bash
cd supabase/functions
supabase functions deploy google-calendar-sync
```

Or via Supabase Dashboard:
- Go to Edge Functions
- Create new function: `google-calendar-sync`
- Upload the code from `supabase/functions/google-calendar-sync/index.ts`

### 3. Set Environment Variables

In Supabase Dashboard → Settings → Edge Functions:
- Add `GOOGLE_CLIENT_ID`
- Add `GOOGLE_CLIENT_SECRET`
- Add `APP_URL` (your production domain)

## 🧪 Testing

### Test OAuth Flow

1. Go to Calendar Settings page (`/settings/calendar`)
2. Enable calendar sync
3. Select "Google Calendar" as provider
4. Click "Connect Google Calendar"
5. Authorize the app in the popup
6. Verify connection status shows "Connected"

### Test Calendar Sync

1. Click "Sync Now" button
2. Check that:
   - Google Calendar events appear in your app
   - Internal bookings appear in Google Calendar
   - Events are properly matched/merged

### Test Token Refresh

- Tokens automatically refresh when they expire
- Check Edge Function logs to verify refresh happens

## 🔄 How It Works

### Automatic Sync Flow

1. **User connects Google Calendar** → OAuth tokens stored securely
2. **On sync trigger** (manual or scheduled):
   - Fetch events from Google Calendar (last 30 days to next 90 days)
   - Push internal bookings to Google Calendar
   - Store synced events in `calendar_events` table
   - Match events by time/description to avoid duplicates

3. **Token Management**:
   - Access tokens expire in 1 hour
   - System auto-refreshes using refresh token
   - Refresh tokens stored securely in database

### Matching Existing Calendars

The system automatically:
- Detects the user's primary Google Calendar
- Syncs all events from that calendar
- Pushes new bookings to the same calendar
- Matches events by time ranges to prevent duplicates

## 🛠️ Troubleshooting

### "Failed to connect Google Calendar"

**Check:**
- ✅ Edge Function environment variables are set
- ✅ Google OAuth credentials are correct
- ✅ Redirect URI matches exactly in Google Console
- ✅ Google Calendar API is enabled

### "Sync failed" or "Unauthorized"

**Check:**
- ✅ User has connected their calendar (tokens exist)
- ✅ Refresh token is valid
- ✅ Edge Function has proper authentication headers

### Events not syncing

**Check:**
- ✅ Calendar sync is enabled in settings
- ✅ Last sync timestamp is updating
- ✅ Check Edge Function logs for errors
- ✅ Verify Google Calendar API quotas not exceeded

## 📊 Monitoring

### View Sync Status

- Check `calendar_sync_configs.last_sync` timestamp
- View `calendar_events` table for synced events
- Check Edge Function logs in Supabase Dashboard

### Edge Function Logs

Go to: Supabase Dashboard → Edge Functions → `google-calendar-sync` → Logs

## 🔒 Security Notes

- OAuth tokens are stored encrypted in the database
- Only authenticated users can access their own calendar data
- RLS policies enforce data isolation
- Edge Function uses service role key (server-side only)

## 📝 Next Steps

1. **Deploy the migration** to create database tables
2. **Deploy the Edge Function** with environment variables
3. **Configure Google OAuth** credentials
4. **Test the connection** in Calendar Settings
5. **Set up automatic sync** (optional: create scheduled job)

## 💡 Optional: Automatic Scheduled Sync

You can create a scheduled job to auto-sync calendars:

```sql
-- Create a function to sync all enabled calendars
CREATE OR REPLACE FUNCTION sync_all_calendars()
RETURNS void AS $$
BEGIN
  -- This would call your Edge Function for each user with enabled sync
  -- Implementation depends on your cron job setup
END;
$$ LANGUAGE plpgsql;
```

Or use Supabase Cron Jobs / pg_cron extension.

