/**
 * FlashCard Component - Notion Style
 * Displays a single flashcard with flip animation
 * Clean white card with colored badge indicators
 */

import { useState, ReactNode } from 'react';
import { ReadableText } from '../ui/Typography';
import { FlashCardProps } from '../../types/components';
import RatingButtons from './RatingButtons';
import { renderTextWithFormatting } from '../ui/FormattedText';

// Reusable card side component for DRY code
interface CardSideProps {
  side: 'front' | 'back';
  text: string | null | undefined;
  imageUrl?: string | null;
  imageError: boolean;
  onImageError: () => void;
}

function CardSide({ side, text, imageUrl, imageError, onImageError }: CardSideProps) {
  const isFront = side === 'front';

  return (
    <div
      className={`flip-card-${side} absolute inset-0 rounded-lg py-8 px-2 flex flex-col border-2 transition-all  card-hover-effect${isFront ? '' : '-answer'}`}
      style={{
        backgroundColor: 'var(--card-color)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Badge */}
      <div className="flex justify-center">
        <div className={`badge badge-${isFront ? 'question' : 'answer'}`}>
          {isFront ? 'Question' : 'Answer'}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 mt-8 ${isFront ? 'mb-10' : ''}`}>
        {text && (
          <ReadableText>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-theme-text">
              {renderTextWithFormatting(text)}
            </h3>
          </ReadableText>
        )}
        {imageUrl && !imageError && (
          <img
            src={imageUrl}
            alt={text ? `Visual aid for: ${text.substring(0, 50)}` : `${isFront ? 'Question' : 'Answer'} image`}
            onError={onImageError}
            className="mx-auto object-contain rounded-lg max-h-80 md:max-h-90"
          />
        )}
      </div>

      {/* Helper text (front only) - positioned absolutely at bottom */}

    </div>
  );
}

export default function FlashCard({ card, isFlipped, onFlip, onRate }: FlashCardProps) {
  const [frontImageError, setFrontImageError] = useState(false);
  const [backImageError, setBackImageError] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div className="flip-card min-w-[400px] min-h-[300px] max-h-[500px] align-middle">
      <div
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={isFlipped ? "Flashcard showing answer. Click or press Enter to show question" : "Flashcard showing question. Click or press Enter to reveal answer"}
        className={`flip-card-inner relative w-full min-h-[500px] cursor-pointer ${isFlipped ? 'flipped' : ''}`}
      >
        {/* Front of Card - Question */}
        <CardSide
          side="front"
          text={card.front}
          imageUrl={card.frontImageUrl}
          imageError={frontImageError}
          onImageError={() => setFrontImageError(true)}
        />

        {/* Back of Card - Answer */}
        <CardSide
          side="back"
          text={card.back}
          imageUrl={card.backImageUrl}
          imageError={backImageError}
          onImageError={() => setBackImageError(true)}
        />
      </div>

      {/* Bottom section below the card */}

      <div className="text-center text-sm text-theme-textDim mt-4">
      {!isFlipped ? (
  "Click to reveal answer"
) : (
  <>
    How well did you know this card? <span className="hidden md:inline">(Press 1-5)</span>
  </>
)}
    </div>
       {
    onRate && <RatingButtons onRate={onRate} />
  }
    </div >
  );
}
