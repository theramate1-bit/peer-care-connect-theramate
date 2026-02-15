-- Rename maileroo_email_id column to resend_email_id
ALTER TABLE IF EXISTS public.email_logs 
  RENAME COLUMN maileroo_email_id TO resend_email_id;

-- Rename index
DROP INDEX IF EXISTS idx_email_logs_maileroo_id;
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_email_id ON public.email_logs(resend_email_id);

-- Update column comment
COMMENT ON COLUMN public.email_logs.resend_email_id IS 'Email ID returned from Resend API for tracking delivery status';

-- Update table comment
COMMENT ON TABLE public.email_logs IS 'Logs all emails sent via Resend API for tracking and debugging';

