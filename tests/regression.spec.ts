import { test, expect } from '@playwright/test'

test.describe('Regression Tests', () => {
  test('should maintain contact form functionality after updates', async ({ page }) => {
    await page.goto('/')
    
    // Test all form fields
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    await page.fill('textarea[name="message"]', 'Test message')
    await page.check('input[name="confidential"]')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should maintain dashboard statistics accuracy', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Check that statistics are displayed
    await expect(page.locator('text=Nouveaux contacts')).toBeVisible()
    await expect(page.locator('text=Acheteurs actifs')).toBeVisible()
    await expect(page.locator('text=Vendeurs actifs')).toBeVisible()
    await expect(page.locator('text=Ventes conclues')).toBeVisible()
    
    // Check that numbers are displayed
    const statsCards = page.locator('.grid-cols-2 > div')
    await expect(statsCards).toHaveCount(4)
  })

  test('should maintain search functionality', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const searchInput = page.locator('input[placeholder*="Rechercher"]')
    await expect(searchInput).toBeVisible()
    
    await searchInput.fill('test')
    await expect(searchInput).toHaveValue('test')
  })

  test('should maintain filter functionality', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const typeFilter = page.locator('select:has-text("Tous les types")')
    const statusFilter = page.locator('select:has-text("Tous les statuts")')
    
    await expect(typeFilter).toBeVisible()
    await expect(statusFilter).toBeVisible()
    
    await typeFilter.selectOption('BUYER')
    await statusFilter.selectOption('NEW')
  })

  test('should maintain contact detail card functionality', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Click on first contact
    await page.click('tbody tr:first-child')
    
    // Check that detail card opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Check that close button works
    await page.click('button:has-text("Fermer")')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should maintain responsive design', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Check mobile layout
    await expect(page.locator('.grid-cols-2')).toBeVisible()
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    
    // Check desktop layout
    await expect(page.locator('.grid-cols-4')).toBeVisible()
  })

  test('should maintain authentication flow', async ({ page }) => {
    // Test login
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Test logout
    await page.click('button:has-text("Déconnexion")')
    await expect(page).toHaveURL('/login')
    
    // Test protected route
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('should maintain form validation', async ({ page }) => {
    await page.goto('/')
    
    // Test empty form submission
    await page.click('button[type="submit"]')
    await expect(page.locator('.text-red-400')).toBeVisible()
    
    // Test invalid email
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Email invalide')).toBeVisible()
  })

  test('should maintain API error handling', async ({ page }) => {
    // Simulate API error
    await page.route('**/api/contacts', route => route.abort())
    
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Erreur de connexion')).toBeVisible()
  })

  test('should maintain data persistence', async ({ page }) => {
    // Create contact
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    await page.click('button[type="submit"]')
    
    // Login and check contact exists
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await expect(page.locator('text=John Doe')).toBeVisible()
  })

  test('should maintain user session', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should maintain contact CRUD operations', async ({ page }) => {
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
    
    // Read contact
    await page.goto('/dashboard')
    await expect(page.locator('text=John Doe')).toBeVisible()
    
    // Update contact
    await page.click('tbody tr:has-text("John Doe") button:has-text("Modifier")')
    await page.fill('input[name="name"]', 'John Smith')
    await page.click('button:has-text("Sauvegarder")')
    
    // Verify update
    await expect(page.locator('text=John Smith')).toBeVisible()
    
    // Delete contact
    await page.click('tbody tr:has-text("John Smith") button:has-text("Supprimer")')
    await page.click('button:has-text("Confirmer")')
    
    // Verify deletion
    await expect(page.locator('text=John Smith')).not.toBeVisible()
  })
})


