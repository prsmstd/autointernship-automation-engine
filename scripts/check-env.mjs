#!/usr/bin/env node
// Frontend Debugging Agent - Environment Validator
// Validates required environment variables at startup

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Environment Check - Frontend Debugging Agent');
console.log('================================================');

// Required environment variables
const requiredEnvs = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXTAUTH_SECRET'
];

// Optional but recommended
const optionalEnvs = [
  'NEXTAUTH_URL',
  'GOOGLE_AI_API_KEY',
  'RAZORPAY_KEY_ID',
  'RESEND_API_KEY',
  'TEST_EMAIL',
  'TEST_PASSWORD'
];

// Test-specific variables
const testEnvs = [
  'TEST_EMAIL',
  'TEST_PASSWORD',
  'PORT'
];

let hasErrors = false;
let hasWarnings = false;

console.log('📋 Checking required environment variables...\n');

// Check required variables
requiredEnvs.forEach(env => {
  const value = process.env[env];
  if (!value) {
    console.log(`❌ Missing required: ${env}`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('your-')) {
    console.log(`⚠️  Placeholder value: ${env} (contains 'your_' or 'your-')`);
    hasWarnings = true;
  } else {
    console.log(`✅ Found: ${env} (${value.length} chars)`);
  }
});

console.log('\n📋 Checking optional environment variables...\n');

// Check optional variables
optionalEnvs.forEach(env => {
  const value = process.env[env];
  if (!value) {
    console.log(`⚠️  Optional missing: ${env} (will use mock/default)`);
    hasWarnings = true;
  } else if (value.includes('your_') || value.includes('your-')) {
    console.log(`⚠️  Placeholder value: ${env} (contains 'your_' or 'your-')`);
    hasWarnings = true;
  } else {
    console.log(`✅ Found: ${env}`);
  }
});

console.log('\n📋 Checking test-specific variables...\n');

// Check test variables
testEnvs.forEach(env => {
  const value = process.env[env];
  if (!value) {
    if (env === 'TEST_EMAIL') {
      console.log(`⚠️  ${env} not set, using default: admin@prismstudio.co.in`);
    } else if (env === 'TEST_PASSWORD') {
      console.log(`⚠️  ${env} not set, using default: Admin@123`);
    } else if (env === 'PORT') {
      console.log(`⚠️  ${env} not set, using default: 3000`);
    }
  } else {
    console.log(`✅ Found: ${env} = ${value}`);
  }
});

// Check .env.local file
console.log('\n📋 Checking .env.local file...\n');

try {
  const envLocalPath = join(dirname(__dirname), '.env.local');
  const envLocal = readFileSync(envLocalPath, 'utf8');
  
  console.log('✅ .env.local file exists');
  
  // Check for common issues
  if (envLocal.includes('your_supabase_url')) {
    console.log('⚠️  .env.local contains placeholder values');
    hasWarnings = true;
  }
  
  if (envLocal.includes('NEXTAUTH_SECRET=your-super-secret')) {
    console.log('⚠️  NEXTAUTH_SECRET is using placeholder value');
    hasWarnings = true;
  }
  
} catch (error) {
  console.log('❌ .env.local file not found');
  hasErrors = true;
}

// Database connection test
console.log('\n📋 Testing Supabase connection...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_')) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
    } else {
      console.log(`⚠️  Supabase connection failed: ${response.status}`);
      hasWarnings = true;
    }
  } catch (error) {
    console.log(`⚠️  Supabase connection error: ${error.message}`);
    hasWarnings = true;
  }
} else {
  console.log('⚠️  Skipping Supabase connection test (missing/placeholder values)');
  hasWarnings = true;
}

// Summary
console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ Environment check FAILED');
  console.log('   Fix the missing required variables before running tests');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Environment check PASSED with warnings');
  console.log('   Some optional features may not work correctly');
  console.log('   Tests will continue with mock/default values');
} else {
  console.log('✅ Environment check PASSED');
  console.log('   All required variables are properly configured');
}

console.log('\n🚀 Ready for testing!');

// Export configuration for tests
const config = {
  hasErrors,
  hasWarnings,
  testEmail: process.env.TEST_EMAIL || 'admin@prismstudio.co.in',
  testPassword: process.env.TEST_PASSWORD || 'Admin@123',
  port: process.env.PORT || '3000',
  supabaseConfigured: !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('your_'))
};

console.log('\n📊 Test Configuration:');
console.log(JSON.stringify(config, null, 2));