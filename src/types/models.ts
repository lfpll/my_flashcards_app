/**
 * Core Data Models for Flashcard Application
 */

// Card interface with spaced repetition metadata
export interface Card {
  id: string;
  front: string;
  back: string;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lastReviewed: number | null;
  reviews: Review[];
  createdAt: number;
}

// Review history for a card
export interface Review {
  rating: number;
  date: number;
}

// Deck interface
export interface Deck {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  cards: Card[];
}

// Gamification stats
export interface GamificationStats {
  streak: number;
  dailyGoal: number;
  cardsStudiedToday: number;
  dailyProgress: number;
  goalMet: boolean;
  totalCardsStudied: number;
  lastStudyDate: string | null;
  achievements: Achievement[];
}

// Achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

// CSV parsing result
export interface CSVParseResult {
  cards: Array<{ front: string; back: string }>;
  errors: Array<{ line: number; message: string }>;
}

// Deck size info
export interface DeckSize {
  bytes: number;
  formatted: string;
}

// Theme type
export type Theme = 'light' | 'dark' | 'ocean-breeze' | 'sunset' | 'forest' | 'lavender';

// Toast type
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// View types for navigation
export type View = 'home' | 'decks' | 'deck-detail' | 'study';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning' | 'info';

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Loading spinner sizes
export type SpinnerSize = 'sm' | 'md' | 'lg';

