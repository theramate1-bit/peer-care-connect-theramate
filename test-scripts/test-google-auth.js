// Google OAuth Authentication Test Script
// Test Google sign-up and identify 500 errors

console.log('🔐 Starting Google OAuth Authentication Tests...\n');

// Import required modules
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Try to load environment variables from different possible locations
function loadEnvVars() {
  const possiblePaths = [
    '../.env',
    '../.env.local',
    '../.env.production',
    '../.env.development'
  ];
  
  for (const envPath of possiblePaths) {
    const fullPath = path.join(__dirname, envPath);
    if (fs.existsSync(fullPath)) {
      console.log(`📁 Loading environment from: ${envPath}`);
      require('dotenv').config({ path: fullPath });
      break;
    }
  }
}

loadEnvVars();

// Configuration - use hardcoded values if env vars not found
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    'https://aikqnvltuwwgifuocvto.supabase.co';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase anonymous key');
  console.error('Please set VITE_SUPABASE_ANON_KEY in your .env file');
  console.error('Or provide it as an environment variable');
  process.exit(1);
}

console.log('🔧 Configuration:');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
  }
});

// Test Functions
async function testGoogleOAuthSignUp() {
  console.log('\n🔍 Testing Google OAuth Sign-Up...\n');
  
  try {
    // Test 1: Check if Google provider is configured
    console.log('1️⃣ Checking Google provider configuration...');
    
    try {
      const { data: providers, error: providersError } = await supabase.auth.listIdentities();
      
      if (providersError) {
        console.error('❌ Error checking providers:', providersError);
      } else {
        console.log('✅ Providers check completed');
        console.log('Available providers:', providers);
      }
    } catch (error) {
      console.error('❌ Providers check failed:', error.message);
    }
    
    // Test 2: Test OAuth URL generation
    console.log('\n2️⃣ Testing OAuth URL generation...');
    
    try {
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (oauthError) {
        console.error('❌ OAuth URL generation failed:', oauthError);
        console.error('Error details:', {
          message: oauthError.message,
          status: oauthError.status,
          name: oauthError.name
        });
        
        // Check if it's a 500 error
        if (oauthError.message && oauthError.message.includes('500')) {
          console.error('🚨 DETECTED 500 ERROR!');
          console.error('This suggests a server-side issue with Google OAuth configuration');
        }
        
        // Check for specific error types
        if (oauthError.message && oauthError.message.includes('redirect_uri_mismatch')) {
          console.error('🚨 REDIRECT URI MISMATCH ERROR!');
          console.error('This suggests the redirect URL in Google OAuth config doesn\'t match');
        }
        
      } else {
        console.log('✅ OAuth URL generated successfully');
        console.log('Provider:', oauthData.provider);
        console.log('URL:', oauthData.url);
      }
    } catch (error) {
      console.error('❌ OAuth test failed with exception:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    
    // Test 3: Check current session
    console.log('\n3️⃣ Checking current session...');
    
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session check failed:', sessionError);
      } else {
        console.log('✅ Session check completed');
        console.log('Has session:', !!session.session);
        if (session.session) {
          console.log('User ID:', session.session.user.id);
          console.log('Email:', session.session.user.email);
        }
      }
    } catch (error) {
      console.error('❌ Session check failed:', error.message);
    }
    
    // Test 4: Check auth state
    console.log('\n4️⃣ Checking auth state...');
    
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User check failed:', userError);
      } else {
        console.log('✅ User check completed');
        console.log('Authenticated:', !!user.user);
        if (user.user) {
          console.log('User ID:', user.user.id);
          console.log('Email:', user.user.email);
          console.log('Role:', user.user.user_metadata?.role);
        }
      }
    } catch (error) {
      console.error('❌ User check failed:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during Google OAuth test:', error);
    console.error('Error stack:', error.stack);
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️ Testing Database Connection...\n');
  
  try {
    // Test basic database connection
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Database connection successful');
      console.log('Users count:', data?.length || 0);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during database test:', error);
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔧 Testing Environment Variables...\n');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  console.log('Required environment variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? `${value.substring(0, 20)}...` : 'NOT SET';
    console.log(`${status} ${varName}: ${displayValue}`);
  });
  
  // Check for Google OAuth specific variables
  const googleVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  console.log('\nGoogle OAuth variables (if applicable):');
  googleVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? `${value.substring(0, 20)}...` : 'NOT SET';
    console.log(`${status} ${varName}: ${displayValue}`);
  });
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive Google OAuth tests...\n');
  
  try {
    await testEnvironmentVariables();
    await testDatabaseConnection();
    await testGoogleOAuthSignUp();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(() => {
    console.log('\n🏁 Test execution finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testGoogleOAuthSignUp,
  testDatabaseConnection,
  testEnvironmentVariables,
  runAllTests
};
