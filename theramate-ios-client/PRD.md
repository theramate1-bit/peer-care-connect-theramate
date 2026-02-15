# Theramate iOS Client App - Product Requirements Document

## Executive Summary

**Product Name:** Theramate Client  
**Platform:** iOS (React Native / Expo)  
**Target Users:** Healthcare clients seeking therapy services  
**Version:** 1.0 MVP  
**Last Updated:** January 2026

### Vision Statement
A beautiful, intuitive iOS app enabling clients to discover, book, and manage therapy sessions with verified healthcare practitioners. Built to seamlessly integrate with the existing Theramate web platform and backend infrastructure.

---

## 1. Design System & Visual Identity

### 1.1 Color Palette - Soft Cream Theme

```scss
// Primary Palette - Warm & Inviting
$cream-50: #FFFDF8;      // Background
$cream-100: #FFF9EB;     // Card backgrounds
$cream-200: #FFF3D6;     // Subtle highlights
$cream-300: #FFE9B8;     // Borders
$cream-400: #FFD98C;     // Interactive states

// Accent Colors
$sage-500: #7A9E7E;      // Primary action (booking)
$sage-600: #5C7F61;      // Pressed states
$terracotta-500: #C9826D; // Secondary accent
$terracotta-600: #A66B59; // Pressed states

// Semantic Colors
$success: #6B9B6B;       // Confirmed sessions
$warning: #E8A952;       // Pending states
$error: #C75D5D;         // Cancellations
$info: #6B8FAD;          // Information

// Neutrals
$charcoal-900: #2D2A26;  // Primary text
$charcoal-700: #4A4641;  // Secondary text
$charcoal-500: #6B6660;  // Tertiary text
$charcoal-300: #A09A94;  // Placeholders
$charcoal-100: #E8E4DF;  // Dividers
```

### 1.2 Typography

```scss
// Font Family: Outfit (modern, friendly, geometric)
$font-display: 'Outfit', sans-serif;
$font-body: 'Outfit', sans-serif;

// Scale
$text-xs: 12px;
$text-sm: 14px;
$text-base: 16px;
$text-lg: 18px;
$text-xl: 20px;
$text-2xl: 24px;
$text-3xl: 32px;
$text-4xl: 40px;

// Weights
$font-regular: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### 1.3 Spacing & Layout

```scss
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;
$space-12: 48px;

$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 24px;
$radius-full: 9999px;
```

### 1.4 UI Component Inspiration

Drawing from:
- **KokonutUI** - Card layouts, file upload patterns
- **Magic UI** - Animated backgrounds, gradient effects
- **Aceternity UI** - Smooth transitions, hover states
- **Motion Primitives** - Micro-interactions, gesture feedback

---

## 2. Database Schema

### 2.1 Core Tables (Existing - Read Access)

```sql
-- Users table (shared auth system)
users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  avatar_preferences JSONB,
  user_role user_role ENUM,         -- 'client' | 'practitioner' | 'admin'
  onboarding_status onboarding_status ENUM,
  profile_completed BOOLEAN,
  is_active BOOLEAN,
  is_verified BOOLEAN,
  treatment_exchange_opt_in BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Client Sessions (Bookings)
