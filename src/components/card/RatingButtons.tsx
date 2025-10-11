/**
 * RatingButtons Component
 * Displays rating buttons (1-5) for spaced repetition
 * Supports keyboard shortcuts (1-5 keys)
 */

import { useEffect } from 'react';

const ratings = [
  { value: 1, label: 'Again', description: "Didn't remember", color: 'rating-btn-again' },
  { value: 2, label: 'Hard', description: 'Barely remembered', color: 'rating-btn-hard' },
  { value: 3, label: 'Good', description: 'Remembered', color: 'rating-btn-good' },
  { value: 4, label: 'Easy', description: 'Easy recall', color: 'rating-btn-easy' },
  { value: 5, label: 'Perfect', description: 'Instant recall', color: 'rating-btn-perfect' },
];

export default function RatingButtons({ onRate }) {
  // Keyboard shortcuts (1-5)
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= 5) {
        e.preventDefault();
        onRate(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onRate]);

  return (
    <div className="animate-fadeIn">

      {/* Single row on all screen sizes */}
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            onClick={() => onRate(rating.value)}
            className={`
              ${rating.color}
              px-2 py-3 md:px-4 md:py-4
              rounded-lg font-semibold
              transition-all duration-200
              active:scale-95 hover:scale-[1.02] hover:shadow-md
              flex flex-col items-center justify-center
              min-h-20 md:min-h-24
              border-none
              focus:outline-none focus:ring-2 focus:ring-gray-400
            `}
            aria-label={`Rate as ${rating.label}: ${rating.description}`}
          >
            <span className="text-base md:text-lg font-bold mb-1">{rating.value}</span>
            <span className="text-xs md:text-sm font-semibold">{rating.label}</span>
            <span className="text-[10px] md:text-xs mt-0.5 leading-tight opacity-80">{rating.description}</span>
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-theme-textDim mt-4 text-xs hidden md:block">
        💡 Tip: Use keyboard numbers 1-5 for faster reviewing
      </p>
    </div>
  );
}

