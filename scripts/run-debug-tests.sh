#!/bin/bash
# Frontend Debugging Agent - Main Test Runner
# Implements the full PDCA cycle from frontendDebug.txt

set -e

echo "🕵️‍♂️ Frontend Debugging Agent - RUNNING TESTS"
echo "=============================================="

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

PORT=${PORT:-3000}
TEST_EMAIL=${TEST_EMAIL:-"admin@prismstudio.co.in"}
TEST_PASSWORD=${TEST_PASSWORD:-"Admin@123"}

echo "🔧 Configuration:"
echo "   Port: $PORT"
echo "   Test Email: $TEST_EMAIL"
echo "   Test Password: [HIDDEN]"
echo ""

# Step 1: Environment Check
echo "📋 Step 1: Environment Validation"
echo "================================="
node scripts/check-env.mjs || {
    echo "❌ Environment check failed"
    exit 1
}

# Step 2: Start Development Server
echo ""
echo "🚀 Step 2: Starting Development Server"
echo "======================================"

# Kill any existing process on the port
echo "🧹 Cleaning up existing processes on port $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Start the dev server in background
echo "🚀 Starting Next.js dev server on port $PORT..."
PORT=$PORT npm run dev &
DEV_PID=$!

echo "📝 Dev server PID: $DEV_PID"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $DEV_PID 2>/dev/null || true
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
}
trap cleanup EXIT

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
npx wait-on http://localhost:$PORT --timeout 60000 || {
    echo "❌ Server failed to start within 60 seconds"
    exit 1
}

echo "✅ Server is ready!"

# Step 3: Run E2E Tests
echo ""
echo "🎭 Step 3: Running E2E Tests"
echo "============================"

# Set test environment variables
export TEST_EMAIL
export TEST_PASSWORD
export PORT

# Run Playwright tests
echo "🎬 Running Playwright E2E tests..."
npx playwright test scripts/e2e-login.spec.mjs \
    --reporter=list \
    --output-dir=artifacts \
    --timeout=30000 || {
    echo "⚠️ Some E2E tests failed - continuing with analysis"
}

# Step 4: Generate HAR file
echo ""
echo "📊 Step 4: Generating Network Analysis"
echo "======================================"

echo "🌐 Generating HAR file for network analysis..."
timeout 30s npx playwright open \
    --save-har=artifacts/session.har \
    http://localhost:$PORT || {
    echo "⚠️ HAR generation timed out or failed"
}

# Step 5: Analyze Results
echo ""
echo "📈 Step 5: Analyzing Test Results"
echo "================================="

# Create comprehensive test report
cat > artifacts/test-report.md << EOF
# Frontend Debugging Agent - Test Report
Generated: $(date)

## Test Environment
- **Framework**: Next.js
- **Port**: $PORT
- **Test Email**: $TEST_EMAIL
- **Node Version**: $(node --version)
- **npm Version**: $(npm --version)

## Test Results Summary

### E2E Test Results
$(if [ -f "test-results.json" ]; then echo "✅ Test results available"; else echo "⚠️ Test results not generated"; fi)

### Screenshots Generated
$(ls -la artifacts/*.png 2>/dev/null | wc -l) screenshots captured:
$(ls artifacts/*.png 2>/dev/null | sed 's/artifacts\//- /' || echo "No screenshots found")

### Network Analysis
$(if [ -f "artifacts/session.har" ]; then echo "✅ HAR file generated: artifacts/session.har"; else echo "⚠️ HAR file not generated"; fi)
$(if [ -f "artifacts/trace.zip" ]; then echo "✅ Playwright trace: artifacts/trace.zip"; else echo "⚠️ Playwright trace not generated"; fi)

### Browser Console Logs
Check the test output above for browser console messages.
Look for:
- ❌ CRITICAL BROWSER ERROR: [error messages]
- 🚨 REQ_FAIL: [network failures]
- 📥 RESPONSE: [HTTP error codes]

## Common Issues to Check

### Authentication Issues
- [ ] NEXTAUTH_URL matches current domain
- [ ] NEXTAUTH_SECRET is properly set
- [ ] Supabase credentials are correct
- [ ] RLS policies allow login

### Network Issues
- [ ] No CORS errors in console
- [ ] API endpoints responding correctly
- [ ] No 4xx/5xx errors during login flow

### UI/UX Issues
- [ ] Login form elements are accessible
- [ ] Form validation works correctly
- [ ] Redirect after login works
- [ ] Dashboard loads without errors

## Next Steps

1. **Review Screenshots**: Check artifacts/*.png for visual issues
2. **Analyze Network**: Open artifacts/session.har in browser dev tools
3. **Debug Traces**: Run \`npx playwright show-trace artifacts/trace.zip\`
4. **Fix Issues**: Address any errors found in console logs
5. **Re-test**: Run this script again to verify fixes

## Commands to Reproduce
\`\`\`bash
# Setup
./scripts/setup-testing.sh

# Run tests
./scripts/run-debug-tests.sh

# View trace (if generated)
npx playwright show-trace artifacts/trace.zip
\`\`\`

## Artifacts Generated
- \`artifacts/test-report.md\` - This report
- \`artifacts/*.png\` - Screenshots of test flow
- \`artifacts/session.har\` - Network traffic analysis
- \`artifacts/trace.zip\` - Detailed Playwright trace

---
*Generated by Frontend Debugging Agent*
EOF

# Step 6: Final Analysis
echo ""
echo "📊 Step 6: Final Analysis"
echo "========================"

echo "📁 Artifacts generated:"
ls -la artifacts/ 2>/dev/null || echo "No artifacts directory found"

echo ""
echo "🎯 Test Summary:"
if [ -f "artifacts/05-dashboard-success.png" ]; then
    echo "✅ Login flow appears successful (dashboard screenshot found)"
elif [ -f "artifacts/99-error-state.png" ]; then
    echo "❌ Login flow failed (error screenshot found)"
else
    echo "⚠️ Login flow status unclear (check artifacts)"
fi

echo ""
echo "📋 Next Actions:"
echo "1. Review artifacts/test-report.md for detailed analysis"
echo "2. Check artifacts/*.png for visual confirmation"
echo "3. Run: npx playwright show-trace artifacts/trace.zip (if exists)"
echo "4. Fix any issues found and re-run tests"

echo ""
echo "🎉 Frontend Debugging Agent - COMPLETE"
echo "======================================"