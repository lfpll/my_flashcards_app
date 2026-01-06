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

/**
 * HybridAdapter merges data from Supabase (primary) and localStorage (backup)
 * This ensures offline data is preserved even after login
 */
class HybridAdapter implements StorageAdapter {
  private supabaseAdapter: SupabaseAdapter;
  private localStorageAdapter: LocalStorageAdapter;

  constructor(userId: string) {
    this.supabaseAdapter = new SupabaseAdapter(userId);
    this.localStorageAdapter = new LocalStorageAdapter();
  }

  /**
   * Merge decks from both sources, preferring Supabase but including localStorage-only decks
   */
  private mergeDecks(supabaseDecks: Deck[], localDecks: Deck[]): Deck[] {
    const mergedMap = new Map<string, Deck>();
    
    // First, add all Supabase decks (primary source)
    for (const deck of supabaseDecks) {
      mergedMap.set(deck.id, deck);
    }
    
    // Then, add localStorage decks that don't exist in Supabase (by name matching)
    const supabaseDeckNames = new Set(
      supabaseDecks.map(d => d.name.toLowerCase().trim())
    );
    
    for (const localDeck of localDecks) {
      const localDeckName = localDeck.name.toLowerCase().trim();
      
      // If deck with same name exists in Supabase, prefer Supabase version
      if (!supabaseDeckNames.has(localDeckName)) {
        // Check if we already have this deck by ID (might have different name casing)
        if (!mergedMap.has(localDeck.id)) {
          mergedMap.set(localDeck.id, localDeck);
        }
      }
    }
    
    return Array.from(mergedMap.values());
  }

  /**
   * Merge cards from both sources, preferring Supabase but including localStorage-only cards
   */
  private mergeCards(supabaseCards: Card[], localCards: Card[]): Card[] {
    const mergedMap = new Map<string, Card>();
    
    // First, add all Supabase cards (primary source)
    for (const card of supabaseCards) {
      mergedMap.set(card.id, card);
    }
    
    // Then, add localStorage cards that don't exist in Supabase
    const supabaseCardKeys = new Set(
      supabaseCards.map(c => `${c.front.toLowerCase().trim()}|${c.back.toLowerCase().trim()}`)
    );
    
    for (const localCard of localCards) {
      const localCardKey = `${(localCard.front || '').toLowerCase().trim()}|${(localCard.back || '').toLowerCase().trim()}`;
      
      // If card with same content exists in Supabase, prefer Supabase version
      if (!supabaseCardKeys.has(localCardKey)) {
        // Check if we already have this card by ID
        if (!mergedMap.has(localCard.id)) {
          mergedMap.set(localCard.id, localCard);
        }
      }
    }
    
    return Array.from(mergedMap.values());
  }

  async getAllDecks(): Promise<Deck[]> {
    try {
      const [supabaseDecks, localDecks] = await Promise.all([
        this.supabaseAdapter.getAllDecks().catch(() => []),
        this.localStorageAdapter.getAllDecks().catch(() => [])
      ]);
      
      return this.mergeDecks(supabaseDecks, localDecks);
    } catch (error) {
      console.error('Error in HybridAdapter.getAllDecks:', error);
      // Fallback to localStorage if Supabase fails
      return this.localStorageAdapter.getAllDecks().catch(() => []);
    }
  }

  async getDeckById(deckId: string): Promise<Deck | undefined> {
    try {
      // Try Supabase first
      const supabaseDeck = await this.supabaseAdapter.getDeckById(deckId);
      if (supabaseDeck) return supabaseDeck;
      
      // Fallback to localStorage
      return await this.localStorageAdapter.getDeckById(deckId);
    } catch (error) {
      console.error('Error in HybridAdapter.getDeckById:', error);
      // Fallback to localStorage
      return this.localStorageAdapter.getDeckById(deckId);
    }
  }

  async createDeck(name: string, description: string): Promise<Deck> {
    try {
      // Write to Supabase (primary source of truth)
      const deck = await this.supabaseAdapter.createDeck(name, description);
      // Don't write to localStorage if Supabase succeeds - Supabase is source of truth
      // Migration will handle syncing if needed
      return deck;
    } catch (error) {
      console.error('Error creating deck in Supabase, falling back to localStorage:', error);
      // If Supabase fails, write to localStorage (offline mode)
      return this.localStorageAdapter.createDeck(name, description);
    }
  }

