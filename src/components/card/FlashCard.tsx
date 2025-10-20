/**
 * FlashCard Component - Notion Style
 * Displays a single flashcard with flip animation
 * Clean white card with colored badge indicators
 */

import { useState } from 'react';
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
      className={`outline-1 outline-black-100 rounded-xl flip-card-${side} absolute inset-0 rounded-xl py-2 px-4 flex flex-col border-2 transition-all shadow-theme-md card-hover-effect${isFront ? '' : '-answer'}`}
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
      <div className={`flex flex-col items-center justify-center flex-1 mt-4  ${isFront ? 'mb-10' : ''}`}>
        {text && (
          <div className="max-h-24 md:max-h-32 max-w-[90%] overflow-hidden">
            <ReadableText>
              <h3 className={` font-bold leading-tight mb-4 text-theme-text ${!imageUrl? 'text-[clamp(1rem,8vw,2rem)]' : 'text-[clamp(1rem,4vw,1.5rem)]'}`}>
                {renderTextWithFormatting(text)}
              </h3>
            </ReadableText>
          </div>
        )}
        {imageUrl && !imageError && (
          <img
            src={imageUrl}
            alt={text ? `Visual aid for: ${text.substring(0, 50)}` : `${isFront ? 'Question' : 'Answer'} image`}
            onError={onImageError}
            className="mx-auto rounded-lg max-h-[70%] max-w-[90%] object-contain"
          />
        )}
      </div>

      {/* Helper text (front only) - positioned absolutely at bottom */}

    </div>
  );
}

export default function FlashCard({ card, onFlip, onRate }: FlashCardProps) {
  const [frontImageError, setFrontImageError] = useState(false);
  const [backImageError, setBackImageError] = useState(false);
  const [isFront,setIsFront] = useState(true)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onFlip();
    }
  };

  const handleFlip = () => {
    setIsFront(!isFront);
    onFlip();
  };

  return (
    <div className="flip-card align-middle">
      <div
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={!isFront ? "Flashcard showing answer. Click or press Enter to show question" : "Flashcard showing question. Click or press Enter to reveal answer"}
        className={`flip-card-inner relative w-full min-h-[500px] cursor-pointer ${!isFront ? 'flipped' : ''}`}
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
      {isFront ? (
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
