import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as storage from '../utils/storage';
import { Deck, Card } from '../types/models';
import { FlashcardContextType } from '../types/contexts';

const FlashcardContext = createContext<FlashcardContextType | null>(null);

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load decks on mount
  useEffect(() => {
    const loadedDecks = storage.getAllDecks();
    setDecks(loadedDecks);
    setLoading(false);
  }, []);

  // Refresh decks from storage
  const refreshDecks = useCallback(() => {
    const loadedDecks = storage.getAllDecks();
    setDecks(loadedDecks);
  }, []);

  // Deck operations
  const addDeck = useCallback((name: string, description: string): Deck => {
    const newDeck = storage.createDeck(name, description);
    refreshDecks();
    return newDeck;
  }, [refreshDecks]);

  const modifyDeck = useCallback((deckId: string, updates: Partial<Deck>): Deck | null => {
    const updated = storage.updateDeck(deckId, updates);
    refreshDecks();
    return updated;
  }, [refreshDecks]);

  const removeDeck = useCallback((deckId: string): boolean => {
    const success = storage.deleteDeck(deckId);
    if (success) {
      refreshDecks();
    }
    return success;
  }, [refreshDecks]);

  // Card operations
  const addCard = useCallback((deckId: string, cardData: Partial<Card>): Card => {
    const newCard = storage.createCard(deckId, cardData);
    refreshDecks();
    return newCard;
  }, [refreshDecks]);

  const modifyCard = useCallback((deckId: string, cardId: string, updates: Partial<Card>): Card | null => {
    const updated = storage.updateCard(deckId, cardId, updates);
    refreshDecks();
    return updated;
  }, [refreshDecks]);

  const removeCard = useCallback((deckId: string, cardId: string): boolean => {
    const success = storage.deleteCard(deckId, cardId);
    if (success) {
      refreshDecks();
    }
    return success;
  }, [refreshDecks]);

  const value: FlashcardContextType = {
    decks,
    loading,
    refreshDecks,
    addDeck,
    modifyDeck,
    removeDeck,
    addCard,
    modifyCard,
    removeCard,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within FlashcardProvider');
  }
  return context;
}

