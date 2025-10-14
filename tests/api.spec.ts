import { test, expect } from '@playwright/test'

test.describe('API Tests', () => {
  test('should create contact via API', async ({ request }) => {
    const response = await request.post('/api/contacts', {
      data: {
        name: 'Test User',
        phone: '+212612345678',
        email: 'test@example.com',
        type: 'BUYER',
        budget: '1000000',
        message: 'Test message',
        confidential: false,
      },
    })

    expect(response.status()).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.contact.name).toBe('Test User')
  })

  test('should get contacts via API', async ({ request }) => {
    const response = await request.get('/api/contacts')
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('should update contact status via API', async ({ request }) => {
    // First create a contact
    const createResponse = await request.post('/api/contacts', {
      data: {
        name: 'Test User',
        phone: '+212612345678',
        type: 'BUYER',
        budget: '1000000',
      },
    })
    
    const { contact } = await createResponse.json()
    
    // Then update its status
    const updateResponse = await request.put('/api/contacts', {
      data: {
        id: contact.id,
        status: 'CONTACTED',
      },
    })
    
    expect(updateResponse.status()).toBe(200)
    const data = await updateResponse.json()
    expect(data.contact.status).toBe('CONTACTED')
  })

  test('should update contact personal note via API', async ({ request }) => {
    // First create a contact
    const createResponse = await request.post('/api/contacts', {
      data: {
        name: 'Test User',
        phone: '+212612345678',
        type: 'BUYER',
        budget: '1000000',
      },
    })
    
    const { contact } = await createResponse.json()
    
    // Then update its personal note
    const updateResponse = await request.patch('/api/contacts/personal-note', {
      data: {
        contactId: contact.id,
        personalNote: 'Test personal note',
      },
    })
    
    expect(updateResponse.status()).toBe(200)
    const data = await updateResponse.json()
    expect(data.contact.personalNote).toBe('Test personal note')
  })

  test('should update contact rating via API', async ({ request }) => {
    // First create a contact
    const createResponse = await request.post('/api/contacts', {
      data: {
        name: 'Test User',
        phone: '+212612345678',
        type: 'BUYER',
        budget: '1000000',
      },
    })
    
    const { contact } = await createResponse.json()
    
    // Then update its rating
    const updateResponse = await request.patch('/api/contacts/rating/', {
      data: {
        contactId: contact.id,
        rating: 5,
      },
    })
    
    expect(updateResponse.status()).toBe(200)
    const data = await updateResponse.json()
    expect(data.contact.rating).toBe(5)
  })

  test('should delete contact via API', async ({ request }) => {
    // First create a contact
    const createResponse = await request.post('/api/contacts', {
      data: {
        name: 'Test User',
        phone: '+212612345678',
        type: 'BUYER',
        budget: '1000000',
      },
    })
    
    const { contact } = await createResponse.json()
    
    // Then delete it
    const deleteResponse = await request.delete('/api/contacts', {
      data: { id: contact.id },
    })
    
    expect(deleteResponse.status()).toBe(200)
    const data = await deleteResponse.json()
    expect(data.success).toBe(true)
  })

  test('should authenticate admin via API', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'password123',
      },
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.token).toBeDefined()
    expect(data.user).toBeDefined()
  })

  test('should change admin password via API', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        username: 'admin',
        password: 'password123',
      },
    })
    
    const { token } = await loginResponse.json()
    
    // Then change password
    const changeResponse = await request.post('/api/admin/change-password', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      },
    })
    
    expect(changeResponse.status()).toBe(200)
    const data = await changeResponse.json()
    expect(data.success).toBe(true)
  })

  test('should handle validation errors', async ({ request }) => {
    const response = await request.post('/api/contacts', {
      data: {
        // Missing required fields
        email: 'test@example.com',
      },
    })
    
    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  test('should handle unauthorized access', async ({ request }) => {
    const response = await request.get('/api/contacts', {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    })
    
    expect(response.status()).toBe(401)
  })
})


