import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Dashboard from '../page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Dashboard Component', () => {
  const mockContacts = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+212612345678',
      email: 'john@example.com',
      type: 'BUYER',
      budget: '1000000',
      status: 'NEW',
      personalNote: 'Test note',
      rating: 4,
      confidential: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '+212612345679',
      email: 'jane@example.com',
      type: 'SELLER',
      estimation: '2000000',
      status: 'CONTACTED',
      personalNote: null,
      rating: 5,
      confidential: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ]

  beforeEach(() => {
    fetch.mockClear()
    mockPush.mockClear()
    mockLocalStorage.getItem.mockReturnValue('mock-token')
    
    // Mock successful API calls
    fetch.mockImplementation((url) => {
      if (url.includes('/api/contacts')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockContacts,
        })
      }
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ username: 'admin' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    })
  })

  test('renders dashboard with statistics cards', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Nouveaux contacts')).toBeInTheDocument()
      expect(screen.getByText('Acheteurs actifs')).toBeInTheDocument()
      expect(screen.getByText('Vendeurs actifs')).toBeInTheDocument()
      expect(screen.getByText('Ventes conclues')).toBeInTheDocument()
    })
  })

  test('displays contacts in table', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  test('search functionality works', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText(/rechercher/i)
    await user.type(searchInput, 'John')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  test('filter by type works', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
    
    const typeFilter = screen.getByDisplayValue('Tous les types')
    await user.selectOptions(typeFilter, 'BUYER')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  test('filter by status works', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
    
    const statusFilter = screen.getByDisplayValue('Tous les statuts')
    await user.selectOptions(statusFilter, 'NEW')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  test('opens contact detail card when clicking on contact', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    const contactRow = screen.getByText('John Doe').closest('tr')
    await user.click(contactRow!)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Test note')).toBeInTheDocument()
    })
  })

  test('logout functionality works', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    const logoutButton = screen.getByRole('button', { name: /déconnexion/i })
    await user.click(logoutButton)
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('admin-token')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  test('displays correct statistics', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      // Should show 2 new contacts
      expect(screen.getByText('2')).toBeInTheDocument()
      // Should show 1 active buyer
      expect(screen.getByText('1')).toBeInTheDocument()
      // Should show 1 active seller
      expect(screen.getByText('1')).toBeInTheDocument()
      // Should show 0 sales
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })
})
