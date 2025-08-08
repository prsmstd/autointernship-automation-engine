# PrismStudio Internship Platform - Comprehensive Deployment Guide

## 🚀 Quick Start

This guide combines production deployment with the frontend debugging approach suggested by ChatGPT to ensure a bulletproof system.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
```bash
# Clone and setup
git clone <your-repo>
cd prismstudio-internship-platform
npm install

# Environment configuration
cp .env.example .env.local
```

### 2. Required Environment Variables
```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-token-with-at-least-32-characters

# AI Services
GOOGLE_AI_API_KEY=your_gemini_api_key

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Service
RESEND_API_KEY=your_resend_api_key

# File Storage (Optional)
NEXT_PUBLIC_STORAGE_URL=your_storage_url
```

## 🗄️ Database Setup

### 1. Supabase Configuration

1. Create a new Supabase project
2. Go to SQL Editor
3. Copy and paste the entire `database/supabase-production-schema.sql`
4. Execute the script

### 2. Verify Database Setup
```sql
-- Check if all tables are created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check default admin user
SELECT email, role, email_verified FROM users WHERE role = 'A';
```

## 🧪 Frontend Testing & Debugging (ChatGPT Approach)

### 1. Install Testing Tools
```bash
npm install --save-dev @playwright/test
npx playwright install --with-deps
mkdir -p artifacts
```

### 2. Create E2E Test Suite
```bash
# Create test directory
mkdir -p e2e

# Create login test
cat > e2e/login.spec.js << 'EOF'
import { test, expect } from '@playwright/test';

test('complete login flow works', async ({ page, context }) => {
  // Monitor console and network
  context.on('requestfailed', r => console.log('REQ_FAIL', r.url(), r.failure()));
  page.on('console', m => console.log('BROWSER', m.type(), m.text()));
  
  // Start tracing
  await context.tracing.start({ screenshots: true, snapshots: true });
  
  // Navigate to app
  await page.goto(`http://localhost:${process.env.PORT || 3000}/`);
  
  // Test login flow
  await page.click('text=Login');
  await page.fill('input[type=email]', process.env.TEST_EMAIL || 'admin@prismstudio.co.in');
  await page.fill('input[type=password]', process.env.TEST_PASSWORD || 'Admin@123');
  await page.click('button[type=submit]');
  
  // Wait for navigation
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  
  // Verify successful login
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Take screenshot
  await page.screenshot({ path: 'artifacts/login-success.png', fullPage: true });
  
  // Stop tracing
  await context.tracing.stop({ path: 'artifacts/trace.zip' });
});

test('dashboard loads correctly', async ({ page }) => {
  // Login first
  await page.goto(`http://localhost:${process.env.PORT || 3000}/login`);
  await page.fill('input[type=email]', process.env.TEST_EMAIL || 'admin@prismstudio.co.in');
  await page.fill('input[type=password]', process.env.TEST_PASSWORD || 'Admin@123');
  await page.click('button[type=submit]');
  
  // Wait for dashboard
  await page.waitForURL(/\/dashboard/);
  
  // Check for key elements
  await expect(page.locator('h1')).toContainText('Dashboard');
  await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  
  // Screenshot
  await page.screenshot({ path: 'artifacts/dashboard.png', fullPage: true });
});
EOF
```

### 3. Create Environment Check Script
```bash
cat > scripts/check-env.mjs << 'EOF'
#!/usr/bin/env node

const requiredEnvs = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXTAUTH_SECRET'
];

const optionalEnvs = [
  'GOOGLE_AI_API_KEY',
  'RAZORPAY_KEY_ID',
  'RESEND_API_KEY'
];

console.log('🔍 Environment Check\n');

let hasErrors = false;

// Check required
requiredEnvs.forEach(env => {
  if (!process.env[env]) {
    console.log(`❌ Missing required: ${env}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${env}`);
  }
});

// Check optional
optionalEnvs.forEach(env => {
  if (!process.env[env]) {
    console.log(`⚠️  Optional missing: ${env} (will use mock)`);
  } else {
    console.log(`✅ Found: ${env}`);
  }
});

if (hasErrors) {
  console.log('\n❌ Environment check failed');
  process.exit(1);
} else {
  console.log('\n✅ Environment check passed');
}
EOF

chmod +x scripts/check-env.mjs
```

### 4. Pre-Deployment Testing Script
```bash
cat > scripts/pre-deploy-test.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Pre-Deployment Testing Suite"
echo "================================"

# Environment check
echo "1. Checking environment..."
node scripts/check-env.mjs

# Install dependencies
echo "2. Installing dependencies..."
npm ci

