// Complete OAuth Flow Test Script
// Test the entire Google OAuth sign-up process to identify 500 errors

console.log('🔄 Starting Complete OAuth Flow Test...\n');

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://aikqnvltuwwgifuocvto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa3Fudmx0dXd3Z2lmdW9jdnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTk5NDgsImV4cCI6MjA3MTE5NTk0OH0.PJAKAkbAfp2PP4DXelMpIzhUZZUE5SVoKPzN0JJSRac';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
  }
});

async function testDatabaseSchema() {
  console.log('🗄️ Testing Database Schema...\n');
  
  try {
    // Test 1: Check users table structure
    console.log('1️⃣ Checking users table structure...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table query failed:', usersError);
      return;
    }
    
    console.log('✅ Users table accessible');
    if (users && users.length > 0) {
      const userColumns = Object.keys(users[0]);
      console.log('Available columns:', userColumns);
    }
    
    // Test 2: Check therapist_profiles table
    console.log('\n2️⃣ Checking therapist_profiles table...');
    
    const { data: therapistProfiles, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select('*')
      .limit(1);
    
    if (therapistError) {
      console.error('❌ Therapist profiles table query failed:', therapistError);
    } else {
      console.log('✅ Therapist profiles table accessible');
      if (therapistProfiles && therapistProfiles.length > 0) {
        const columns = Object.keys(therapistProfiles[0]);
        console.log('Available columns:', columns);
      }
    }
    
    // Test 3: Check client_profiles table
    console.log('\n3️⃣ Checking client_profiles table...');
    
    const { data: clientProfiles, error: clientError } = await supabase
      .from('client_profiles')
      .select('*')
      .limit(1);
    
    if (clientError) {
      console.error('❌ Client profiles table query failed:', clientError);
    } else {
      console.log('✅ Client profiles table accessible');
      if (clientProfiles && clientProfiles.length > 0) {
        const columns = Object.keys(clientProfiles[0]);
        console.log('Available columns:', columns);
      }
    }
    
  } catch (error) {
    console.error('💥 Database schema test failed:', error);
  }
}

async function testOAuthCallbackSimulation() {
  console.log('\n🔄 Testing OAuth Callback Simulation...\n');
  
  try {
    // Simulate what happens after OAuth redirect
    console.log('1️⃣ Simulating post-OAuth user creation...');
    
    // Test creating a user profile (this might be where the 500 error occurs)
    const testUserData = {
      email: 'test-oauth@example.com',
      user_metadata: {
        provider: 'google',
        full_name: 'Test OAuth User',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    };
    
    console.log('2️⃣ Testing user profile insertion...');
    
    // Try to insert into users table
    const { data: userInsert, error: userInsertError } = await supabase
      .from('users')
      .insert([testUserData])
      .select();
    
    if (userInsertError) {
      console.error('❌ User insertion failed:', userInsertError);
      console.error('Error details:', {
        message: userInsertError.message,
        code: userInsertError.code,
        details: userInsertError.details,
        hint: userInsertError.hint
      });
      
      // Check if it's a 500 error
      if (userInsertError.message && userInsertError.message.includes('500')) {
        console.error('🚨 DETECTED 500 ERROR in user creation!');
      }
    } else {
      console.log('✅ User insertion successful');
      console.log('Inserted user:', userInsert);
      
      // Clean up - delete the test user
      if (userInsert && userInsert[0]) {
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', userInsert[0].id);
        
        if (deleteError) {
          console.error('⚠️ Failed to clean up test user:', deleteError);
        } else {
          console.log('✅ Test user cleaned up');
        }
      }
    }
    
  } catch (error) {
    console.error('💥 OAuth callback simulation failed:', error);
  }
}

async function testEdgeFunctionEndpoints() {
  console.log('\n⚡ Testing Edge Function Endpoints...\n');
  
  try {
    // Test 1: Check if edge functions are accessible
    console.log('1️⃣ Testing edge function accessibility...');
    
    const edgeFunctions = [
      'stripe-payment',
      'check-subscription',
      'create-checkout',
      'customer-portal'
    ];
    
    for (const funcName of edgeFunctions) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${funcName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'test' })
        });
        
        if (response.ok) {
          console.log(`✅ ${funcName}: Accessible`);
        } else {
          console.log(`⚠️ ${funcName}: Status ${response.status}`);
          if (response.status === 500) {
            console.error(`🚨 500 ERROR detected in ${funcName}!`);
          }
        }
      } catch (error) {
        console.log(`❌ ${funcName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Edge function test failed:', error);
  }
}

async function testAuthEndpoints() {
  console.log('\n🔐 Testing Auth Endpoints...\n');
  
  try {
    // Test 1: Check auth health
    console.log('1️⃣ Testing auth service health...');
    
    const authEndpoints = [
      '/auth/v1/health',
      '/auth/v1/settings',
      '/auth/v1/providers'
    ];
    
    for (const endpoint of authEndpoints) {
      try {
        const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          console.log(`✅ ${endpoint}: Healthy`);
        } else {
          console.log(`⚠️ ${endpoint}: Status ${response.status}`);
          if (response.status === 500) {
            console.error(`🚨 500 ERROR detected in ${endpoint}!`);
          }
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Auth endpoint test failed:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive OAuth flow tests...\n');
  
  try {
    await testDatabaseSchema();
    await testOAuthCallbackSimulation();
    await testEdgeFunctionEndpoints();
    await testAuthEndpoints();
    
    console.log('\n✅ All OAuth flow tests completed!');
    
  } catch (error) {
    console.error('\n💥 OAuth flow test suite failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(() => {
    console.log('\n🏁 OAuth flow test execution finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 OAuth flow test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testDatabaseSchema,
  testOAuthCallbackSimulation,
  testEdgeFunctionEndpoints,
  testAuthEndpoints,
  runAllTests
};
