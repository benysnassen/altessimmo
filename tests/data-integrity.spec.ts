import { test, expect } from '@playwright/test'

test.describe('Data Integrity Tests', () => {
  test('should maintain data consistency across operations', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Create contact
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    await page.fill('textarea[name="message"]', 'Test message')
    await page.check('input[name="confidential"]')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // Verify data in dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=Acheteur')).toBeVisible()
    await expect(page.locator('text=1M')).toBeVisible()
    
    // Open contact detail and verify all data
    await page.click('tbody tr:has-text("John Doe")')
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=+212 612-345-678')).toBeVisible()
    await expect(page.locator('text=john@example.com')).toBeVisible()
    await expect(page.locator('text=Test message')).toBeVisible()
    await expect(page.locator('text=Confidentiel')).toBeVisible()
  })

  test('should handle data validation correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test invalid phone number
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', 'invalid-phone')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Format de téléphone invalide')).toBeVisible()
    
    // Test invalid email
    await page.fill('input[name="phone"]', '+212612345678')
    await page.fill('input[name="email"]', 'invalid-email')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Format d\'email invalide')).toBeVisible()
    
    // Test invalid budget
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="budget"]', 'invalid-budget')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Budget invalide')).toBeVisible()
  })

  test('should handle data truncation correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test long name
    const longName = 'a'.repeat(1000)
    await page.fill('input[name="name"]', longName)
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Nom trop long')).toBeVisible()
    
    // Test long message
    await page.fill('input[name="name"]', 'John Doe')
    const longMessage = 'a'.repeat(10000)
    await page.fill('textarea[name="message"]', longMessage)
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Message trop long')).toBeVisible()
  })

  test('should handle special characters correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test special characters in name
    await page.fill('input[name="name"]', 'José María O\'Connor')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // Verify data is stored correctly
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await expect(page.locator('text=José María O\'Connor')).toBeVisible()
  })

  test('should handle Unicode characters correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test Unicode characters
    await page.fill('input[name="name"]', 'محمد العربي')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // Verify data is stored correctly
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await expect(page.locator('text=محمد العربي')).toBeVisible()
  })

  test('should handle empty and null values correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test with empty optional fields
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    // Leave email and message empty
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // Verify data is stored correctly
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await expect(page.locator('text=John Doe')).toBeVisible()
  })

  test('should handle data updates correctly', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Create contact
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    await page.click('button[type="submit"]')
    
    // Update contact
    await page.goto('/dashboard')
    await page.click('tbody tr:has-text("John Doe") button:has-text("Modifier")')
    await page.fill('input[name="name"]', 'John Smith')
    await page.fill('input[name="budget"]', '2000000')
    await page.click('button:has-text("Sauvegarder")')
    
    // Verify update
    await expect(page.locator('text=John Smith')).toBeVisible()
    await expect(page.locator('text=2M')).toBeVisible()
  })

  test('should handle data deletion correctly', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Create contact
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    await page.click('button[type="submit"]')
    
    // Delete contact
    await page.goto('/dashboard')
    await page.click('tbody tr:has-text("John Doe") button:has-text("Supprimer")')
    await page.click('button:has-text("Confirmer")')
    
    // Verify deletion
    await expect(page.locator('text=John Doe')).not.toBeVisible()
  })

  test('should handle concurrent data modifications', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()
    
    // Both users login
    await page1.goto('/login')
    await page1.fill('input[name="username"]', 'admin')
    await page1.fill('input[name="password"]', 'password123')
    await page1.click('button[type="submit"]')
    await page1.waitForURL('/dashboard')
    
    await page2.goto('/login')
    await page2.fill('input[name="username"]', 'admin')
    await page2.fill('input[name="password"]', 'password123')
    await page2.click('button[type="submit"]')
    await page2.waitForURL('/dashboard')
    
    // Both users create contacts with same phone number
    await page1.goto('/')
    await page1.fill('input[name="name"]', 'User 1')
    await page1.fill('input[name="phone"]', '+212612345678')
    await page1.selectOption('select[name="type"]', 'BUYER')
    await page1.fill('input[name="budget"]', '1000000')
    await page1.click('button[type="submit"]')
    
    await page2.goto('/')
    await page2.fill('input[name="name"]', 'User 2')
    await page2.fill('input[name="phone"]', '+212612345678')
    await page2.selectOption('select[name="type"]', 'SELLER')
    await page2.fill('input[name="estimation"]', '2000000')
    await page2.click('button[type="submit"]')
    
    // Both users should see both contacts
    await page1.goto('/dashboard')
    await expect(page1.locator('text=User 1')).toBeVisible()
    await expect(page1.locator('text=User 2')).toBeVisible()
    
    await page2.goto('/dashboard')
    await expect(page2.locator('text=User 1')).toBeVisible()
    await expect(page2.locator('text=User 2')).toBeVisible()
    
    await context1.close()
    await context2.close()
  })
})


