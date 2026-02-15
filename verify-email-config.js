/**
 * Verify what email address is actually configured for bookings
 * Checks if RESEND_FROM_EMAIL is set and what it should be
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aikqnvltuwwgifuocvto.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa3Fudmx0dXd3Z2lmdW9jdnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1OTkwNjYsImV4cCI6MjA0ODE3NTA2Nn0.XuXUrqDKzj0vZzNCp_3KMqJ4KjZs1LfS3NOMCJ5WGgk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyEmailConfig() {
  console.log('🔍 Verifying Email Configuration...\n')

  // Check recent email logs to see what was actually used
  const { data: recentEmails, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching emails:', error)
    return
  }

  console.log('📧 Recent Email Logs:')
  console.log('─'.repeat(60))
  
  recentEmails.forEach((email, idx) => {
    console.log(`\n${idx + 1}. Email Type: ${email.email_type}`)
    console.log(`   To: ${email.recipient_email}`)
    console.log(`   Status: ${email.status}`)
    console.log(`   Sent At: ${email.sent_at}`)
    if (email.resend_email_id) {
      console.log(`   Resend ID: ${email.resend_email_id}`)
      console.log(`   📬 View in Resend: https://resend.com/emails/${email.resend_email_id}`)
    }
    
    // Check metadata for any hints about from address
    if (email.metadata && email.metadata.resend_response) {
      console.log(`   📋 Resend Response Available (check metadata)`)
    }
  })

  console.log('\n' + '='.repeat(60))
  console.log('\n📝 Current Code Configuration:')
  console.log('─'.repeat(60))
  console.log('The send-email function uses:')
  console.log('  Deno.env.get("RESEND_FROM_EMAIL") || "Peer Care Connect <onboarding@resend.dev>"')
  console.log('\n💡 To check if RESEND_FROM_EMAIL is set:')
  console.log('   1. Go to: https://supabase.com/dashboard/project/aikqnvltuwwgifuocvto/settings/functions')
  console.log('   2. Scroll to "Secrets" section')
  console.log('   3. Look for "RESEND_FROM_EMAIL" secret')
  console.log('\n💡 To verify actual sender in Resend:')
  if (recentEmails[0]?.resend_email_id) {
    console.log(`   - Email ID: ${recentEmails[0].resend_email_id}`)
    console.log(`   - Dashboard: https://resend.com/emails/${recentEmails[0].resend_email_id}`)
  }
  console.log('   - All emails: https://resend.com/emails')
}

verifyEmailConfig()

