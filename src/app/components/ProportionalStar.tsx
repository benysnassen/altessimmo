'use client';

import { Star } from 'lucide-react';

interface ProportionalStarProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProportionalStar({ rating, size = 'md' }: ProportionalStarProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Calculer le pourcentage de remplissage
  const fillPercentage = (rating / 5) * 100;

  return (
    <div className="flex items-center gap-1">
      <span className={`${textSizeClasses[size]} text-white font-medium`}>{rating}</span>
      <div className="relative flex items-center justify-center">
        {/* Étoile de fond (vide) */}
        <Star className={`${sizeClasses[size]} text-gray-400`} />
        {/* Étoile remplie avec gradient horizontal */}
        <div 
          className="absolute top-0 left-0 overflow-hidden flex items-center justify-center"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
        </div>
      </div>
    </div>
  );
}
