#!/bin/bash
# Frontend Debugging Agent - Setup Script
# Following the PDCA approach from frontendDebug.txt

set -e

echo "🕵️‍♂️ Frontend Debugging Agent - ACTIVATED"
echo "=========================================="

# 1. PREPARE - Install tools and test runner
echo "📦 Step 1: Installing testing tools..."

# Install dependencies
echo "Installing npm dependencies..."
npm ci || npm install

# Install Playwright with dependencies
echo "Installing Playwright with browser dependencies..."
npx playwright install --with-deps

# Create artifacts directory
echo "Creating artifacts directory..."
mkdir -p artifacts

# 2. LINT & TYPECHECK
echo "🔍 Step 2: Running lint and typecheck..."

echo "Running ESLint..."
npm run lint || echo "⚠️ Linting issues found - will continue"

echo "Running TypeScript check..."
npm run build || echo "⚠️ Build issues found - will continue"

# 3. ENVIRONMENT CHECK
echo "🔧 Step 3: Environment validation..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️ .env.local not found"
    if [ -f ".env.example" ]; then
        echo "📋 Copying .env.example to .env.local"
        cp .env.example .env.local
        echo "⚠️ Please fill in your environment variables in .env.local"
    else
        echo "❌ No .env.example found - creating basic .env.local"
        cat > .env.local << 'EOF'
# Basic environment for testing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-token-with-at-least-32-characters

# Test credentials
TEST_EMAIL=admin@prismstudio.co.in
TEST_PASSWORD=Admin@123
PORT=3000
EOF
    fi
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Fill in your .env.local with actual values"
echo "2. Run: ./scripts/run-debug-tests.sh"
echo "3. Check artifacts/ for test results"