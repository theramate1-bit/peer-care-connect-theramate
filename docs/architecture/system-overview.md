# System Overview

## Architecture Overview

Peer Care Connect is built as a modern, full-stack web application with the following architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Pages   │  │Components│  │  Hooks   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Backend                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │PostgreSQL│  │  Auth    │  │ Realtime │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐                          │
│  │Storage   │  │  Edge    │                          │
│  │          │  │Functions │                          │
│  └──────────┘  └──────────┘                          │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Stripe   │  │  Resend  │  │   Groq   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Router** - Navigation
- **React Hook Form + Zod** - Forms & validation

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Edge Functions (Deno)
  - Storage

### External Services
- **Stripe** - Payment processing
- **Resend** - Email delivery
- **Groq** - AI for SOAP notes

## Key Features

### Authentication & Authorization
- Email/password authentication
- Role-based access control (Client, Practitioner, Admin)
- Row Level Security (RLS) policies

### Booking System
- Availability management
- Calendar integration
- Session scheduling
- Recurring sessions

### Payment Processing
- Stripe integration
- Credit-based economy
- Payment processing
- Webhook handling

### Messaging
- Real-time messaging
- Conversation management
- Notification system

### Treatment Documentation
- SOAP notes
- Progress tracking
- Goal setting

## Data Flow

1. **User Action** → React component
2. **API Call** → Supabase client
3. **Database Query** → PostgreSQL (with RLS)
4. **Real-time Update** → Realtime subscription
5. **UI Update** → React re-render

## Security Architecture

- **Client-side**: Public keys only (VITE_* variables)
- **Server-side**: Secrets in Edge Functions
- **Database**: Row Level Security (RLS)
- **API**: Rate limiting, validation
- **Authentication**: Supabase Auth with JWT

## Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Supabase (managed)
- **Database**: Supabase PostgreSQL
- **CDN**: CloudFlare / AWS CloudFront

## Scalability

- **Horizontal scaling**: Stateless frontend
- **Database**: Supabase managed scaling
- **Caching**: React Query for client-side
- **CDN**: Static asset delivery

## Monitoring

- **Error Tracking**: (To be configured)
- **Analytics**: (To be configured)
- **Logging**: Supabase logs
- **Performance**: Vite build analysis

---

For more details, see:
- [Database Schema](./database-schema.md)
- [API Design](./api-design.md)
- [Security Architecture](./security.md)
