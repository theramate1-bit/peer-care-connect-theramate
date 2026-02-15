-- Smart scheduling suggest_slots and progress recording RPCs (v1)

-- RPC: suggest_slots
DROP FUNCTION IF EXISTS public.suggest_slots(UUID, INTEGER, TIMESTAMPTZ, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION public.suggest_slots(
  p_practitioner_id UUID,
  p_service_minutes INTEGER,
  p_from TIMESTAMPTZ,
  p_count INTEGER DEFAULT 3,
  p_buffer_minutes INTEGER DEFAULT 10
) RETURNS TABLE(slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
DECLARE
  v_day DATE;
  v_step INTERVAL := make_interval(mins => p_service_minutes + p_buffer_minutes);
  v_found INTEGER := 0;
  v_avail JSONB;
  v_enabled BOOLEAN;
  v_start TIME;
  v_end TIME;
  v_slot TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
BEGIN
  -- Iterate over next 14 days
  FOR v_day IN SELECT generate_series::date FROM generate_series(date_trunc('day', p_from)::date, (date_trunc('day', p_from)::date + 14), '1 day') LOOP
    -- Load availability JSON for practitioner
    SELECT working_hours INTO v_avail
    FROM public.practitioner_availability
    WHERE user_id = p_practitioner_id;

    IF v_avail IS NULL THEN
      CONTINUE;
    END IF;

    -- Determine weekday key from v_day (e.g., 'monday')
    -- to_char returns capitalized; lower()
    PERFORM 1;
    v_enabled := COALESCE((v_avail -> lower(to_char(v_day, 'Day')) ->> 'enabled')::boolean, false);
    IF NOT v_enabled THEN CONTINUE; END IF;

    v_start := COALESCE((v_avail -> lower(to_char(v_day, 'Day')) ->> 'start')::time, TIME '09:00');
    v_end := COALESCE((v_avail -> lower(to_char(v_day, 'Day')) ->> 'end')::time, TIME '17:00');

    -- Generate candidate slots within working window
    FOR v_slot IN 
      SELECT (v_day::timestamp + v_start) + (i * v_step)
      FROM generate_series(0, 1000) AS g(i)
      WHERE (v_day::timestamp + v_start) + (i * v_step) >= p_from
        AND (v_day::timestamp + v_start) + (i * v_step) < (v_day::timestamp + v_end)
    LOOP
      v_slot_end := v_slot + make_interval(mins => p_service_minutes);
      IF v_slot_end > (v_day::timestamp + v_end) THEN CONTINUE; END IF;

      -- Check overlap with existing sessions
      IF EXISTS (
        SELECT 1 FROM public.client_sessions s
        WHERE s.therapist_id = p_practitioner_id
          AND s.status IN ('scheduled','confirmed','in_progress')
          AND (s.session_date + s.start_time)::timestamp < v_slot_end
          AND (s.session_date + s.start_time)::timestamp + make_interval(mins => s.duration_minutes) > v_slot
      ) THEN
        CONTINUE;
      END IF;

      slot_start := v_slot;
      slot_end := v_slot_end;
      v_found := v_found + 1;
      RETURN NEXT;
      IF v_found >= p_count THEN RETURN; END IF;
    END LOOP;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.suggest_slots(UUID, INTEGER, TIMESTAMPTZ, INTEGER, INTEGER) TO authenticated, anon;

-- RPC: record_progress (simple pain + optional metric)
DROP FUNCTION IF EXISTS public.record_progress(UUID, UUID, INTEGER, TEXT, NUMERIC);
CREATE OR REPLACE FUNCTION public.record_progress(
  p_session_id UUID,
  p_client_id UUID,
  p_pain INTEGER,
  p_metric_name TEXT DEFAULT NULL,
  p_metric_value NUMERIC DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_practitioner UUID;
DECLARE v_date DATE;
BEGIN
  SELECT therapist_id, session_date INTO v_practitioner, v_date FROM public.client_sessions WHERE id = p_session_id;
  IF v_practitioner IS NULL THEN RAISE EXCEPTION 'Invalid session'; END IF;
  -- Pain metric (0-10)
  IF p_pain IS NOT NULL THEN
    INSERT INTO public.progress_metrics(client_id, practitioner_id, session_id, metric_type, metric_name, value, max_value, unit, session_date)
    VALUES (p_client_id, v_practitioner, p_session_id, 'pain_level', 'pain', GREATEST(0, LEAST(10, p_pain)), 10, '', COALESCE(v_date, CURRENT_DATE));
  END IF;
  -- Optional custom metric
  IF p_metric_name IS NOT NULL AND p_metric_value IS NOT NULL THEN
    INSERT INTO public.progress_metrics(client_id, practitioner_id, session_id, metric_type, metric_name, value, max_value, unit, session_date)
    VALUES (p_client_id, v_practitioner, p_session_id, 'custom', p_metric_name, p_metric_value, 100, '', COALESCE(v_date, CURRENT_DATE));
  END IF;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_progress(UUID, UUID, INTEGER, TEXT, NUMERIC) TO authenticated;