client_sessions (
  id UUID PRIMARY KEY,
  therapist_id UUID REFERENCES users(id),
  client_id UUID REFERENCES users(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT,
  price DECIMAL,
  currency TEXT DEFAULT 'GBP',
  status session_status ENUM,       -- 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  payment_status TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Therapist Profiles
therapist_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  specializations therapist_specialization[],
  hourly_rate DECIMAL,
  bio TEXT,
  professional_statement TEXT,
  treatment_philosophy TEXT,
  experience_years INTEGER,
  average_rating DECIMAL,
  total_reviews INTEGER,
  is_active BOOLEAN,
  verification_status verification_status ENUM,
  profile_photo_url TEXT,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  service_radius_km INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Practitioner Products (Services)
practitioner_products (
  id UUID PRIMARY KEY,
  practitioner_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  price_pence INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  category TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Reviews
reviews (
  id UUID PRIMARY KEY,
  therapist_id UUID REFERENCES users(id),
  client_id UUID,
  session_id UUID REFERENCES client_sessions(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)

-- Conversations (Messaging)
conversations (
  id UUID PRIMARY KEY,
  participant_1_id UUID REFERENCES users(id),
  participant_2_id UUID REFERENCES users(id),
  last_message_at TIMESTAMPTZ,
  unread_count_1 INTEGER DEFAULT 0,
  unread_count_2 INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Messages
messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- Progress Goals
progress_goals (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES users(id),
  practitioner_id UUID REFERENCES users(id),
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_value DECIMAL,
  target_unit TEXT,
  target_date DATE,
  status TEXT,                      -- 'active' | 'completed' | 'paused'
  progress_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Progress Metrics
progress_metrics (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES users(id),
  practitioner_id UUID REFERENCES users(id),
  session_id UUID REFERENCES client_sessions(id),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_unit TEXT NOT NULL,
  session_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Favorites
favorites (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES users(id),
  therapist_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ,
  UNIQUE(client_id, therapist_id)
)

-- Availability Slots
availability_slots (
  id UUID PRIMARY KEY,
  therapist_id UUID REFERENCES users(id),
  day_of_week INTEGER,              -- 0-6 (Sunday-Saturday)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Slot Holds (Temporary booking reservations)
slot_holds (
  id UUID PRIMARY KEY,
  therapist_id UUID REFERENCES users(id),
  client_id UUID,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ
)

-- Payment Intents
payment_intents (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES client_sessions(id),
  client_id UUID REFERENCES users(id),
  practitioner_id UUID REFERENCES users(id),
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'gbp',
  status TEXT,
  client_secret TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Notifications
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- Client Profiles (Practitioner's view of their clients)
client_profiles (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES users(id),
  practitioner_id UUID REFERENCES users(id),
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  total_spent_pence INTEGER DEFAULT 0,
  last_session_date TIMESTAMPTZ,
  next_session_date TIMESTAMPTZ,
  first_session_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(client_id, practitioner_id)
)
```

### 2.2 Views (Existing)

```sql
-- Marketplace Practitioners View
CREATE VIEW marketplace_practitioners AS
SELECT 
  tp.id,
  tp.user_id,
  u.first_name,
  u.last_name,
  tp.bio,
  tp.specializations,
  tp.hourly_rate,
  tp.average_rating,
  tp.total_reviews,
  tp.verification_status,
  tp.profile_photo_url,
  tp.location,
  tp.latitude,
  tp.longitude,
  tp.experience_years,
  tp.professional_statement,
  tp.treatment_philosophy,
  tp.is_active,
  tp.response_time_hours,
  u.is_active as user_is_active
FROM therapist_profiles tp
JOIN users u ON tp.user_id = u.id
WHERE tp.is_active = true AND u.is_active = true;
```

### 2.3 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│     users       │       │  therapist_profiles │
│─────────────────│       │─────────────────────│
│ id (PK)         │←──────│ user_id (FK)        │
│ email           │       │ specializations     │
│ first_name      │       │ average_rating      │
│ user_role       │       │ verification_status │
└────────┬────────┘       └─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│   client_sessions   │
│─────────────────────│
│ id (PK)             │
│ therapist_id (FK)───┼───→ users.id
│ client_id (FK)──────┼───→ users.id
│ session_date        │
│ status              │
│ payment_status      │
└─────────┬───────────┘
          │
          │ 1:1
          ▼
┌─────────────────────┐      ┌─────────────────────┐
│      reviews        │      │   treatment_notes   │
│─────────────────────│      │─────────────────────│
│ session_id (FK)     │      │ session_id (FK)     │
│ rating              │      │ note_type           │
│ comment             │      │ content             │
└─────────────────────┘      └─────────────────────┘

┌─────────────────────┐      ┌─────────────────────┐
│   conversations     │      │     messages        │
│─────────────────────│      │─────────────────────│
│ participant_1_id    │←─────│ conversation_id     │
│ participant_2_id    │      │ sender_id           │
│ last_message_at     │      │ content             │
└─────────────────────┘      └─────────────────────┘

┌─────────────────────┐      ┌─────────────────────┐
│   progress_goals    │      │  progress_metrics   │
│─────────────────────│      │─────────────────────│
│ client_id (FK)      │      │ client_id (FK)      │
│ practitioner_id     │      │ session_id (FK)     │
│ goal_title          │      │ metric_name         │
│ status              │      │ metric_value        │
└─────────────────────┘      └─────────────────────┘
```

---

## 3. API Endpoint Structure

### 3.1 Authentication Endpoints (Supabase Auth)

```typescript
// Auth - Supabase handles these
POST   /auth/v1/signup                    // Register new user
POST   /auth/v1/token?grant_type=password // Login
POST   /auth/v1/token?grant_type=refresh  // Refresh token
POST   /auth/v1/logout                    // Logout
POST   /auth/v1/recover                   // Password reset request
PUT    /auth/v1/user                      // Update password
GET    /auth/v1/user                      // Get current user
POST   /auth/v1/otp                       // Magic link / OTP

// OAuth Providers
GET    /auth/v1/authorize?provider=google
GET    /auth/v1/authorize?provider=apple
GET    /auth/v1/callback                  // OAuth callback
```

### 3.2 REST Endpoints (Supabase PostgREST)

```typescript
// User Profile
GET    /rest/v1/users?id=eq.{userId}
PATCH  /rest/v1/users?id=eq.{userId}

// Marketplace / Therapist Discovery
GET    /rest/v1/marketplace_practitioners
GET    /rest/v1/marketplace_practitioners?location=ilike.*london*
GET    /rest/v1/marketplace_practitioners?specializations=cs.{sports_therapy}

// Therapist Profiles
GET    /rest/v1/therapist_profiles?user_id=eq.{userId}

// Practitioner Products (Services)
GET    /rest/v1/practitioner_products?practitioner_id=eq.{practitionerId}&is_active=eq.true

// Availability
GET    /rest/v1/availability_slots?therapist_id=eq.{therapistId}&is_available=eq.true

// Sessions (Bookings)
GET    /rest/v1/client_sessions?client_id=eq.{userId}&order=session_date.desc
GET    /rest/v1/client_sessions?id=eq.{sessionId}
POST   /rest/v1/client_sessions
PATCH  /rest/v1/client_sessions?id=eq.{sessionId}

// Reviews
GET    /rest/v1/reviews?therapist_id=eq.{therapistId}&is_public=eq.true
POST   /rest/v1/reviews

// Favorites
GET    /rest/v1/favorites?client_id=eq.{userId}
POST   /rest/v1/favorites
DELETE /rest/v1/favorites?id=eq.{favoriteId}

// Conversations
GET    /rest/v1/conversations?or=(participant_1_id.eq.{userId},participant_2_id.eq.{userId})
POST   /rest/v1/conversations

// Messages
GET    /rest/v1/messages?conversation_id=eq.{conversationId}&order=created_at.asc
POST   /rest/v1/messages

// Progress
GET    /rest/v1/progress_goals?client_id=eq.{userId}
GET    /rest/v1/progress_metrics?client_id=eq.{userId}&order=session_date.desc

// Notifications
GET    /rest/v1/notifications?user_id=eq.{userId}&order=created_at.desc
PATCH  /rest/v1/notifications?id=eq.{notificationId}
```

### 3.3 RPC Functions (Server-side logic)

```typescript
// Existing RPC Functions
POST /rest/v1/rpc/find_practitioners_by_distance
     Body: { lat: number, lng: number, radius_km: number }

POST /rest/v1/rpc/get_next_available_slot
     Body: { practitioner_id: string, duration_minutes: number }

POST /rest/v1/rpc/create_booking_with_validation
     Body: { 
       therapist_id: string,
       client_id: string,
       session_date: string,
       start_time: string,
       duration_minutes: number,
       product_id: string
     }

POST /rest/v1/rpc/create_slot_hold
     Body: {
       therapist_id: string,
       session_date: string,
       start_time: string,
       duration_minutes: number,
       hold_minutes: number
     }

POST /rest/v1/rpc/release_slot_hold
     Body: { hold_id: string }
```

### 3.4 Edge Functions (Serverless)

```typescript
// Payment Processing
POST /functions/v1/create-session-payment
     Body: { 
       session_id: string,
       amount: number,
       currency: string
     }
     Response: { client_secret: string, payment_intent_id: string }

POST /functions/v1/stripe-refund
     Body: { session_id: string, reason: string }

// Notifications
POST /functions/v1/send-email
     Body: {
       to: string,
       template: string,
       data: object
     }

POST /functions/v1/session-reminders
     // Triggered by cron - sends upcoming session reminders

// Stripe Webhook
POST /functions/v1/stripe-webhook
     // Handles payment events from Stripe
```

### 3.5 Realtime Subscriptions (WebSocket)

```typescript
// Subscribe to messages in a conversation
supabase.channel('messages:{conversationId}')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)

// Subscribe to session updates
supabase.channel('sessions:{userId}')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'client_sessions',
    filter: `client_id=eq.${userId}`
  }, handleSessionUpdate)

// Subscribe to notifications
supabase.channel('notifications:{userId}')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)

// Subscribe to availability changes (for live booking UI)
supabase.channel('availability:{therapistId}')
  .on('broadcast', { event: 'slot_changed' }, handleSlotChange)
```

---

## 4. Authentication Flow

### 4.1 Authentication Methods

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────────┐   │
│  │  Email   │     │    Google    │     │      Apple       │   │
│  │ Password │     │    OAuth     │     │    Sign-In       │   │
│  └────┬─────┘     └──────┬───────┘     └────────┬─────────┘   │
│       │                  │                      │              │
│       └──────────────────┴──────────────────────┘              │
│                          │                                      │
│                          ▼                                      │
│              ┌───────────────────────┐                         │
│              │    Supabase Auth      │                         │
│              │   (/auth/v1/...)      │                         │
│              └───────────┬───────────┘                         │
│                          │                                      │
│                          ▼                                      │
│              ┌───────────────────────┐                         │
│              │  JWT Token Issued     │                         │
│              │  (access + refresh)   │                         │
│              └───────────┬───────────┘                         │
│                          │                                      │
│          ┌───────────────┴───────────────┐                     │
│          │                               │                     │
│          ▼                               ▼                     │
│  ┌───────────────┐              ┌────────────────┐            │
│  │ New User?     │              │ Existing User  │            │
│  │ Onboarding    │              │ Dashboard      │            │
│  └───────────────┘              └────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Token Management

```typescript
// Token storage (React Native)
import * as SecureStore from 'expo-secure-store';

// Store tokens securely
await SecureStore.setItemAsync('supabase_access_token', session.access_token);
await SecureStore.setItemAsync('supabase_refresh_token', session.refresh_token);

// Auto-refresh on app launch
const refreshSession = async () => {
  const refreshToken = await SecureStore.getItemAsync('supabase_refresh_token');
  if (refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({ 
      refresh_token: refreshToken 
    });
    if (data.session) {
      // Store new tokens
    }
  }
};
```

### 4.3 Role-Based Access

```typescript
// User roles (from users table)
type UserRole = 'client' | 'practitioner' | 'admin';

// Client app only needs 'client' role
const isClient = userProfile?.user_role === 'client';

// Route protection
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (user.user_role !== 'client') return <Navigate to="/unauthorized" />;
  
  return children;
};
```

### 4.4 Onboarding Flow (Client)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT ONBOARDING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Basic Info                                             │
│  ┌─────────────────────────────────────┐                       │
│  │ First Name: [_______________]       │                       │
│  │ Last Name:  [_______________]       │                       │
│  │ Phone:      [_______________]       │                       │
│  └─────────────────────────────────────┘                       │
│                    ▼                                            │
│  Step 2: Location                                               │
│  ┌─────────────────────────────────────┐                       │
│  │ Postcode:   [_______________]       │                       │
│  │ City:       [_______________]       │                       │
│  │ [📍 Use My Location]                │                       │
│  └─────────────────────────────────────┘                       │
│                    ▼                                            │
│  Step 3: Preferences                                            │
│  ┌─────────────────────────────────────┐                       │
│  │ What type of therapy?               │                       │
│  │ ☑ Sports Therapy                    │                       │
│  │ ☐ Massage Therapy                   │                       │
│  │ ☐ Osteopathy                        │                       │
│  └─────────────────────────────────────┘                       │
│                    ▼                                            │
│  Step 4: Terms & Privacy                                        │
│  ┌─────────────────────────────────────┐                       │
│  │ ☑ I accept Terms of Service         │                       │
│  │ ☑ I accept Privacy Policy           │                       │
│  │ ☐ Marketing communications (opt)    │                       │
│  └─────────────────────────────────────┘                       │
│                    ▼                                            │
│              ┌──────────────┐                                   │
│              │  Dashboard   │                                   │
│              └──────────────┘                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. File Storage Approach

### 5.1 Storage Buckets (Supabase Storage)

```typescript
// Existing Buckets
const BUCKETS = {
  avatars: 'avatars',           // User profile photos
  qualifications: 'qualifications', // Practitioner documents
  session_files: 'session-files',   // Session attachments
};

// Client-specific usage
const uploadAvatar = async (userId: string, file: File) => {
  const filePath = `${userId}/avatar.${file.type.split('/')[1]}`;
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });
  
  return data?.path;
};

// Get public URL
const getAvatarUrl = (path: string) => {
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
};
```

### 5.2 File Types & Limits

| Bucket | Allowed Types | Max Size | Access |
|--------|---------------|----------|--------|
| avatars | jpg, png, webp | 2MB | Public |
| session_files | pdf, jpg, png | 10MB | Authenticated |

### 5.3 Image Handling (React Native)

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const pickAndUploadAvatar = async () => {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return;

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Compress and resize
    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 400, height: 400 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Upload to Supabase
    const response = await fetch(manipulated.uri);
    const blob = await response.blob();
    await uploadAvatar(userId, blob);
  }
};
```

---

## 6. Background Job Requirements

### 6.1 Existing Background Jobs (Server-side)

```typescript
// Cron Jobs (Supabase pg_cron or external)
// ─────────────────────────────────────────

// 1. Session Reminders - Every 15 minutes
// Sends reminder emails/push notifications for upcoming sessions
schedule: "*/15 * * * *"
function: session-reminders

// 2. Credit Allocations - Monthly (1st of month)
// Allocates monthly subscription credits
schedule: "0 0 1 * *"
function: process-credit-allocations

// 3. Expired Slot Holds Cleanup - Every 5 minutes
// Releases expired booking slot holds
schedule: "*/5 * * * *"
function: cleanup-expired-holds

// 4. Subscription Sync - Daily
// Syncs Stripe subscription status
schedule: "0 2 * * *"
function: sync-stripe-subscription
```

### 6.2 Client App Background Tasks (React Native)

```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

// Define background tasks
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-check';
const SESSION_REMINDER_TASK = 'session-reminder-check';

// Register background task
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    // Check for new notifications
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .limit(1);

    if (data && data.length > 0) {
      // Show local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data[0].title,
          body: data[0].message,
        },
        trigger: null, // Immediate
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register fetch task (runs every 15 minutes minimum on iOS)
await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
  minimumInterval: 15 * 60, // 15 minutes
  stopOnTerminate: false,
  startOnBoot: true,
});
```

### 6.3 Push Notification Handling

```typescript
// Push notification setup
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const registerForPushNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  // Save token to user profile
  await supabase
    .from('users')
    .update({ push_token: token.data })
    .eq('id', userId);

  return token.data;
};
```

---

## 7. Third-Party Integrations

### 7.1 Payment Processing - Stripe

```typescript
// Integration Points
// ──────────────────

// 1. Stripe Connect (Practitioners receive payments)
// Already configured in existing backend

// 2. Payment Sheet (Client pays for sessions)
import { initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';

// Initialize Stripe
await initStripe({
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  merchantIdentifier: 'merchant.com.theramate',
  urlScheme: 'theramate',
});

// Create payment intent via Edge Function
const { clientSecret } = await fetch('/functions/v1/create-session-payment', {
  method: 'POST',
  body: JSON.stringify({ session_id: sessionId }),
}).then(r => r.json());

// Present payment sheet
const { error } = await presentPaymentSheet({ clientSecret });
```

### 7.2 Maps & Location - OpenStreetMap/Nominatim

```typescript
// Geocoding (Address → Coordinates)
const geocodeAddress = async (address: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    { headers: { 'User-Agent': 'Theramate/1.0' } }
  );
  const data = await response.json();
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
};

// React Native Maps
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 51.5074,
    longitude: -0.1278,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  }}
>
  {practitioners.map(p => (
    <Marker
      key={p.id}
      coordinate={{ latitude: p.latitude, longitude: p.longitude }}
      title={`${p.first_name} ${p.last_name}`}
    />
  ))}
</MapView>
```

### 7.3 Analytics - PostHog / Mixpanel

```typescript
import PostHog from 'posthog-react-native';

// Initialize
const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: 'https://app.posthog.com',
});

// Track events
posthog.capture('session_booked', {
  therapist_id: therapistId,
  session_type: sessionType,
  price: price,
});

// Identify user
posthog.identify(userId, {
  email: user.email,
  role: 'client',
});
```

### 7.4 Error Tracking - Sentry

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.2,
});

// Capture errors
try {
  await bookSession();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### 7.5 Live Chat - Crisp (Existing)

```typescript
// Existing web integration, for mobile use WebView or native SDK
import { CrispChat } from 'react-native-crisp-chat';

// Initialize
CrispChat.configure('CRISP_WEBSITE_ID');
CrispChat.setUser({
  email: user.email,
  nickname: `${user.first_name} ${user.last_name}`,
});

// Show chat
CrispChat.show();
```

### 7.6 Calendar Integration

```typescript
import * as Calendar from 'expo-calendar';

const addToCalendar = async (session) => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];

  await Calendar.createEventAsync(defaultCalendar.id, {
    title: `Therapy Session with ${session.therapist_name}`,
    startDate: new Date(`${session.session_date}T${session.start_time}`),
    endDate: new Date(`${session.session_date}T${session.end_time}`),
    location: session.location,
    notes: session.notes,
  });
};
```

---

## 8. Tech Stack (Optimized for Solo Dev Speed)

### 8.1 Core Framework

```yaml
Framework: React Native with Expo
  - Expo SDK 52+ (managed workflow)
  - TypeScript for type safety
  - File-based routing with expo-router

