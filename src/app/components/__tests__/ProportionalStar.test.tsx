import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProportionalStar from '../ProportionalStar'

describe('ProportionalStar Component', () => {
  test('renders rating number and star', () => {
    render(<ProportionalStar rating={4} />)
    
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByTestId('star-container')).toBeInTheDocument()
  })

  test('displays correct fill percentage', () => {
    render(<ProportionalStar rating={3} />)
    
    const fillDiv = screen.getByTestId('star-container').querySelector('div')
    expect(fillDiv).toHaveStyle('width: 60%') // 3/5 * 100%
  })

  test('shows correct size variants', () => {
    const { rerender } = render(<ProportionalStar rating={3} size="sm" />)
    
    let star = screen.getByTestId('star-container').querySelector('svg')
    expect(star).toHaveClass('w-3', 'h-3')
    
    rerender(<ProportionalStar rating={3} size="lg" />)
    star = screen.getByTestId('star-container').querySelector('svg')
    expect(star).toHaveClass('w-5', 'h-5')
  })

  test('handles edge cases correctly', () => {
    const { rerender } = render(<ProportionalStar rating={0} />)
    
    let fillDiv = screen.getByTestId('star-container').querySelector('div')
    expect(fillDiv).toHaveStyle('width: 0%')
    
    rerender(<ProportionalStar rating={5} />)
    fillDiv = screen.getByTestId('star-container').querySelector('div')
    expect(fillDiv).toHaveStyle('width: 100%')
  })

  test('displays white text for rating number', () => {
    render(<ProportionalStar rating={4} />)
    
    const ratingText = screen.getByText('4')
    expect(ratingText).toHaveClass('text-white')
  })
})
