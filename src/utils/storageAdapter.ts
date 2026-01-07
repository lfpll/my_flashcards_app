/**
 * Storage Adapter using RxDB
 * Provides offline-first storage with automatic Supabase sync
 */
import { getDatabase, startReplication, stopReplication, FlashcardDatabase } from '../lib/rxdb';
import { Deck, Card, DeckSize } from '../types/models';

export interface StorageAdapter {
  getAllDecks(): Promise<Deck[]>;
  getDeckById(deckId: string): Promise<Deck | undefined>;
  createDeck(name: string, description: string): Promise<Deck>;
  updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck | null>;
  deleteDeck(deckId: string): Promise<boolean>;
  createCard(deckId: string, cardData: Partial<Card>): Promise<Card>;
  updateCard(deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null>;
  deleteCard(deckId: string, cardId: string): Promise<boolean>;
}

/**
 * RxDB-based Storage Adapter
 */
class RxDBAdapter implements StorageAdapter {
  private db: FlashcardDatabase | null = null;

  private async getDb(): Promise<FlashcardDatabase> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async getAllDecks(): Promise<Deck[]> {
    const db = await this.getDb();
    const deckDocs = await db.decks.find().exec();
    
    // Build decks with their cards
    const decks: Deck[] = [];
    for (const deckDoc of deckDocs) {
      const cardDocs = await db.cards.find({ selector: { deckId: deckDoc.id } }).exec();
      decks.push({
        id: deckDoc.id,
        name: deckDoc.name,
        description: deckDoc.description,
        createdAt: deckDoc.createdAt,
        updatedAt: deckDoc.updatedAt,
        cards: cardDocs.map(c => ({
          id: c.id,
          front: c.front,
          back: c.back,
          frontImageUrl: c.frontImageUrl,
          backImageUrl: c.backImageUrl,
          easeFactor: c.easeFactor,
          interval: c.interval,
          repetitions: c.repetitions,
          nextReview: c.nextReview,
          lastReviewed: c.lastReviewed,
          reviews: c.reviews,
          createdAt: c.createdAt
        }))
      });
    }
    return decks;
  }

  async getDeckById(deckId: string): Promise<Deck | undefined> {
    const decks = await this.getAllDecks();
    return decks.find(d => d.id === deckId);
  }

  async createDeck(name: string, description: string): Promise<Deck> {
    const db = await this.getDb();
    const now = Date.now();
    const id = crypto.randomUUID();

    await db.decks.insert({
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      userId: null
    });

    return { id, name, description, createdAt: now, updatedAt: now, cards: [] };
  }

  async updateDeck(deckId: string, updates: Partial<Deck>): Promise<Deck | null> {
    const db = await this.getDb();
    const doc = await db.decks.findOne(deckId).exec();
    if (!doc) return null;

    await doc.patch({
      name: updates.name ?? doc.name,
      description: updates.description ?? doc.description,
      updatedAt: Date.now()
    });

    return this.getDeckById(deckId) as Promise<Deck>;
  }

  async deleteDeck(deckId: string): Promise<boolean> {
    const db = await this.getDb();
    
    // Delete all cards in the deck
    const cards = await db.cards.find({ selector: { deckId } }).exec();
    for (const card of cards) {
      await card.remove();
    }

    // Delete the deck
    const doc = await db.decks.findOne(deckId).exec();
    if (doc) {
      await doc.remove();
      return true;
    }
    return false;
  }

  async createCard(deckId: string, cardData: Partial<Card>): Promise<Card> {
    const db = await this.getDb();
    const now = Date.now();
    const id = crypto.randomUUID();

    const card = {
      id,
      deckId,
      front: cardData.front || '',
      back: cardData.back || '',
      frontImageUrl: cardData.frontImageUrl || null,
      backImageUrl: cardData.backImageUrl || null,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: now,
      lastReviewed: null,
      reviews: [],
      createdAt: now,
      updatedAt: now,
      userId: null
    };

    await db.cards.insert(card);

    // Update deck's updatedAt
    const deckDoc = await db.decks.findOne(deckId).exec();
    if (deckDoc) {
      await deckDoc.patch({ updatedAt: now });
    }

    return {
      id,
      front: card.front,
      back: card.back,
      frontImageUrl: card.frontImageUrl,
      backImageUrl: card.backImageUrl,
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      nextReview: card.nextReview,
      lastReviewed: card.lastReviewed,
      reviews: card.reviews,
      createdAt: card.createdAt
    };
  }

