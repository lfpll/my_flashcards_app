/**
 * TopNav Component
 * Horizontal navigation bar for Playful Pro design
 */

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function TopNav({ 
  currentView,
  onNavigate,
  onCreateDeck,
  userStreak = 0
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { theme, cycleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b shadow-lg" style={{ 
      backgroundColor: 'var(--card-color)', 
      borderColor: 'var(--border-color)' 
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-bold text-xl" style={{ color: 'var(--text-color)' }}>
                Flashcards
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-accent-primary text-white shadow-md'
                    : ''
                }`}
                style={currentView !== 'dashboard' ? {
                  color: 'var(--text-dim-color)',
                  backgroundColor: 'transparent'
                } : {}}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('decks')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'decks'
                    ? 'bg-accent-primary text-white shadow-md'
                    : ''
                }`}
                style={currentView !== 'decks' ? {
                  color: 'var(--text-dim-color)',
                  backgroundColor: 'transparent'
                } : {}}
              >
                My Decks
              </button>
              <button
                onClick={() => onNavigate('stats')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'stats'
                    ? 'bg-accent-primary text-white shadow-md'
                    : ''
                }`}
                style={currentView !== 'stats' ? {
                  color: 'var(--text-dim-color)',
                  backgroundColor: 'transparent'
                } : {}}
              >
                Stats
              </button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Streak Indicator (Desktop) */}
            {userStreak > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-warning/20 to-error/20 border border-warning/30 rounded-full">
                <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <span className="text-sm font-bold text-warning">{userStreak} day streak</span>
              </div>
            )}
            
            {/* Theme Cycle Button */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ backgroundColor: 'var(--lighter-color)' }}
              aria-label={`Current theme: ${theme}. Click to cycle themes`}
              title={`Theme: ${theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Ocean Breeze'}`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" style={{ color: 'var(--text-dim-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : theme === 'dark' ? (
                <svg className="w-5 h-5" style={{ color: 'var(--text-dim-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              )}
            </button>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ backgroundColor: 'var(--lighter-color)' }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-info rounded-full flex items-center justify-center text-white font-bold">
                  L
                </div>
                <span className="hidden md:inline text-sm font-medium" style={{ color: 'var(--text-color)' }}>Luiz</span>
                <svg className="w-4 h-4" style={{ color: 'var(--text-dim-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50 overflow-hidden" style={{ 
                    backgroundColor: 'var(--card-color)', 
                    border: '1px solid var(--border-color)' 
                  }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>Luiz Fernandol</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-dim-color)' }}>luiz@example.com</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 hover:opacity-70" style={{ color: 'var(--text-color)', backgroundColor: 'transparent' }}>
                        <svg className="w-4 h-4" style={{ color: 'var(--text-dim-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 hover:opacity-70" style={{ color: 'var(--text-color)', backgroundColor: 'transparent' }}>
                        <svg className="w-4 h-4" style={{ color: 'var(--text-dim-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Your Stats
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 hover:opacity-70" style={{ color: 'var(--text-color)', backgroundColor: 'transparent' }}>
                        <svg className="w-4 h-4" style={{ color: 'var(--text-dim-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Achievements
                      </button>
                    </div>
                    <div className="py-1" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <button className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden flex items-center justify-around py-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              currentView === 'dashboard'
                ? 'text-accent-primary'
                : ''
            }`}
            style={currentView !== 'dashboard' ? { color: 'var(--text-dim-color)' } : {}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => onNavigate('decks')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              currentView === 'decks'
                ? 'text-accent-primary'
                : ''
            }`}
            style={currentView !== 'decks' ? { color: 'var(--text-dim-color)' } : {}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-medium">Decks</span>
          </button>
          <button
            onClick={() => onNavigate('stats')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              currentView === 'stats'
                ? 'text-accent-primary'
                : ''
            }`}
            style={currentView !== 'stats' ? { color: 'var(--text-dim-color)' } : {}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Stats</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
