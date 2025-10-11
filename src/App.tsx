import { useState } from 'react';
import TopNav from './components/layout/TopNav';
import Dashboard from './components/layout/Dashboard';
import DecksView from './screens/DecksView/DecksView';
import DeckDetail from './components/deck/DeckDetail';
import StudySession from './components/study/StudySession';
import { useFlashcards } from './context/FlashcardContext';
import { useGamification } from './context/GamificationContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { getDueCardsCount } from './utils/storage';
import { View } from './types/models';

function App() {
  const { loading, decks } = useFlashcards();
  const { } = useGamification();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<string>('home');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'home' || view === 'decks') {
      setSelectedDeckId(null);
    }
  };

  const navigateToDeckDetail = (deckId: string) => {
    setPreviousView(currentView);
    setSelectedDeckId(deckId);
    setCurrentView('deck-detail');
  };

  const navigateToStudy = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentView('study');
  };

  const handleStudyAll = () => {
    // Find first deck with due cards
    const deckWithDue = decks.find(deck => getDueCardsCount(deck) > 0);
    if (deckWithDue) {
      navigateToStudy(deckWithDue.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-theme-textDim">Loading your flashcards...</p>
      </div>
    );
  }

  // Full-screen study mode (no nav)
  if (currentView === 'study' && selectedDeckId) {
    return (
      <StudySession 
        deckId={selectedDeckId}
        onExit={() => handleNavigate('home')}
      />
    );
  }

  // Main Playful Pro layout
  return (
    <div className="min-h-screen bg-gradient-subtle" style={{ color: 'var(--text-color)' }}>
      {/* Top Navigation */}
        <TopNav
          currentView={currentView}
          onNavigate={handleNavigate}
          onCreateDeck={() => handleNavigate('decks')}
        />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <Dashboard
            onSelectDeck={navigateToDeckDetail}
            onStudyAll={handleStudyAll}
            onCreateDeck={() => handleNavigate('decks')}
            onNavigate={handleNavigate}
            onStudy={navigateToStudy}
          />
        )}

        {currentView === 'decks' && (
          <DecksView
            onSelectDeck={navigateToDeckDetail}
            onCreateDeck={() => {}} // Not needed since DecksView handles it internally
          />
        )}

        
        {currentView === 'deck-detail' && selectedDeckId && (
          <DeckDetail 
            deckId={selectedDeckId}
            onBack={() => handleNavigate(previousView)}
            onStudy={navigateToStudy}
            backLabel={previousView === 'decks' ? 'My Decks' : 'Dashboard'}
          />
        )}
      </main>
    </div>
  );
}

export default App;

