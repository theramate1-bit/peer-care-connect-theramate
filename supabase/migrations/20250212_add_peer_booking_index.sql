-- Add indexes for peer booking queries to improve performance

-- Index for filtering by is_peer_booking flag
CREATE INDEX IF NOT EXISTS idx_client_sessions_is_peer_booking 
ON public.client_sessions(is_peer_booking) 
WHERE is_peer_booking = true;

-- Composite index for common peer booking queries (therapist and client lookups)
CREATE INDEX IF NOT EXISTS idx_client_sessions_peer_booking_users 
ON public.client_sessions(therapist_id, client_id, is_peer_booking) 
WHERE is_peer_booking = true;

-- Index for peer booking status queries
CREATE INDEX IF NOT EXISTS idx_client_sessions_peer_booking_status 
ON public.client_sessions(is_peer_booking, status, session_date) 
WHERE is_peer_booking = true;

-- Add comments
COMMENT ON INDEX idx_client_sessions_is_peer_booking IS 'Optimizes queries filtering peer bookings';
COMMENT ON INDEX idx_client_sessions_peer_booking_users IS 'Optimizes lookups for peer sessions by therapist and client';
COMMENT ON INDEX idx_client_sessions_peer_booking_status IS 'Optimizes queries filtering peer bookings by status and date';

