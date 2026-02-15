#!/usr/bin/env node

/**
 * Daily Health Check for Theramate
 * Run this script daily to catch potential blockers early
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🏥 Theramate Daily Health Check Starting...\n');

async function runHealthChecks() {
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  // Test 1: Database Connection
  console.log('1️⃣ Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
    results.passed++;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    results.failed++;
    results.errors.push({ test: 'Database Connection', error: error.message });
  }

  // Test 2: Edge Functions Health
  console.log('\n2️⃣ Testing Edge Functions...');
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/check-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ user_id: 'test' })
    });
    
    if (response.ok) {
      console.log('✅ Edge Functions responding');
      results.passed++;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Edge Functions failed:', error.message);
    results.failed++;
    results.errors.push({ test: 'Edge Functions', error: error.message });
  }

  // Test 3: Authentication Flow
  console.log('\n3️⃣ Testing Authentication...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Authentication service accessible');
    results.passed++;
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    results.failed++;
    results.errors.push({ test: 'Authentication', error: error.message });
  }

  // Test 4: Core Tables Access
  console.log('\n4️⃣ Testing Core Tables...');
  const tables = ['users', 'therapist_profiles', 'categories'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) throw error;
      console.log(`✅ ${table} table accessible`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ${table} table failed:`, error.message);
      results.failed++;
      results.errors.push({ test: `${table} Table`, error: error.message });
    }
  }

  // Test 5: Public Marketplace Data
  console.log('\n5️⃣ Testing Public Marketplace Data...');
  try {
    const { data: therapists, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (therapistError) throw therapistError;
    
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoryError) throw categoryError;
    
    console.log(`✅ Marketplace data accessible (${therapists?.length || 0} therapists, ${categories?.length || 0} categories)`);
    results.passed++;
  } catch (error) {
    console.log('❌ Marketplace data failed:', error.message);
    results.failed++;
    results.errors.push({ test: 'Marketplace Data', error: error.message });
  }

  // Test 6: Environment Variables Check
  console.log('\n6️⃣ Checking Environment Variables...');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_PROJECT_ID'
  ];
  
  let envVarsOk = true;
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.log(`❌ Missing: ${varName}`);
      envVarsOk = false;
    }
  }
  
  if (envVarsOk) {
    console.log('✅ All required environment variables present');
    results.passed++;
  } else {
    console.log('❌ Missing environment variables');
    results.failed++;
    results.errors.push({ test: 'Environment Variables', error: 'Missing required variables' });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 ERRORS FOUND:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (results.errors.some(e => e.test.includes('Database'))) {
      console.log('- Check Supabase project status');
      console.log('- Verify database connection');
    }
    if (results.errors.some(e => e.test.includes('Edge Functions'))) {
      console.log('- Check Edge Functions deployment');
      console.log('- Verify environment variables in Supabase');
    }
    if (results.errors.some(e => e.test.includes('Environment'))) {
      console.log('- Update .env file with missing variables');
      console.log('- Restart development server');
    }
  } else {
    console.log('\n🎉 All systems operational! Theramate is ready for production.');
  }

  console.log('\n' + '='.repeat(50));
  
  // Exit with error code if any tests failed
  if (results.failed > 0) {
    process.exit(1);
  }
}

// Run health checks
runHealthChecks().catch(console.error);
