/**
 * MinimalistDashboard Component
 * Launch pad design focused on getting users studying with minimal friction
 */

import { useState, useMemo } from 'react';
import { useFlashcards } from '../../../context/FlashcardContext';
import { useGamification } from '../../../context/GamificationContext';
import { getDueCardsCount } from '../../../utils/storage';
import { Deck, Card } from '../../../types/models';
import StreakIndicator from './StreakIndicator';
import DeckSwitcher from './DeckSwitcher';
import DailyGoalDots from './DailyGoalDots';

interface MinimalistDashboardProps {
  onStudy: (deckId: string) => void;
  onNavigate: (view: string) => void;
}

export default function MinimalistDashboard({ onStudy, onNavigate }: MinimalistDashboardProps) {
  const { decks } = useFlashcards();
  const { streak, dailyGoal, cardsStudiedToday } = useGamification();

  // Get decks with due cards
  const decksWithDueCards = useMemo(() => {
    return decks
      .map(deck => ({
        deck,
        dueCount: getDueCardsCount(deck),
      }))
      .filter(({ dueCount }) => dueCount > 0)
      .sort((a, b) => b.dueCount - a.dueCount);
  }, [decks]);

  // Current selected deck (first one with due cards by default)
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    decksWithDueCards.length > 0 ? decksWithDueCards[0].deck.id : null
  );

  // Get current deck data
  const currentDeckData = useMemo(() => {
    if (!selectedDeckId) return null;
    return decksWithDueCards.find(d => d.deck.id === selectedDeckId);
  }, [selectedDeckId, decksWithDueCards]);

  // Get a preview card from the current deck
  const previewCard = useMemo(() => {
    if (!currentDeckData) return null;
    const dueCards = currentDeckData.deck.cards.filter(
      card => card.nextReview <= Date.now()
    );
    return dueCards.length > 0 ? dueCards[0] : null;
  }, [currentDeckData]);

  // Handle deck selection
  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
  };

  // Handle start studying
  const handleStartStudying = () => {
    if (selectedDeckId) {
      onStudy(selectedDeckId);
    }
  };

  const hasCards = decksWithDueCards.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Streak indicator */}
      <div className="pt-12">
        <StreakIndicator streak={streak} />
      </div>

      {/* Main content - vertically and horizontally centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {hasCards ? (
            <>
              {/* Central study card */}
              <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-shadow">
                {/* Card preview */}
                <div className="mb-8">
                  <div className="bg-gray-100 rounded-xl p-6 sm:p-8 min-h-[120px] flex items-center justify-center mb-6">
                    <p className="text-lg sm:text-xl text-gray-800 text-center line-clamp-3">
                      {previewCard ? previewCard.front : 'Loading...'}
                    </p>
                  </div>

                  {/* Deck name and card count */}
                  <div className="text-center space-y-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {currentDeckData?.deck.name}
                    </h2>
                    <p className="text-gray-600">
                      {currentDeckData?.dueCount} cards ready to review
                    </p>
                  </div>
                </div>

                {/* Start studying button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleStartStudying}
                    className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                    style={{
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <span className="relative z-10">Start Studying</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>

              {/* Deck switcher */}
              <div className="mt-6">
                <DeckSwitcher
                  decks={decksWithDueCards}
                  currentDeckId={selectedDeckId}
                  onSelectDeck={handleSelectDeck}
                />
              </div>
            </>
          ) : (
            <>
              {/* All caught up state */}
              <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl text-center">
                <div className="mb-8">
                  <div className="text-6xl mb-6">🎉</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    You're all caught up!
                  </h2>
                  <p className="text-gray-600 mb-2">
                    All decks reviewed. Come back tomorrow
                  </p>
                  <p className="text-gray-600">
                    for your next spaced repetition session.
                  </p>
                </div>

                {/* Add new cards button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => onNavigate('decks')}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Add New Cards
                  </button>
                  <button
                    onClick={() => onNavigate('decks')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Browse All Decks
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Daily goal indicator */}
          <div className="mt-12">
            <DailyGoalDots
              cardsStudiedToday={cardsStudiedToday}
              dailyGoal={dailyGoal}
            />
          </div>

          {/* View all decks link */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => onNavigate('decks')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <span>View all decks</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



