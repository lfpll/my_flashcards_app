/**
 * Storage utility functions for flashcard data persistence
 * Uses adapter pattern to switch between localStorage and Supabase
 */

import { Card, Deck, DeckSize } from '../types/models';
import { getStorageAdapter } from './storageAdapter';

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
 * @returns {Promise<Deck[]>} Array of deck objects
 */
export async function getAllDecks(): Promise<Deck[]> {
  const adapter = await getStorageAdapter();
  return adapter.getAllDecks();
}

/**
 * Get or initialize streak data
 * @returns {Promise<StreakData>} Streak data
 */
export async function getStreakData(): Promise<any> {
  const adapter = await getStorageAdapter();
  return adapter.getStreakData();
}

/**
 * Update streak after studying
 * @returns {Promise<StreakData>} Updated streak data
 */
export async function updateStreak(): Promise<any> {
  const adapter = await getStorageAdapter();
  return adapter.updateStreak();
}

/**
 * Get deck by ID
 * @param {string} deckId - Deck ID
 * @returns {Promise<Deck|undefined>} Deck object or undefined
 */
export async function getDeckById(deckId: string): Promise<Deck | undefined> {
  const adapter = await getStorageAdapter();
  return adapter.getDeckById(deckId);
}

/**
 * Create a new deck
 */
export async function createDeck(name: string, description: string = ''): Promise<Deck> {
  const adapter = await getStorageAdapter();
  return adapter.createDeck(name, description);
}


export async function updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck | null> {
  const adapter = await getStorageAdapter();
  return adapter.updateDeck(deckId, updates);
}

export async function deleteDeck(deckId: string): Promise<boolean> {
  const adapter = await getStorageAdapter();
  return adapter.deleteDeck(deckId);
}


export async function createCard(deckId: string, cardData: Partial<Card>): Promise<Card> {
  const adapter = await getStorageAdapter();
  return adapter.createCard(deckId, cardData);
}


export async function updateCard(deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null> {
  const adapter = await getStorageAdapter();
  return adapter.updateCard(deckId, cardId, updates);
}


export async function deleteCard(deckId: string, cardId: string): Promise<boolean> {
  const adapter = await getStorageAdapter();
  return adapter.deleteCard(deckId, cardId);
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