Why Expo:
  - Instant setup, no native tooling required
  - Over-the-air updates (no App Store wait)
  - Built-in APIs for camera, notifications, etc.
  - EAS Build for production builds
```

### 8.2 State Management

```yaml
Client State: Zustand
  - Simple, minimal boilerplate
  - TypeScript-first
  - Persist with AsyncStorage

Server State: TanStack Query (React Query)
  - Automatic caching & invalidation
  - Optimistic updates
  - Background refetching

Why this combo:
  - Minimal code, maximum functionality
  - Zustand for UI state (auth, theme, navigation)
  - React Query for all API data
```

### 8.3 UI Components

```yaml
Base: NativeWind (Tailwind for React Native)
  - Same Tailwind classes as web
  - Consistent with existing design system

Components: 
  - Custom components with our cream theme
  - React Native Reanimated for animations
  - React Native Gesture Handler for gestures

Icons: Lucide React Native
  - Same icons as web app
  - Tree-shakeable

Why:
  - Maximum code sharing potential with web
  - Familiar Tailwind syntax
  - Smooth 60fps animations
```

### 8.4 Navigation

```yaml
Router: Expo Router v3
  - File-based routing (like Next.js)
  - Deep linking out of the box
  - Type-safe navigation

Structure:
  app/
  ├── (auth)/
  │   ├── login.tsx
  │   ├── register.tsx
  │   └── onboarding.tsx
  ├── (tabs)/
  │   ├── index.tsx          # Home/Dashboard
  │   ├── explore.tsx        # Find Therapists
  │   ├── bookings.tsx       # My Sessions
  │   ├── messages.tsx       # Conversations
  │   └── profile.tsx        # Settings
  ├── therapist/[id].tsx     # Therapist profile
  ├── booking/[id].tsx       # Booking flow
  └── _layout.tsx            # Root layout
