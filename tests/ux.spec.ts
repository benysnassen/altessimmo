import { test, expect } from '@playwright/test'

test.describe('User Experience Tests', () => {
  test('should provide clear feedback for form validation', async ({ page }) => {
    await page.goto('/')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show clear error messages
    await expect(page.locator('.text-red-400')).toBeVisible()
    await expect(page.locator('text=Le nom est requis')).toBeVisible()
    await expect(page.locator('text=Le téléphone est requis')).toBeVisible()
  })

  test('should provide loading states during form submission', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show loading state
    await expect(page.locator('button[disabled]')).toBeVisible()
  })

  test('should provide success feedback after form submission', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should handle keyboard navigation properly', async ({ page }) => {
    await page.goto('/')
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to navigate with keyboard
    await page.keyboard.type('John Doe')
    await page.keyboard.press('Tab')
    await page.keyboard.type('+212612345678')
  })

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Should be able to interact with touch
    await page.tap('input[name="name"]')
    await page.keyboard.type('John Doe')
    
    await page.tap('input[name="phone"]')
    await page.keyboard.type('+212612345678')
    
    await page.tap('button[type="submit"]')
  })

  test('should provide clear error messages for network issues', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/contacts', route => route.abort())
    
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show network error message
    await expect(page.locator('text=Erreur de connexion')).toBeVisible()
  })

  test('should handle form reset properly', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    // Reset form
    await page.click('button[type="reset"]')
    
    // Fields should be cleared
    await expect(page.locator('input[name="name"]')).toHaveValue('')
    await expect(page.locator('input[name="phone"]')).toHaveValue('')
  })

  test('should provide helpful placeholder text', async ({ page }) => {
    await page.goto('/')
    
    const nameInput = page.locator('input[name="name"]')
    const phoneInput = page.locator('input[name="phone"]')
    const emailInput = page.locator('input[name="email"]')
    
    await expect(nameInput).toHaveAttribute('placeholder')
    await expect(phoneInput).toHaveAttribute('placeholder')
    await expect(emailInput).toHaveAttribute('placeholder')
  })

  test('should handle form auto-save', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    
    // Navigate away and back
    await page.goto('/login')
    await page.goBack()
    
    // Form should retain values (if auto-save is implemented)
    // This test would need to be adjusted based on actual implementation
  })

  test('should provide clear confirmation for destructive actions', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Try to delete a contact
    await page.click('tbody tr:first-child button:has-text("Supprimer")')
    
    // Should show confirmation dialog
    await expect(page.locator('text=Êtes-vous sûr')).toBeVisible()
  })

  test('should handle form validation in real-time', async ({ page }) => {
    await page.goto('/')
    
    const nameInput = page.locator('input[name="name"]')
    const phoneInput = page.locator('input[name="phone"]')
    
    // Type invalid data
    await nameInput.type('a')
    await phoneInput.type('123')
    
    // Should show validation errors in real-time
    await expect(page.locator('text=Nom trop court')).toBeVisible()
    await expect(page.locator('text=Format de téléphone invalide')).toBeVisible()
  })

  test('should provide clear feedback for successful operations', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Should show welcome message or success indicator
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should handle form submission with Enter key', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    // Submit with Enter key
    await page.keyboard.press('Enter')
    
    // Should submit the form
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should handle form submission with Ctrl+Enter', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    // Submit with Ctrl+Enter
    await page.keyboard.press('Control+Enter')
    
    // Should submit the form
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })
})


