import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeContextType } from '../types/contexts';

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('flashcard-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Remove old theme attribute first to force CSS recalculation
    document.documentElement.removeAttribute('data-theme');
    
    // Apply theme to document with a small delay to ensure CSS recalculation
    requestAnimationFrame(() => {
      document.documentElement.setAttribute('data-theme', theme);
    });
    
    localStorage.setItem('flashcard-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const cycleTheme = toggleTheme; // Alias for compatibility

  const value: ThemeContextType = { theme, toggleTheme, cycleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
