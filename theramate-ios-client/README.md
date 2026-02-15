# Theramate iOS Client

A beautiful iOS app for clients to discover, book, and manage therapy sessions with verified healthcare practitioners.

## 🎨 Design System

This app uses a **soft cream theme** inspired by:
- [KokonutUI](https://kokonutui.com)
- [Magic UI](https://magicui.design)
- [Aceternity UI](https://ui.aceternity.com)

### Color Palette

- **Primary Background:** `#FFFDF8` (Cream)
- **Primary Action:** `#7A9E7E` (Sage Green)
- **Secondary Accent:** `#C9826D` (Terracotta)
- **Text:** `#2D2A26` (Charcoal)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or physical device with Expo Go

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your Supabase and Stripe keys
```

### Development

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios
```

## 📱 Features

### Phase 1 - Core MVP
- ✅ Authentication (Email/Password, Google, Apple)
- ✅ Client onboarding flow
- ✅ Dashboard with upcoming sessions
- ✅ Therapist discovery & search
- ✅ Therapist profiles with reviews
- ✅ Booking flow with Stripe payments
- ✅ My Sessions management
- ✅ Push notifications

### Phase 2 - Communication
- 🔲 Real-time messaging
- 🔲 In-app notifications

### Phase 3 - Engagement
- 🔲 Favorites
- 🔲 Reviews submission
- 🔲 Progress tracking

## 🏗 Project Structure

```
theramate-ios-client/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Main app tabs
│   └── booking/           # Booking flow
├── components/            # Reusable components
│   └── ui/               # Base UI components
├── lib/                   # Core utilities
│   └── supabase.ts       # Supabase client
├── stores/                # Zustand stores
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
├── constants/            # App constants
└── assets/               # Static assets
```

## 🔗 Backend Integration

This app connects to the same Supabase backend as the web app:
- Authentication via Supabase Auth
- Real-time data via PostgREST
- File storage via Supabase Storage
- Payments via Stripe Connect

## 📖 Documentation

See [PRD.md](./PRD.md) for complete product requirements including:
- Database schema
- API endpoints
- Auth flow
- Third-party integrations

## 🛠 Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** Expo Router
- **Styling:** NativeWind (Tailwind CSS)
- **State:** Zustand + React Query
- **Backend:** Supabase
- **Payments:** Stripe

## 📝 License

MIT License - See LICENSE file

