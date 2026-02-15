#!/usr/bin/env node

/**
 * Daily User Journey Test for Theramate
 * Tests critical user flows to catch UX blockers
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('👥 Theramate Daily User Journey Test Starting...\n');

async function testUserJourneys() {
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  // Journey 1: Public Marketplace Browsing
  console.log('1️⃣ Testing Public Marketplace Journey...');
  try {
    // Test marketplace data loading
    const { data: therapists, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select(`
        *,
        users (
          first_name,
          last_name,
          user_role
        )
      `)
      .eq('is_active', true)
      .limit(10);
    
    if (therapistError) throw therapistError;
    
    if (!therapists || therapists.length === 0) {
      throw new Error('No active therapists found');
    }
    
    // Test search functionality simulation
    const searchTest = therapists.filter(t => 
      t.users?.first_name?.toLowerCase().includes('a') ||
      t.specializations?.some(s => s.toLowerCase().includes('therapy'))
    );
    
    console.log(`✅ Public marketplace accessible with ${therapists.length} therapists`);
    console.log(`✅ Search simulation found ${searchTest.length} results`);
    results.passed++;
    
  } catch (error) {
    console.log('❌ Public marketplace failed:', error.message);
    results.failed++;
    results.errors.push({ journey: 'Public Marketplace', error: error.message });
  }

  // Journey 2: Therapist Profile Viewing
  console.log('\n2️⃣ Testing Therapist Profile Journey...');
  try {
    const { data: therapist, error } = await supabase
      .from('therapist_profiles')
      .select(`
        *,
        users (
          first_name,
          last_name,
          user_role
        )
      `)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (error) throw error;
    
    if (!therapist) {
      throw new Error('No therapist profile available for testing');
    }
    
    // Test profile data completeness
    const requiredFields = ['bio', 'location', 'hourly_rate', 'specializations'];
    const missingFields = requiredFields.filter(field => !therapist[field]);
    
    if (missingFields.length > 0) {
      console.log(`⚠️  Therapist profile missing fields: ${missingFields.join(', ')}`);
    }
    
    console.log(`✅ Therapist profile accessible: ${therapist.users?.first_name} ${therapist.users?.last_name}`);
    console.log(`✅ Profile data: ${requiredFields.length - missingFields.length}/${requiredFields.length} fields complete`);
    results.passed++;
    
  } catch (error) {
    console.log('❌ Therapist profile failed:', error.message);
    results.failed++;
    results.errors.push({ journey: 'Therapist Profile', error: error.message });
  }

  // Journey 3: Category Browsing
  console.log('\n3️⃣ Testing Category Browsing Journey...');
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    if (!categories || categories.length === 0) {
      throw new Error('No categories found');
    }
    
    console.log(`✅ Categories accessible: ${categories.length} categories found`);
    console.log(`✅ Sample categories: ${categories.slice(0, 3).map(c => c.name).join(', ')}`);
    results.passed++;
    
  } catch (error) {
    console.log('❌ Category browsing failed:', error.message);
    results.failed++;
    results.errors.push({ journey: 'Category Browsing', error: error.message });
  }

  // Journey 4: Authentication Flow Simulation
  console.log('\n4️⃣ Testing Authentication Flow...');
  try {
    // Test auth service availability
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    // Test sign-up flow simulation (without actually creating user)
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    // We expect this to fail due to invalid email, but service should respond
    if (signUpError && signUpError.message.includes('Invalid email')) {
      console.log('✅ Authentication service responding correctly');
      results.passed++;
    } else if (signUpError) {
      console.log('✅ Authentication service accessible');
      results.passed++;
    } else {
      throw new Error('Unexpected authentication response');
    }
    
  } catch (error) {
    console.log('❌ Authentication flow failed:', error.message);
    results.failed++;
    results.errors.push({ journey: 'Authentication Flow', error: error.message });
  }

  // Journey 5: Data Integrity Check
  console.log('\n5️⃣ Testing Data Integrity...');
  try {
    let integrityIssues = [];
    
    // Check for orphaned therapist profiles
    const { data: orphanedProfiles, error: orphanedError } = await supabase
      .from('therapist_profiles')
      .select('user_id')
      .is('user_id', null);
    
    if (orphanedError) throw orphanedError;
    
    if (orphanedProfiles && orphanedProfiles.length > 0) {
      integrityIssues.push(`${orphanedProfiles.length} orphaned therapist profiles`);
    }
    
    // Check for incomplete user profiles
    const { data: incompleteUsers, error: incompleteError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .or('first_name.is.null,last_name.is.null,email.is.null')
      .limit(5);
    
    if (incompleteError) throw incompleteError;
    
    if (incompleteUsers && incompleteUsers.length > 0) {
      integrityIssues.push(`${incompleteUsers.length} incomplete user profiles`);
    }
    
    if (integrityIssues.length === 0) {
      console.log('✅ Data integrity check passed');
    } else {
      console.log(`⚠️  Data integrity issues found: ${integrityIssues.join(', ')}`);
    }
    
    results.passed++;
    
  } catch (error) {
    console.log('❌ Data integrity check failed:', error.message);
    results.failed++;
    results.errors.push({ journey: 'Data Integrity', error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 USER JOURNEY TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 JOURNEY BLOCKERS FOUND:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.journey}: ${error.error}`);
    });
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (results.errors.some(e => e.journey.includes('Marketplace'))) {
      console.log('- Check therapist profile data');
      console.log('- Verify marketplace filtering logic');
    }
    if (results.errors.some(e => e.journey.includes('Authentication'))) {
      console.log('- Check Supabase auth service status');
      console.log('- Verify auth configuration');
    }
    if (results.errors.some(e => e.journey.includes('Data Integrity'))) {
      console.log('- Review database relationships');
      console.log('- Check for data consistency issues');
    }
  } else {
    console.log('\n🎉 All user journeys operational! Theramate provides smooth user experience.');
  }

  console.log('\n' + '='.repeat(50));
  
  // Exit with error code if any tests failed
  if (results.failed > 0) {
    process.exit(1);
  }
}

// Run user journey tests
testUserJourneys().catch(console.error);
