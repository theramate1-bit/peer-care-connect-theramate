#!/usr/bin/env node

// Quick Test Runner for Payment System
console.log('🚀 Starting Payment System Tests...\n');

// Import test functions
const { runAllTests } = require('./user-journey-tests.js');

// Run all tests
runAllTests();
