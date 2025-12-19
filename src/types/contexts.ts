/**
 * Context Type Definitions
 */

import { Card, Deck, GamificationStats, ToastType } from './models';

// Flashcard Context
export interface FlashcardContextType {
  decks: Deck[];
  loading: boolean;
  refreshDecks: () => Promise<void>;
  addDeck: (name: string, description: string) => Promise<Deck>;
  modifyDeck: (deckId: string, updates: Partial<Deck>) => Promise<Deck | null>;
  removeDeck: (deckId: string) => Promise<boolean>;
  addCard: (deckId: string, cardData: Partial<Card>) => Promise<Card>;
  modifyCard: (deckId: string, cardId: string, updates: Partial<Card>) => Promise<Card | null>;
  removeCard: (deckId: string, cardId: string) => Promise<boolean>;
}

// Toast Context
export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

// Toast State
export interface ToastState {
  message: string;
  type: ToastType;
}

// Theme Context
export interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
  cycleTheme: () => void;
}

// Gamification Context
export interface GamificationContextType extends GamificationStats {
  recordStudySession: (cardsCount: number) => void;
  updateGoal: (newGoal: number) => void;
}

// Confirm Dialog Config
export interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

