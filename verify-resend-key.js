// Verify Resend API Key directly
const API_KEY = 're_PtKC1CKr_Lt2ais9fSf729cJ2Vx7fTjtQ';

async function verifyResendKey() {
  console.log('🔑 Testing Resend API Key...\n');
  console.log('Key:', API_KEY.substring(0, 15) + '...\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Peer Care Connect <onboarding@resend.dev>',
        to: ['delivered@resend.dev'],
        subject: 'Test Email - API Key Verification',
        html: '<h1>Test</h1><p>This is a test email to verify the API key works.</p>'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ API KEY IS VALID!');
      console.log('Email ID:', data.id);
      console.log('\n✅ The API key works correctly.');
      console.log('✅ Once added to Supabase secrets, emails will work!');
    } else {
      console.log('❌ API KEY ERROR');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
      
      if (data.message) {
        console.log('\nError Message:', data.message);
      }
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

verifyResendKey();