```

### 8.5 Backend Integration

```yaml
Supabase JS: @supabase/supabase-js
  - Same client as web
  - Realtime subscriptions
  - Auth with secure storage

Payments: @stripe/stripe-react-native
  - Apple Pay / Google Pay
  - Payment Sheet UI

Why:
  - 100% compatible with existing backend
  - No new APIs needed
```

### 8.6 Development Tools

```yaml
IDE: Cursor with Expo Tools extension
Debugging: Expo DevTools + Flipper
Testing: Jest + React Native Testing Library
CI/CD: EAS Build + GitHub Actions

Scripts:
  - `npx expo start` - Development
  - `eas build --platform ios` - Production build
  - `eas submit` - App Store submission
```

### 8.7 Package.json (Key Dependencies)

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    
    "@supabase/supabase-js": "^2.45.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    
    "@stripe/stripe-react-native": "^0.37.0",
    
    "expo-secure-store": "~14.0.0",
    "expo-notifications": "~0.30.0",
    "expo-image-picker": "~16.0.0",
    "expo-location": "~18.0.0",
    "expo-calendar": "~14.0.0",
    
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-maps": "1.18.0",
    
    "lucide-react-native": "^0.400.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "~18.3.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.5.0"
  }
}
```

---

## 9. App Architecture

