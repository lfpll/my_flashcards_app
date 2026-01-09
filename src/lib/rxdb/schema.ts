/**
 * RxDB Schema Definitions for Flashcard App
 */
import { RxJsonSchema } from 'rxdb';

// Card document type
export interface CardDoc {
  id: string;
  deckId: string;
  front: string;
  back: string;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lastReviewed: number | null;
  reviews: Array<{ rating: number; date: number }>;
  createdAt: number;
  updatedAt: number;
  userId?: string | null;
}

// Deck document type
export interface DeckDoc {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  userId?: string | null;
}

// Card schema
export const cardSchema: RxJsonSchema<CardDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    deckId: { type: 'string', maxLength: 100 },
    front: { type: 'string' },
    back: { type: 'string' },
    frontImageUrl: { type: ['string', 'null'] },
    backImageUrl: { type: ['string', 'null'] },
    easeFactor: { type: 'number' },
    interval: { type: 'number' },
    repetitions: { type: 'number' },
    nextReview: { type: 'number' },
    lastReviewed: { type: ['number', 'null'] },
    reviews: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rating: { type: 'number' },
          date: { type: 'number' }
        }
      }
    },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
    userId: { type: ['string', 'null'] }
  },
  required: ['id', 'deckId', 'front', 'back', 'easeFactor', 'interval', 'repetitions', 'nextReview', 'createdAt', 'updatedAt'],
  indexes: ['deckId', 'nextReview', 'updatedAt']
};

// Deck schema
export const deckSchema: RxJsonSchema<DeckDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    description: { type: 'string' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
    userId: { type: ['string', 'null'] }
  },
  required: ['id', 'name', 'createdAt', 'updatedAt'],
  indexes: ['updatedAt']
};

