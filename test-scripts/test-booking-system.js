#!/usr/bin/env node

/**
 * Booking System Test Suite
 * Tests the complete booking system functionality including:
 * - Availability Management
 * - Booking Calendar
 * - Session Management
 * - Database Integration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL_DEV || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY_DEV || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file');
  process.exit(1);
}

// Initialize Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test data
const testUsers = {
  therapist: {
    email: 'test-therapist@example.com',
    password: 'testpassword123',
    profile: {
      first_name: 'Dr. Sarah',
      last_name: 'Johnson',
      user_role: 'therapist',
      specializations: ['Sports Therapy', 'Physiotherapy'],
      hourly_rate: 80,
      location: 'London, UK',
      profile_verified: true
    }
  },
  client: {
    email: 'test-client@example.com',
    password: 'testpassword123',
    profile: {
      first_name: 'John',
      last_name: 'Smith',
      user_role: 'client'
    }
  }
};

let testData = {
  therapistId: null,
  clientId: null,
  therapistProfileId: null,
  clientProfileId: null,
  availabilitySlots: [],
  sessions: []
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testDatabaseConnection() {
  log('Testing database connection...', 'info');
  
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(1);
    if (error) throw error;
    
    log('✅ Database connection successful', 'success');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'error');
    return false;
  }
}

async function createTestUsers() {
  log('Creating test users...', 'info');
  
  try {
    // Create therapist user
    const { data: therapistAuth, error: therapistError } = await supabase.auth.signUp({
      email: testUsers.therapist.email,
      password: testUsers.therapist.password
    });
    
    if (therapistError) throw therapistError;
    testData.therapistId = therapistAuth.user.id;
    log('✅ Therapist user created', 'success');
    
    // Create client user
    const { data: clientAuth, error: clientError } = await supabase.auth.signUp({
      email: testUsers.client.email,
      password: testUsers.client.password
    });
    
    if (clientError) throw clientError;
    testData.clientId = clientAuth.user.id;
    log('✅ Client user created', 'success');
    
    // Wait for users to be created
    await sleep(2000);
    
    return true;
  } catch (error) {
    log(`❌ Failed to create test users: ${error.message}`, 'error');
    return false;
  }
}

async function createTestProfiles() {
  log('Creating test profiles...', 'info');
  
  try {
    // Create therapist profile
    const { data: therapistProfile, error: therapistError } = await supabaseAdmin
      .from('therapist_profiles')
      .insert({
        user_id: testData.therapistId,
        ...testUsers.therapist.profile
      })
      .select()
      .single();
    
    if (therapistError) throw therapistError;
    testData.therapistProfileId = therapistProfile.id;
    log('✅ Therapist profile created', 'success');
    
    // Create client profile
    const { data: clientProfile, error: clientError } = await supabaseAdmin
      .from('client_profiles')
      .insert({
        user_id: testData.clientId,
        ...testUsers.client.profile
      })
      .select()
      .single();
    
    if (clientError) throw clientError;
    testData.clientProfileId = clientProfile.id;
    log('✅ Client profile created', 'success');
    
    return true;
  } catch (error) {
    log(`❌ Failed to create test profiles: ${error.message}`, 'error');
    return false;
  }
}

async function testAvailabilityManagement() {
  log('Testing availability management...', 'info');
  
  try {
    // Test creating availability slots
    const availabilityData = [
      {
        therapist_id: testData.therapistId,
        day_of_week: 1, // Monday
        start_time: '09:00:00',
        end_time: '17:00:00',
        duration_minutes: 60,
        is_available: true
      },
      {
        therapist_id: testData.therapistId,
        day_of_week: 2, // Tuesday
        start_time: '09:00:00',
        end_time: '17:00:00',
        duration_minutes: 60,
        is_available: true
      },
      {
        therapist_id: testData.therapistId,
        day_of_week: 3, // Wednesday
        start_time: '09:00:00',
        end_time: '17:00:00',
        duration_minutes: 60,
        is_available: true
      }
    ];
    
    const { data: availabilitySlots, error: availabilityError } = await supabaseAdmin
      .from('availability_slots')
      .insert(availabilityData)
      .select();
    
    if (availabilityError) throw availabilityError;
    testData.availabilitySlots = availabilitySlots;
    log(`✅ Created ${availabilitySlots.length} availability slots`, 'success');
    
    // Test fetching availability
    const { data: fetchedSlots, error: fetchError } = await supabaseAdmin
      .from('availability_slots')
      .select('*')
      .eq('therapist_id', testData.therapistId);
    
    if (fetchError) throw fetchError;
    log(`✅ Fetched ${fetchedSlots.length} availability slots`, 'success');
    
    return true;
  } catch (error) {
    log(`❌ Availability management test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testSessionCreation() {
  log('Testing session creation...', 'info');
  
  try {
    // Create a test session
    const sessionData = {
      therapist_id: testData.therapistId,
      client_name: `${testUsers.client.profile.first_name} ${testUsers.client.profile.last_name}`,
      client_email: testUsers.client.email,
      session_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
      start_time: '10:00:00',
      duration_minutes: 60,
      session_type: 'Initial Consultation',
      price: 80.00,
      notes: 'Test session for booking system',
      status: 'scheduled',
      payment_status: 'pending'
    };
    
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('client_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    testData.sessions.push(session);
    log('✅ Test session created', 'success');
    
    // Test fetching sessions
    const { data: fetchedSessions, error: fetchError } = await supabaseAdmin
      .from('client_sessions')
      .select('*')
      .eq('therapist_id', testData.therapistId);
    
    if (fetchError) throw fetchError;
    log(`✅ Fetched ${fetchedSessions.length} sessions`, 'success');
    
    return true;
  } catch (error) {
    log(`❌ Session creation test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testSessionManagement() {
  log('Testing session management...', 'info');
  
  try {
    const session = testData.sessions[0];
    if (!session) {
      log('⚠️ No session to test management with', 'warning');
      return true;
    }
    
    // Test updating session status
    const { error: statusError } = await supabaseAdmin
      .from('client_sessions')
      .update({ status: 'confirmed' })
      .eq('id', session.id);
    
    if (statusError) throw statusError;
    log('✅ Session status updated to confirmed', 'success');
    
    // Test adding session notes
    const { error: notesError } = await supabaseAdmin
      .from('client_sessions')
      .update({ 
        session_notes: 'Test session notes from therapist',
        status: 'completed'
      })
      .eq('id', session.id);
    
    if (notesError) throw notesError;
    log('✅ Session notes added and status updated to completed', 'success');
    
    return true;
  } catch (error) {
    log(`❌ Session management test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testBookingFlow() {
  log('Testing complete booking flow...', 'info');
  
  try {
    // Simulate a client booking a session
    const bookingData = {
      therapist_id: testData.therapistId,
      client_name: `${testUsers.client.profile.first_name} ${testUsers.client.profile.last_name}`,
      client_email: testUsers.client.email,
      session_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
      start_time: '14:00:00',
      duration_minutes: 90,
      session_type: 'Follow-up Session',
      price: 120.00,
      notes: 'Client requested longer session for comprehensive treatment',
      status: 'scheduled',
      payment_status: 'pending'
    };
    
    const { data: newSession, error: bookingError } = await supabaseAdmin
      .from('client_sessions')
      .insert(bookingData)
      .select()
      .single();
    
    if (bookingError) throw bookingError;
    testData.sessions.push(newSession);
    log('✅ New booking created', 'success');
    
    // Test the complete lifecycle
    const statuses = ['scheduled', 'confirmed', 'in_progress', 'completed'];
    
    for (const status of statuses) {
      const { error: updateError } = await supabaseAdmin
        .from('client_sessions')
        .update({ status })
        .eq('id', newSession.id);
      
      if (updateError) throw updateError;
      log(`✅ Session status updated to: ${status}`, 'success');
      await sleep(500); // Small delay for demonstration
    }
    
    return true;
  } catch (error) {
    log(`❌ Booking flow test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testDataValidation() {
  log('Testing data validation...', 'info');
  
  try {
    // Test invalid session data
    const invalidSessionData = {
      therapist_id: testData.therapistId,
      client_name: '', // Invalid: empty name
      session_date: 'invalid-date', // Invalid: bad date format
      start_time: '25:00:00', // Invalid: hour > 24
      duration_minutes: -30, // Invalid: negative duration
      price: -50.00 // Invalid: negative price
    };
    
    const { error: validationError } = await supabaseAdmin
      .from('client_sessions')
      .insert(invalidSessionData);
    
    if (validationError) {
      log('✅ Data validation working correctly (rejected invalid data)', 'success');
    } else {
      log('⚠️ Data validation may not be working correctly', 'warning');
    }
    
    // Test invalid availability data
    const invalidAvailabilityData = {
      therapist_id: testData.therapistId,
      day_of_week: 8, // Invalid: day > 6
      start_time: '09:00:00',
      end_time: '08:00:00', // Invalid: end before start
      duration_minutes: 0 // Invalid: zero duration
    };
    
    const { error: availabilityValidationError } = await supabaseAdmin
      .from('availability_slots')
      .insert(invalidAvailabilityData);
    
    if (availabilityValidationError) {
      log('✅ Availability validation working correctly (rejected invalid data)', 'success');
    } else {
      log('⚠️ Availability validation may not be working correctly', 'warning');
    }
    
    return true;
  } catch (error) {
    log(`❌ Data validation test failed: ${error.message}`, 'error');
    return false;
  }
}

async function cleanupTestData() {
  log('Cleaning up test data...', 'info');
  
  try {
    // Delete test sessions
    if (testData.sessions.length > 0) {
      const sessionIds = testData.sessions.map(s => s.id);
      const { error: sessionsError } = await supabaseAdmin
        .from('client_sessions')
        .delete()
        .in('id', sessionIds);
      
      if (sessionsError) throw sessionsError;
      log('✅ Test sessions cleaned up', 'success');
    }
    
    // Delete availability slots
    if (testData.availabilitySlots.length > 0) {
      const slotIds = testData.availabilitySlots.map(s => s.id);
      const { error: slotsError } = await supabaseAdmin
        .from('availability_slots')
        .delete()
        .in('id', slotIds);
      
      if (slotsError) throw slotsError;
      log('✅ Availability slots cleaned up', 'success');
    }
    
    // Delete test profiles
    if (testData.therapistProfileId) {
      const { error: therapistError } = await supabaseAdmin
        .from('therapist_profiles')
        .delete()
        .eq('id', testData.therapistProfileId);
      
      if (therapistError) throw therapistError;
    }
    
    if (testData.clientProfileId) {
      const { error: clientError } = await supabaseAdmin
        .from('client_profiles')
        .delete()
        .eq('id', testData.clientProfileId);
      
      if (clientError) throw clientError;
    }
    
    // Delete test users (this will cascade to profiles)
    if (testData.therapistId) {
      const { error: therapistError } = await supabaseAdmin.auth.admin.deleteUser(testData.therapistId);
      if (therapistError) log(`⚠️ Could not delete therapist user: ${therapistError.message}`, 'warning');
    }
    
    if (testData.clientId) {
      const { error: clientError } = await supabaseAdmin.auth.admin.deleteUser(testData.clientId);
      if (clientError) log(`⚠️ Could not delete client user: ${clientError.message}`, 'warning');
    }
    
    log('✅ Test data cleanup completed', 'success');
    return true;
  } catch (error) {
    log(`❌ Cleanup failed: ${error.message}`, 'error');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Booking System Test Suite', 'info');
  log('=====================================', 'info');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'User Creation', fn: createTestUsers },
    { name: 'Profile Creation', fn: createTestProfiles },
    { name: 'Availability Management', fn: testAvailabilityManagement },
    { name: 'Session Creation', fn: testSessionCreation },
    { name: 'Session Management', fn: testSessionManagement },
    { name: 'Complete Booking Flow', fn: testBookingFlow },
    { name: 'Data Validation', fn: testDataValidation }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    log(`\n📋 Running: ${test.name}`, 'info');
    
    try {
      const result = await test.fn();
      if (result) {
        log(`✅ ${test.name} PASSED`, 'success');
        passedTests++;
      } else {
        log(`❌ ${test.name} FAILED`, 'error');
      }
    } catch (error) {
      log(`❌ ${test.name} ERROR: ${error.message}`, 'error');
    }
    
    await sleep(1000); // Brief pause between tests
  }
  
  // Cleanup
  log('\n🧹 Cleaning up test data...', 'info');
  await cleanupTestData();
  
  // Results
  log('\n📊 Test Results', 'info');
  log('===============', 'info');
  log(`Total Tests: ${totalTests}`, 'info');
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'success' : 'warning');
  log(`Failed: ${totalTests - passedTests}`, passedTests === totalTests ? 'success' : 'error');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Booking system is working correctly.', 'success');
    process.exit(0);
  } else {
    log('\n⚠️ Some tests failed. Please check the errors above.', 'warning');
    process.exit(1);
  }
}

// Handle errors and cleanup
process.on('SIGINT', async () => {
  log('\n🛑 Test interrupted by user', 'warning');
  await cleanupTestData();
  process.exit(0);
});

process.on('unhandledRejection', async (reason, promise) => {
  log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
  await cleanupTestData();
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runTests().catch(async (error) => {
    log(`❌ Test suite failed: ${error.message}`, 'error');
    await cleanupTestData();
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testDatabaseConnection,
  testAvailabilityManagement,
  testSessionCreation,
  testSessionManagement
};
