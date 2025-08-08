// Frontend Debugging Agent - E2E Login Test
// Following the approach from frontendDebug.txt

import { test, expect } from '@playwright/test';

test.describe('PrismStudio Login Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Monitor network failures
    context.on('requestfailed', request => {
      console.log('🚨 REQ_FAIL:', request.url(), request.failure()?.errorText);
    });
  });

  test('complete login flow works', async ({ page, context }) => {
    // Tracing is already configured in playwright.config.js

    // Monitor console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🖥️ BROWSER [${type.toUpperCase()}]:`, text);
      
      // Flag critical errors
      if (type === 'error') {
        console.log('❌ CRITICAL BROWSER ERROR:', text);
      }
    });

    // Monitor network requests
    page.on('request', request => {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      console.log(`📥 RESPONSE: ${status} ${url}`);
      
      // Flag HTTP errors
      if (status >= 400) {
        console.log(`❌ HTTP ERROR: ${status} ${url}`);
      }
    });

    try {
      // Navigate to homepage
      console.log('🏠 Navigating to homepage...');
      await page.goto(`http://localhost:${process.env.PORT || 3000}/`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Take screenshot of homepage
      await page.screenshot({ 
        path: 'artifacts/01-homepage.png', 
        fullPage: true 
      });

      // Look for login link/button
      console.log('🔍 Looking for login button...');
      
      // Try multiple selectors for login
      const loginSelectors = [
        'text=Login',
        'text=Sign In',
        'a[href="/login"]',
        'button:has-text("Login")',
        '[data-testid="login-button"]'
      ];

      let loginFound = false;
      for (const selector of loginSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          console.log(`✅ Found login with selector: ${selector}`);
          await page.click(selector);
          loginFound = true;
          break;
        } catch (e) {
          console.log(`⚠️ Login selector not found: ${selector}`);
        }
      }

      if (!loginFound) {
        // Try navigating directly to login page
        console.log('🔄 Navigating directly to /login...');
        await page.goto(`http://localhost:${process.env.PORT || 3000}/login`);
      }

      // Wait for login page to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of login page
      await page.screenshot({ 
        path: 'artifacts/02-login-page.png', 
        fullPage: true 
      });

      // Fill login form
      console.log('📝 Filling login form...');
      
      const email = process.env.TEST_EMAIL || 'admin@prismstudio.co.in';
      const password = process.env.TEST_PASSWORD || 'Admin@123';

      // Try multiple selectors for email input
      const emailSelectors = [
        'input[type=email]',
        'input[name=email]',
        'input[placeholder*="email" i]',
        '#email'
      ];

      for (const selector of emailSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.fill(selector, email);
          console.log(`✅ Filled email with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Email selector not found: ${selector}`);
        }
      }

      // Try multiple selectors for password input
      const passwordSelectors = [
        'input[type=password]',
        'input[name=password]',
        'input[placeholder*="password" i]',
        '#password'
      ];

      for (const selector of passwordSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.fill(selector, password);
          console.log(`✅ Filled password with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Password selector not found: ${selector}`);
        }
      }

      // Take screenshot before submit
      await page.screenshot({ 
        path: 'artifacts/03-form-filled.png', 
        fullPage: true 
      });

      // Submit form
      console.log('🚀 Submitting login form...');
      
      const submitSelectors = [
        'button[type=submit]',
        'button:has-text("Login")',
        'button:has-text("Sign In")',
        'input[type=submit]',
        '[data-testid="login-submit"]'
      ];

      for (const selector of submitSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          console.log(`✅ Clicked submit with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Submit selector not found: ${selector}`);
        }
      }

      // Wait for navigation or response
      console.log('⏳ Waiting for login response...');
      
      // Wait for the success message to appear
      try {
        await page.waitForSelector('text=login successful', { timeout: 5000 });
        console.log('✅ Success message appeared');
        
        // Wait additional time for redirect (login has 1 second setTimeout)
        await page.waitForTimeout(2000);
        
        // Wait for navigation to complete
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch (e) {
        console.log('⚠️ Success message not found, continuing...');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      }

      // Take screenshot after submit
      await page.screenshot({ 
        path: 'artifacts/04-after-submit.png', 
        fullPage: true 
      });

      // Check if we're on dashboard or still on login (error case)
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      if (currentUrl.includes('/dashboard')) {
        console.log('✅ Successfully redirected to dashboard');
        
        // Take dashboard screenshot
        await page.screenshot({ 
          path: 'artifacts/05-dashboard-success.png', 
          fullPage: true 
        });

        // Verify dashboard elements
        await expect(page).toHaveURL(/\/dashboard/);
        
        // Look for user-specific elements
        const dashboardElements = [
          'h1:has-text("Dashboard")',
          '[data-testid="user-profile"]',
          'text=Welcome',
          'button:has-text("Logout")'
        ];

        for (const selector of dashboardElements) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            console.log(`✅ Found dashboard element: ${selector}`);
          } catch (e) {
            console.log(`⚠️ Dashboard element not found: ${selector}`);
          }
        }

      } else if (currentUrl.includes('/login')) {
        console.log('❌ Still on login page - checking for errors');
        
        // Look for error messages
        const errorSelectors = [
          '.error',
          '.alert-error',
          '[role="alert"]',
          'text=Invalid',
          'text=Error',
          'text=Failed'
        ];

        for (const selector of errorSelectors) {
          try {
            const errorElement = await page.waitForSelector(selector, { timeout: 2000 });
            const errorText = await errorElement.textContent();
            console.log(`❌ Found error: ${errorText}`);
          } catch (e) {
            // No error found with this selector
          }
        }

        throw new Error('Login failed - still on login page');
      } else {
        console.log(`⚠️ Unexpected redirect to: ${currentUrl}`);
      }

    } catch (error) {
      console.log('❌ Test failed:', error.message);
      
      // Take error screenshot
      await page.screenshot({ 
        path: 'artifacts/99-error-state.png', 
        fullPage: true 
      });
      
      throw error;
    } finally {
      // Tracing is handled automatically by playwright config
    }
  });

  test('dashboard loads correctly after login', async ({ page }) => {
    // This test assumes login works and tests dashboard functionality
    console.log('🏠 Testing dashboard functionality...');

    // Login first (simplified)
    await page.goto(`http://localhost:${process.env.PORT || 3000}/login`);
    
    const email = process.env.TEST_EMAIL || 'admin@prismstudio.co.in';
    const password = process.env.TEST_PASSWORD || 'Admin@123';

    await page.fill('input[type=email]', email);
    await page.fill('input[type=password]', password);
    await page.click('button[type=submit]');
    
    // Admin user should go to /admin, student to /dashboard
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 15000 });

    // Test dashboard/admin elements
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    // Take dashboard screenshot
    await page.screenshot({ 
      path: 'artifacts/dashboard-functionality.png', 
      fullPage: true 
    });

    console.log('✅ Dashboard functionality test passed');
  });
});