  async updateCard(deckId: string, cardId: string, updates: Partial<Card>): Promise<Card | null> {
    const db = await this.getDb();
    const doc = await db.cards.findOne(cardId).exec();
    if (!doc) return null;

    const now = Date.now();
    await doc.patch({
      front: updates.front ?? doc.front,
      back: updates.back ?? doc.back,
      frontImageUrl: updates.frontImageUrl !== undefined ? updates.frontImageUrl : doc.frontImageUrl,
      backImageUrl: updates.backImageUrl !== undefined ? updates.backImageUrl : doc.backImageUrl,
      easeFactor: updates.easeFactor ?? doc.easeFactor,
      interval: updates.interval ?? doc.interval,
      repetitions: updates.repetitions ?? doc.repetitions,
      nextReview: updates.nextReview ?? doc.nextReview,
      lastReviewed: updates.lastReviewed !== undefined ? updates.lastReviewed : doc.lastReviewed,
      reviews: updates.reviews ?? doc.reviews,
      updatedAt: now
    });

    // Update deck's updatedAt
    const deckDoc = await db.decks.findOne(deckId).exec();
    if (deckDoc) {
      await deckDoc.patch({ updatedAt: now });
    }

    const updated = await db.cards.findOne(cardId).exec();
    if (!updated) return null;

    return {
      id: updated.id,
      front: updated.front,
      back: updated.back,
      frontImageUrl: updated.frontImageUrl,
      backImageUrl: updated.backImageUrl,
      easeFactor: updated.easeFactor,
      interval: updated.interval,
      repetitions: updated.repetitions,
      nextReview: updated.nextReview,
      lastReviewed: updated.lastReviewed,
      reviews: updated.reviews,
      createdAt: updated.createdAt
    };
  }

  async deleteCard(deckId: string, cardId: string): Promise<boolean> {
    const db = await this.getDb();
    const doc = await db.cards.findOne(cardId).exec();
    if (doc) {
      await doc.remove();
      
      // Update deck's updatedAt
      const deckDoc = await db.decks.findOne(deckId).exec();
      if (deckDoc) {
        await deckDoc.patch({ updatedAt: Date.now() });
      }
      
      return true;
    }
    return false;
  }
}

// Singleton adapter
let adapterInstance: RxDBAdapter | null = null;

export async function getStorageAdapter(): Promise<StorageAdapter> {
  if (!adapterInstance) {
    adapterInstance = new RxDBAdapter();
  }
  return adapterInstance;
}

export function clearAdapterCache(): void {
  // No-op for RxDB - database persists
}

// Re-export replication functions for auth context
export { startReplication, stopReplication };

// ==================== UTILITY FUNCTIONS ====================

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
    
    return { bytes, formatted };
  } catch (error) {
    console.error('Error calculating deck size:', error);
    return { bytes: 0, formatted: '0 bytes' };
  }
}

// ==================== CONVENIENCE EXPORTS ====================

const adapter = new RxDBAdapter();

export const getAllDecks = () => adapter.getAllDecks();
export const getDeckById = (deckId: string) => adapter.getDeckById(deckId);
export const createDeck = (name: string, description: string = '') => adapter.createDeck(name, description);
export const updateDeck = (deckId: string, updates: Partial<Deck>) => adapter.updateDeck(deckId, updates);
export const deleteDeck = (deckId: string) => adapter.deleteDeck(deckId);
export const createCard = (deckId: string, cardData: Partial<Card>) => adapter.createCard(deckId, cardData);
export const updateCard = (deckId: string, cardId: string, updates: Partial<Card>) => adapter.updateCard(deckId, cardId, updates);
export const deleteCard = (deckId: string, cardId: string) => adapter.deleteCard(deckId, cardId);
