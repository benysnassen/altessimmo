import { test, expect } from '@playwright/test'

test.describe('Load Testing', () => {
  test('should handle 100 concurrent users', async ({ browser }) => {
    const contexts = []
    const pages = []
    
    // Create 100 browser contexts
    for (let i = 0; i < 100; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      contexts.push(context)
      pages.push(page)
    }
    
    // All users login simultaneously
    const loginPromises = pages.map(async (page, index) => {
      await page.goto('/login')
      await page.fill('input[name="username"]', 'admin')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard')
    })
    
    const startTime = Date.now()
    await Promise.all(loginPromises)
    const endTime = Date.now()
    
    // All users should be able to login within reasonable time
    expect(endTime - startTime).toBeLessThan(30000) // 30 seconds
    
    // All users should see dashboard
    for (const page of pages) {
      await expect(page.locator('h1')).toContainText('Dashboard')
    }
    
    // Cleanup
    for (const context of contexts) {
      await context.close()
    }
  })

  test('should handle 1000 contact creations', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const startTime = Date.now()
    
    // Create 1000 contacts
    for (let i = 0; i < 1000; i++) {
      await page.goto('/')
      await page.fill('input[name="name"]', `User ${i}`)
      await page.fill('input[name="phone"]', `+212612345${i.toString().padStart(3, '0')}`)
      await page.selectOption('select[name="type"]', i % 2 === 0 ? 'BUYER' : 'SELLER')
      await page.fill('input[name="budget"]', '1000000')
      await page.click('button[type="submit"]')
      
      if (i % 100 === 0) {
        console.log(`Created ${i} contacts`)
      }
    }
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Should complete within reasonable time
    expect(totalTime).toBeLessThan(300000) // 5 minutes
    
    // Verify contacts were created
    await page.goto('/dashboard')
    await expect(page.locator('tbody tr')).toHaveCount.greaterThan(1000)
    
    await context.close()
  })

  test('should handle database stress', async ({ browser }) => {
    const contexts = []
    const pages = []
    
    // Create 50 browser contexts
    for (let i = 0; i < 50; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      contexts.push(context)
      pages.push(page)
    }
    
    // All users perform various operations simultaneously
    const operationPromises = pages.map(async (page, index) => {
      await page.goto('/login')
      await page.fill('input[name="username"]', 'admin')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard')
      
      // Perform various operations
      for (let i = 0; i < 10; i++) {
        // Create contact
        await page.goto('/')
        await page.fill('input[name="name"]', `User ${index}-${i}`)
        await page.fill('input[name="phone"]', `+212612345${index}${i}`)
        await page.selectOption('select[name="type"]', 'BUYER')
        await page.fill('input[name="budget"]', '1000000')
        await page.click('button[type="submit"]')
        
        // Search contacts
        await page.goto('/dashboard')
        await page.fill('input[placeholder*="Rechercher"]', `User ${index}`)
        
        // Filter contacts
        await page.selectOption('select:has-text("Tous les types")', 'BUYER')
        await page.selectOption('select:has-text("Tous les statuts")', 'NEW')
        
        // Open contact detail
        if (await page.locator('tbody tr:first-child').isVisible()) {
          await page.click('tbody tr:first-child')
          await page.keyboard.press('Escape')
        }
      }
    })
    
    const startTime = Date.now()
    await Promise.all(operationPromises)
    const endTime = Date.now()
    
    // Should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(60000) // 1 minute
    
    // Cleanup
    for (const context of contexts) {
      await context.close()
    }
  })

  test('should handle memory pressure', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Perform memory-intensive operations
    for (let i = 0; i < 100; i++) {
      // Open and close contact details multiple times
      await page.click('tbody tr:first-child')
      await page.waitForTimeout(100)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
      
      // Search and filter
      await page.fill('input[placeholder*="Rechercher"]', `search${i}`)
      await page.selectOption('select:has-text("Tous les types")', 'BUYER')
      await page.selectOption('select:has-text("Tous les statuts")', 'NEW')
      
      // Clear search
      await page.fill('input[placeholder*="Rechercher"]', '')
    }
    
    // Page should still be responsive
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('table')).toBeVisible()
    
    await context.close()
  })

  test('should handle network latency', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    
    // Simulate high latency
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 500) // 500ms delay
    })
    
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const endTime = Date.now()
    
    // Should still work with high latency
    expect(endTime - startTime).toBeLessThan(30000) // 30 seconds
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    await context.close()
  })

  test('should handle intermittent network failures', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Simulate intermittent failures
    let failureCount = 0
    await page.route('**/api/**', route => {
      if (Math.random() < 0.3) { // 30% failure rate
        failureCount++
        route.abort()
      } else {
        route.continue()
      }
    })
    
    // Perform operations that might fail
    for (let i = 0; i < 50; i++) {
      try {
        await page.goto('/')
        await page.fill('input[name="name"]', `User ${i}`)
        await page.fill('input[name="phone"]', `+212612345${i}`)
        await page.selectOption('select[name="type"]', 'BUYER')
        await page.fill('input[name="budget"]', '1000000')
        await page.click('button[type="submit"]')
        
        // Wait for either success or error
        await Promise.race([
          page.waitForSelector('text=Merci pour votre message'),
          page.waitForSelector('text=Erreur de connexion')
        ])
      } catch (error) {
        // Ignore errors, continue testing
      }
    }
    
    // Should have some failures
    expect(failureCount).toBeGreaterThan(0)
    
    // Page should still be functional
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    await context.close()
  })
})