### 9.1 Folder Structure

```
theramate-ios-client/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth group (no tabs)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── onboarding/
│   │       ├── _layout.tsx
│   │       ├── profile.tsx
│   │       ├── location.tsx
│   │       └── preferences.tsx
│   ├── (tabs)/                   # Main app with tabs
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Dashboard
│   │   ├── explore/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Marketplace
│   │   │   └── [therapistId].tsx # Therapist profile
│   │   ├── bookings/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # My sessions
│   │   │   └── [sessionId].tsx   # Session detail
│   │   ├── messages/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Conversations
│   │   │   └── [conversationId].tsx
│   │   └── profile/
│   │       ├── _layout.tsx
│   │       ├── index.tsx         # Profile/settings
│   │       ├── favorites.tsx
│   │       ├── progress.tsx
│   │       └── help.tsx
│   ├── booking/                  # Booking flow (modal)
│   │   ├── _layout.tsx
│   │   ├── [therapistId]/
│   │   │   ├── index.tsx         # Select service
│   │   │   ├── time.tsx          # Select time
│   │   │   ├── confirm.tsx       # Review booking
│   │   │   └── payment.tsx       # Payment
│   │   └── success.tsx
│   ├── review/
│   │   └── [sessionId].tsx       # Submit review
│   └── _layout.tsx               # Root layout
│
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   ├── booking/
│   │   ├── TimeSlotPicker.tsx
│   │   ├── ServiceCard.tsx
│   │   └── BookingSummary.tsx
│   ├── therapist/
│   │   ├── TherapistCard.tsx
│   │   ├── TherapistProfile.tsx
│   │   ├── ReviewCard.tsx
│   │   └── SpecializationBadge.tsx
│   ├── session/
│   │   ├── SessionCard.tsx
│   │   ├── SessionDetail.tsx
│   │   └── UpcomingSession.tsx
│   ├── messaging/
│   │   ├── ConversationList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   ├── progress/
│   │   ├── GoalCard.tsx
│   │   ├── MetricChart.tsx
│   │   └── ProgressSummary.tsx
│   └── common/
│       ├── Header.tsx
│       ├── EmptyState.tsx
│       ├── LoadingScreen.tsx
│       └── ErrorBoundary.tsx
│
├── lib/                          # Core utilities
│   ├── supabase.ts               # Supabase client
│   ├── stripe.ts                 # Stripe setup
│   ├── auth.ts                   # Auth utilities
│   ├── api/
│   │   ├── therapists.ts
│   │   ├── sessions.ts
│   │   ├── messages.ts
│   │   └── bookings.ts
│   └── utils/
│       ├── date.ts
│       ├── currency.ts
│       └── validation.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── bookingStore.ts
│   └── settingsStore.ts
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useTherapists.ts
│   ├── useSessions.ts
│   ├── useMessages.ts
│   ├── useRealtime.ts
│   └── useLocation.ts
│
├── types/                        # TypeScript types
│   ├── database.ts               # Generated from Supabase
│   ├── navigation.ts
│   └── api.ts
│
├── constants/                    # App constants
│   ├── colors.ts                 # Design tokens
│   ├── config.ts                 # App config
│   └── specializations.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── animations/
│
├── app.json                      # Expo config
├── tailwind.config.js            # NativeWind config
├── tsconfig.json
├── babel.config.js
└── package.json
```

