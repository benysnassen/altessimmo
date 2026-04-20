import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ContactDetailCard from '../ContactDetailCard'

jest.mock('../BuyerPropertyInterestsSection', () => ({
  __esModule: true,
  default: () => null,
}))

// Mock fetch
global.fetch = jest.fn()

describe('ContactDetailCard Component', () => {
  const mockContact = {
    id: '1',
    name: 'John Doe',
    phone: '+212612345678',
    email: 'john@example.com',
    type: 'BUYER' as const,
    budget: '1000000',
    status: 'NEW' as const,
    personalNote: 'Test note',
    rating: 4,
    confidential: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  const mockOnClose = jest.fn()
  const mockOnUpdateNote = jest.fn()
  const mockOnUpdateRating = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnUpdateNote.mockClear()
    mockOnUpdateRating.mockClear()
    fetch.mockReset()
    fetch.mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/property-interests/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        }) as Promise<Response>
      }
      if (url.includes('/api/properties')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        }) as Promise<Response>
      }
      if (url.includes('/api/contacts/personal-note')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        }) as Promise<Response>
      }
      if (url.includes('/api/contacts/rating')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        }) as Promise<Response>
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      }) as Promise<Response>
    })
  })

  test('renders contact details correctly', () => {
    render(
      <ContactDetailCard
        contact={mockContact}
        onClose={mockOnClose}
        onUpdateNote={mockOnUpdateNote}
        onUpdateRating={mockOnUpdateRating}
      />
    )
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(document.body.textContent).toMatch(/612/)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Test note')).toBeInTheDocument()
  })

  test('closes when clicking close button', async () => {
    const user = userEvent.setup()
    render(
      <ContactDetailCard
        contact={mockContact}
        onClose={mockOnClose}
        onUpdateNote={mockOnUpdateNote}
        onUpdateRating={mockOnUpdateRating}
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /fermer la fiche/i })
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('allows editing personal note', async () => {
    const user = userEvent.setup()
    
    render(
      <ContactDetailCard
        contact={mockContact}
        onClose={mockOnClose}
        onUpdateNote={mockOnUpdateNote}
        onUpdateRating={mockOnUpdateRating}
      />
    )
    
    const editButton = screen.getByText('Modifier')
    await user.click(editButton)
    
    const textarea = screen.getByPlaceholderText(/Ajouter une note personnelle/i)
    await user.clear(textarea)
    await user.type(textarea, 'Updated note')
    
    const saveButton = screen.getByText('Sauvegarder')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnUpdateNote).toHaveBeenCalledWith('1', 'Updated note')
    })
  })

  test('allows rating a contact', async () => {
    const user = userEvent.setup()
    
    render(
      <ContactDetailCard
        contact={mockContact}
        onClose={mockOnClose}
        onUpdateNote={mockOnUpdateNote}
        onUpdateRating={mockOnUpdateRating}
      />
    )
    
    const fifthStar = screen.getByRole('button', { name: /Noter 5 sur 5/i })
    await user.click(fifthStar)

    await waitFor(() => {
      expect(mockOnUpdateRating).toHaveBeenCalledWith('1', 5)
    })
  })

  test('displays confidential badge when contact is confidential', () => {
    const confidentialContact = { ...mockContact, confidential: true }
    
    render(
      <ContactDetailCard
        contact={confidentialContact}
        onClose={mockOnClose}
        onUpdateNote={mockOnUpdateNote}
        onUpdateRating={mockOnUpdateRating}
      />
    )
    
    expect(screen.getByText('Confidentiel')).toBeInTheDocument()
  })

  test('shows edit button for contact modification', async () => {
    const user = userEvent.setup()
    render(
      <ContactDetailCard
        contact={mockContact}
        onClose={mockOnClose}
        onUpdateNote={mockOnUpdateNote}
        onUpdateRating={mockOnUpdateRating}
      />
    )
    
    const editButton = screen.getByRole('button', { name: /modifier le contact/i })
    await user.click(editButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })
})
