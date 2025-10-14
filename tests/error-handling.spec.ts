import { test, expect } from '@playwright/test'

test.describe('Error Handling Tests', () => {
  test('should handle network timeouts gracefully', async ({ page }) => {
    // Simulate network timeout
    await page.route('**/api/**', route => {
      setTimeout(() => route.abort(), 10000) // 10 second timeout
    })
    
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show timeout error
    await expect(page.locator('text=Timeout de connexion')).toBeVisible()
  })

  test('should handle server errors gracefully', async ({ page }) => {
    // Simulate server error
    await page.route('**/api/contacts', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show server error
    await expect(page.locator('text=Erreur du serveur')).toBeVisible()
  })

  test('should handle validation errors gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Submit form with invalid data
    await page.fill('input[name="name"]', '')
    await page.fill('input[name="phone"]', 'invalid')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', 'invalid')
    
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Le nom est requis')).toBeVisible()
    await expect(page.locator('text=Format de téléphone invalide')).toBeVisible()
    await expect(page.locator('text=Format d\'email invalide')).toBeVisible()
    await expect(page.locator('text=Budget invalide')).toBeVisible()
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('/login')
    
    // Try to login with invalid credentials
    await page.fill('input[name="username"]', 'invalid')
    await page.fill('input[name="password"]', 'invalid')
    await page.click('button[type="submit"]')
    
    // Should show authentication error
    await expect(page.locator('text=Identifiants invalides')).toBeVisible()
  })

  test('should handle authorization errors gracefully', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should handle database connection errors gracefully', async ({ page }) => {
    // Simulate database connection error
    await page.route('**/api/contacts', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service Unavailable' })
      })
    })
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Should show database error
    await expect(page.locator('text=Service temporairement indisponible')).toBeVisible()
  })

  test('should handle file upload errors gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Try to upload invalid file
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'malicious.exe',
        mimeType: 'application/x-executable',
        buffer: Buffer.from('malicious content'),
      })
      
      await page.click('button[type="submit"]')
      
      // Should show file upload error
      await expect(page.locator('text=Type de fichier non autorisé')).toBeVisible()
    }
  })

  test('should handle rate limiting gracefully', async ({ page }) => {
    await page.goto('/login')
    
    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      await page.fill('input[name="username"]', 'admin')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }
    
    // Should show rate limit error
    await expect(page.locator('text=Trop de tentatives')).toBeVisible()
  })

  test('should handle memory errors gracefully', async ({ page }) => {
    // Simulate memory error
    await page.route('**/api/contacts', route => {
      route.fulfill({
        status: 507,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Insufficient Storage' })
      })
    })
    
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show memory error
    await expect(page.locator('text=Espace de stockage insuffisant')).toBeVisible()
  })

  test('should handle unexpected errors gracefully', async ({ page }) => {
    // Simulate unexpected error
    await page.route('**/api/contacts', route => {
      route.fulfill({
        status: 418,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'I\'m a teapot' })
      })
    })
    
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show generic error
    await expect(page.locator('text=Une erreur inattendue s\'est produite')).toBeVisible()
  })

  test('should handle client-side errors gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Inject JavaScript error
    await page.addInitScript(() => {
      window.addEventListener('error', (e) => {
        console.error('Client error:', e.error)
      })
    })
    
    // Try to cause a client-side error
    await page.evaluate(() => {
      // This should cause an error
      const element = document.querySelector('non-existent-element')
      element.someProperty = 'value'
    })
    
    // Page should still be functional
    await expect(page.locator('form')).toBeVisible()
  })

  test('should handle browser compatibility errors gracefully', async ({ page }) => {
    // Simulate old browser
    await page.addInitScript(() => {
      // Remove modern features
      delete window.fetch
      delete window.Promise
    })
    
    await page.goto('/')
    
    // Should show compatibility error
    await expect(page.locator('text=Navigateur non supporté')).toBeVisible()
  })

  test('should handle data corruption gracefully', async ({ page }) => {
    // Simulate corrupted data response
    await page.route('**/api/contacts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'corrupted json data'
      })
    })
    
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Should show data corruption error
    await expect(page.locator('text=Données corrompues')).toBeVisible()
  })

  test('should handle session expiration gracefully', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Simulate session expiration
    await page.evaluate(() => {
      localStorage.removeItem('admin-token')
    })
    
    // Try to perform an action
    await page.click('tbody tr:first-child')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})


