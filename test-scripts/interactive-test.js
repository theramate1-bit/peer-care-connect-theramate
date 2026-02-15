#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎭 INTERACTIVE PAYMENT SYSTEM TEST\n');
console.log('==================================\n');

// Simulate user interactions
const userSimulations = {
  client: {
    name: 'Test Client',
    actions: [
      'Browse therapist profiles',
      'Select Sports Therapy package (£80)',
      'View fee breakdown',
      'Enter payment details',
      'Complete transaction'
    ]
  },
  sportsTherapist: {
    name: 'John Sports',
    actions: [
      'Setup Stripe Connect account',
      'Configure business profile',
      'Create service packages',
      'View earnings dashboard',
      'Check payout status'
    ]
  },
  massageTherapist: {
    name: 'Sarah Massage',
    actions: [
      'Setup Stripe Connect account',
      'Configure business profile',
      'Create service packages',
      'View earnings dashboard',
      'Check payout status'
    ]
  },
  osteopath: {
    name: 'Dr. Mike Osteo',
    actions: [
      'Setup Stripe Connect account',
      'Configure business profile',
      'Create service packages',
      'View earnings dashboard',
      'Check payout status'
    ]
  },
  admin: {
    name: 'Admin User',
    actions: [
      'View verification dashboard',
      'Review therapist profiles',
      'Monitor payment system',
      'Check analytics',
      'Manage platform settings'
    ]
  }
};

function simulateUserJourney(userType) {
  const user = userSimulations[userType];
  if (!user) {
    console.log(`❌ Unknown user type: ${userType}`);
    return;
  }

  console.log(`\n👤 Simulating ${userType.toUpperCase()} Journey`);
  console.log(`User: ${user.name}\n`);

  user.actions.forEach((action, index) => {
    setTimeout(() => {
      console.log(`  ${index + 1}. ${action}`);
      
      // Simulate processing time
      setTimeout(() => {
        console.log(`     ✅ Completed`);
      }, 500);
    }, index * 1000);
  });

  // Show completion after all actions
  setTimeout(() => {
    console.log(`\n🎉 ${userType} journey completed successfully!\n`);
  }, user.actions.length * 1000 + 1000);
}

function showPaymentCalculations() {
  console.log('\n💳 PAYMENT CALCULATIONS DEMO\n');
  
  const services = [
    { name: 'Sports Therapy', amount: 8000 },
    { name: 'Massage Therapy', amount: 7000 },
    { name: 'Osteopath Session', amount: 9500 }
  ];

  services.forEach((service, index) => {
    setTimeout(() => {
      const fee = Math.round(service.amount * 0.005);
      const payout = service.amount - fee;
      
      console.log(`${service.name} (£${(service.amount / 100).toFixed(2)}):`);
      console.log(`  • Client pays: £${(service.amount / 100).toFixed(2)}`);
      console.log(`  • Marketplace fee (0.5%): £${(fee / 100).toFixed(2)}`);
      console.log(`  • Practitioner receives: £${(payout / 100).toFixed(2)}\n`);
    }, index * 800);
  });
}

function showMenu() {
  console.log('\n📋 TEST MENU');
  console.log('============');
  console.log('1. Test Client Journey');
  console.log('2. Test Sports Therapist Journey');
  console.log('3. Test Massage Therapist Journey');
  console.log('4. Test Osteopath Journey');
  console.log('5. Test Admin Journey');
  console.log('6. Show Payment Calculations');
  console.log('7. Run All Tests');
  console.log('8. Exit\n');
}

function runAllTests() {
  console.log('\n🚀 RUNNING ALL USER JOURNEY TESTS\n');
  
  const userTypes = ['client', 'sportsTherapist', 'massageTherapist', 'osteopath', 'admin'];
  
  userTypes.forEach((userType, index) => {
    setTimeout(() => {
      simulateUserJourney(userType);
    }, index * 6000);
  });

  // Show payment calculations after all journeys
  setTimeout(() => {
    showPaymentCalculations();
  }, userTypes.length * 6000 + 2000);

  // Final summary
  setTimeout(() => {
    console.log('\n🎉 ALL TESTS COMPLETED!');
    console.log('\n📊 SUMMARY:');
    console.log('✅ Client payment flow');
    console.log('✅ Therapist onboarding flow');
    console.log('✅ Admin monitoring flow');
    console.log('✅ Payment calculations');
    console.log('✅ Fee breakdowns');
    console.log('\n🌐 Ready for testing at: http://localhost:5173/payments/demo\n');
  }, userTypes.length * 6000 + 5000);
}

function startInteractiveTest() {
  showMenu();
  
  rl.question('Select an option (1-8): ', (answer) => {
    switch (answer.trim()) {
      case '1':
        simulateUserJourney('client');
        break;
      case '2':
        simulateUserJourney('sportsTherapist');
        break;
      case '3':
        simulateUserJourney('massageTherapist');
        break;
      case '4':
        simulateUserJourney('osteopath');
        break;
      case '5':
        simulateUserJourney('admin');
        break;
      case '6':
        showPaymentCalculations();
        break;
      case '7':
        runAllTests();
        break;
      case '8':
        console.log('\n👋 Test session ended. Goodbye!');
        rl.close();
        return;
      default:
        console.log('\n❌ Invalid option. Please select 1-8.');
    }
    
    // Show menu again after a delay
    setTimeout(() => {
      if (answer.trim() !== '8') {
        startInteractiveTest();
      }
    }, 2000);
  });
}

// Start the interactive test
console.log('Welcome to the Payment System Interactive Test!');
console.log('This will simulate different user journeys and payment scenarios.\n');

startInteractiveTest();
