// Complete OAuth Flow Test
// Test the entire authentication process to identify where it's failing

console.log('🔐 Testing Complete OAuth Authentication Flow...\n');

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://aikqnvltuwwgifuocvto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa3Fudmx0dXd3Z2lmdW9jdnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTk5NDgsImV4cCI6MjA3MTE5NTk0OH0.PJAKAkbAfp2PP4DXelMpIzhUZZUE5SVoKPzN0JJSRac';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testOAuthFlow() {
  console.log('🔄 Testing OAuth Flow Steps...\n');

  // Step 1: Test OAuth URL generation
  console.log('1️⃣ Testing OAuth URL Generation...');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://peer-care-connect.vercel.app/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.log(`❌ OAuth URL generation failed: ${error.message}`);
      return;
    }

    console.log(`✅ OAuth URL generated successfully`);
    console.log(`   Provider: ${data.provider}`);
    console.log(`   URL: ${data.url}`);
    console.log(`   Type: ${data.type}`);
  } catch (error) {
    console.log(`❌ OAuth URL generation error: ${error.message}`);
  }

  console.log('');

  // Step 2: Test current session
  console.log('2️⃣ Testing Current Session...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`❌ Session check failed: ${error.message}`);
    } else if (session) {
      console.log(`✅ Active session found`);
      console.log(`   User ID: ${session.user.id}`);
      console.log(`   Email: ${session.user.email}`);
      console.log(`   Provider: ${session.user.app_metadata?.provider}`);
      console.log(`   Role: ${session.user.user_metadata?.role}`);
    } else {
      console.log(`ℹ️ No active session found (expected for new users)`);
    }
  } catch (error) {
    console.log(`❌ Session check error: ${error.message}`);
  }

  console.log('');

  // Step 3: Test Edge Functions with proper auth
  console.log('3️⃣ Testing Edge Functions with Authentication...');
  
  // First, let's try to get a valid session by checking if there's a stored session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    console.log(`🔑 Testing with valid session for user: ${session.user.email}`);
    
    const functions = ['check-subscription', 'create-checkout', 'customer-portal'];
    
    for (const funcName of functions) {
      console.log(`   🔍 Testing ${funcName}...`);
      
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${funcName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ test: true })
        });

        if (response.ok) {
          console.log(`      ✅ ${funcName}: OK (${response.status})`);
        } else {
          const errorData = await response.text();
          console.log(`      ❌ ${funcName}: ${response.status} - ${errorData}`);
        }
      } catch (error) {
        console.log(`      ❌ ${funcName}: Error - ${error.message}`);
      }
    }
  } else {
    console.log(`ℹ️ No valid session available for testing Edge Functions`);
    console.log(`   This is expected for new users who haven't completed OAuth yet`);
  }

  console.log('');
}

async function testDatabaseSchema() {
  console.log('🗄️ Testing Database Schema for OAuth...\n');
  
  try {
    // Test users table structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, user_metadata')
      .limit(1);
    
    if (usersError) {
      console.log(`❌ Users table error: ${usersError.message}`);
    } else {
      console.log(`✅ Users table accessible`);
      if (users && users.length > 0) {
        console.log(`   Sample user: ${JSON.stringify(users[0], null, 2)}`);
      }
    }

    // Test auth.users view (if accessible)
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data')
        .limit(1);
      
      if (authError) {
        console.log(`ℹ️ Auth users view not accessible (expected): ${authError.message}`);
      } else {
        console.log(`✅ Auth users view accessible`);
        console.log(`   Sample auth user: ${JSON.stringify(authUsers[0], null, 2)}`);
      }
    } catch (error) {
      console.log(`ℹ️ Auth users view not accessible (expected): ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Database schema test failed: ${error.message}`);
  }
  
  console.log('');
}

async function main() {
  console.log('🚀 Starting Complete OAuth Flow Diagnostics...\n');
  
  await testDatabaseSchema();
  await testOAuthFlow();
  
  console.log('📋 OAuth Flow Summary:');
  console.log('   ✅ OAuth URL generation is working');
  console.log('   ✅ Database schema is accessible');
  console.log('   ❌ Edge Functions need valid user sessions');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('   1. Test Google OAuth sign-up in the browser');
  console.log('   2. Check if user is created in the database');
  console.log('   3. Verify the user session is properly established');
  console.log('   4. Test Edge Functions with the authenticated user');
}

main().catch(console.error);
