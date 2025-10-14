import { test, expect } from '@playwright/test'

test.describe('Monitoring Tests', () => {
  test('should track user interactions', async ({ page }) => {
    await page.goto('/')
    
    // Check for analytics tracking
    const analyticsScript = page.locator('script[src*="analytics"]')
    await expect(analyticsScript).toBeVisible()
    
    // Check for event tracking
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should track form submission
    const events = []
    page.on('console', msg => {
      if (msg.text().includes('track')) {
        events.push(msg.text())
      }
    })
    
    expect(events.length).toBeGreaterThan(0)
  })

  test('should track performance metrics', async ({ page }) => {
    await page.goto('/')
    
    // Check for performance tracking
    const performanceScript = page.locator('script[src*="performance"]')
    await expect(performanceScript).toBeVisible()
    
    // Check for Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(entries.map(entry => ({
            name: entry.name,
            startTime: entry.startTime
          })))
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
      })
    })
    
    expect(vitals).toBeDefined()
  })

  test('should track error occurrences', async ({ page }) => {
    await page.goto('/')
    
    // Check for error tracking
    const errorScript = page.locator('script[src*="error"]')
    await expect(errorScript).toBeVisible()
    
    // Simulate error
    await page.route('**/api/contacts', route => route.abort())
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should track error
    const errors = []
    page.on('console', msg => {
      if (msg.text().includes('error')) {
        errors.push(msg.text())
      }
    })
    
    expect(errors.length).toBeGreaterThan(0)
  })

  test('should track user sessions', async ({ page }) => {
    await page.goto('/')
    
    // Check for session tracking
    const sessionScript = page.locator('script[src*="session"]')
    await expect(sessionScript).toBeVisible()
    
    // Check for session ID
    const sessionId = await page.evaluate(() => {
      return localStorage.getItem('session-id')
    })
    
    expect(sessionId).toBeDefined()
  })

  test('should track page views', async ({ page }) => {
    await page.goto('/')
    
    // Check for page view tracking
    const pageViewScript = page.locator('script[src*="pageview"]')
    await expect(pageViewScript).toBeVisible()
    
    // Check for page view events
    const pageViews = []
    page.on('console', msg => {
      if (msg.text().includes('pageview')) {
        pageViews.push(msg.text())
      }
    })
    
    expect(pageViews.length).toBeGreaterThan(0)
  })

  test('should track user behavior', async ({ page }) => {
    await page.goto('/')
    
    // Check for behavior tracking
    const behaviorScript = page.locator('script[src*="behavior"]')
    await expect(behaviorScript).toBeVisible()
    
    // Track user interactions
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    // Should track form interactions
    const interactions = []
    page.on('console', msg => {
      if (msg.text().includes('interaction')) {
        interactions.push(msg.text())
      }
    })
    
    expect(interactions.length).toBeGreaterThan(0)
  })

  test('should track conversion events', async ({ page }) => {
    await page.goto('/')
    
    // Check for conversion tracking
    const conversionScript = page.locator('script[src*="conversion"]')
    await expect(conversionScript).toBeVisible()
    
    // Track conversion
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should track conversion
    const conversions = []
    page.on('console', msg => {
      if (msg.text().includes('conversion')) {
        conversions.push(msg.text())
      }
    })
    
    expect(conversions.length).toBeGreaterThan(0)
  })

  test('should track user demographics', async ({ page }) => {
    await page.goto('/')
    
    // Check for demographics tracking
    const demographicsScript = page.locator('script[src*="demographics"]')
    await expect(demographicsScript).toBeVisible()
    
    // Check for user agent tracking
    const userAgent = await page.evaluate(() => {
      return navigator.userAgent
    })
    
    expect(userAgent).toBeDefined()
  })

  test('should track device information', async ({ page }) => {
    await page.goto('/')
    
    // Check for device tracking
    const deviceScript = page.locator('script[src*="device"]')
    await expect(deviceScript).toBeVisible()
    
    // Check for device information
    const deviceInfo = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: screen.width,
        screenHeight: screen.height
      }
    })
    
    expect(deviceInfo.userAgent).toBeDefined()
    expect(deviceInfo.platform).toBeDefined()
    expect(deviceInfo.language).toBeDefined()
    expect(deviceInfo.screenWidth).toBeDefined()
    expect(deviceInfo.screenHeight).toBeDefined()
  })

  test('should track geographic information', async ({ page }) => {
    await page.goto('/')
    
    // Check for geographic tracking
    const geoScript = page.locator('script[src*="geo"]')
    await expect(geoScript).toBeVisible()
    
    // Check for geographic information
    const geoInfo = await page.evaluate(() => {
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        country: navigator.language.split('-')[1]
      }
    })
    
    expect(geoInfo.timezone).toBeDefined()
    expect(geoInfo.language).toBeDefined()
    expect(geoInfo.country).toBeDefined()
  })

  test('should track user preferences', async ({ page }) => {
    await page.goto('/')
    
    // Check for preferences tracking
    const preferencesScript = page.locator('script[src*="preferences"]')
    await expect(preferencesScript).toBeVisible()
    
    // Check for preferences
    const preferences = await page.evaluate(() => {
      return {
        theme: localStorage.getItem('theme'),
        language: localStorage.getItem('language'),
        notifications: localStorage.getItem('notifications')
      }
    })
    
    expect(preferences).toBeDefined()
  })

  test('should track system health', async ({ page }) => {
    await page.goto('/')
    
    // Check for health tracking
    const healthScript = page.locator('script[src*="health"]')
    await expect(healthScript).toBeVisible()
    
    // Check for system health
    const health = await page.evaluate(() => {
      return {
        memory: performance.memory?.usedJSHeapSize,
        timing: performance.timing?.loadEventEnd - performance.timing?.navigationStart
      }
    })
    
    expect(health).toBeDefined()
  })
})


