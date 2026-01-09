/**
 * SM-2 (SuperMemo 2) Spaced Repetition Algorithm Implementation
 *
 * This algorithm schedules card reviews based on user performance.
 * Rating scale: 1-5 where:
 *   1 = Again (didn't remember)
 *   2 = Hard (barely remembered)
 *   3 = Good (remembered with effort)
 *   4 = Easy (remembered easily)
 *   5 = Perfect (knew it instantly)
 */

import { Card, Deck } from '../types/models';

// ==================== CONSTANTS ====================

const EASE_FACTOR_MIN = 1.3;
const EASE_FACTOR_MAX = 3.5;
const MAX_INTERVAL_DAYS = 90;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// ==================== PURE CALCULATIONS ====================

interface ScoreUpdate {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: number;
}

function userRatedAsRemembered(rating: number): boolean {
  return rating >= 3;
}

function getAverageRating(card: Card): number {
  if (!card.reviews || card.reviews.length === 0) {
    return 3; // Default to "Good" for new cards
  }
  const sum = card.reviews.reduce((total, review) => total + review.rating, 0);
  return sum / card.reviews.length;
}

function userForgot(card: Card, rating: number): boolean {
  // First review: only rating 1 counts as forgot
  if (!card.reviews || card.reviews.length === 0) {
    return rating === 1;
  }
  
  // Compare to historical average - forgot if significantly below
  const avgRating = getAverageRating(card);
  return rating < avgRating - 1;
}

function getEaseFactorChange(rating: number): number {
  const changes: Record<number, number> = {
    5: 0.15,   // Perfect
    4: 0.10,   // Easy
    3: 0.0,    // Good
    2: -0.15,  // Hard
    1: -0.20   // Again
  };
  return changes[rating] ?? 0;
}

function clampEaseFactor(easeFactor: number): number {
  return Math.max(EASE_FACTOR_MIN, Math.min(EASE_FACTOR_MAX, easeFactor));
}

function calculateNextInterval(card: Card): number {
  if (card.repetitions === 0) return 1;
  if (card.repetitions === 1) return 6;
  return Math.round(card.interval * card.easeFactor);
}

function calculateNextReviewDate(intervalDays: number): number {
  const safeInterval = Math.min(intervalDays, MAX_INTERVAL_DAYS);
  return Date.now() + (safeInterval * MILLISECONDS_PER_DAY);
}

function calculateScoreUpdate(card: Card, rating: number): ScoreUpdate {
  const remembered = userRatedAsRemembered(rating);
  
  const newRepetitions = remembered ? card.repetitions + 1 : 0;
  const newInterval = remembered ? calculateNextInterval(card) : 1;
  const newEaseFactor = clampEaseFactor(card.easeFactor + getEaseFactorChange(rating));
  const nextReview = calculateNextReviewDate(newInterval);
  
  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    nextReview
  };
}

// ==================== DECISION LOGIC ====================

function isScheduledReview(card: Card): boolean {
  return card.nextReview <= Date.now();
}

function shouldApplyScoreUpdate(card: Card, rating: number): boolean {
  // Apply score if: card was due OR user forgot (even during practice)
  return isScheduledReview(card) || userForgot(card, rating);
}

// ==================== CARD UPDATE ====================

function recordReview(card: Card, rating: number, now: number): Card {
  return {
    ...card,
    lastReviewed: now,
    reviews: [...(card.reviews || []), { rating, date: now }]
  };
}

function applyScoreUpdate(card: Card, score: ScoreUpdate): Card {
  return {
    ...card,
    interval: score.interval,
    easeFactor: score.easeFactor,
    repetitions: score.repetitions,
    nextReview: score.nextReview
  };
}

// ==================== MAIN FUNCTION ====================

/**
 * Update card based on user rating.
 * 
 * - If card is due (scheduled review): full score update
 * - If card is not due but user forgot: full score update (penalty)
 * - If card is not due and user remembered: practice only (no scoring)
 */
export function updateCardWithRating(card: Card, rating: number): Card {
  const now = Date.now();
  
  // Always record the review
  let updatedCard = recordReview(card, rating, now);
  
  // Apply score update only if scheduled or user forgot
  if (shouldApplyScoreUpdate(card, rating)) {
    const score = calculateScoreUpdate(card, rating);
    updatedCard = applyScoreUpdate(updatedCard, score);
  }
  
  return updatedCard;
}

// ==================== CARD FILTERS ====================

function wasNeverStudied(card: Card): boolean {
  return !card.lastReviewed;
}

function wasStudiedRecently(card: Card, thirtyMinutesAgo: number): boolean {
  return card.lastReviewed !== null && card.lastReviewed >= thirtyMinutesAgo;
}

// ==================== CARD SORTERS ====================

function sortByHardestFirst(a: Card, b: Card): number {
  return (a.easeFactor || 2.5) - (b.easeFactor || 2.5);
}

function sortByOldestStudiedFirst(a: Card, b: Card): number {
  return (a.lastReviewed || 0) - (b.lastReviewed || 0);
}

// ==================== MAIN FUNCTION ====================

/**
 * Get cards available for study.
 * 
 * Priority:
 * 1. Cards that are due (nextReview <= now)
 * 2. If none due: cards studied more than 30 min ago (for practice)
 * 
 * Ordering:
 * - Never studied cards first (hardest first)
 * - Then cards not studied recently (hardest first)
 * - Then recently studied cards (oldest first for spacing)
 */
export function getDueCards(deck: Deck): Card[] {
  const now = Date.now();
  const thirtyMinutesAgo = now - (30 * 60 * 1000);
  
  // First: try cards that are actually due
  const dueCards = deck.cards.filter(card => card.nextReview <= now);
  
  if (dueCards.length > 0) {
    return sortCardsForStudy(dueCards, thirtyMinutesAgo);
  }
  
  // No cards due: return max 10 cards for practice (studied >30 min ago)
  const practiceCards = deck.cards.filter(card => 
    !wasStudiedRecently(card, thirtyMinutesAgo)
  );
  
  return practiceCards.sort(sortByHardestFirst).slice(0, 10);
}

function sortCardsForStudy(cards: Card[], thirtyMinutesAgo: number): Card[] {
  const neverStudied = cards.filter(wasNeverStudied);
  const studiedButNotRecently = cards.filter(card => 
    !wasNeverStudied(card) && !wasStudiedRecently(card, thirtyMinutesAgo)
  );
  const studiedRecently = cards.filter(card => 
    wasStudiedRecently(card, thirtyMinutesAgo)
  );
  
  // Prioritize cards not studied recently
  if (neverStudied.length > 0 || studiedButNotRecently.length > 0) {
    return [
      ...neverStudied.sort(sortByHardestFirst),
      ...studiedButNotRecently.sort(sortByHardestFirst)
    ];
  }
  
  return studiedRecently.sort(sortByOldestStudiedFirst);
}

