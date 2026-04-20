'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  onRatingChange: (rating: number | null) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  size = 'md', 
  interactive = true 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleStarClick = (starRating: number) => {
    if (!interactive) return;
    
    // Si on clique sur la même étoile que la note actuelle, on la supprime
    if (rating === starRating) {
      onRatingChange(null);
    } else {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!interactive) return;
    setHoverRating(starRating);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(null);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (displayRating || 0);
        const isHovered = hoverRating === star;
        
        return (
          <button
            key={star}
            type="button"
            aria-label={`Noter ${star} sur 5`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`transition-all duration-200 ${
              interactive 
                ? 'hover:scale-110 cursor-pointer' 
                : 'cursor-default'
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400 hover:text-yellow-300'
              } ${
                isHovered && interactive
                  ? 'drop-shadow-lg'
                  : ''
              }`}
            />
          </button>
        );
      })}
      {rating && (
        <span className="text-xs text-white/60 ml-1">
          ({rating}/5)
        </span>
      )}
    </div>
  );
}
