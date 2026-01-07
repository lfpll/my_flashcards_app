import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as storage from '../utils/storageAdapter';
import { Deck, Card } from '../types/models';
import { FlashcardContextType } from '../types/contexts';
import { useAuth } from '../contexts/AuthContext';

const FlashcardContext = createContext<FlashcardContextType | null>(null);

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, migrationStatus } = useAuth();

  // Load decks function
  const loadDecks = useCallback(async () => {
    setLoading(true);
    try {
      const loadedDecks = await storage.getAllDecks();
      setDecks(loadedDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load decks on mount, when user changes, or when migration completes successfully
  useEffect(() => {
    loadDecks();
  }, [loadDecks, user, migrationStatus]); // Refresh when user changes (login/logout) or migration completes

  // Refresh decks from storage
  const refreshDecks = useCallback(async () => {
    await loadDecks();
  }, [loadDecks]);

  // Deck operations
  const addDeck = useCallback(async (name: string, description: string): Promise<Deck> => {
    const newDeck = await storage.createDeck(name, description);
    await refreshDecks();
    return newDeck;
  }, [refreshDecks]);

  const modifyDeck = useCallback(async (deckId: string, updates: Partial<Deck>): Promise<Deck | null> => {
    const updated = await storage.updateDeck(deckId, updates);
    await refreshDecks();
    return updated;
  }, [refreshDecks]);

  const removeDeck = useCallback(async (deckId: string): Promise<boolean> => {
    const success = await storage.deleteDeck(deckId);
    if (success) {
      await refreshDecks();
    }
    return success;
  }, [refreshDecks]);

  // Card operations
  const addCard = useCallback(async (deckId: string, cardData: Partial<Card>): Promise<Card> => {
    const newCard = await storage.createCard(deckId, cardData);
    await refreshDecks();
    return newCard;
  }, [refreshDecks]);

  const modifyCard = useCallback(async (deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null> => {
    const updated = await storage.updateCard(deckId, cardId, updates);
    await refreshDecks();
    return updated;
  }, [refreshDecks]);

  const removeCard = useCallback(async (deckId: string, cardId: string): Promise<boolean> => {
    const success = await storage.deleteCard(deckId, cardId);
    if (success) {
      await refreshDecks();
    }
    return success;
  }, [refreshDecks]);

  const value = {
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