### 9.2 Screen Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           THERAMATE CLIENT APP                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐                                                   │
│  │   SPLASH/AUTH   │                                                   │
│  │  ─────────────  │                                                   │
│  │  • Login        │                                                   │
│  │  • Register     │                                                   │
│  │  • Forgot Pass  │                                                   │
│  └────────┬────────┘                                                   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐     New User?                                     │
│  │   ONBOARDING    │──────────────┐                                    │
│  │  ─────────────  │              │                                    │
│  │  • Profile Info │              │                                    │
│  │  • Location     │              │                                    │
│  │  • Preferences  │              │                                    │
│  │  • Terms        │              │                                    │
│  └────────┬────────┘              │                                    │
│           │                        │                                    │
│           └────────────────────────┤                                    │
│                                    ▼                                    │
│  ╔═════════════════════════════════════════════════════════════════╗   │
│  ║                        MAIN APP (Tabs)                           ║   │
│  ╠═════════════════════════════════════════════════════════════════╣   │
│  ║                                                                  ║   │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ║   │
│  ║  │   🏠    │ │   🔍    │ │   📅    │ │   💬    │ │   👤   │ ║   │
│  ║  │  Home    │ │ Explore  │ │ Sessions │ │ Messages │ │ Profile │ ║   │
│  ║  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ ║   │
│  ║       │            │            │            │            │       ║   │
│  ║       ▼            ▼            ▼            ▼            ▼       ║   │
│  ║  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ║   │
│  ║  │Dashboard│ │Therapist │ │ Session  │ │ Chat     │ │Settings │ ║   │
│  ║  │• Next   │ │  List    │ │  List    │ │  List    │ │• Edit   │ ║   │
│  ║  │  Session│ │• Map View│ │• Upcoming│ │• Realtime│ │  Profile│ ║   │
│  ║  │• Quick  │ │• Filters │ │• Past    │ │  Updates │ │• Favs   │ ║   │
│  ║  │  Actions│ │• Search  │ │• Cancel  │ │          │ │• Help   │ ║   │
│  ║  └─────────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────────┘ ║   │
│  ║                   │            │            │                     ║   │
│  ║                   ▼            ▼            ▼                     ║   │
│  ║             ┌──────────┐ ┌──────────┐ ┌──────────┐               ║   │
│  ║             │Therapist │ │ Session  │ │  Chat    │               ║   │
│  ║             │ Profile  │ │  Detail  │ │ Convo    │               ║   │
│  ║             │• Bio     │ │• Status  │ │• Send    │               ║   │
│  ║             │• Reviews │ │• Notes   │ │• Media   │               ║   │
│  ║             │• Services│ │• Review  │ │          │               ║   │
│  ║             └────┬─────┘ └──────────┘ └──────────┘               ║   │
│  ║                  │                                                ║   │
│  ╚══════════════════╪════════════════════════════════════════════════╝   │
│                     │                                                    │
│                     ▼                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    BOOKING FLOW (Modal Stack)                        ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                      ││
│  │  Select Service → Select Date/Time → Confirm Details → Payment      ││
│  │       │               │                   │               │         ││
│  │       ▼               ▼                   ▼               ▼         ││
│  │  ┌─────────┐    ┌─────────┐         ┌─────────┐    ┌─────────┐     ││
│  │  │ Service │    │Calendar │         │ Summary │    │ Stripe  │     ││
│  │  │  Cards  │    │  Slots  │         │ Review  │    │ Payment │     ││
│  │  │         │    │         │         │         │    │  Sheet  │     ││
│  │  └─────────┘    └─────────┘         └─────────┘    └────┬────┘     ││
│  │                                                          │          ││
│  │                                                          ▼          ││
│  │                                                    ┌─────────┐      ││
│  │                                                    │ Success │      ││
│  │                                                    │  + Add  │      ││
│  │                                                    │ to Cal  │      ││
│  │                                                    └─────────┘      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 10. MVP Feature Scope

