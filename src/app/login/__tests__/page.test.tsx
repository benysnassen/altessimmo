import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginPage from '../page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('Login Page', () => {
  beforeEach(() => {
    fetch.mockClear()
    mockPush.mockClear()
  })

  test('renders login form with username and password fields', () => {
    render(<LoginPage />)
    
    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  test('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Nom d\'utilisateur requis')).toBeInTheDocument()
      expect(screen.getByText('Mot de passe requis')).toBeInTheDocument()
    })
  })

  test('successful login redirects to dashboard', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mock-token' }),
    })
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'admin')
    await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'password123',
        }),
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('displays error message for invalid credentials', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Identifiants invalides' }),
    })
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'wrong')
    await user.type(screen.getByLabelText(/mot de passe/i), 'wrong')
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erreur de connexion au serveur')).toBeInTheDocument()
    })
  })

  test('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/nom d'utilisateur/i), 'admin')
    await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument()
    })
  })
})
