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

/**
 * Update card based on user rating using SM-2 algorithm
 */
export function updateCardWithRating(card: Card, rating: number): Card {
  // Convert 1-5 rating to 0-5 quality (SM-2 expects 0-5)
  const quality = rating - 1;
  
  // Create a copy of the card to avoid mutations
  const updatedCard = { ...card };
  
  if (quality < 3) {
    // Failed recall - reset repetitions
    updatedCard.repetitions = 0;
    updatedCard.interval = 1;
  } else {
    // Successful recall
    if (updatedCard.repetitions === 0) {
      updatedCard.interval = 1;
    } else if (updatedCard.repetitions === 1) {
      updatedCard.interval = 6;
    } else {
      updatedCard.interval = Math.round(updatedCard.interval * updatedCard.easeFactor);
    }
    updatedCard.repetitions += 1;
  }
  
  // Update ease factor with more generous increases for good ratings
  // Modified SM-2 formula to reward high ratings more
  let easeFactorChange;
  
  if (quality === 4) {
    // Perfect (5) - increase significantly
    easeFactorChange = 0.15;
  } else if (quality === 3) {
    // Easy (4) - increase moderately  
    easeFactorChange = 0.10;
  } else if (quality === 2) {
    // Good (3) - small increase
    easeFactorChange = 0.0;
  } else if (quality === 1) {
    // Hard (2) - decrease slightly
    easeFactorChange = -0.15;
  } else {
    // Again (1) - decrease more
    easeFactorChange = -0.20;
  }
  
  updatedCard.easeFactor = updatedCard.easeFactor + easeFactorChange;
  
  // Ease factor should stay between 1.3 and 3.5
  if (updatedCard.easeFactor < 1.3) {
    updatedCard.easeFactor = 1.3;
  } else if (updatedCard.easeFactor > 3.5) {
    updatedCard.easeFactor = 3.5;
  }
  
  // Set next review date
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  updatedCard.nextReview = Date.now() + (updatedCard.interval * millisecondsPerDay);
  updatedCard.lastReviewed = Date.now();
  
  // Add to review history
  if (!updatedCard.reviews) {
    updatedCard.reviews = [];
  }
  updatedCard.reviews.push({ 
    rating, 
    date: Date.now() 
  });
  
  return updatedCard;
}

/**
 * Get cards that are due for review, sorted by difficulty (lowest ease factor first)
 */
export function getDueCards(deck: Deck): Card[] {
  const now = Date.now();
  const dueCards = deck.cards.filter(card => card.nextReview <= now);
  
  // Sort by ease factor (lowest first = hardest cards first)
  // Then by last reviewed (oldest first)
  return dueCards.sort((a, b) => {
    // Primary sort: ease factor (lower = harder = higher priority)
    const easeFactorA = a.easeFactor || 2.5;
    const easeFactorB = b.easeFactor || 2.5;
    const easeDiff = easeFactorA - easeFactorB;
    
    if (easeDiff !== 0) {
      return easeDiff;
    }
    
    // Secondary sort: last reviewed date (older = higher priority)
    const lastReviewedA = a.lastReviewed || 0;
    const lastReviewedB = b.lastReviewed || 0;
    return lastReviewedA - lastReviewedB;
  });
}

/**
 * Get worst-performing cards for practice (sorted by ease factor and last review)
 */
export function getWorstPerformingCards(deck: Deck, count: number = 10): Card[] {
  if (!deck || !deck.cards || deck.cards.length === 0) {
    return [];
  }

  // Sort by ease factor (lower is worse) and last reviewed (older first)
  const sortedCards = [...deck.cards].sort((a, b) => {
    const easeDiff = a.easeFactor - b.easeFactor;
    if (easeDiff !== 0) return easeDiff;
    return (a.lastReviewed || 0) - (b.lastReviewed || 0);
  });

  return sortedCards.slice(0, Math.min(count, deck.cards.length));
}
