/**
 * FlashCard Component - Notion Style
 * Displays a single flashcard with flip animation
 * Clean white card with colored badge indicators
 */

import { useState, ReactNode } from 'react';
import { ReadableText } from '../ui/Typography';
import { FlashCardProps } from '../../types/components';

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

export default function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  const [frontImageError, setFrontImageError] = useState(false);
  const [backImageError, setBackImageError] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div className="flip-card w-full" style={{ minHeight: '320px' }}>
      <div
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={isFlipped ? "Flashcard showing answer. Click or press Enter to show question" : "Flashcard showing question. Click or press Enter to reveal answer"}
        className={`flip-card-inner relative w-full h-full cursor-pointer ${isFlipped ? 'flipped' : ''
          }`}
        style={{ minHeight: '320px' }}
      >
        {/* Front of Card - Question */}
        <div
          className="flip-card-front absolute inset-0 rounded-lg p-8 flex flex-col items-center justify-center border-2 transition-all overflow-hidden card-hover-effect"
          style={{
            backgroundColor: 'var(--card-color)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Question Badge */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <div className="badge badge-question">
              Question
            </div>
          </div>

          <div className="text-center w-full h-full flex flex-col items-center justify-center overflow-auto px-2 mt-8">
            {card.front && (
              <ReadableText className="mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-theme-text">
                  {renderTextWithFormatting(card.front)}
                </h3>
              </ReadableText>
            )}
            {card.frontImageUrl && !frontImageError && (
              <img
                src={card.frontImageUrl}
                alt={card.front ? `Visual aid for: ${card.front.substring(0, 50)}` : "Question image"}
                onError={() => setFrontImageError(true)}
                className="object-contain rounded-lg mx-auto mt-4 max-w-[80%] max-h-[90%]"
              />
            )}
          </div>

          <div className="absolute bottom-6 text-sm text-theme-textDim">
            Click to reveal answer
          </div>
        </div>

        {/* Back of Card - Answer */}
        <div
          className="flip-card-back absolute inset-0 rounded-lg p-8 flex flex-col items-center justify-center border-2 transition-all overflow-hidden card-hover-effect-answer"
          style={{
            backgroundColor: 'var(--card-color)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Answer Badge */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <div className="badge badge-answer">
              Answer
            </div>
          </div>

          <div className="text-center w-full h-full flex flex-col items-center justify-center overflow-auto px-2 mt-8">
            {card.back && (
              <ReadableText className="mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-theme-text">
                  {renderTextWithFormatting(card.back)}
                </h3>
              </ReadableText>
            )}
            {card.backImageUrl && !backImageError && (
              <img
                src={card.backImageUrl}
                alt={card.back ? `Visual aid for: ${card.back.substring(0, 50)}` : "Answer image"}
                onError={() => setBackImageError(true)}
                className="object-contain rounded-lg mx-auto mt-4 max-w-[80%] max-h-[90%]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
