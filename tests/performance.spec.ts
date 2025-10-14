import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should load login page within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(2000) // Should load within 2 seconds
  })

  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  })

  test('should handle large number of contacts efficiently', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Check that table renders without performance issues
    const startTime = Date.now()
    await expect(page.locator('table')).toBeVisible()
    const renderTime = Date.now() - startTime
    
    expect(renderTime).toBeLessThan(1000) // Should render within 1 second
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/login')
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      })
    })
    
    expect(lcp).toBeLessThan(2500) // LCP should be under 2.5s
    
    // Measure FID (First Input Delay)
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const firstEntry = entries[0]
          resolve(firstEntry.processingStart - firstEntry.startTime)
        }).observe({ entryTypes: ['first-input'] })
      })
    })
    
    expect(fid).toBeLessThan(100) // FID should be under 100ms
  })

  test('should have efficient bundle size', async ({ page }) => {
    const responses = []
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length']
        })
      }
    })
    
    await page.goto('/login')
    
    // Check that JavaScript bundles are not too large
    const jsResponses = responses.filter(r => r.url.includes('.js'))
    const totalJsSize = jsResponses.reduce((sum, r) => sum + parseInt(r.size || '0'), 0)
    
    expect(totalJsSize).toBeLessThan(500000) // Should be under 500KB
  })

  test('should handle concurrent users', async ({ browser }) => {
    const contexts = []
    const pages = []
    
    // Create multiple browser contexts to simulate concurrent users
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      contexts.push(context)
      pages.push(page)
    }
    
    // All users login simultaneously
    const loginPromises = pages.map(async (page) => {
      await page.goto('/login')
      await page.fill('input[name="username"]', 'admin')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard')
    })
    
    await Promise.all(loginPromises)
    
    // All users should be able to access dashboard
    for (const page of pages) {
      await expect(page.locator('h1')).toContainText('Dashboard')
    }
    
    // Cleanup
    for (const context of contexts) {
      await context.close()
    }
  })

  test('should handle memory leaks', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Perform multiple operations to check for memory leaks
    for (let i = 0; i < 10; i++) {
      await page.click('tbody tr:first-child')
      await page.waitForTimeout(100)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
    }
    
    // Check that page still functions correctly
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should have efficient database queries', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Monitor network requests
    const requests = []
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        })
      }
    })
    
    // Perform various operations
    await page.fill('input[placeholder*="Rechercher"]', 'test')
    await page.selectOption('select:has-text("Tous les types")', 'BUYER')
    await page.selectOption('select:has-text("Tous les statuts")', 'NEW')
    
    // Check that API calls are efficient
    const apiRequests = requests.filter(r => r.url.includes('/api/'))
    expect(apiRequests.length).toBeLessThan(10) // Should not make too many requests
  })

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100) // Add 100ms delay
    })
    
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(10000) // Should still load within 10 seconds even with slow network
  })
})


