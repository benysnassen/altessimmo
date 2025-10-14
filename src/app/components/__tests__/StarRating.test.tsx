import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import StarRating from '../StarRating'

describe('StarRating Component', () => {
  const mockOnRatingChange = jest.fn()

  beforeEach(() => {
    mockOnRatingChange.mockClear()
  })

  test('renders 5 stars', () => {
    render(<StarRating rating={null} onRatingChange={mockOnRatingChange} />)
    
    const stars = screen.getAllByRole('button')
    expect(stars).toHaveLength(5)
  })

  test('displays correct rating', () => {
    render(<StarRating rating={3} onRatingChange={mockOnRatingChange} />)
    
    const stars = screen.getAllByRole('button')
    // First 3 stars should be filled
    expect(stars[0].querySelector('svg')).toHaveClass('text-yellow-400')
    expect(stars[1].querySelector('svg')).toHaveClass('text-yellow-400')
    expect(stars[2].querySelector('svg')).toHaveClass('text-yellow-400')
    // Last 2 stars should be empty
    expect(stars[3].querySelector('svg')).toHaveClass('text-gray-400')
    expect(stars[4].querySelector('svg')).toHaveClass('text-gray-400')
  })

  test('calls onRatingChange when star is clicked', async () => {
    const user = userEvent.setup()
    render(<StarRating rating={null} onRatingChange={mockOnRatingChange} />)
    
    const thirdStar = screen.getAllByRole('button')[2]
    await user.click(thirdStar)
    
    expect(mockOnRatingChange).toHaveBeenCalledWith(3)
  })

  test('allows clearing rating by clicking same star', async () => {
    const user = userEvent.setup()
    render(<StarRating rating={3} onRatingChange={mockOnRatingChange} />)
    
    const thirdStar = screen.getAllByRole('button')[2]
    await user.click(thirdStar)
    
    expect(mockOnRatingChange).toHaveBeenCalledWith(null)
  })

  test('shows correct size variants', () => {
    const { rerender } = render(
      <StarRating rating={3} onRatingChange={mockOnRatingChange} size="sm" />
    )
    
    let stars = screen.getAllByRole('button')
    expect(stars[0].querySelector('svg')).toHaveClass('w-3', 'h-3')
    
    rerender(<StarRating rating={3} onRatingChange={mockOnRatingChange} size="lg" />)
    stars = screen.getAllByRole('button')
    expect(stars[0].querySelector('svg')).toHaveClass('w-5', 'h-5')
  })

  test('is not interactive when interactive is false', () => {
    render(
      <StarRating 
        rating={3} 
        onRatingChange={mockOnRatingChange} 
        interactive={false} 
      />
    )
    
    const stars = screen.getAllByRole('button')
    stars.forEach(star => {
      expect(star).toHaveAttribute('disabled')
    })
  })
})
