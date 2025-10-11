/**
 * DeckSwitcher Component
 * Dropdown to quickly switch between decks with due cards
 */

import { Deck } from '../../../types/models';
import { useState, useRef, useEffect } from 'react';

interface DeckSwitcherProps {
  decks: Array<{ deck: Deck; dueCount: number }>;
  currentDeckId: string | null;
  onSelectDeck: (deckId: string) => void;
}

export default function DeckSwitcher({ decks, currentDeckId, onSelectDeck }: DeckSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDeck = decks.find(d => d.deck.id === currentDeckId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (decks.length === 0) return null;

  return (
    <div className="flex justify-center mb-12" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 border border-gray-300 rounded-lg hover:border-gray-400 bg-white"
        >
          <span className="text-sm font-medium">
            {currentDeck ? currentDeck.deck.name : 'Switch deck'}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            {decks.map(({ deck, dueCount }) => (
              <button
                key={deck.id}
                onClick={() => {
                  onSelectDeck(deck.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  deck.id === currentDeckId ? 'bg-gray-50' : ''
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{deck.name}</p>
                  <p className="text-sm text-gray-500">{dueCount} cards ready</p>
                </div>
                {deck.id === currentDeckId && (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