  async updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck | null> {
    try {
      // Try Supabase first (source of truth)
      const updated = await this.supabaseAdapter.updateDeck(deckId, updates);
      // Don't update localStorage if Supabase succeeds - Supabase is source of truth
      return updated;
    } catch (error) {
      console.error('Error updating deck in Supabase, trying localStorage:', error);
      // Fallback to localStorage if Supabase fails
      return this.localStorageAdapter.updateDeck(deckId, updates);
    }
  }

  async deleteDeck(deckId: string): Promise<boolean> {
    try {
      // Delete from Supabase (source of truth)
      const supabaseSuccess = await this.supabaseAdapter.deleteDeck(deckId);
      // Don't delete from localStorage if Supabase succeeds - Supabase is source of truth
      return supabaseSuccess;
    } catch (error) {
      console.error('Error deleting deck in Supabase, trying localStorage:', error);
      // Fallback to localStorage if Supabase fails
      return this.localStorageAdapter.deleteDeck(deckId);
    }
  }

  async createCard(deckId: string, cardData: Partial<Card>): Promise<Card> {
    try {
      // Write to Supabase (primary source of truth)
      const card = await this.supabaseAdapter.createCard(deckId, cardData);
      // Don't write to localStorage if Supabase succeeds - Supabase is source of truth
      return card;
    } catch (error) {
      console.error('Error creating card in Supabase, falling back to localStorage:', error);
      // If Supabase fails, write to localStorage (offline mode)
      return this.localStorageAdapter.createCard(deckId, cardData);
    }
  }

  async updateCard(deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null> {
    try {
      // Try Supabase first (source of truth)
      const updated = await this.supabaseAdapter.updateCard(deckId, cardId, updates);
      // Don't update localStorage if Supabase succeeds - Supabase is source of truth
      return updated;
    } catch (error) {
      console.error('Error updating card in Supabase, trying localStorage:', error);
      // Fallback to localStorage if Supabase fails
      return this.localStorageAdapter.updateCard(deckId, cardId, updates);
    }
  }

  async deleteCard(deckId: string, cardId: string): Promise<boolean> {
    try {
      // Delete from Supabase (source of truth)
      const supabaseSuccess = await this.supabaseAdapter.deleteCard(deckId, cardId);
      // Don't delete from localStorage if Supabase succeeds - Supabase is source of truth
      return supabaseSuccess;
    } catch (error) {
      console.error('Error deleting card in Supabase, trying localStorage:', error);
      // Fallback to localStorage if Supabase fails
      return this.localStorageAdapter.deleteCard(deckId, cardId);
    }
  }

  async getStreakData(): Promise<any> {
    try {
      // Try Supabase first
      const supabaseStreak = await this.supabaseAdapter.getStreakData();
      
      // Merge with localStorage (prefer higher values)
      try {
        const localStreak = await this.localStorageAdapter.getStreakData();
        return {
          currentStreak: Math.max(
            supabaseStreak.currentStreak || 0,
            localStreak.currentStreak || 0
          ),
          longestStreak: Math.max(
            supabaseStreak.longestStreak || 0,
            localStreak.longestStreak || 0
          ),
          lastStudyDate: supabaseStreak.lastStudyDate && localStreak.lastStudyDate
            ? (new Date(supabaseStreak.lastStudyDate) > new Date(localStreak.lastStudyDate)
                ? supabaseStreak.lastStudyDate
                : localStreak.lastStudyDate)
            : (supabaseStreak.lastStudyDate || localStreak.lastStudyDate)
        };
      } catch {
        return supabaseStreak;
      }
    } catch (error) {
      console.error('Error getting streak from Supabase, using localStorage:', error);
      return this.localStorageAdapter.getStreakData();
    }
  }

  async updateStreak(): Promise<any> {
    try {
      // Update Supabase (source of truth)
      const streak = await this.supabaseAdapter.updateStreak();
      // Don't update localStorage if Supabase succeeds - Supabase is source of truth
      return streak;
    } catch (error) {
      console.error('Error updating streak in Supabase, using localStorage:', error);
      // Fallback to localStorage if Supabase fails
      return this.localStorageAdapter.updateStreak();
    }
  }
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
    // Use HybridAdapter when logged in to merge Supabase + localStorage
    cachedAdapter = new HybridAdapter(user.id);
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

