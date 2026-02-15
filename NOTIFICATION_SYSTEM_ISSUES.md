# Notification System Issues Analysis

## Critical Schema Mismatches Found

### 1. **Database Schema vs Component Expectations**

**Database Schema (20250204_notifications_v1.sql):**
- `recipient_id` UUID (not `user_id`)
- `read_at` TIMESTAMPTZ (nullable, not boolean `read`)
- `body` TEXT (not `message`)
- No `updated_at` column

**Components Expect:**
- `user_id` 
- `read` (boolean)
- `message`
- `updated_at`

### 2. **Affected Components**

1. **`useRealtimeNotifications` hook** (use-realtime.tsx:208-295)
   - ❌ Queries with `.eq('user_id', userId)` - should be `recipient_id`
   - ❌ Queries with `.eq('read', false)` - should be `.is('read_at', null)`
   - ❌ Updates with `{ read: true }` - should use `mark_notifications_read` RPC or update `read_at`

2. **`NotificationBell` component** (NotificationBell.tsx:17-138)
   - ❌ Uses `useRealtimeNotifications` which has wrong schema
   - ❌ Expects `notification.read` boolean
   - ❌ Expects `notification.message` 
   - ❌ Expects `notification.type` to work correctly

3. **`RealTimeNotifications` component** (RealTimeNotifications.tsx:39-336)
   - ❌ Queries with `.eq('user_id', user.id)` - should be `recipient_id`
   - ❌ Queries with `.eq('read', false)` - should be `.is('read_at', null)`
   - ❌ Updates with `{ read: true }` - should update `read_at`
   - ❌ Real-time filter uses `user_id=eq.${user?.id}` - should be `recipient_id`

4. **Direct Inserts** (BookingFlow.tsx:503-516)
   - ❌ Tries to insert directly into `notifications` table
   - ❌ Uses wrong schema (`user_id`, `message`, `read`)
   - ❌ **WILL FAIL** due to RLS - only RPC `create_notification` can insert

### 3. **RPC Function Available**

**`create_notification` RPC exists and should be used:**
```sql
create_notification(
  p_recipient_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_source_type TEXT DEFAULT NULL,
  p_source_id TEXT DEFAULT NULL
) RETURNS UUID
```

**Also:**
- `mark_notifications_read(UUID[])` - for marking notifications as read

## Impact Assessment

### 🔴 **CRITICAL - Notifications NOT Working:**
1. **Cannot create notifications** - Direct inserts will fail (RLS blocks them)
2. **Cannot fetch notifications** - Queries use wrong column names
3. **Cannot mark as read** - Updates use wrong schema
4. **Real-time subscriptions broken** - Filters use wrong column names

### Status: **NOT FUNCTIONAL** ❌

## Required Fixes

1. **Update all queries to use correct schema:**
   - `user_id` → `recipient_id`
   - `read` → `read_at IS NULL` (for unread check)
   - `message` → `body`

2. **Use RPC function for creating notifications:**
   - Replace direct inserts with `create_notification()` RPC calls

3. **Update mark-as-read logic:**
   - Use `mark_notifications_read()` RPC or update `read_at` timestamp

4. **Fix real-time subscriptions:**
   - Update filters to use `recipient_id` instead of `user_id`

