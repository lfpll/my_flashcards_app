/**
 * LocalStorage utility functions for flashcard data persistence
 */

import { Card, Deck, DeckSize } from '../types/models';

interface StorageData {
  decks: Deck[];
}

interface SaveResult {
  success: boolean;
  warning?: string | null;
}

interface StorageInfo {
  used: number;
  limit: number;
  percentUsed: number;
  usedMB: string;
  limitMB: string;
  isNearLimit: boolean;
}

const STORAGE_KEY = 'flashcards_data';

// Approximate localStorage limit (5MB in most browsers)
const STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB
const WARNING_THRESHOLD = 0.8; // Warn at 80% usage

/**
 * Load all data from localStorage
 */
export function loadData(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { decks: [] };
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return { decks: [] };
  }
}

/**
 * Save all data to localStorage
 */
export function saveData(data: StorageData): SaveResult {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonData);
    
    // Check if approaching storage limit
    const storageInfo = getStorageInfo();
    if (storageInfo.percentUsed >= WARNING_THRESHOLD * 100) {
      return {
        success: true,
        warning: `Storage ${storageInfo.percentUsed.toFixed(0)}% full (${storageInfo.usedMB}MB / ${storageInfo.limitMB}MB). Consider deleting old decks or cards with images.`
      };
    }
    
    return { success: true, warning: null };
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      return {
        success: false,
        warning: 'Storage limit exceeded! Please delete some decks, cards, or images to free up space.'
      };
    }
    return { success: false, warning: 'Failed to save data. Please try again.' };
  }
}

/**
 * Get localStorage usage information
 * @returns {StorageInfo} Storage usage information
 */
export function getStorageInfo(): StorageInfo {
  try {
    // Calculate size of current data
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const usedBytes = new Blob([data]).size;
    const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
    const limitMB = (STORAGE_LIMIT / (1024 * 1024)).toFixed(2);
    const percentUsed = (usedBytes / STORAGE_LIMIT) * 100;

    return {
      used: usedBytes,
      limit: STORAGE_LIMIT,
      percentUsed,
      usedMB,
      limitMB,
      isNearLimit: percentUsed >= WARNING_THRESHOLD * 100,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      used: 0,
      limit: STORAGE_LIMIT,
      percentUsed: 0,
      usedMB: '0',
      limitMB: '5',
      isNearLimit: false,
    };
  }
}

/**
 * Get all decks
 * @returns {Deck[]} Array of deck objects
 */
export function getAllDecks(): Deck[] {
  return loadData().decks;
}

/**
 * Get or initialize streak data
 * @returns {StreakData} Streak data
 */
export function getStreakData() {
  try {
    const data = localStorage.getItem('flashcards_streak');
    if (!data) {
      return {
        currentStreak: 0,
        lastStudyDate: null,
        longestStreak: 0,
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading streak data:', error);
    return {
      currentStreak: 0,
      lastStudyDate: null,
      longestStreak: 0,
    };
  }
}

/**
 * Update streak after studying
 * @returns {StreakData} Updated streak data
 */
export function updateStreak() {
  const streak = getStreakData();
  const today = new Date().toDateString();
  const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate).toDateString() : null;

  if (lastDate === today) {
    // Already studied today
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastDate === yesterdayStr) {
    // Continue streak
    streak.currentStreak += 1;
  } else {
    // Streak broken, restart
    streak.currentStreak = 1;
  }

  streak.lastStudyDate = new Date().toISOString();
  
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  try {
    localStorage.setItem('flashcards_streak', JSON.stringify(streak));
  } catch (error) {
    console.error('Error saving streak data:', error);
  }

  return streak;
}

/**
 * Get deck by ID
 * @param {string} deckId - Deck ID
 * @returns {Deck|undefined} Deck object or undefined
 */
export function getDeckById(deckId: string): Deck | undefined {
  const data = loadData();
  return data.decks.find(deck => deck.id === deckId);
}

/**
 * Create a new deck
 */
export function createDeck(name: string, description: string = ''): Deck {
  const data = loadData();
  const newDeck = {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cards: []
  };
  data.decks.push(newDeck);
  saveData(data);
  return newDeck;
}


export function updateDeck(deckId: string, updates: Partial<Deck>): Deck | null {
  const data = loadData();
  const deckIndex = data.decks.findIndex(deck => deck.id === deckId);
  
  if (deckIndex === -1) return null;
  
  data.decks[deckIndex] = {
    ...data.decks[deckIndex],
    ...updates,
    updatedAt: Date.now()
  };
  
  saveData(data);
  return data.decks[deckIndex];
}

export function deleteDeck(deckId: string): boolean {
  const data = loadData();
  const initialLength = data.decks.length;
  data.decks = data.decks.filter(deck => deck.id !== deckId);
  
  if (data.decks.length < initialLength) {
    saveData(data);
    return true;
  }
  
  return false;
}


export function createCard(deckId: string, cardData: Partial<Card>): Card {
  const data = loadData();
  const deck = data.decks.find(d => d.id === deckId);
  
  if (!deck) return null;
  
  const newCard = {
    id: crypto.randomUUID(),
    front: cardData.front,
    back: cardData.back,
    frontImageUrl: cardData.frontImageUrl || null,
    backImageUrl: cardData.backImageUrl || null,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: Date.now(), // Due immediately for new cards
    lastReviewed: null,
    reviews: []
  };
  
  deck.cards.push(newCard);
  deck.updatedAt = Date.now();
  saveData(data);
  
  return newCard;
}


export function updateCard(deckId: string, cardId: string, updates: Partial<Card>): Card | null {
  const data = loadData();
  const deck = data.decks.find(d => d.id === deckId);
  
  if (!deck) return null;
  
  const cardIndex = deck.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return null;
  
  deck.cards[cardIndex] = {
    ...deck.cards[cardIndex],
    ...updates
  };
  
  deck.updatedAt = Date.now();
  saveData(data);
  
  return deck.cards[cardIndex];
}


export function deleteCard(deckId: string, cardId: string): boolean {
  const data = loadData();
  const deck = data.decks.find(d => d.id === deckId);
  
  if (!deck) return false;
  
  const initialLength = deck.cards.length;
  deck.cards = deck.cards.filter(c => c.id !== cardId);
  
  if (deck.cards.length < initialLength) {
    deck.updatedAt = Date.now();
    saveData(data);
    return true;
  }
  
  return false;
}

export function getDueCardsCount(deck: Deck): number {
  const now = Date.now();
  return deck.cards.filter(card => card.nextReview <= now).length;
}


export function getDeckSize(deck: Deck): DeckSize {
  try {
    const deckString = JSON.stringify(deck);
    const bytes = new Blob([deckString]).size;
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    let formatted;
    if (mb >= 1) {
      formatted = `${mb.toFixed(2)} MB`;
    } else if (kb >= 1) {
      formatted = `${kb.toFixed(2)} KB`;
    } else {
      formatted = `${bytes} bytes`;
    }
    
    return { bytes, kb, mb, formatted };
  } catch (error) {
    console.error('Error calculating deck size:', error);
    return { bytes: 0, kb: 0, mb: 0, formatted: '0 bytes' };
  }
}
