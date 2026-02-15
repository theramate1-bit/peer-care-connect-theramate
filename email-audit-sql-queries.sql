-- Email System Audit SQL Queries
-- Run these in Supabase SQL Editor to analyze email sending patterns

-- ============================================
-- Phase 3: Database Audit Queries
-- ============================================

-- 1. Check recent email sends (last 50)
SELECT 
  id,
  email_type,
  recipient_email,
  status,
  error_message,
  resend_email_id,
  created_at,
  sent_at,
  metadata->>'from_email' as from_email_used,
  metadata->>'resend_from_email_env_set' as resend_secret_set
FROM email_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- 2. Check failure rates by email type (last 7 days)
SELECT 
  email_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  ROUND(100.0 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as failure_rate_pct,
  ROUND(100.0 * SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as success_rate_pct
FROM email_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY email_type
ORDER BY failure_rate_pct DESC, total DESC;

-- 3. Check for missing email IDs (emails that didn't reach Resend)
SELECT 
  id,
  email_type,
  recipient_email,
  status,
  error_message,
  created_at
FROM email_logs
WHERE resend_email_id IS NULL
  AND status != 'pending'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;

-- 4. Recent failures with error details
SELECT 
  id,
  email_type,
  recipient_email,
  status,
  error_message,
  metadata->>'resend_response' as resend_error_details,
  created_at
FROM email_logs
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;

-- 5. Email sending volume by day (last 7 days)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_emails,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(100.0 * SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as success_rate
FROM email_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 6. Check sender email configuration usage
SELECT 
  metadata->>'from_email' as from_email_used,
  metadata->>'resend_from_email_env_set' as secret_set,
  COUNT(*) as count,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_logs
WHERE created_at > NOW() - INTERVAL '7 days'
  AND metadata->>'from_email' IS NOT NULL
GROUP BY metadata->>'from_email', metadata->>'resend_from_email_env_set'
ORDER BY count DESC;

-- 7. Most common error messages
SELECT 
  error_message,
  COUNT(*) as occurrence_count,
  email_type,
  MAX(created_at) as last_occurrence
FROM email_logs
WHERE status = 'failed'
  AND error_message IS NOT NULL
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_message, email_type
ORDER BY occurrence_count DESC
LIMIT 10;

-- 8. Check email logs table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'email_logs'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Verify RLS policies on email_logs
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'email_logs';

-- 10. Email type coverage check (which types have been sent)
SELECT 
  email_type,
  COUNT(*) as total_sent,
  MIN(created_at) as first_sent,
  MAX(created_at) as last_sent
FROM email_logs
GROUP BY email_type
ORDER BY total_sent DESC;

-- 11. Recipients who received the most emails (last 7 days)
SELECT 
  recipient_email,
  COUNT(*) as email_count,
  COUNT(DISTINCT email_type) as unique_types,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY recipient_email
ORDER BY email_count DESC
LIMIT 20;

-- 12. Check for duplicate email sends (same email type to same recipient within 1 minute)
SELECT 
  email_type,
  recipient_email,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at) as email_ids,
  array_agg(created_at ORDER BY created_at) as timestamps
FROM email_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY email_type, recipient_email, DATE_TRUNC('minute', created_at)
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 20;