### 10.1 Phase 1 - Core MVP (4-6 weeks)

| Feature | Priority | Description |
|---------|----------|-------------|
| Auth & Onboarding | P0 | Login, register, password reset, client onboarding |
| Dashboard | P0 | Next session, quick actions, recent activity |
| Therapist Discovery | P0 | List view, search, filters, map view |
| Therapist Profile | P0 | Bio, services, reviews, availability preview |
| Booking Flow | P0 | Select service → time → confirm → pay |
| My Sessions | P0 | Upcoming, past, cancel session |
| Session Detail | P0 | Status, therapist info, location, notes |
| Payments | P0 | Stripe payment sheet, Apple Pay |
| Push Notifications | P0 | Session reminders, booking confirmations |

### 10.2 Phase 2 - Communication (2-3 weeks)

| Feature | Priority | Description |
|---------|----------|-------------|
| Messaging | P1 | Conversation list, realtime chat |
| Message Notifications | P1 | Push for new messages |
| In-app Notifications | P1 | Notification center |

### 10.3 Phase 3 - Engagement (2-3 weeks)

| Feature | Priority | Description |
|---------|----------|-------------|
| Favorites | P2 | Save therapists |
| Reviews | P2 | Submit post-session reviews |
| Progress Tracking | P2 | View goals and metrics |
| Treatment Plans | P2 | View assigned plans |

