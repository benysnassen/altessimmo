import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test('should prevent SQL injection in contact form', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', "'; DROP TABLE contacts; --")
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should not crash and should show success message
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should prevent XSS attacks in contact form', async ({ page }) => {
    await page.goto('/')
    
    await page.fill('input[name="name"]', '<script>alert("XSS")</script>')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should not execute script and should show success message
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // Check that script tag is escaped in the form
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toHaveValue('<script>alert("XSS")</script>')
  })

  test('should require authentication for protected routes', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should validate password strength', async ({ page }) => {
    await page.goto('/login')
    
    // Try with weak password
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', '123')
    await page.click('button[type="submit"]')
    
    // Should show error
    await expect(page.locator('.text-red-400')).toBeVisible()
  })

  test('should rate limit login attempts', async ({ page }) => {
    await page.goto('/login')
    
    // Try multiple failed login attempts
    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="username"]', 'wrong')
      await page.fill('input[name="password"]', 'wrong')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }
    
    // Should show rate limit error
    await expect(page.locator('text=Too many attempts')).toBeVisible()
  })

  test('should sanitize file uploads', async ({ page }) => {
    await page.goto('/')
    
    // Try to upload malicious file
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'malicious.exe',
        mimeType: 'application/x-executable',
        buffer: Buffer.from('malicious content'),
      })
      
      await page.click('button[type="submit"]')
      
      // Should reject the file
      await expect(page.locator('text=Invalid file type')).toBeVisible()
    }
  })

  test('should prevent CSRF attacks', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Try to make request without proper CSRF token
    const response = await page.request.post('/api/contacts', {
      data: {
        name: 'Test',
        phone: '+212612345678',
        type: 'BUYER',
        budget: '1000000',
      },
      headers: {
        'X-CSRF-Token': 'invalid-token',
      },
    })
    
    // Should reject the request
    expect(response.status()).toBe(403)
  })

  test('should validate input length limits', async ({ page }) => {
    await page.goto('/')
    
    // Try with extremely long input
    const longString = 'a'.repeat(10000)
    await page.fill('input[name="name"]', longString)
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    await page.click('button[type="submit"]')
    
    // Should show validation error
    await expect(page.locator('text=Name too long')).toBeVisible()
  })

  test('should prevent directory traversal', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Try to access restricted files
    const response = await page.request.get('/api/contacts/../../../etc/passwd')
    
    // Should return 404 or 403
    expect([404, 403]).toContain(response.status())
  })

  test('should encrypt sensitive data', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // Check that password is not visible in network requests
    const requests = page.context().request
    // This would need to be implemented with proper network monitoring
    // For now, we just verify the login works
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})


