-- Allow public read access to 'block' and 'unavailable' calendar events
-- This is necessary so that booking flows can check for practitioner availability
-- without requiring the user to be authenticated as the practitioner.

DROP POLICY IF EXISTS "Public can view blocked time" ON public.calendar_events;

CREATE POLICY "Public can view blocked time"
ON public.calendar_events
FOR SELECT
TO public
USING (
  event_type IN ('block', 'unavailable')
);

