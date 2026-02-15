const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://aikqnvltuwwgifuocvto.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa3Fudmx0dXd3Z2lmdW9jdnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTk5NDgsImV4cCI6MjA3MTE5NTk0OH0.PJAKAkbAfp2PP4DXelMpIzhUZZUE5SVoKPzN0JJSRac';

console.log('🔧 Testing Edge Function Environment Variables');
console.log('=============================================');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Supabase Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('');

// Test Edge Functions to see what environment variables are available
async function testEdgeFunctions() {
  try {
    console.log('🧪 Testing Edge Functions for environment variable access...');
    
    // Test check-subscription function
    console.log('\n1️⃣ Testing check-subscription function...');
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    const result1 = await response1.text();
    console.log(`Status: ${response1.status}`);
    console.log(`Response: ${result1.substring(0, 200)}...`);
    
    // Test create-checkout function
    console.log('\n2️⃣ Testing create-checkout function...');
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    const result2 = await response2.text();
    console.log(`Status: ${response2.status}`);
    console.log(`Response: ${result2.substring(0, 200)}...`);
    
    // Test customer-portal function
    console.log('\n3️⃣ Testing customer-portal function...');
    const response3 = await fetch(`${SUPABASE_URL}/functions/v1/customer-portal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    const result3 = await response3.text();
    console.log(`Status: ${response3.status}`);
    console.log(`Response: ${result3.substring(0, 200)}...`);
    
  } catch (error) {
    console.error('❌ Error testing Edge Functions:', error.message);
  }
}

// Run the test
testEdgeFunctions();
