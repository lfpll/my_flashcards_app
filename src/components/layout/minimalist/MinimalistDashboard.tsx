/**
 * MinimalistDashboard Component
 * Clean, focused dashboard for studying flashcards
 */

import { useMemo, useState, useEffect } from 'react';
import { useFlashcards } from '../../../context/FlashcardContext';
import { useGamification } from '../../../context/GamificationContext';
import { getDueCardsCount } from '../../../utils/storageAdapter';
import Button from '../../ui/Button';
import StreakIndicator from './StreakIndicator';
import DailyGoalDots from './DailyGoalDots';
import DeckSwitcher from './DeckSwitcher';

interface MinimalistDashboardProps {
  onSelectDeck: (deckId: string) => void;
  onStudyAll?: () => void;
  onCreateDeck?: () => void;
  onNavigate: (view: string) => void;
  onStudy: (deckId: string) => void;
}

export default function MinimalistDashboard({
  onSelectDeck,
  onStudyAll,
  onCreateDeck,
  onNavigate,
  onStudy
}: MinimalistDashboardProps) {
  const { decks } = useFlashcards();
  const { streak, dailyGoal, cardsStudiedToday, goalMet } = useGamification();
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const decksWithDue = useMemo(() => {
    return decks
      .map(deck => ({
        deck,
        dueCount: getDueCardsCount(deck)
      }))
      .filter(d => d.dueCount > 0)
      .sort((a, b) => b.dueCount - a.dueCount);
  }, [decks]);

  // Auto-select first deck with due cards if none selected
  useEffect(() => {
    if (decksWithDue.length > 0 && !selectedDeckId) {
      setSelectedDeckId(decksWithDue[0].deck.id);
    }
    // Clear selection if selected deck no longer has due cards
    if (selectedDeckId && !decksWithDue.find(d => d.deck.id === selectedDeckId)) {
      setSelectedDeckId(decksWithDue[0]?.deck.id || null);
    }
  }, [decksWithDue, selectedDeckId]);

  const selectedDeck = useMemo(() => {
    return decksWithDue.find(d => d.deck.id === selectedDeckId);
  }, [decksWithDue, selectedDeckId]);

  const totalDue = useMemo(() => {
    return decks.reduce((sum, deck) => sum + getDueCardsCount(deck), 0);
  }, [decks]);

  const hasDecks = decks.length > 0;
  const hasDueCards = totalDue > 0;

  const handleStudySelected = () => {
    if (selectedDeckId) {
      onStudy(selectedDeckId);
    }
  };

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      {/* Streak */}
      <StreakIndicator streak={streak} />

      {/* Daily Goal Progress */}
      <DailyGoalDots cardsStudiedToday={cardsStudiedToday} dailyGoal={dailyGoal} />

      {/* Goal Complete Message */}
      {goalMet && (
        <div className="text-center mb-8">
          <p className="text-success font-medium">🎉 Daily goal complete!</p>
        </div>
      )}

      {/* Main Action */}
      <div className="flex flex-col items-center gap-6">
        {hasDueCards && selectedDeck ? (
          <>
            {/* Current Deck Display */}
            <div className="text-center mb-2">
              <p className="text-sm text-theme-textDim mb-1">Studying</p>
              <h2 className="text-2xl font-bold">{selectedDeck.deck.name}</h2>
            </div>

            <Button
              variant="success"
              size="lg"
              onClick={handleStudySelected}
              className="px-12 py-4 text-xl shadow-lg hover:scale-105 transition-transform"
            >
              Study {selectedDeck.dueCount} card{selectedDeck.dueCount !== 1 ? 's' : ''}
            </Button>

            {/* Deck Switcher */}
            {decksWithDue.length > 1 && (
              <DeckSwitcher
                decks={decksWithDue}
                currentDeckId={selectedDeckId}
                onSelectDeck={handleDeckSelect}
              />
            )}

            {/* Total due across all decks */}
            {decksWithDue.length > 1 && (
              <p className="text-sm text-theme-textDim">
                {totalDue} cards due across {decksWithDue.length} decks
              </p>
            )}
          </>
        ) : hasDecks ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-theme-textDim mb-6">No cards due for review right now.</p>
            <Button variant="secondary" onClick={() => onNavigate('decks')}>
              Manage Decks
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
            <p className="text-theme-textDim mb-6">Create your first deck to start learning.</p>
            <Button variant="primary" size="lg" onClick={onCreateDeck}>
              Create Your First Deck
            </Button>
          </div>
        )}
      </div>

      {/* Quick Links */}
      {hasDecks && (
        <div className="mt-16 flex justify-center gap-4">
          <Button variant="ghost" onClick={() => onNavigate('decks')}>
            📚 My Decks ({decks.length})
          </Button>
        </div>
      )}
    </div>
  );
}
