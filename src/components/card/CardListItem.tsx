/**
 * CardListItem Component
 * Displays a single card in the deck detail view with edit/delete actions
 */

import { ReactNode } from 'react';
import { CardListItemProps } from '../../types/components';

// Helper function to render text with bold and underline markdown
function renderTextWithFormatting(text: string): ReactNode[] | null {
  if (!text) return null;
  
  // Split by both **bold** and __underline__ patterns
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and render bold
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-bold">{boldText}</strong>;
    } else if (part.startsWith('__') && part.endsWith('__')) {
      // Remove the __ markers and render underline
      const underlineText = part.slice(2, -2);
      return <u key={index} className="underline">{underlineText}</u>;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function CardListItem({ 
  card,
  showBack = false,
  onEdit, 
  onDelete 
}: CardListItemProps) {

  const getStatusBarColor = (): string => {
    // Gray for new cards (never reviewed)
    if (!card.reviews || card.reviews.length === 0) return 'bg-theme-lighter';

    const ef = card.easeFactor;
    if (ef < 1.8) return 'bg-error';        // Red: Very Hard (struggling)
    if (ef < 2.2) return 'bg-warning';      // Yellow: Hard
    if (ef < 2.5) return 'bg-info';         // Blue: Below Average
    if (ef < 2.7) return 'bg-accent-light'; // Light Blue: Average (new cards reviewed once)
    return 'bg-success';                     // Green: Easy (mastered)
  };

  return (
    <div className="relative py-4 px-4 bg-theme-card hover:bg-theme-lighter transition-colors group cursor-pointer border-b border-theme-lighter/30" onClick={onEdit}>
      {/* Vertical status bar - centered and 80% height */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 rounded-full" style={{ height: '80%' }}>
        <div className={`w-full h-full rounded-full ${getStatusBarColor()}`}></div>
      </div>
      {/* Delete button - shows on hover */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded-lg bg-error/20 hover:bg-error/30 text-error transition-all"
          title="Delete card"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Content - Responsive layout */}
      <div className="pl-4 pr-10 md:pr-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Front */}
          <div>
            <div className="text-xs md:text-sm font-medium text-theme-textDim mb-1 uppercase">Front</div>
            <div className="text-sm md:text-sm font-medium text-theme-text break-words">
              {renderTextWithFormatting(card.front)}
            </div>
            {card.frontImageUrl && (
              <div className="mt-2">
                <img
                  src={card.frontImageUrl}
                  alt="Front"
                  className="max-h-16 rounded border border-theme-lighter"
                />
              </div>
            )}
          </div>

          {/* Back */}
          <div className={`transition-all ${showBack ? 'opacity-100' : 'opacity-50'}`}>
            <div className="text-xs md:text-sm font-medium text-theme-textDim mb-1 uppercase">Back</div>
            <div className="text-sm md:text-sm font-medium text-theme-text break-words">
              {showBack ? renderTextWithFormatting(card.back) : '••••••'}
            </div>
            {showBack && card.backImageUrl && (
              <div className="mt-2">
                <img
                  src={card.backImageUrl}
                  alt="Back"
                  className="max-h-16 rounded border border-theme-lighter"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
