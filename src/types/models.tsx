/**
 * Type definitions for the flashcard application
 */

/**
 * @typedef Review
 * @type {object}
 * @property {number} rating - User rating (1-5)
 * @property {number} date - Timestamp of the review
 */

/**
 * @typedef Card
 * @type {object}
 * @property {string} id - Unique card identifier
 * @property {string} front - Front text of the card
 * @property {string} back - Back text of the card
 * @property {string} [frontImageUrl] - Optional front image URL
 * @property {string} [backImageUrl] - Optional back image URL
 * @property {number} easeFactor - SM-2 ease factor (1.3-3.5)
 * @property {number} interval - Days until next review
 * @property {number} repetitions - Number of successful repetitions
 * @property {number} nextReview - Timestamp of next review
 * @property {number} lastReviewed - Timestamp of last review
 * @property {Review[]} reviews - Array of review history
 */

/**
 * @typedef Deck
 * @type {object}
 * @property {string} id - Unique deck identifier
 * @property {string} name - Deck name
 * @property {Card[]} cards - Array of cards in the deck
 */

export {};