### 10.4 Future Phases

| Feature | Priority | Description |
|---------|----------|-------------|
| Rebooking | P3 | Quick rebook with same therapist |
| Calendar Sync | P3 | Export to device calendar |
| Home Exercise Programs | P3 | View assigned exercises |
| Video Calls | P3 | In-app video consultations |

---

## 11. Success Metrics

### 11.1 Technical KPIs

| Metric | Target |
|--------|--------|
| App Launch Time | < 2 seconds |
| API Response Time | < 500ms (p95) |
| Crash-free Sessions | > 99.5% |
| Background Fetch Success | > 95% |
| Offline Capability | Basic caching |

### 11.2 Business KPIs

| Metric | Target |
|--------|--------|
| App Store Rating | > 4.5 stars |
| Session Booking Conversion | > 60% |
| User Retention (30-day) | > 40% |
| Push Notification Opt-in | > 70% |

---

## 12. Security Considerations

### 12.1 Data Protection

- JWT tokens stored in iOS Keychain via Expo SecureStore
- Biometric authentication option (Face ID / Touch ID)
- Certificate pinning for API calls
- No sensitive data in logs or analytics

### 12.2 Payment Security

- PCI DSS compliance via Stripe
- No card data stored on device
- Apple Pay / Google Pay preferred

### 12.3 Privacy

- GDPR/UK GDPR compliant
- Clear privacy policy in-app
- Data export/deletion via settings
- Optional analytics with consent

---

## 13. Launch Checklist

### 13.1 Pre-Launch

- [ ] App Store Connect account setup
- [ ] App icons and screenshots (all sizes)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] TestFlight beta testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Accessibility testing

### 13.2 App Store Requirements

- [ ] App description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Screenshots (6.7", 6.5", 5.5" displays)
- [ ] App preview video (optional)
- [ ] Age rating questionnaire
- [ ] Export compliance
- [ ] Privacy nutrition labels

---

## Appendix A: Color Tokens (NativeWind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF8',
          100: '#FFF9EB',
          200: '#FFF3D6',
          300: '#FFE9B8',
          400: '#FFD98C',
        },
        sage: {
          500: '#7A9E7E',
          600: '#5C7F61',
        },
        terracotta: {
          500: '#C9826D',
          600: '#A66B59',
        },
        charcoal: {
          100: '#E8E4DF',
          300: '#A09A94',
          500: '#6B6660',
          700: '#4A4641',
          900: '#2D2A26',
        },
      },
    },
  },
};
```

---

## Appendix B: API Response Examples

### Therapist List Response
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "specializations": ["sports_therapy", "rehabilitation"],
      "hourly_rate": 80.00,
      "average_rating": 4.8,
      "total_reviews": 47,
      "profile_photo_url": "https://...",
      "location": "London, UK",
      "verification_status": "verified"
    }
  ],
  "count": 25
}
```

### Session Response
```json
{
  "id": "uuid",
  "therapist_id": "uuid",
  "client_id": "uuid",
  "session_date": "2026-01-10",
  "start_time": "14:00:00",
  "duration_minutes": 60,
  "session_type": "Sports Therapy",
  "price": 80.00,
  "status": "confirmed",
  "payment_status": "paid",
  "therapist": {
    "first_name": "Sarah",
    "last_name": "Johnson",
    "profile_photo_url": "https://..."
  }
}
```

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*Author: AI Assistant*

