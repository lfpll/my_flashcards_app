import { StorageAdapter } from '../storageAdapter';
import { Deck, Card } from '../../types/models';

interface StorageData {
  decks: Deck[];
}

const STORAGE_KEY = 'flashcards_data';

export class LocalStorageAdapter implements StorageAdapter {
  private loadData(): StorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { decks: [] };
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return { decks: [] };
    }
  }

  private saveData(data: StorageData): void {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, jsonData);
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      throw error;
    }
  }

  async getAllDecks(): Promise<Deck[]> {
    return this.loadData().decks;
  }

  async getDeckById(deckId: string): Promise<Deck | undefined> {
    const data = this.loadData();
    return data.decks.find(deck => deck.id === deckId);
  }

  async createDeck(name: string, description: string): Promise<Deck> {
    const data = this.loadData();
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: []
    };
    data.decks.push(newDeck);
    this.saveData(data);
    return newDeck;
  }

  async updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck | null> {
    const data = this.loadData();
    const deckIndex = data.decks.findIndex(deck => deck.id === deckId);
    
    if (deckIndex === -1) return null;
    
    data.decks[deckIndex] = {
      ...data.decks[deckIndex],
      ...updates,
      updatedAt: Date.now()
    };
    
    this.saveData(data);
    return data.decks[deckIndex];
  }

  async deleteDeck(deckId: string): Promise<boolean> {
    const data = this.loadData();
    const initialLength = data.decks.length;
    data.decks = data.decks.filter(deck => deck.id !== deckId);
    
    if (data.decks.length < initialLength) {
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  async createCard(deckId: string, cardData: Partial<Card>): Promise<Card> {
    const data = this.loadData();
    const deck = data.decks.find(d => d.id === deckId);
    
    if (!deck) throw new Error('Deck not found');
    
    const newCard: Card = {
      id: crypto.randomUUID(),
      front: cardData.front || '',
      back: cardData.back || '',
      frontImageUrl: cardData.frontImageUrl || null,
      backImageUrl: cardData.backImageUrl || null,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: Date.now(),
      lastReviewed: null,
      reviews: [],
      createdAt: Date.now()
    };
    
    deck.cards.push(newCard);
    deck.updatedAt = Date.now();
    this.saveData(data);
    
    return newCard;
  }

  async updateCard(deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null> {
    const data = this.loadData();
    const deck = data.decks.find(d => d.id === deckId);
    
    if (!deck) return null;
    
    const cardIndex = deck.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return null;
    
    deck.cards[cardIndex] = {
      ...deck.cards[cardIndex],
      ...updates
    };
    
    deck.updatedAt = Date.now();
    this.saveData(data);
    
    return deck.cards[cardIndex];
  }

  async deleteCard(deckId: string, cardId: string): Promise<boolean> {
    const data = this.loadData();
    const deck = data.decks.find(d => d.id === deckId);
    
    if (!deck) return false;
    
    const initialLength = deck.cards.length;
    deck.cards = deck.cards.filter(c => c.id !== cardId);
    
    if (deck.cards.length < initialLength) {
      deck.updatedAt = Date.now();
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  async getStreakData(): Promise<any> {
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

  async updateStreak(): Promise<any> {
    const streak = await this.getStreakData();
    const today = new Date().toDateString();
    const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate).toDateString() : null;

    if (lastDate === today) {
      return streak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastDate === yesterdayStr) {
      streak.currentStreak += 1;
    } else {
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
}


