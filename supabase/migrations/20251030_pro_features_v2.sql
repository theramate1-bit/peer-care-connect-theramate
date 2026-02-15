-- Pro features v2: extend treatment_plans, add RPCs

-- Extend treatment_plans with clinician_notes and attachments
ALTER TABLE public.treatment_plans
  ADD COLUMN IF NOT EXISTS clinician_notes TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- RPC: create_treatment_plan
DROP FUNCTION IF EXISTS public.create_treatment_plan(UUID, UUID, TEXT, TEXT[], TEXT[], DATE, DATE, TEXT, JSONB);
CREATE OR REPLACE FUNCTION public.create_treatment_plan(
  p_practitioner_id UUID,
  p_client_id UUID,
  p_title TEXT,
  p_goals TEXT[],
  p_interventions TEXT[],
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_clinician_notes TEXT DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  IF auth.uid() <> p_practitioner_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO public.treatment_plans(
    practitioner_id, client_id, title, goals, interventions, start_date, end_date, clinician_notes, attachments
  ) VALUES (
    p_practitioner_id, p_client_id, p_title, to_jsonb(p_goals::text[])::jsonb, to_jsonb(p_interventions::text[])::jsonb, p_start_date, p_end_date, p_clinician_notes, COALESCE(p_attachments, '[]'::jsonb)
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;$$;

GRANT EXECUTE ON FUNCTION public.create_treatment_plan(UUID, UUID, TEXT, TEXT[], TEXT[], DATE, DATE, TEXT, JSONB) TO authenticated;

-- RPC: update_treatment_plan
DROP FUNCTION IF EXISTS public.update_treatment_plan(UUID, JSONB);
CREATE OR REPLACE FUNCTION public.update_treatment_plan(
  p_plan_id UUID,
  p_patch JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_owner UUID;
BEGIN
  SELECT practitioner_id INTO v_owner FROM public.treatment_plans WHERE id = p_plan_id;
  IF v_owner IS NULL OR v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.treatment_plans
  SET 
    title = COALESCE(p_patch->>'title', title),
    goals = COALESCE(p_patch->'goals', goals),
    interventions = COALESCE(p_patch->'interventions', interventions),
    start_date = COALESCE((p_patch->>'start_date')::date, start_date),
    end_date = COALESCE((p_patch->>'end_date')::date, end_date),
    status = COALESCE(p_patch->>'status', status),
    clinician_notes = COALESCE(p_patch->>'clinician_notes', clinician_notes),
    attachments = COALESCE(p_patch->'attachments', attachments),
    updated_at = now()
  WHERE id = p_plan_id;
  RETURN true;
END;$$;

GRANT EXECUTE ON FUNCTION public.update_treatment_plans(UUID, JSONB) TO authenticated;

-- RPC: link_session_to_plan
DROP FUNCTION IF EXISTS public.link_session_to_plan(UUID, UUID, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.link_session_to_plan(
  p_plan_id UUID,
  p_session_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_adherence INTEGER DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_owner UUID; v_id UUID;
BEGIN
  SELECT practitioner_id INTO v_owner FROM public.treatment_plans WHERE id = p_plan_id;
  IF v_owner IS NULL OR v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO public.treatment_plan_sessions(plan_id, session_id, notes, adherence_score)
  VALUES (p_plan_id, p_session_id, p_notes, p_adherence)
  RETURNING id INTO v_id;
  RETURN v_id;
END;$$;

GRANT EXECUTE ON FUNCTION public.link_session_to_plan(UUID, UUID, TEXT, INTEGER) TO authenticated;


