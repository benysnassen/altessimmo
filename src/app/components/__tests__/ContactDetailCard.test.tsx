import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ContactDetailCard from '../ContactDetailCard'

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
    fetch.mockClear()
    mockOnClose.mockClear()
    mockOnUpdateNote.mockClear()
    mockOnUpdateRating.mockClear()
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
    expect(screen.getByText('+212 612-345-678')).toBeInTheDocument()
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
    
    const closeButton = screen.getByRole('button', { name: /fermer/i })
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('allows editing personal note', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })
    
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
    
    const textarea = screen.getByPlaceholderText(/ex: très bon investisseur/i)
    await user.clear(textarea)
    await user.type(textarea, 'Updated note')
    
    const saveButton = screen.getByText('Sauvegarder')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contacts/personal-note', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: '1',
          personalNote: 'Updated note',
        }),
      })
    })
  })

  test('allows rating a contact', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })
    
    render(
      <ContactDetailCard
        contact={mockContact}
        onClose={mockOnClose}
        onUpdateNote={mockOnUpdateNote}
        onUpdateRating={mockOnUpdateRating}
      />
    )
    
    const starButtons = screen.getAllByRole('button')
    const fifthStar = starButtons.find(button => 
      button.getAttribute('aria-label')?.includes('5')
    )
    
    if (fifthStar) {
      await user.click(fifthStar)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/contacts/rating/', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: '1',
            rating: 5,
          }),
        })
      })
    }
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
