-- Pro features: Treatment plans and reporting (Phase 1)

-- Tables
CREATE TABLE IF NOT EXISTS public.treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','cancelled')),
  progress JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treatment_plan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.treatment_plans(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.client_sessions(id) ON DELETE SET NULL,
  notes TEXT,
  adherence_score INTEGER CHECK (adherence_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_treatment_plans_practitioner_client ON public.treatment_plans(practitioner_id, client_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_sessions_plan ON public.treatment_plan_sessions(plan_id);

-- RLS
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plan_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: practitioners manage their plans; clients can read their own plans
DROP POLICY IF EXISTS "Practitioner manage own plans" ON public.treatment_plans;
CREATE POLICY "Practitioner manage own plans" ON public.treatment_plans FOR ALL
  USING (auth.uid() = practitioner_id)
  WITH CHECK (auth.uid() = practitioner_id);

DROP POLICY IF EXISTS "Client read own plans" ON public.treatment_plans;
CREATE POLICY "Client read own plans" ON public.treatment_plans FOR SELECT
  USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Practitioner manage plan sessions" ON public.treatment_plan_sessions;
CREATE POLICY "Practitioner manage plan sessions" ON public.treatment_plan_sessions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.treatment_plans tp
    WHERE tp.id = treatment_plan_sessions.plan_id AND tp.practitioner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.treatment_plans tp
    WHERE tp.id = treatment_plan_sessions.plan_id AND tp.practitioner_id = auth.uid()
  ));

-- Views for Advanced Reporting (Phase 1)
CREATE OR REPLACE VIEW public.v_practice_kpis AS
SELECT
  u.id AS user_id,
  date_trunc('month', cs.created_at) AS period,
  COUNT(*) FILTER (WHERE cs.status = 'completed') AS sessions,
  COALESCE(SUM(CASE WHEN cs.status = 'completed' THEN cs.price ELSE 0 END), 0) AS revenue,
  COUNT(DISTINCT cs.client_name) AS clients
FROM public.users u
LEFT JOIN public.client_sessions cs ON cs.therapist_id = u.id
GROUP BY u.id, date_trunc('month', cs.created_at);

CREATE OR REPLACE VIEW public.v_service_mix AS
SELECT
  cs.therapist_id AS user_id,
  cs.session_type,
  COUNT(*) FILTER (WHERE cs.status = 'completed') AS count,
  COALESCE(SUM(CASE WHEN cs.status = 'completed' THEN cs.price ELSE 0 END), 0) AS revenue
FROM public.client_sessions cs
GROUP BY cs.therapist_id, cs.session_type;

COMMENT ON VIEW public.v_practice_kpis IS 'Monthly KPIs per practitioner';
COMMENT ON VIEW public.v_service_mix IS 'Service mix breakdown per practitioner';