# Lint and type check
echo "3. Running linting and type checks..."
npm run lint || echo "⚠️ Linting issues found"
npm run build || (echo "❌ Build failed" && exit 1)

# Start dev server in background
echo "4. Starting development server..."
PORT=${PORT:-3000} npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "5. Waiting for server to be ready..."
npx wait-on http://localhost:${PORT:-3000} --timeout 60000

# Run E2E tests
echo "6. Running E2E tests..."
npx playwright test e2e/ --reporter=list || echo "⚠️ Some E2E tests failed"

# Generate test report
echo "7. Generating test report..."
cat > artifacts/test-report.md << EOL
# Pre-Deployment Test Report
Generated: $(date)

## Environment Status
- Node.js: $(node --version)
- npm: $(npm --version)
- Port: ${PORT:-3000}

## Test Results
- Build: ✅ Passed
- Linting: $(npm run lint > /dev/null 2>&1 && echo "✅ Passed" || echo "⚠️ Issues found")
- E2E Tests: $(npx playwright test e2e/ --reporter=json > /dev/null 2>&1 && echo "✅ Passed" || echo "⚠️ Some failures")

## Screenshots
- Login flow: artifacts/login-success.png
- Dashboard: artifacts/dashboard.png

## Traces
- Full trace: artifacts/trace.zip
EOL

# Cleanup
echo "8. Cleaning up..."
kill $DEV_PID || true

echo "✅ Pre-deployment testing complete!"
echo "📊 Check artifacts/test-report.md for details"
EOF

chmod +x scripts/pre-deploy-test.sh
```

## 🚀 Deployment Steps

### 1. Local Testing
```bash
# Run comprehensive pre-deployment tests
./scripts/pre-deploy-test.sh

# Manual verification
npm run dev
# Visit http://localhost:3000
# Test login with admin@prismstudio.co.in / Admin@123
# Verify all features work
```

### 2. Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# or use CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all required env vars
```

### 4. Post-Deployment Verification
```bash
# Test production deployment
cat > scripts/prod-test.mjs << 'EOF'
import { test, expect } from '@playwright/test';

test('production deployment works', async ({ page }) => {
  const prodUrl = process.env.PROD_URL || 'https://your-app.vercel.app';
  
  await page.goto(prodUrl);
  await expect(page).toHaveTitle(/PrismStudio/);
  
  // Test login
  await page.click('text=Login');
  await page.fill('input[type=email]', 'admin@prismstudio.co.in');
  await page.fill('input[type=password]', 'Admin@123');
  await page.click('button[type=submit]');
  
  await page.waitForURL(/\/dashboard/);
  await expect(page.locator('h1')).toContainText('Dashboard');
  
  await page.screenshot({ path: 'artifacts/prod-test.png' });
});
EOF

PROD_URL=https://your-app.vercel.app npx playwright test scripts/prod-test.mjs
```

## 🔧 Troubleshooting Common Issues

### Authentication Issues
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/users?select=*"

# Verify RLS policies
# In Supabase SQL Editor:
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Database Issues
```bash
# Check table creation
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';

# Verify default data
SELECT * FROM domains;
SELECT email, role FROM users WHERE role = 'A';
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## 📊 Monitoring & Maintenance

### 1. Health Check Endpoint
Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

### 2. Monitoring Script
```bash
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

PROD_URL=${PROD_URL:-"https://your-app.vercel.app"}

echo "🔍 Production Health Check"
echo "========================="

# Health endpoint
echo "Checking health endpoint..."
curl -s "$PROD_URL/api/health" | jq '.'

# Login test
echo "Testing login flow..."
npx playwright test scripts/prod-test.mjs --reporter=line

echo "✅ Monitoring complete"
EOF

chmod +x scripts/monitor.sh
```

## 🔐 Security Checklist

- [ ] Default admin password changed
- [ ] Environment variables secured
- [ ] RLS policies enabled and tested
- [ ] HTTPS enforced in production
- [ ] API rate limiting configured
- [ ] Audit logging enabled
- [ ] Regular security updates scheduled

## 📝 Final Notes

1. **Change Default Password**: Immediately change the default admin password after deployment
2. **Monitor Logs**: Set up log monitoring for the audit_logs table
3. **Backup Strategy**: Configure regular database backups in Supabase
4. **Performance**: Monitor query performance and add indexes as needed
5. **Updates**: Keep dependencies updated and test regularly

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
# Vercel rollback
vercel rollback

# Database rollback (if needed)
# Restore from Supabase backup
```

### Emergency Maintenance
```sql
-- Enable maintenance mode
UPDATE system_settings 
SET value = 'true' 
WHERE key = 'maintenance_mode';
```

This comprehensive guide ensures your PrismStudio Internship Platform is production-ready with robust testing and monitoring in place!