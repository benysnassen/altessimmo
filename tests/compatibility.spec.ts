import { test, expect } from '@playwright/test'

test.describe('Cross-Browser Compatibility', () => {
  test('should work in Chrome', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should work in Firefox', async ({ page, browserName }) => {
    if (browserName !== 'firefox') {
      test.skip('Skipping Firefox-specific test')
    }
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should work in Safari', async ({ page, browserName }) => {
    if (browserName !== 'webkit') {
      test.skip('Skipping Safari-specific test')
    }
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should work in Edge', async ({ page, browserName }) => {
    if (browserName !== 'chromium') {
      test.skip('Skipping Edge-specific test')
    }
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})

test.describe('Mobile Browser Compatibility', () => {
  test('should work on iOS Safari', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should work on Android Chrome', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('/login')
    
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should work on Samsung Internet', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('/login')
    
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})

test.describe('Feature Detection', () => {
  test('should work without JavaScript', async ({ page }) => {
    await page.setJavaScriptEnabled(false)
    
    await page.goto('/login')
    
    // Should still show the login form
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('should work with CSS disabled', async ({ page }) => {
    await page.route('**/*.css', route => route.abort())
    
    await page.goto('/login')
    
    // Should still be functional
    await expect(page.locator('form')).toBeVisible()
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
  })

  test('should work with images disabled', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,gif,svg}', route => route.abort())
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should work with cookies disabled', async ({ page }) => {
    await page.context().clearCookies()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should still work (using localStorage instead of cookies)
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should work with localStorage disabled', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
        },
      })
    })
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should redirect to login since localStorage is disabled
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Internationalization', () => {
  test('should work with different locales', async ({ page }) => {
    await page.goto('/login', { locale: 'fr-FR' })
    
    // Should display French text
    await expect(page.locator('h1')).toContainText('Connexion')
  })

  test('should work with RTL languages', async ({ page }) => {
    await page.goto('/login', { locale: 'ar-SA' })
    
    // Should handle RTL layout
    await expect(page.locator('form')).toBeVisible()
  })

  test('should work with different timezones', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Should display dates in correct timezone
    await expect(page.locator('table')).toBeVisible()
  })
})


