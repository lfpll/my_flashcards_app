/**
 * GamificationContext
 * Manages streaks, daily goals, and achievements
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GamificationContextType } from '../types/contexts';

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState<number>(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number>(20); // Default 20 cards per day
  const [cardsStudiedToday, setCardsStudiedToday] = useState<number>(0);
  const [totalCardsStudied, setTotalCardsStudied] = useState<number>(0);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gamification');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStreak(data.streak || 0);
        setLastStudyDate(data.lastStudyDate || null);
        setDailyGoal(data.dailyGoal || 20);
        setCardsStudiedToday(data.cardsStudiedToday || 0);
        setTotalCardsStudied(data.totalCardsStudied || 0);

        // Check if we need to reset daily count or update streak
        const today = new Date().toDateString();
        const lastDate = data.lastStudyDate ? new Date(data.lastStudyDate).toDateString() : null;
        
        if (lastDate !== today && lastDate) {
          // New day - check streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          if (lastDate === yesterdayStr) {
            // Studied yesterday, keep streak
          } else {
            // Missed a day, reset streak
            setStreak(0);
          }
          
          // Reset daily count
          setCardsStudiedToday(0);
        }
      } catch (error) {
        console.error('Error loading gamification data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const data = {
      streak,
      lastStudyDate,
      dailyGoal,
      cardsStudiedToday,
      totalCardsStudied
    };
    localStorage.setItem('gamification', JSON.stringify(data));
  }, [streak, lastStudyDate, dailyGoal, cardsStudiedToday, totalCardsStudied]);

  // Record a study session
  const recordStudySession = (cardsCount: number): void => {
    const today = new Date().toDateString();
    const lastDate = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;

    // Update cards studied today
    const newCardsToday = lastDate === today ? cardsStudiedToday + cardsCount : cardsCount;
    setCardsStudiedToday(newCardsToday);
    setTotalCardsStudied(totalCardsStudied + cardsCount);

    // Update streak if it's a new day
    if (lastDate !== today) {
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastDate === yesterdayStr) {
          // Continue streak
          setStreak(streak + 1);
        } else {
          // Broke streak, start over
          setStreak(1);
        }
      } else {
        // First time studying
        setStreak(1);
      }
      
      setLastStudyDate(new Date().toISOString());
    }
  };

  const dailyProgress = Math.min((cardsStudiedToday / dailyGoal) * 100, 100);
  const goalMet = cardsStudiedToday >= dailyGoal;

  const value: GamificationContextType = {
    streak,
    lastStudyDate,
    dailyGoal,
    cardsStudiedToday,
    totalCardsStudied,
    dailyProgress,
    goalMet,
    recordStudySession,
    updateGoal: setDailyGoal
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}
