import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm'

// CORS headers - restrict to allowed origins in production
const getAllowedOrigin = (): string => {
  const origin = Deno.env.get('ALLOWED_ORIGINS') || '';
  const allowedOrigins = origin.split(',').map(o => o.trim()).filter(Boolean);
  
  // In production, use specific origins; in development, allow localhost
  if (allowedOrigins.length > 0) {
    return allowedOrigins[0]; // For CORS, we need to check the request origin
  }
  
  // Default: allow all in development, restrict in production
  return Deno.env.get('ENVIRONMENT') === 'production' ? '' : '*';
};

const corsHeaders = (origin?: string | null): Record<string, string> => {
  const allowedOrigin = getAllowedOrigin();
  const requestOrigin = origin || '*';
  
  // In production, validate origin; in development, allow all
  const corsOrigin = allowedOrigin === '*' || Deno.env.get('ENVIRONMENT') !== 'production'
    ? '*'
    : (allowedOrigin.includes(requestOrigin) ? requestOrigin : '');
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

interface EmailRequest {
  emailType: 'booking_confirmation_client' | 'booking_confirmation_practitioner' | 
            'payment_confirmation_client' | 'payment_received_practitioner' |
            'session_reminder_24h' | 'session_reminder_1h' | 'cancellation' | 'rescheduling' |
            'peer_booking_confirmed_client' | 'peer_booking_confirmed_practitioner' |
            'peer_credits_deducted' | 'peer_credits_earned' | 'peer_booking_cancelled_refunded'
  recipientEmail: string
  recipientName?: string
  data: {
    // Session data
    sessionId?: string
    sessionType?: string
    sessionDate?: string
    sessionTime?: string
    sessionPrice?: number
    sessionDuration?: number
    sessionLocation?: string
    
    // User data
    clientName?: string
    clientEmail?: string
    practitionerName?: string
    practitionerEmail?: string
    
    // Payment data
    paymentAmount?: number
    platformFee?: number
    practitionerAmount?: number
    paymentId?: string
    
    // Additional data
    cancellationReason?: string
    refundAmount?: number
    originalDate?: string
    originalTime?: string
    newDate?: string
    newTime?: string
    bookingUrl?: string
    calendarUrl?: string
    messageUrl?: string
    directionsUrl?: string
    paymentStatus?: string
  }
}

interface EmailTemplate {
  subject: string
  html: string
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Validate Content-Type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request body
    let emailRequest: EmailRequest;
    try {
      const bodyText = await req.text();
      if (bodyText.length > 10 * 1024 * 1024) { // 10MB limit
        return new Response(
          JSON.stringify({ error: 'Request body is too large (max 10MB)' }),
          { 
            status: 400, 
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
          }
        );
      }
      emailRequest = JSON.parse(bodyText) as EmailRequest;
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    const { emailType, recipientEmail, recipientName, data } = emailRequest;

    // Validate required fields
    if (!emailType || typeof emailType !== 'string') {
      return new Response(
        JSON.stringify({ error: 'emailType is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return new Response(
        JSON.stringify({ error: 'recipientEmail is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY secret is missing')
      throw new Error('RESEND_API_KEY not configured. Please add it to Edge Function secrets in Supabase Dashboard.')
    }
    
    // Log that API key exists (but don't log the actual key)
    console.log('Resend API key configured:', resendApiKey.substring(0, 10) + '...')

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: `Invalid email address format: ${recipientEmail}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email length (RFC 5321 limit is 254 characters)
    if (recipientEmail.length > 254) {
      return new Response(
        JSON.stringify({ error: 'Email address is too long (max 254 characters)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate emailType is one of allowed values
    const validEmailTypes = [
      'booking_confirmation_client',
      'booking_confirmation_practitioner',
      'payment_confirmation_client',
      'payment_received_practitioner',
      'session_reminder_24h',
      'session_reminder_1h',
      'cancellation',
      'rescheduling',
      'peer_booking_confirmed_client',
      'peer_booking_confirmed_practitioner',
      'peer_credits_deducted',
      'peer_credits_earned',
      'peer_booking_cancelled_refunded'
    ];
    
    if (!validEmailTypes.includes(emailType)) {
      return new Response(
        JSON.stringify({ error: `Invalid emailType. Must be one of: ${validEmailTypes.join(', ')}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate recipientName if provided
    if (recipientName && (typeof recipientName !== 'string' || recipientName.length > 200)) {
      return new Response(
        JSON.stringify({ error: 'recipientName must be a string with max 200 characters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate email template
    const template = generateEmailTemplate(emailType, data, recipientName)
    
    // Determine sender email - use onboarding@resend.dev for testing, can upgrade to verified domain later
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Theramate <onboarding@resend.dev>'
    
    // Send email via Resend API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let resendResponse: Response
    try {
      resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipientEmail],
          subject: template.subject,
          html: template.html,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // Handle timeout or network errors
      if (fetchError.name === 'AbortError') {
        throw new Error('Resend API request timed out after 30 seconds')
      }
      
      throw fetchError
    }

    // Parse response - handle both success and error cases
    let resendData: any
    try {
      const responseText = await resendResponse.text()
      resendData = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error('Failed to parse Resend response:', parseError)
      throw new Error('Failed to parse Resend API response')
    }

    if (!resendResponse.ok) {
      const errorMessage = resendData.message || resendData.error || JSON.stringify(resendData)
      
      // Handle rate limiting (429) with retry information
      if (resendResponse.status === 429) {
        const retryAfter = resendResponse.headers.get('Retry-After')
        console.error('Resend API rate limit exceeded:', {
          retryAfter: retryAfter || 'unknown',
          recipientEmail: recipientEmail,
          emailType: emailType
        })
      } else {
        console.error('Resend API error:', {
          status: resendResponse.status,
          statusText: resendResponse.statusText,
          response: resendData,
          recipientEmail: recipientEmail,
          emailType: emailType
        })
      }
      
      // Log failed attempt to database
      try {
        await supabaseClient
          .from('email_logs')
          .insert({
            email_type: emailType,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            subject: template.subject,
            resend_email_id: null,
            status: 'failed',
            error_message: errorMessage,
            sent_at: null,
            metadata: {
              resend_response: resendData,
              resend_status: resendResponse.status,
              retry_after: resendResponse.headers.get('Retry-After'),
              template_data: data,
              recipient_name: recipientName
            }
          })
      } catch (logErr) {
        console.error('Failed to log email error:', logErr)
      }
      
      throw new Error(`Resend API error (${resendResponse.status}): ${errorMessage}`)
    }

    // Extract email ID from response
    const emailId = resendData.id || null

    if (!emailId) {
      console.warn('Resend API returned success but no email ID:', resendData)
    }

    // Log successful email send to database
    try {
      const { error: logError } = await supabaseClient
        .from('email_logs')
        .insert({
          email_type: emailType,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          subject: template.subject,
          resend_email_id: emailId,
          status: emailId ? 'sent' : 'pending',
          sent_at: new Date().toISOString(),
          metadata: {
            resend_response: resendData,
            template_data: data,
            recipient_name: recipientName
          }
        })

      if (logError) {
        console.error('Failed to log email:', logError)
        // Don't fail the request if logging fails
      }
    } catch (logErr) {
      console.error('Email logging error (table may not exist):', logErr)
      // Continue even if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailId,
        message: 'Email sent successfully',
        resend_response: resendData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email send error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateEmailTemplate(emailType: string, data: any, recipientName?: string): EmailTemplate {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://theramate.co.uk'
  
  switch (emailType) {
    case 'booking_confirmation_client':
      return {
        subject: `Booking Confirmed - ${data.sessionType} with ${data.practitionerName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
              .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>Your booking has been confirmed! We're excited to connect you with your practitioner.</p>
              
              <div class="session-details">
                <h3>Session Details</h3>
                <p><strong>Type:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
                <p><strong>Price:</strong> £${data.sessionPrice}</p>
                ${data.sessionLocation ? `<p><strong>Location:</strong> ${data.sessionLocation}</p>` : ''}
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/bookings`}" class="cta-button">View Booking Details</a>
                <a href="${data.calendarUrl || '#'}" class="cta-button">Add to Calendar</a>
                <a href="${data.messageUrl || `${baseUrl}/messages`}" class="cta-button">Message Practitioner</a>
              </div>

              <p><strong>Important:</strong> Please arrive 5 minutes early for your session. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'booking_confirmation_practitioner':
      return {
        subject: `New Booking - ${data.sessionType} with ${data.clientName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Booking</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
              .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>New Booking Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>You have received a new booking! Here are the details:</p>
              
              <div class="session-details">
                <h3>Session Details</h3>
                <p><strong>Type:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
                <p><strong>Price:</strong> £${data.sessionPrice}</p>
                <p><strong>Client:</strong> ${data.clientName}</p>
                <p><strong>Client Email:</strong> ${data.clientEmail}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/practice/sessions/${data.sessionId || ''}`}" class="cta-button">View Session</a>
                <a href="${data.messageUrl || `${baseUrl}/messages`}" class="cta-button">Message Client</a>
                <a href="${baseUrl}/practice/scheduler" class="cta-button">Manage Availability</a>
              </div>

              <p><strong>Payment Status:</strong> ${data.paymentStatus || 'Pending confirmation'}</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'payment_confirmation_client':
      return {
        subject: `Payment Confirmed - £${data.paymentAmount} for ${data.sessionType}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Confirmed</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
              .cta-button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Payment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>Your payment has been successfully processed. Thank you for your booking!</p>
              
              <div class="payment-details">
                <h3>Payment Details</h3>
                <p><strong>Amount:</strong> £${data.paymentAmount}</p>
                <p><strong>Session:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Payment ID:</strong> ${data.paymentId}</p>
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/bookings`}" class="cta-button">View Booking</a>
                <a href="#" class="cta-button">Download Receipt</a>
              </div>

              <p>Your session is confirmed and you should receive a separate booking confirmation email shortly.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'payment_received_practitioner':
      return {
        subject: `Payment Received - £${data.practitionerAmount} from ${data.clientName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Received</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
              .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Payment Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>You have received a payment for your session. Here are the details:</p>
              
              <div class="payment-details">
                <h3>Payment Breakdown</h3>
                <p><strong>Total Session Price:</strong> £${data.paymentAmount}</p>
                <p><strong>Platform Fee (0.5%):</strong> £${data.platformFee}</p>
                <p><strong>Your Earnings:</strong> £${data.practitionerAmount}</p>
                <p><strong>Client:</strong> ${data.clientName}</p>
                <p><strong>Session:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Payment ID:</strong> ${data.paymentId}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/payments" class="cta-button">View Transaction</a>
                <a href="${baseUrl}/settings/payouts" class="cta-button">Manage Payouts</a>
              </div>

              <p><strong>Payout Schedule:</strong> Funds will be transferred to your bank account within 2-7 business days.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'session_reminder_24h':
      return {
        subject: `Reminder: Your session is tomorrow`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Session Reminder</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Session Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>This is a friendly reminder that you have a session tomorrow!</p>
              
              <div class="session-details">
                <h3>Session Details</h3>
                <p><strong>Type:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
                ${data.sessionLocation ? `<p><strong>Location:</strong> ${data.sessionLocation}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/bookings`}" class="cta-button">View Details</a>
                <a href="${data.directionsUrl || '#'}" class="cta-button">Get Directions</a>
                <a href="${data.bookingUrl || `${baseUrl}/bookings`}" class="cta-button">Reschedule</a>
              </div>

              <p><strong>Preparation Tips:</strong></p>
              <ul>
                <li>Arrive 5 minutes early</li>
                <li>Wear comfortable clothing</li>
                <li>Bring any relevant medical information</li>
                <li>Stay hydrated</li>
              </ul>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'session_reminder_1h':
      return {
        subject: `Reminder: Your session starts in 1 hour`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Session Starting Soon</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .cta-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Session Starting Soon!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>Your session starts in 1 hour. Please make sure you're ready!</p>
              
              <div class="session-details">
                <h3>Session Details</h3>
                <p><strong>Type:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
                ${data.sessionLocation ? `<p><strong>Location:</strong> ${data.sessionLocation}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/bookings`}" class="cta-button">View Details</a>
                <a href="${data.directionsUrl || '#'}" class="cta-button">Get Directions</a>
                <a href="${data.messageUrl || `${baseUrl}/messages`}" class="cta-button">Message Practitioner</a>
              </div>

              <p><strong>Last-minute reminders:</strong></p>
              <ul>
                <li>Leave now to arrive on time</li>
                <li>Bring your ID if required</li>
                <li>Have your phone charged</li>
                <li>Check traffic conditions</li>
              </ul>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'cancellation':
      return {
        subject: `Session Cancelled - ${data.sessionType}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Session Cancelled</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .cancellation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .cta-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Session Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>We're sorry to inform you that your session has been cancelled.</p>
              
              <div class="cancellation-details">
                <h3>Cancellation Details</h3>
                <p><strong>Session:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
                ${data.cancellationReason ? `<p><strong>Reason:</strong> ${data.cancellationReason}</p>` : ''}
                ${data.refundAmount ? `<p><strong>Refund Amount:</strong> £${data.refundAmount}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/marketplace" class="cta-button">Book Another Session</a>
                <a href="${baseUrl}/terms#cancellation" class="cta-button">View Cancellation Policy</a>
              </div>

              ${data.refundAmount ? '<p><strong>Refund:</strong> Your refund will be processed within 5-10 business days.</p>' : ''}
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'rescheduling':
      return {
        subject: `Session Rescheduled - New Date/Time`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Session Rescheduled</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .reschedule-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Session Rescheduled</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>Your session has been rescheduled. Here are the updated details:</p>
              
              <div class="reschedule-details">
                <h3>Updated Session Details</h3>
                <p><strong>Session:</strong> ${data.sessionType}</p>
                <p><strong>Original Date:</strong> ${new Date(data.originalDate).toLocaleDateString()}</p>
                <p><strong>Original Time:</strong> ${data.originalTime}</p>
                <p><strong>New Date:</strong> ${new Date(data.newDate).toLocaleDateString()}</p>
                <p><strong>New Time:</strong> ${data.newTime}</p>
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/bookings`}" class="cta-button">Confirm New Time</a>
                <a href="${data.calendarUrl || '#'}" class="cta-button">Add to Calendar</a>
              </div>

              <p>Please make sure to update your calendar with the new time.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'peer_booking_confirmed_client':
      return {
        subject: `Peer Treatment Booking Confirmed - ${data.sessionType}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Peer Treatment Booking Confirmed</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .credit-info { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Peer Treatment Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>Your peer treatment booking has been confirmed! You've booked a treatment session with another practitioner.</p>
              
              <div class="session-details">
                <h3>Session Details</h3>
                <p><strong>Type:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
              </div>

              <div class="credit-info">
                <h3>Credit Information</h3>
                <p><strong>Credits Deducted:</strong> ${data.paymentAmount || 0} credits</p>
                <p>These credits have been deducted from your account balance. You can view your credit balance and transaction history on your Credits page.</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/credits#peer-treatment`}" class="cta-button">View My Bookings</a>
                <a href="${data.calendarUrl || '#'}" class="cta-button">Add to Calendar</a>
              </div>

              <p><strong>Important:</strong> This is a peer treatment exchange. Both you and your practitioner are part of our practitioner community supporting each other.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'peer_booking_confirmed_practitioner':
      return {
        subject: `New Peer Treatment Booking - ${data.sessionType} with ${data.clientName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Peer Treatment Booking</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
              .credit-info { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
              .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>New Peer Treatment Booking!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>You have received a new peer treatment booking from another practitioner in our community.</p>
              
              <div class="session-details">
                <h3>Session Details</h3>
                <p><strong>Type:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Duration:</strong> ${data.sessionDuration} minutes</p>
                <p><strong>Client (Practitioner):</strong> ${data.clientName}</p>
                <p><strong>Client Email:</strong> ${data.clientEmail}</p>
              </div>

              <div class="credit-info">
                <h3>Credit Information</h3>
                <p><strong>Credits Earned:</strong> ${data.paymentAmount || 0} credits</p>
                <p>These credits have been added to your account balance. You can use them to book your own peer treatments!</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl || `${baseUrl}/practice/sessions/${data.sessionId || ''}`}" class="cta-button">View Session</a>
                <a href="${baseUrl}/credits#peer-treatment" class="cta-button">View Credits</a>
              </div>

              <p><strong>Note:</strong> This is a peer treatment exchange. Both parties are practitioners supporting each other in our community.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'peer_credits_deducted':
      return {
        subject: `${data.paymentAmount || 0} Credits Deducted - Peer Treatment Booking`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Credits Deducted</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .credit-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .cta-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Credits Deducted</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>Credits have been deducted from your account for a peer treatment booking.</p>
              
              <div class="credit-details">
                <h3>Transaction Details</h3>
                <p><strong>Credits Deducted:</strong> ${data.paymentAmount || 0} credits</p>
                <p><strong>Session:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Practitioner:</strong> ${data.practitionerName}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/credits" class="cta-button">View Credit Balance</a>
              </div>

              <p>You can check your credit balance and transaction history anytime on your Credits page.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'peer_credits_earned':
      return {
        subject: `+${data.paymentAmount || 0} Credits Earned - Peer Treatment`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Credits Earned</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .credit-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
              .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Credits Earned!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>Great news! You've earned credits from a peer treatment session.</p>
              
              <div class="credit-details">
                <h3>Transaction Details</h3>
                <p><strong>Credits Earned:</strong> +${data.paymentAmount || 0} credits</p>
                <p><strong>Session:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                <p><strong>Client:</strong> ${data.clientName}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/credits" class="cta-button">View Credit Balance</a>
                <a href="${baseUrl}/credits#peer-treatment" class="cta-button">Book Peer Treatment</a>
              </div>

              <p>You can use these credits to book your own peer treatment sessions with other practitioners!</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    case 'peer_booking_cancelled_refunded':
      return {
        subject: `Peer Treatment Cancelled - ${data.refundAmount || 0} Credits Refunded`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Peer Treatment Cancelled</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .refund-info { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Peer Treatment Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName || 'there'},</p>
              <p>A peer treatment booking has been cancelled. ${data.cancellationReason ? `Reason: ${data.cancellationReason}` : ''}</p>
              
              <div class="session-details">
                <h3>Cancelled Session</h3>
                <p><strong>Type:</strong> ${data.sessionType}</p>
                <p><strong>Date:</strong> ${new Date(data.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.sessionTime}</p>
                ${data.practitionerName ? `<p><strong>Practitioner:</strong> ${data.practitionerName}</p>` : ''}
                ${data.clientName ? `<p><strong>Client:</strong> ${data.clientName}</p>` : ''}
              </div>

              <div class="refund-info">
                <h3>Credit Refund</h3>
                <p><strong>Credits Refunded:</strong> ${data.refundAmount || 0} credits</p>
                <p>These credits have been refunded to your account balance and are available for future peer treatment bookings.</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/credits" class="cta-button">View Credit Balance</a>
                <a href="${baseUrl}/credits#peer-treatment" class="cta-button">Book Another Session</a>
              </div>

              <p>If you'd like to reschedule, you can book a new session with the same practitioner or choose a different one.</p>
            </div>
            <div class="footer">
              <p>This email was sent by Theramate</p>
              <p>If you have any questions, please contact us at support@theramate.co.uk</p>
            </div>
          </body>
          </html>
        `
      }

    default:
      throw new Error(`Unknown email type: ${emailType}`)
  }
}

