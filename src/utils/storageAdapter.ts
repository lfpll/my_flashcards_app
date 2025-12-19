import { Deck, Card } from '../types/models';
import { supabase } from '../lib/supabase';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
import { SupabaseAdapter } from './adapters/SupabaseAdapter';

export interface StorageAdapter {
  // Deck operations
  getAllDecks(): Promise<Deck[]>;
  getDeckById(deckId: string): Promise<Deck | undefined>;
  createDeck(name: string, description: string): Promise<Deck>;
  updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck | null>;
  deleteDeck(deckId: string): Promise<boolean>;
  
  // Card operations
  createCard(deckId: string, cardData: Partial<Card>): Promise<Card>;
  updateCard(deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null>;
  deleteCard(deckId: string, cardId: string): Promise<boolean>;
  
  // Stats operations
  getStreakData(): Promise<any>;
  updateStreak(): Promise<any>;
}

let cachedAdapter: StorageAdapter | null = null;
let cachedUserId: string | null = null;

export async function getStorageAdapter(): Promise<StorageAdapter> {
  // If Supabase is not configured, always use localStorage
  if (!supabase) {
    if (!cachedAdapter) {
      cachedAdapter = new LocalStorageAdapter();
    }
    return cachedAdapter;
  }
  
  // Check current auth state
  const { data: { user } } = await supabase.auth.getUser();
  
  // Return cached adapter if user hasn't changed
  if (user?.id === cachedUserId && cachedAdapter) {
    return cachedAdapter;
  }
  
  // Create new adapter based on auth state
  if (user) {
    cachedAdapter = new SupabaseAdapter(user.id);
    cachedUserId = user.id;
  } else {
    cachedAdapter = new LocalStorageAdapter();
    cachedUserId = null;
  }
  
  return cachedAdapter;
}

// Helper to clear cache when user logs out
export function clearAdapterCache() {
  cachedAdapter = null;
  cachedUserId = null;
}

