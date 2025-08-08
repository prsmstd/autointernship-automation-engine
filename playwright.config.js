// Frontend Debugging Agent - Playwright Configuration
// Optimized for comprehensive debugging and evidence collection

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './scripts',
  
  // Test files pattern
  testMatch: '**/*.spec.mjs',
  
  // Global timeout
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 10000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 1,
  
  // Opt out of parallel tests for debugging
  workers: 1,
  
  // Reporter configuration for debugging
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/playwright-report' }],
    ['json', { outputFile: 'artifacts/test-results.json' }]
  ],
  
  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: `http://localhost:${process.env.PORT || 3000}`,
    
    // Browser context options
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Collect HAR files for network analysis
    recordHar: {
      mode: 'minimal',
      path: 'artifacts/network-trace.har'
    },
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 15000
  },
  
  // Output directory for test artifacts
  outputDir: 'artifacts/test-results',
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable additional debugging features
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox'
          ]
        }
      },
    },
    
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // Mobile testing (optional)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
  
  // Web server configuration for local testing
  webServer: process.env.CI ? undefined : {
    command: `PORT=${process.env.PORT || 3000} npm run dev`,
    port: parseInt(process.env.PORT || '3000'),
    timeout: 60000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'development',
      ...process.env
    }
  }
});