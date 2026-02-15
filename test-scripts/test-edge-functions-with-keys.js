const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://aikqnvltuwwgifuocvto.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa3Fudmx0dXd3Z2lmdW9jdnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTk5NDgsImV4cCI6MjA3MTE5NTk0OH0.PJAKAkbAfp2PP4DXelMpIzhUZZUE5SVoKPzN0JJSRac';

console.log('🔧 Testing Edge Functions with Environment Variables');
console.log('==================================================');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Supabase Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('');

// Check if required environment variables are set
const requiredVars = [
  'STRIPE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('📋 Checking Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== `your_${varName.toLowerCase().replace(/_/g, '_')}_here`) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});
console.log('');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunctions() {
  try {
    console.log('🚀 Testing Edge Functions...');
    
    // Test 1: Check subscription (should work with proper auth)
    console.log('\n1️⃣ Testing check-subscription...');
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({})
      });
      
      const result = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${result.substring(0, 200)}...`);
      
      if (response.status === 401) {
        console.log('ℹ️ Expected: Authentication required');
      } else if (response.status === 500) {
        console.log('❌ Server error - check environment variables');
      } else {
        console.log('✅ Function responding');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 2: Create checkout (should work with proper auth)
    console.log('\n2️⃣ Testing create-checkout...');
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          plan: 'basic',
          billing_cycle: 'monthly'
        })
      });
      
      const result = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${result.substring(0, 200)}...`);
      
      if (response.status === 401) {
        console.log('ℹ️ Expected: Authentication required');
      } else if (response.status === 500) {
        console.log('❌ Server error - check environment variables');
      } else {
        console.log('✅ Function responding');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    // Test 3: Customer portal (should work with proper auth)
    console.log('\n3️⃣ Testing customer-portal...');
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({})
      });
      
      const result = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${result.substring(0, 200)}...`);
      
      if (response.status === 401) {
        console.log('ℹ️ Expected: Authentication required');
      } else if (response.status === 500) {
        console.log('❌ Server error - check environment variables');
      } else {
        console.log('✅ Function responding');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n✅ Edge Function testing complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Set STRIPE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY in Supabase Dashboard');
    console.log('2. Test with a real authenticated user session');
    console.log('3. Deploy any updated Edge Functions');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testEdgeFunctions();
