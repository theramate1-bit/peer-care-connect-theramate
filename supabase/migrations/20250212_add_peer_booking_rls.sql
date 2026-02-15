-- Add explicit RLS policy for peer bookings
-- Ensures both parties (therapist and client, both practitioners) can access peer booking sessions

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "peer_booking_full_access" ON public.client_sessions;

-- Create policy allowing both parties full access to peer bookings
CREATE POLICY "peer_booking_full_access" 
ON public.client_sessions
FOR ALL
USING (
  is_peer_booking = true AND 
  (auth.uid() = therapist_id OR auth.uid() = client_id)
)
WITH CHECK (
  is_peer_booking = true AND 
  (auth.uid() = therapist_id OR auth.uid() = client_id)
);

-- Add comment
COMMENT ON POLICY "peer_booking_full_access" ON public.client_sessions IS 
'Allows both therapist and client (both practitioners) full access to peer treatment bookings for viewing, updating, and cancelling';

