/**
 * DeckList Component
 * Displays all decks with create functionality
 */

import { useState } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useTheme } from '../../context/ThemeContext';
import DeckCard from '../deck/DeckCard';
import CreateDeckModal from './CreateDeckModal';
import Button from '../ui/Button';
import AppHeader from '../layout/AppHeader';
import EmptyState from '../ui/EmptyState';

export default function DeckList({ onSelectDeck }) {
  const { decks } = useFlashcards();
  const { theme, cycleTheme } = useTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <AppHeader
        title="My Decks"
        actions={
          <>
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg hover:bg-theme-lighter transition-colors"
              title={`Theme: ${theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Ocean Breeze'}`}
            >
              {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🌊'}
            </button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="success"
              size="lg"
              className="flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>New Deck</span>
            </Button>
          </>
        }
        subtitle={
          <div className="flex items-center gap-4">
            <span>{decks.length} {decks.length === 1 ? 'deck' : 'decks'}</span>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4">

      {/* Empty State */}
      {decks.length === 0 && (
        <EmptyState
          icon="📚"
          headline="Start Your Learning Journey"
          body="Decks organize flashcards by topic. Perfect for languages, exam prep, or any subject you want to master!"
          primaryAction={{
            label: "Create Your First Deck",
            onClick: () => setIsCreateModalOpen(true),
            variant: "success"
          }}
          preview={
            <div className="bg-theme-card p-4 rounded-lg max-w-sm mx-auto border border-theme-lighter">
              <div className="text-sm text-left space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span>
                  <span>Group cards by topic or subject</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span>
                  <span>Track progress with spaced repetition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent-primary">✓</span>
                  <span>Study offline, anytime, anywhere</span>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Deck Grid */}
      {decks.length > 0 && (
        <div className="grid">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onClick={() => onSelectDeck(deck.id)}
            />
          ))}
        </div>
      )}

      </div>

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}

