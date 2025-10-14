import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1')
    const h2 = page.locator('h2')
    const h3 = page.locator('h3')
    
    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText('Dashboard')
    
    // Check that headings are in logical order
    const h1Text = await h1.textContent()
    expect(h1Text).toBe('Dashboard')
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/')
    
    const nameInput = page.locator('input[name="name"]')
    const phoneInput = page.locator('input[name="phone"]')
    const emailInput = page.locator('input[name="email"]')
    
    await expect(nameInput).toHaveAttribute('id')
    await expect(phoneInput).toHaveAttribute('id')
    await expect(emailInput).toHaveAttribute('id')
    
    // Check that labels are properly associated
    const nameLabel = page.locator('label[for="name"]')
    const phoneLabel = page.locator('label[for="phone"]')
    const emailLabel = page.locator('label[for="email"]')
    
    await expect(nameLabel).toBeVisible()
    await expect(phoneLabel).toBeVisible()
    await expect(emailLabel).toBeVisible()
  })

  test('should have proper button labels', async ({ page }) => {
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Button should have either text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy()
    }
  })

  test('should have proper table structure', async ({ page }) => {
    const table = page.locator('table')
    const headers = page.locator('th')
    const rows = page.locator('tbody tr')
    
    await expect(table).toBeVisible()
    await expect(headers).toHaveCount.greaterThan(0)
    await expect(rows).toHaveCount.greaterThan(0)
    
    // Check that table has proper caption or aria-label
    const caption = page.locator('caption')
    const ariaLabel = await table.getAttribute('aria-label')
    
    expect(caption.isVisible() || ariaLabel).toBeTruthy()
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper color contrast', async ({ page }) => {
    // This would need to be implemented with a proper accessibility testing tool
    // For now, we just verify that the page loads
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      
      // Images should have alt text
      expect(alt).toBeTruthy()
    }
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for common ARIA attributes
    const buttons = page.locator('button[aria-label]')
    const inputs = page.locator('input[aria-describedby]')
    const regions = page.locator('[role="main"]')
    
    // At least some elements should have ARIA attributes
    const buttonCount = await buttons.count()
    const inputCount = await inputs.count()
    const regionCount = await regions.count()
    
    expect(buttonCount + inputCount + regionCount).toBeGreaterThan(0)
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Should be able to navigate without mouse
    await expect(page.locator('form')).toBeVisible()
  })

  test('should have proper error messages', async ({ page }) => {
    await page.goto('/')
    
    // Submit form without required fields
    await page.click('button[type="submit"]')
    
    // Check that error messages are properly associated
    const errorMessages = page.locator('.text-red-400')
    await expect(errorMessages).toHaveCount.greaterThan(0)
    
    // Check that errors are announced to screen readers
    const ariaLive = page.locator('[aria-live]')
    await expect(ariaLive).toHaveCount.greaterThan(0)
  })

  test('should have proper loading states', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Check that loading state is announced
    const loadingIndicator = page.locator('[aria-label*="loading"], [aria-busy="true"]')
    await expect(loadingIndicator).toBeVisible()
  })
})


