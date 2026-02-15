/**
 * Check Stripe Connect account status for a specific user
 * Usage: node check-stripe-account-status.js
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://aikqnvltuwwgifuocvto.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// User email to check
const USER_EMAIL = 'rayman196823@googlemail.com';

async function checkAccountStatus() {
  try {
    // First, get the user ID from the email
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log(`\n🔍 Checking account status for: ${USER_EMAIL}\n`);

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_connect_account_id')
      .eq('email', USER_EMAIL)
      .maybeSingle();

    if (userError || !user) {
      console.error('❌ User not found:', userError?.message || 'No user found');
      return;
    }

    console.log('✅ User found:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Stripe Account ID: ${user.stripe_connect_account_id || 'None'}\n`);

    if (!user.stripe_connect_account_id) {
      console.log('⚠️  No Stripe Connect account found for this user');
      return;
    }

    // Check database status
    const { data: dbAccount, error: dbError } = await supabase
      .from('connect_accounts')
      .select('*')
      .eq('stripe_account_id', user.stripe_connect_account_id)
      .maybeSingle();

    console.log('📊 Database Status:');
    if (dbAccount) {
      console.log(`   Account Status: ${dbAccount.account_status}`);
      console.log(`   Charges Enabled: ${dbAccount.charges_enabled}`);
      console.log(`   Payouts Enabled: ${dbAccount.payouts_enabled}`);
      console.log(`   Details Submitted: ${dbAccount.details_submitted}`);
      console.log(`   Last Updated: ${dbAccount.updated_at}`);
    } else {
      console.log('   ⚠️  No database record found');
    }

    // Call the edge function to get actual Stripe status
    console.log('\n🔄 Fetching actual status from Stripe API...\n');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        action: 'get-connect-account-status',
        userId: user.id,
        account_id: user.stripe_connect_account_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error calling edge function:', response.status, errorText);
      return;
    }

    const statusData = await response.json();
    
    console.log('✅ Stripe API Status (Source of Truth):');
    console.log(`   Stripe Account ID: ${statusData.stripe_account_id}`);
    console.log(`   Status: ${statusData.status}`);
    console.log(`   Charges Enabled: ${statusData.chargesEnabled}`);
    console.log(`   Payouts Enabled: ${statusData.payoutsEnabled}`);
    console.log(`   Details Submitted: ${statusData.detailsSubmitted}`);
    console.log(`   Is Fully Onboarded: ${statusData.isFullyOnboarded ? '✅ YES' : '❌ NO'}`);
    
    if (statusData.requirementsCurrentlyDue && statusData.requirementsCurrentlyDue.length > 0) {
      console.log(`\n⚠️  Requirements Currently Due:`);
      statusData.requirementsCurrentlyDue.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req}`);
      });
    }

    // Compare database vs Stripe
    console.log('\n📋 Comparison:');
    if (dbAccount) {
      const dbComplete = dbAccount.charges_enabled && dbAccount.payouts_enabled && dbAccount.details_submitted;
      const stripeComplete = statusData.isFullyOnboarded;
      
      if (dbComplete !== stripeComplete) {
        console.log('   ⚠️  MISMATCH: Database and Stripe status differ!');
        console.log(`      Database says: ${dbComplete ? 'Complete' : 'Incomplete'}`);
        console.log(`      Stripe says: ${stripeComplete ? 'Complete' : 'Incomplete'}`);
        console.log('   → Database needs to be synced with Stripe');
      } else {
        console.log('   ✅ Database and Stripe status match');
      }
    }

    // Onboarding step assessment
    console.log('\n🎯 Onboarding Step Assessment:');
    if (statusData.isFullyOnboarded) {
      console.log('   ✅ Step 2 (Stripe Connect) is COMPLETE');
      console.log('   → User should be able to proceed to Step 3 (Subscription)');
    } else {
      console.log('   ⚠️  Step 2 (Stripe Connect) is INCOMPLETE');
      console.log('   → User is stuck on Step 2 and needs to complete Stripe onboarding');
      
      if (statusData.requirementsCurrentlyDue && statusData.requirementsCurrentlyDue.length > 0) {
        console.log('   → Missing requirements need to be completed in Stripe');
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAccountStatus();


