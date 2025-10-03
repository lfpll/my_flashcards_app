/**
 * Confetti Component
 * Creates a celebratory confetti animation
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Confetti({ duration = 3000 }) {
  const [pieces, setPieces] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    // Use theme-specific colors
    const colorPalette = theme === 'breeze' 
      ? [
          '#0077BE', // Ocean Breeze primary
          '#48CAE4', // Ocean Breeze accent
          '#51CF66', // Ocean Breeze success
          '#FFA94D', // Ocean Breeze warning
          '#FF6B6B', // Ocean Breeze error
        ]
      : [
          '#6366f1', // accent-primary
          '#10b981', // success
          '#f59e0b', // warning
          '#ef4444', // error
          '#3b82f6', // info
          '#818cf8', // accent-light
        ];

    // Generate confetti pieces
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 0.5,
      backgroundColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      size: Math.random() * 8 + 4,
    }));

    setPieces(confettiPieces);

    // Remove confetti after duration
    const timer = setTimeout(() => {
      setPieces([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, theme]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.backgroundColor,
            animationDelay: `${piece.animationDelay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}

