import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="username"]', 'wrong')
    await page.fill('input[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('.text-red-400')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Logout
    await page.click('button:has-text("Déconnexion")')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Contact Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new contact', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should display contacts in dashboard table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0)
  })

  test('should search contacts by name', async ({ page }) => {
    await page.fill('input[placeholder*="Rechercher"]', 'John')
    
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('John')
  })

  test('should filter contacts by type', async ({ page }) => {
    await page.selectOption('select:has-text("Tous les types")', 'BUYER')
    
    const rows = page.locator('tbody tr')
    await expect(rows.first().locator('text=Acheteur')).toBeVisible()
  })

  test('should open contact detail card', async ({ page }) => {
    await page.click('tbody tr:first-child')
    
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('h3')).toBeVisible()
  })

  test('should edit contact personal note', async ({ page }) => {
    await page.click('tbody tr:first-child')
    
    await page.click('button:has-text("Modifier")')
    await page.fill('textarea', 'Updated personal note')
    await page.click('button:has-text("Sauvegarder")')
    
    await expect(page.locator('text=Updated personal note')).toBeVisible()
  })

  test('should rate a contact', async ({ page }) => {
    await page.click('tbody tr:first-child')
    
    const stars = page.locator('[role="button"]:has-text("5")')
    await stars.click()
    
    await expect(page.locator('text=5')).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Check mobile layout
    await expect(page.locator('.grid-cols-2')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Check tablet layout
    await expect(page.locator('.grid-cols-4')).toBeVisible()
  })

  test('should work on desktop devices', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Check desktop layout
    await expect(page.locator('.grid-cols-4')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })
})

test.describe('Performance Tests', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  })

  test('should handle large number of contacts', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Check that table renders without issues
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0)
  })
})


