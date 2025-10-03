/**
 * Context Type Definitions
 */

import { Card, Deck, GamificationStats, ToastType } from './models';

// Flashcard Context
export interface FlashcardContextType {
  decks: Deck[];
  loading: boolean;
  refreshDecks: () => void;
  addDeck: (name: string, description: string) => Deck;
  modifyDeck: (deckId: string, updates: Partial<Deck>) => Deck | null;
  removeDeck: (deckId: string) => boolean;
  addCard: (deckId: string, cardData: Partial<Card>) => Card;
  modifyCard: (deckId: string, cardId: string, updates: Partial<Card>) => Card | null;
  removeCard: (deckId: string, cardId: string) => boolean;
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

