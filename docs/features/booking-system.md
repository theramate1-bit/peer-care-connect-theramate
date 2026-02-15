# Booking System

The booking system allows clients to schedule therapy sessions with practitioners.

## Overview

The booking system handles:
- Availability management
- Session scheduling
- Calendar integration
- Recurring sessions
- Session lifecycle management

## Key Components

### Availability Manager
Practitioners set their working hours and available time slots.

### Booking Calendar
Clients view available slots and book sessions.

### Session Manager
Both parties manage session lifecycle and status.

## Database Schema

Key tables:
- `availability_slots` - Therapist working hours
- `client_sessions` - Session bookings
- `therapist_profiles` - Therapist information
- `client_profiles` - Client information

## User Flows

### For Practitioners
1. Set availability
2. View bookings
3. Confirm/cancel sessions
4. Update session status

### For Clients
1. Browse therapists
2. View availability
3. Book session
4. Manage bookings

## API Endpoints

See [API Documentation](../api/rest-api.md) for detailed endpoint documentation.

## Related Documentation

- [Booking System README](../../BOOKING_SYSTEM_README.md)
- [Database Schema](../architecture/database-schema.md)
