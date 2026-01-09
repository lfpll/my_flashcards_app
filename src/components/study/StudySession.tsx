/**
 * StudySession Component
 * Handles the study session flow with flashcards and ratings
 */

import { useState, useEffect } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useGamification } from '../../context/GamificationContext';
import { getDueCards, updateCardWithRating } from '../../utils/spacedRepetition';
import FlashCard from '../card/FlashCard';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import AppHeader from '../layout/AppHeader';
import Breadcrumbs from '../ui/Breadcrumbs';
import Confetti from '../ui/Confetti';

// Reusable completion/message screen
function MessageScreen({ emoji, title, message, buttonText, onButtonClick, secondaryButton }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">{emoji}</div>
        <h2 className="text-2xl font-semibold mb-3">{title}</h2>
        <p className="text-theme-textDim mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onButtonClick} size="lg">
            {buttonText}
          </Button>
          {secondaryButton && (
            <Button onClick={secondaryButton.onClick} size="lg" variant="secondary">
              {secondaryButton.text}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudySession({ deckId, onExit }) {
  const { decks, modifyCard } = useFlashcards();
  const { recordStudySession } = useGamification();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showTransition, setShowTransition] = useState(true);
  const [slidingOut, setSlidingOut] = useState(false);
  const [nextIndex, setNextIndex] = useState(null);

  // Snapshot deck and due cards at the start of the session
  const [sessionData, setSessionData] = useState(() => {
    const foundDeck = decks.find(d => d.id === deckId);
    if (!foundDeck) {
      return { deck: null, dueCards: [] };
    }

    const cardsToStudy = getDueCards(foundDeck);

    return {
      deck: foundDeck,
      dueCards: cardsToStudy
    };
  });

  const { deck, dueCards } = sessionData;

  const currentCard = dueCards[currentIndex];
  const nextCard = nextIndex !== null ? dueCards[nextIndex] : null;
  const progress = {
    current: currentIndex + 1,
    total: dueCards.length
  };

  useEffect(() => {
    // Check if session is complete
    if (dueCards.length === 0 || currentIndex >= dueCards.length) {
      setSessionComplete(true);
    }
  }, [dueCards.length, currentIndex]);


  // Show transition screen briefly whenever showTransition becomes true
  useEffect(() => {
    if (showTransition) {
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [showTransition]);

  // Record study session when complete (only once)
  useEffect(() => {
    if (sessionComplete && dueCards.length > 0) {
      recordStudySession(dueCards.length);
    }
  }, [sessionComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleRating = (rating) => {
    if (!currentCard || slidingOut) return;

    // Update card with spaced repetition algorithm
    const updatedCard = updateCardWithRating(currentCard, rating);
    console.log('Updated card:', {
      id: updatedCard.id,
      easeFactor: updatedCard.easeFactor,
      interval: updatedCard.interval,
      nextReviewRaw: updatedCard.nextReview,
      nextReview: updatedCard.nextReview ? new Date(updatedCard.nextReview) : null
    });
    modifyCard(deckId, currentCard.id, updatedCard);

    // Start slide out transition
    setSlidingOut(true);
    setNextIndex(currentIndex + 1);

    // After animation completes, update index and reset states
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSlidingOut(false);
      setNextIndex(null);
    }, 400); // Match animation duration
  };

  const handleExit = () => {
    if (currentIndex > 0 && !sessionComplete) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  const handleStudyAgain = () => {
    // Get fresh deck data from context
    const foundDeck = decks.find(d => d.id === deckId);
    if (!foundDeck) {
      onExit();
      return;
    }

    // Check for due cards first
    const cardsToStudy = getDueCards(foundDeck);

    if (cardsToStudy.length === 0) {
      onExit();
      return;
    }

    setSessionData({
      deck: foundDeck,
      dueCards: cardsToStudy
    });
    setCurrentIndex(0);
    setSessionComplete(false);
    setShowTransition(true);
  };

  // Show transition screen
  if (showTransition && deck && dueCards.length > 0) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="text-8xl mb-6">📚</div>
          <h2 className="text-3xl font-bold mb-3">Starting Study Session</h2>
          <p className="text-2xl text-theme-textDim">{deck.name}</p>
          <p className="text-lg text-theme-textDim mt-2">
            {dueCards.length} {dueCards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <MessageScreen
        emoji="❓"
        title="Deck Not Found"
        message="The requested deck could not be found."
        buttonText="Go Back"
        onButtonClick={onExit}
      />
    );
  }

  if (dueCards.length === 0) {
    const hasCards = deck.cards && deck.cards.length > 0;
    return (
      <MessageScreen
        emoji="✨"
        title="No Cards Due!"
        message="Great work! Check back later for more cards to review."
        buttonText="Back to Deck"
        onButtonClick={onExit}
        secondaryButton={hasCards ? {
          text: "Study Again",
          onClick: handleStudyAgain
        } : null}
      />
    );
  }

  if (sessionComplete) {
    const hasCards = deck.cards && deck.cards.length > 0;

    return (
      <>
        <Confetti duration={4000} />
        <MessageScreen
          emoji="🎉"
          title="Session Complete!"
          message={`You reviewed ${dueCards.length} ${dueCards.length === 1 ? 'card' : 'cards'}. Great job!`}
          buttonText="Back to Dashboard"
          onButtonClick={onExit}
          secondaryButton={hasCards ? {
            text: "Study Again",
            onClick: handleStudyAgain
          } : null}
        />
      </>
    );
  }

  const breadcrumbItems = [
    {
      label: 'My Decks',
      icon: '🏠',
      onClick: handleExit
    },
    {
      label: deck.name,
      icon: '📚'
    },
    {
      label: 'Study',
      icon: '✏️'
    }
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col bg-theme-bg">
        <AppHeader
          title={
            <span className="flex items-center gap-3">
              <span>📚</span>
              <span className="hidden md:inline">Studying: </span>
              <span>{deck.name}</span>
            </span>
          }
          backButton={
            <Breadcrumbs items={breadcrumbItems} />
          }
          actions={
            <div className="text-theme-textDim text-sm font-medium">
              Card {progress.current} of {progress.total}
            </div>
          }
        />

        {/* Progress Bar */}
        <div className="bg-theme-lighter h-1">
          <div
            className="bg-accent-primary h-full transition-all duration-300"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>

        {/* Card Area */}
        <div className="flex-1 flex flex-col items-center px-4 py-8 overflow-hidden">
            {/* Card container with fixed positioning */}
            <div className="relative min-w-[460px] min-h-[500px]">
              {/* Current card - slides out to left */}
              {currentCard && (
                <div className={`absolute top-0 left-0 right-0 ${slidingOut ? 'animate-slideOutToLeft' : ''}`}>
                  <FlashCard
                    key={`current-${currentIndex}`}
                    card={currentCard}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                    onRate={!slidingOut ? handleRating : undefined}
                  />
                </div>
              )}

              {/* Next card - slides in from right */}
              {nextCard && slidingOut && (
                <div className="absolute top-0 left-0 right-0 animate-slideInFromRight">
                  <FlashCard
                    key={`next-${nextIndex}`}
                    card={nextCard}
                    isFlipped={false}
                    onFlip={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
      </div>

      <ConfirmDialog
        isOpen={showExitConfirm}
        onConfirm={onExit}
        onCancel={() => setShowExitConfirm(false)}
        title="Leave Study Session?"
        message="Your progress has been saved. You can continue where you left off later."
        confirmText="Leave"
        cancelText="Continue Studying"
      />
    </>
  );
}
