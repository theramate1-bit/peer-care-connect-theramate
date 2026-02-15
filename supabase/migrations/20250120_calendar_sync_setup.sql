-- Calendar Sync Configuration Migration
-- Enables Google Calendar and other calendar provider integrations

-- Create calendar_sync_configs table
CREATE TABLE IF NOT EXISTS public.calendar_sync_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple', 'ical')),
    enabled BOOLEAN DEFAULT false,
    sync_interval INTEGER DEFAULT 30, -- minutes
    last_sync TIMESTAMP WITH TIME ZONE,
    calendar_id TEXT, -- External calendar ID (e.g., Google Calendar ID)
    access_token TEXT, -- Encrypted OAuth access token
    refresh_token TEXT, -- Encrypted OAuth refresh token
    token_expires_at TIMESTAMP WITH TIME ZONE,
    sync_direction TEXT DEFAULT 'two-way' CHECK (sync_direction IN ('one-way-in', 'one-way-out', 'two-way')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Create practitioner_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.practitioner_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    working_hours JSONB NOT NULL DEFAULT '{
        "monday": {"start": "09:00", "end": "17:00", "enabled": true},
        "tuesday": {"start": "09:00", "end": "17:00", "enabled": true},
        "wednesday": {"start": "09:00", "end": "17:00", "enabled": true},
        "thursday": {"start": "09:00", "end": "17:00", "enabled": true},
        "friday": {"start": "09:00", "end": "17:00", "enabled": true},
        "saturday": {"start": "10:00", "end": "15:00", "enabled": false},
        "sunday": {"start": "10:00", "end": "15:00", "enabled": false}
    }',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create calendar_events table to track synced events
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    external_event_id TEXT, -- ID from external calendar (e.g., Google Calendar event ID)
    internal_event_id UUID, -- Reference to internal booking/session
    event_type TEXT NOT NULL CHECK (event_type IN ('appointment', 'session', 'block', 'unavailable')),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    provider TEXT NOT NULL CHECK (provider IN ('internal', 'google', 'outlook', 'apple')),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
    attendees JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, external_event_id, provider)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_sync_configs_user ON public.calendar_sync_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_configs_provider ON public.calendar_sync_configs(provider);
CREATE INDEX IF NOT EXISTS idx_practitioner_availability_user ON public.practitioner_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_external ON public.calendar_events(external_event_id, provider);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time ON public.calendar_events(start_time, end_time);

-- Enable RLS
ALTER TABLE public.calendar_sync_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_sync_configs
CREATE POLICY "Users can view their own calendar sync configs"
    ON public.calendar_sync_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar sync configs"
    ON public.calendar_sync_configs FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for practitioner_availability
CREATE POLICY "Users can view their own availability"
    ON public.practitioner_availability FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own availability"
    ON public.practitioner_availability FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view their own calendar events"
    ON public.calendar_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar events"
    ON public.calendar_events FOR ALL
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_calendar_sync_configs_updated_at
    BEFORE UPDATE ON public.calendar_sync_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_practitioner_availability_updated_at
    BEFORE UPDATE ON public.practitioner_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_updated_at();

