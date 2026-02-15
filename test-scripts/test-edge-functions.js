// Edge Functions Test Script
// Test the current status of Edge Functions and identify missing environment variables

console.log('🔧 Testing Edge Functions Status...\n');

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://aikqnvltuwwgifuocvto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa3Fudmx0dXd3Z2lmdW9jdnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTk5NDgsImV4cCI6MjA3MTE5NTk0OH0.PJAKAkbAfp2PP4DXelMpIzhUZZUE5SVoKPzN0JJSRac';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunctions() {
  console.log('📋 Testing Edge Functions...\n');

  const functions = [
    'check-subscription',
    'create-checkout', 
    'customer-portal',
    'stripe-payment',
    'stripe-webhook'
  ];

  for (const funcName of functions) {
    console.log(`🔍 Testing ${funcName}...`);
    
    try {
      // Test the function endpoint
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${funcName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ test: true })
      });

      if (response.ok) {
        console.log(`✅ ${funcName}: OK (${response.status})`);
      } else {
        const errorData = await response.text();
        console.log(`❌ ${funcName}: ${response.status} - ${errorData}`);
        
        // Check if it's an environment variable error
        if (errorData.includes('STRIPE_SECRET_KEY') || 
            errorData.includes('SUPABASE_SERVICE_ROLE_KEY') ||
            errorData.includes('SUPABASE_URL')) {
          console.log(`   🔧 Missing environment variable detected`);
        }
      }
    } catch (error) {
      console.log(`❌ ${funcName}: Error - ${error.message}`);
    }
    
    console.log('');
  }
}

async function testDatabaseConnection() {
  console.log('🗄️ Testing Database Connection...\n');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (error) {
      console.log(`❌ Database error: ${error.message}`);
    } else {
      console.log(`✅ Database connection successful`);
      console.log(`   Users table accessible: ${data ? 'Yes' : 'No'}`);
    }
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
  }
  
  console.log('');
}

async function main() {
  console.log('🚀 Starting Edge Functions Diagnostics...\n');
  
  await testDatabaseConnection();
  await testEdgeFunctions();
  
  console.log('📋 Summary of Required Environment Variables:');
  console.log('   • STRIPE_SECRET_KEY - Your Stripe secret key');
  console.log('   • SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key');
  console.log('   • SUPABASE_URL - Your Supabase project URL');
  console.log('   • SUPABASE_ANON_KEY - Your Supabase anon key');
  console.log('');
  console.log('🔧 To fix the 500 errors:');
  console.log('   1. Go to your Supabase Dashboard');
  console.log('   2. Navigate to Settings > Edge Functions');
  console.log('   3. Add the missing environment variables');
  console.log('   4. Redeploy the Edge Functions');
}

main().catch(console.error);
