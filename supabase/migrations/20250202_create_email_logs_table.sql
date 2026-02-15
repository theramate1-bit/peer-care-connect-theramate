-- Create email_logs table to track all sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT,
  maileroo_email_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_maileroo_id ON public.email_logs(maileroo_email_id);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - only service role can access (for Edge Functions)
CREATE POLICY "Service role can manage email logs" ON public.email_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE public.email_logs IS 'Logs all emails sent via Maileroo API for tracking and debugging';
COMMENT ON COLUMN public.email_logs.maileroo_email_id IS 'Email ID returned from Maileroo API for tracking delivery status';

