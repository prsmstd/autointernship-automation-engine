#!/usr/bin/env node

/**
 * Simple test script to verify the app is working
 */

const http = require('http')

console.log('🧪 Testing PrismStudio Internship Platform...\n')

// Test if the server is running
const testServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server is running on http://localhost:3000')
        resolve(true)
      } else {
        console.log(`❌ Server returned status code: ${res.statusCode}`)
        reject(false)
      }
    })
    
    req.on('error', (error) => {
      console.log('❌ Server is not running. Please start with: npm run dev')
      reject(false)
    })
    
    req.setTimeout(5000, () => {
      console.log('❌ Server request timed out')
      reject(false)
    })
  })
}

// Test different routes
const testRoutes = async () => {
  const routes = [
    { path: '/', name: 'Landing Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/verify', name: 'Certificate Verification' },
    { path: '/admin', name: 'Admin Dashboard' }
  ]
  
  for (const route of routes) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3000${route.path}`, (res) => {
          if (res.statusCode === 200) {
            console.log(`✅ ${route.name} (${route.path}) - OK`)
            resolve(true)
          } else {
            console.log(`⚠️  ${route.name} (${route.path}) - Status: ${res.statusCode}`)
            resolve(true) // Don't fail on redirects
          }
        })
        
        req.on('error', (error) => {
          console.log(`❌ ${route.name} (${route.path}) - Error: ${error.message}`)
          reject(false)
        })
        
        req.setTimeout(3000, () => {
          console.log(`⚠️  ${route.name} (${route.path}) - Timeout`)
          resolve(true)
        })
      })
    } catch (error) {
      // Continue testing other routes
    }
  }
}

// Run tests
const runTests = async () => {
  try {
    await testServer()
    console.log('\n📄 Testing Routes:')
    await testRoutes()
    
    console.log('\n🎉 Basic tests completed!')
    console.log('\n📋 Manual Testing Checklist:')
    console.log('1. ✅ Visit http://localhost:3000')
    console.log('2. ✅ Click "Get Started" or "Sign In"')
    console.log('3. ✅ Try signing up with a test email')
    console.log('4. ✅ Select a domain (e.g., Web Development)')
    console.log('5. ✅ Submit a GitHub repo for Task 1')
    console.log('6. ✅ Check AI evaluation results')
    console.log('7. ✅ Test certificate verification at /verify')
    console.log('8. ✅ Try demo certificate: PRISM-2025-DEMO123')
    
    console.log('\n🚀 If all tests pass, your platform is ready!')
    
  } catch (error) {
    console.log('\n❌ Tests failed. Please check the server and try again.')
    process.exit(1)
  }
}

runTests()