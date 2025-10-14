import { test, expect } from '@playwright/test'

test.describe('Usability Tests', () => {
  test('should be intuitive for new users', async ({ page }) => {
    // First-time user experience
    await page.goto('/')
    
    // Should see clear call-to-action
    await expect(page.locator('h1')).toContainText('Contact')
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Form should be self-explanatory
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="phone"]')).toBeVisible()
    await expect(page.locator('select[name="type"]')).toBeVisible()
    
    // Should have helpful placeholders
    const nameInput = page.locator('input[name="name"]')
    const phoneInput = page.locator('input[name="phone"]')
    
    await expect(nameInput).toHaveAttribute('placeholder')
    await expect(phoneInput).toHaveAttribute('placeholder')
  })

  test('should provide clear feedback for user actions', async ({ page }) => {
    await page.goto('/')
    
    // Test form submission feedback
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // Should clear form
    await expect(page.locator('input[name="name"]')).toHaveValue('')
    await expect(page.locator('input[name="phone"]')).toHaveValue('')
  })

  test('should handle user mistakes gracefully', async ({ page }) => {
    await page.goto('/')
    
    // User makes mistake - submits empty form
    await page.click('button[type="submit"]')
    
    // Should show helpful error messages
    await expect(page.locator('text=Le nom est requis')).toBeVisible()
    await expect(page.locator('text=Le téléphone est requis')).toBeVisible()
    
    // User corrects mistake
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should work after correction
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should be accessible to users with disabilities', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper labels
    const nameInput = page.locator('input[name="name"]')
    const phoneInput = page.locator('input[name="phone"]')
    
    await expect(nameInput).toHaveAttribute('id')
    await expect(phoneInput).toHaveAttribute('id')
    
    // Check for proper form structure
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('fieldset')).toBeVisible()
    
    // Check for proper button labels
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toHaveText()
  })

  test('should work well on different screen sizes', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should provide helpful tooltips and hints', async ({ page }) => {
    await page.goto('/')
    
    // Check for tooltips
    const budgetInput = page.locator('input[name="budget"]')
    await expect(budgetInput).toHaveAttribute('title')
    
    // Check for help text
    const helpText = page.locator('.text-sm.text-gray-500')
    await expect(helpText).toBeVisible()
  })

  test('should handle user input efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Test auto-formatting
    await page.fill('input[name="phone"]', '212612345678')
    
    // Should format phone number
    await expect(page.locator('input[name="phone"]')).toHaveValue('+212 612-345-678')
    
    // Test auto-completion
    await page.fill('input[name="email"]', 'john@')
    
    // Should suggest common domains
    await expect(page.locator('text=john@example.com')).toBeVisible()
  })

  test('should provide clear navigation', async ({ page }) => {
    await page.goto('/')
    
    // Should have clear navigation
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('a[href="/"]')).toBeVisible()
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })

  test('should handle user preferences', async ({ page }) => {
    await page.goto('/')
    
    // Test language preference
    await page.selectOption('select[name="language"]', 'fr')
    
    // Should change language
    await expect(page.locator('h1')).toContainText('Contact')
    
    // Test theme preference
    await page.click('button[aria-label="Toggle theme"]')
    
    // Should change theme
    await expect(page.locator('html')).toHaveClass('dark')
  })

  test('should provide clear error recovery', async ({ page }) => {
    await page.goto('/')
    
    // User makes error
    await page.fill('input[name="name"]', '')
    await page.click('button[type="submit"]')
    
    // Should show error
    await expect(page.locator('text=Le nom est requis')).toBeVisible()
    
    // Should provide recovery options
    await expect(page.locator('button:has-text("Réessayer")')).toBeVisible()
    
    // User can recover
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should work after recovery
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should provide clear progress indicators', async ({ page }) => {
    await page.goto('/')
    
    // Test form progress
    await page.fill('input[name="name"]', 'John Doe')
    
    // Should show progress
    await expect(page.locator('.progress-bar')).toBeVisible()
    
    // Test loading states
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show loading
    await expect(page.locator('button[disabled]')).toBeVisible()
  })

  test('should handle user interruptions gracefully', async ({ page }) => {
    await page.goto('/')
    
    // User starts filling form
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    
    // User navigates away
    await page.goto('/login')
    
    // User comes back
    await page.goBack()
    
    // Form should retain values
    await expect(page.locator('input[name="name"]')).toHaveValue('John Doe')
    await expect(page.locator('input[name="phone"]')).toHaveValue('+212612345678')
  })

  test('should provide clear success confirmation', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show clear success message
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // Should provide next steps
    await expect(page.locator('text=Nous vous contacterons bientôt')).toBeVisible()
  })
})


