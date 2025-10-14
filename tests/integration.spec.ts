import { test, expect } from '@playwright/test'

test.describe('Integration Tests', () => {
  test('should complete full contact lifecycle', async ({ page }) => {
    // 1. Create contact
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    await page.fill('textarea[name="message"]', 'Looking for a property')
    
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    
    // 2. Login to dashboard
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    
    // 3. Verify contact appears in dashboard
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=Acheteur')).toBeVisible()
    await expect(page.locator('text=1M')).toBeVisible()
    
    // 4. Open contact detail
    await page.click('tbody tr:has-text("John Doe")')
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=Looking for a property')).toBeVisible()
    
    // 5. Add personal note
    await page.click('button:has-text("Modifier")')
    await page.fill('textarea', 'Very interested client')
    await page.click('button:has-text("Sauvegarder")')
    
    // 6. Rate the contact
    const stars = page.locator('[role="button"]:has-text("5")')
    await stars.click()
    
    // 7. Update contact status
    await page.click('button:has-text("Fermer")')
    await page.selectOption('tbody tr:has-text("John Doe") select', 'CONTACTED')
    
    // 8. Search for the contact
    await page.fill('input[placeholder*="Rechercher"]', 'John')
    await expect(page.locator('tbody tr:has-text("John Doe")')).toBeVisible()
    
    // 9. Filter by type
    await page.selectOption('select:has-text("Tous les types")', 'BUYER')
    await expect(page.locator('tbody tr:has-text("John Doe")')).toBeVisible()
    
    // 10. Edit contact
    await page.click('tbody tr:has-text("John Doe") button:has-text("Modifier")')
    await page.fill('input[name="name"]', 'John Smith')
    await page.click('button:has-text("Sauvegarder")')
    
    // 11. Verify changes
    await expect(page.locator('text=John Smith')).toBeVisible()
    
    // 12. Delete contact
    await page.click('tbody tr:has-text("John Smith") button:has-text("Supprimer")')
    await page.click('button:has-text("Confirmer")')
    
    // 13. Verify deletion
    await expect(page.locator('text=John Smith')).not.toBeVisible()
  })

  test('should handle multiple contacts workflow', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Create multiple contacts
    const contacts = [
      { name: 'Alice Johnson', phone: '+212612345678', type: 'BUYER', budget: '500000' },
      { name: 'Bob Smith', phone: '+212612345679', type: 'SELLER', estimation: '1000000' },
      { name: 'Charlie Brown', phone: '+212612345680', type: 'BUYER', budget: '750000' },
    ]
    
    for (const contact of contacts) {
      await page.goto('/')
      await page.fill('input[name="name"]', contact.name)
      await page.fill('input[name="phone"]', contact.phone)
      await page.selectOption('select[name="type"]', contact.type)
      
      if (contact.budget) {
        await page.fill('input[name="budget"]', contact.budget)
      } else if (contact.estimation) {
        await page.fill('input[name="estimation"]', contact.estimation)
      }
      
      await page.click('button[type="submit"]')
      await expect(page.locator('text=Merci pour votre message')).toBeVisible()
    }
    
    // Verify all contacts in dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=Alice Johnson')).toBeVisible()
    await expect(page.locator('text=Bob Smith')).toBeVisible()
    await expect(page.locator('text=Charlie Brown')).toBeVisible()
    
    // Test bulk operations
    await page.selectOption('select:has-text("Tous les types")', 'BUYER')
    await expect(page.locator('text=Alice Johnson')).toBeVisible()
    await expect(page.locator('text=Charlie Brown')).toBeVisible()
    await expect(page.locator('text=Bob Smith')).not.toBeVisible()
    
    // Test search
    await page.fill('input[placeholder*="Rechercher"]', 'Alice')
    await expect(page.locator('text=Alice Johnson')).toBeVisible()
    await expect(page.locator('text=Bob Smith')).not.toBeVisible()
    await expect(page.locator('text=Charlie Brown')).not.toBeVisible()
  })

  test('should handle admin management workflow', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Change password
    await page.click('button:has-text("Changer mot de passe")')
    await page.fill('input[name="currentPassword"]', 'password123')
    await page.fill('input[name="newPassword"]', 'newpassword123')
    await page.fill('input[name="confirmPassword"]', 'newpassword123')
    await page.click('button:has-text("Changer")')
    
    // Logout
    await page.click('button:has-text("Déconnexion")')
    await expect(page).toHaveURL('/login')
    
    // Login with new password
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'newpassword123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Change password back
    await page.click('button:has-text("Changer mot de passe")')
    await page.fill('input[name="currentPassword"]', 'newpassword123')
    await page.fill('input[name="newPassword"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    await page.click('button:has-text("Changer")')
  })

  test('should handle error recovery scenarios', async ({ page }) => {
    // Test network error recovery
    await page.goto('/')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="phone"]', '+212612345678')
    await page.selectOption('select[name="type"]', 'BUYER')
    await page.fill('input[name="budget"]', '1000000')
    
    // Simulate network error
    await page.route('**/api/contacts', route => route.abort())
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=Erreur de connexion')).toBeVisible()
    
    // Restore network and retry
    await page.unroute('**/api/contacts')
    await page.click('button:has-text("Réessayer")')
    
    // Should succeed
    await expect(page.locator('text=Merci pour votre message')).toBeVisible()
  })

  test('should handle concurrent user scenarios', async ({ browser }) => {
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
    
    // Both users create contacts
    await page1.goto('/')
    await page1.fill('input[name="name"]', 'User 1 Contact')
    await page1.fill('input[name="phone"]', '+212612345678')
    await page1.selectOption('select[name="type"]', 'BUYER')
    await page1.fill('input[name="budget"]', '1000000')
    await page1.click('button[type="submit"]')
    
    await page2.goto('/')
    await page2.fill('input[name="name"]', 'User 2 Contact')
    await page2.fill('input[name="phone"]', '+212612345679')
    await page2.selectOption('select[name="type"]', 'SELLER')
    await page2.fill('input[name="estimation"]', '2000000')
    await page2.click('button[type="submit"]')
    
    // Both users should see both contacts
    await page1.goto('/dashboard')
    await expect(page1.locator('text=User 1 Contact')).toBeVisible()
    await expect(page1.locator('text=User 2 Contact')).toBeVisible()
    
    await page2.goto('/dashboard')
    await expect(page2.locator('text=User 1 Contact')).toBeVisible()
    await expect(page2.locator('text=User 2 Contact')).toBeVisible()
    
    await context1.close()
    await context2.close()
  })
})


