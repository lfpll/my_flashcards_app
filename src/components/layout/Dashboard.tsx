/**
 * Dashboard Component  
 * Playful Pro design - Command center with gamification
 */

import { useMemo } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useGamification } from '../../context/GamificationContext';
import { getDueCardsCount } from '../../utils/storageAdapter';
import Button from '../ui/Button';

export default function Dashboard({ onSelectDeck, onStudyAll, onCreateDeck, onNavigate, onStudy }) {
  const { decks } = useFlashcards();
  const { streak, dailyGoal, cardsStudiedToday, dailyProgress, goalMet, totalCardsStudied } = useGamification();

  const stats = useMemo(() => {
    const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
    const totalDue = decks.reduce((sum, deck) => sum + getDueCardsCount(deck), 0);
    const activeDecks = decks.filter(deck => deck.cards.length > 0).length;
    
    // Calculate average accuracy (mock for now)
    const accuracy = 89;
    
    return { totalCards, totalDue, activeDecks, accuracy };
  }, [decks]);

  const allDecks = useMemo(() => {
    return [...decks]
      .map(deck => ({
        ...deck,
        dueCount: getDueCardsCount(deck),
        progress: deck.cards.length > 0 
          ? Math.round((deck.cards.filter(c => c.easeFactor > 2.8).length / deck.cards.length) * 100)
          : 0
      }))
      .sort((a, b) => b.dueCount - a.dueCount);
  }, [decks]);

  // Using consistent deck icons instead of random emojis

  return (
    <div className="space-y-6 pb-12">
      {/* Enhanced Daily Goal Banner - Hero Section */}
      <div className={`
        relative rounded-3xl p-8 lg:p-10 overflow-hidden
        border-2 shadow-2xl
        ${goalMet
          ? 'bg-theme-card hero-gradient-success border-success/30 glow-border-success'
          : 'bg-theme-card hero-gradient-accent border-accent-primary/30 glow-border-accent'
        }
      `}>
        {/* Decorative background blur effects */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          goalMet ? 'bg-success' : 'bg-accent-primary'
        }`} />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-light rounded-full blur-3xl opacity-10" />

        {/* Success celebration emojis */}
        {goalMet && (
          <>
            <div className="absolute top-10 left-10 text-4xl opacity-60 animate-pulse">🎉</div>
            <div className="absolute top-20 right-20 text-3xl opacity-60 animate-pulse" style={{animationDelay: '0.3s'}}>⭐</div>
            <div className="absolute bottom-20 left-20 text-3xl opacity-60 animate-pulse" style={{animationDelay: '0.6s'}}>✨</div>
          </>
        )}

        <div className="relative z-10">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-6 lg:mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`
                w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center
                border-2 transition-all
                ${goalMet
                  ? 'bg-success/20 border-success/40'
                  : 'bg-accent-primary/20 border-accent-primary/30 animate-pulse-glow'
                }
              `}>
                {goalMet ? (
                  <svg className="w-7 h-7 lg:w-9 lg:h-9 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 lg:w-9 lg:h-9 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-1">
                  {goalMet ? (
                    <span className="bg-gradient-to-r from-success via-emerald-400 to-green-300 bg-clip-text text-transparent">
                      Goal Complete! 🎉
                    </span>
                  ) : (
                    <span className="text-theme-text">Daily Goal</span>
                  )}
                </h1>
                <p className="text-sm lg:text-base text-theme-textDim">
                  {goalMet
                    ? 'Amazing work! You\'re on fire today!'
                    : 'Keep your learning streak alive!'
                  }
                </p>
              </div>
            </div>

            {/* Streak Badge */}
            {streak > 0 && (
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-warning/20 to-error/20 border border-warning/40 flex items-center gap-2 backdrop-blur-sm">
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <span className="font-bold text-warning">{streak} day streak</span>
              </div>
            )}
          </div>

          {/* Stats & Progress Section */}
          <div className="mb-8">
            {/* Stats Cards Row */}
            <div className="flex items-center gap-4 lg:gap-6 mb-6 flex-wrap">
              {/* Cards Studied Today */}
              <div className="stats-badge px-4 lg:px-6 py-3 lg:py-4 rounded-xl">
                <div className={`text-2xl lg:text-4xl font-bold mb-1 ${goalMet ? 'text-success' : 'text-theme-text'}`}>
                  {cardsStudiedToday}
                  <span className="text-theme-textDim text-lg lg:text-2xl">/{dailyGoal}</span>
                </div>
                <div className="text-xs text-theme-textDim uppercase tracking-wider font-medium">Cards Studied</div>
              </div>

              {/* Progress Percentage */}
              <div className="stats-badge px-4 lg:px-6 py-3 lg:py-4 rounded-xl">
                <div className={`text-2xl lg:text-4xl font-bold mb-1 ${goalMet ? 'text-success' : 'text-accent-primary'}`}>
                  {Math.round(dailyProgress)}%
                </div>
                <div className="text-xs text-theme-textDim uppercase tracking-wider font-medium">Progress</div>
              </div>

              {/* Motivational Text */}
              <div className={`flex items-center gap-2 font-medium ${goalMet ? 'text-success' : 'text-theme-textDim'}`}>
                {goalMet ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="hidden sm:inline">+{cardsStudiedToday - dailyGoal} bonus cards!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="hidden sm:inline">{dailyGoal - cardsStudiedToday} more to go!</span>
                  </>
                )}
              </div>

              {/* Quick Stats - Small text */}
              <div className="ml-auto flex items-center gap-4 text-sm text-theme-textDim">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{stats.totalCards} total</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${stats.totalDue > 0 ? 'text-error' : 'text-success'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{stats.totalDue} due</span>
                </div>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative h-3 lg:h-4 bg-theme-bg/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
              <div
                className={`
                  absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out overflow-hidden
                  ${goalMet
                    ? 'bg-gradient-to-r from-success to-emerald-400 progress-glow-success'
                    : 'bg-gradient-to-r from-accent-primary to-accent-light progress-glow-accent'
                  }
                `}
                style={{ width: `${Math.min(dailyProgress, 100)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            {stats.totalDue > 0 && (
              <Button
                variant="success"
                size="lg"
                onClick={onStudyAll}
                className="cta-glow shadow-xl px-6 lg:px-8 py-4 lg:py-5 text-base lg:text-xl font-bold flex items-center gap-3"
              >
                <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div className="text-left">
                  <div>{goalMet ? 'Keep Going!' : 'Continue Studying'}</div>
                  <div className="text-xs lg:text-sm opacity-90 font-normal">{stats.totalDue} cards ready</div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              className="px-5 lg:px-6 py-4 lg:py-5 font-medium"
            >
              {goalMet ? 'View Stats' : 'Adjust Goal'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Study Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Study
          </h2>
          <Button variant="secondary" onClick={() => onNavigate('decks')} className="shadow-lg hover:scale-105 transition-all">
            View All Decks →
          </Button>
        </div>

        <div className="bg-theme-card rounded-2xl p-6 min-h-[280px] shadow-sm">
          {allDecks.filter(d => d.dueCount > 0).length === 0 ? (
            <div className="text-center py-6 w-full flex flex-col items-center justify-center h-full min-h-[232px]">
              <div className="w-16 h-16 mx-auto mb-3 text-success">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-success">All Caught Up!</h3>
              <p className="text-theme-textDim">No cards are due for review right now.</p>
              <p className="text-sm text-theme-textDim mt-1">Check back later or manage your decks to add more cards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {allDecks.filter(d => d.dueCount > 0).slice(0, 6).map((deck) => (
                <div
                  key={deck.id}
                  className="bg-theme-lighter rounded-xl p-4 hover:ring-2 hover:ring-accent-primary/30 transition-all hover:scale-[1.02] cursor-pointer group shadow-sm"
                  onClick={() => onSelectDeck(deck.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center border border-accent-primary/30">
                      <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold group-hover:text-accent-primary transition-colors truncate">
                        {deck.name}
                      </h3>
                      <p className="text-sm text-theme-textDim">
                        {deck.dueCount} cards ready
                      </p>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStudy(deck.id);
                      }}
                      className="shadow-md hover:scale-105 transition-all shrink-0"
                    >
                      Study
                    </Button>
                  </div>
                </div>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-theme-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-theme-lighter rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Studied German deck</p>
                <p className="text-xs text-theme-textDim">2 hours ago • 12 cards</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-theme-lighter rounded-lg">
              <div className="w-2 h-2 bg-theme-textDim rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Created Biology deck</p>
                <p className="text-xs text-theme-textDim">Yesterday • 23 cards added</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-theme-lighter rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Completed Math session</p>
                <p className="text-xs text-theme-textDim">2 days ago • 15 cards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-theme-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Fire Streak - Unlocked */}
            <div className="text-center p-3 bg-success/10 rounded-lg border border-success/30">
              <div className="w-8 h-8 mx-auto mb-1 text-success">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div className="text-xs font-bold text-success">Fire Streak</div>
              <div className="text-xs text-theme-textDim">15 days</div>
            </div>
            
            {/* Scholar - Unlocked */}
            <div className="text-center p-3 bg-success/10 rounded-lg border border-success/30">
              <div className="w-8 h-8 mx-auto mb-1 text-success">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-xs font-bold text-success">Scholar</div>
              <div className="text-xs text-theme-textDim">100+ cards</div>
            </div>
            
            {/* Accuracy - Unlocked */}
            <div className="text-center p-3 bg-success/10 rounded-lg border border-success/30">
              <div className="w-8 h-8 mx-auto mb-1 text-success">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs font-bold text-success">Accuracy Pro</div>
              <div className="text-xs text-theme-textDim">89% avg</div>
            </div>
            
            {/* Rising Star - Locked */}
            <div className="text-center p-3 bg-theme-lighter rounded-lg opacity-50">
              <div className="w-8 h-8 mx-auto mb-1 text-theme-textDim relative">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-xs font-bold text-theme-textDim">Locked</div>
              <div className="text-xs text-theme-textDim">Keep studying!</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

