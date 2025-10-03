/**
 * CSV Parser for bulk card import
 * Expected format: front,back,frontImageURL,backImageURL (one card per line)
 * Image URLs are optional
 */

import { CSVParseResult } from '../types/models';

interface ParsedCard {
  front: string;
  back: string;
  frontImageUrl: string | null;
  backImageUrl: string | null;
}

interface ParseError {
  line: number;
  message: string;
}

/**
 * Parse CSV text into card objects
 */
export function parseCSV(csvText: string): CSVParseResult {
  const lines = csvText.trim().split('\n');
  const cards: ParsedCard[] = [];
  const errors: ParseError[] = [];
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Skip empty lines
    if (!line.trim()) {
      return;
    }
    
    // Simple CSV parsing (handles basic comma-separated values)
    // For production, consider a more robust CSV parser library
    const parts = line.split(',').map(part => part.trim());
    
    if (parts.length < 2) {
      errors.push({
        line: lineNumber,
        message: 'Invalid format. Expected at least: front,back'
      });
      return;
    }
    
    const [front, back, frontImageUrl, backImageUrl] = parts;
    
    if (!front) {
      errors.push({
        line: lineNumber,
        message: 'Front text cannot be empty'
      });
      return;
    }
    
    if (!back) {
      errors.push({
        line: lineNumber,
        message: 'Back text cannot be empty'
      });
      return;
    }
    
    cards.push({
      front,
      back,
      frontImageUrl: frontImageUrl || null,
      backImageUrl: backImageUrl || null
    });
  });
  
  return { cards, errors };
}

/**
 * Validate image URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return true; // Optional field
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
