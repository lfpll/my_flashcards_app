/**
 * DecksView Component
 * Dedicated view for browsing and managing all decks
 */

import { useMemo, useState } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useToast } from '../../context/ToastContext';
import { getDueCardsCount } from '../../utils/storage.jsx';
import Button from '../ui/Button';
import InlineDeckEditor from '../deck/InlineDeckEditor';

export default function DecksView({ onSelectDeck, onCreateDeck }) {
  const { decks } = useFlashcards();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'due', 'progress'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'due', 'completed'
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);

  const processedDecks = useMemo(() => {
    return [...decks]
      .map(deck => ({
        ...deck,
        dueCount: getDueCardsCount(deck),
        progress: deck.cards.length > 0 
          ? Math.round((deck.cards.filter(c => c.easeFactor > 2.8).length / deck.cards.length) * 100)
          : 0,
        lastStudied: Math.floor(Math.random() * 24) // Mock data
      }))
      .filter(deck => {
        if (filterBy === 'due') return deck.dueCount > 0;
        if (filterBy === 'completed') return deck.dueCount === 0;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name);
          case 'due': return b.dueCount - a.dueCount;
          case 'progress': return b.progress - a.progress;
          case 'recent': 
          default: return a.lastStudied - b.lastStudied;
        }
      });
  }, [decks, sortBy, filterBy]);

  // Deck icons will be handled by individual deck settings or default icon

  return (
    <div className="space-y-6">

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-theme-card rounded-xl border border-theme-lighter">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-theme-textDim">Filter:</span>
          <select 
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-1.5 bg-theme-lighter border border-theme-lighter rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="all">All Decks</option>
            <option value="due">Cards Due</option>
            <option value="completed">Up to Date</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-theme-textDim">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-theme-lighter border border-theme-lighter rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="recent">Recently Studied</option>
            <option value="name">Name A-Z</option>
            <option value="due">Most Due Cards</option>
            <option value="progress">Progress</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-theme-textDim">{processedDecks.length} results</span>
        </div>
      </div>

      {/* Inline Deck Editor */}
      {showInlineEditor && (
        <InlineDeckEditor
          deck={editingDeck}
          autoFocus={true}
          onSave={() => {
            setShowInlineEditor(false);
            setEditingDeck(null);
            showToast(editingDeck ? 'Deck updated!' : 'Deck created!', 'success');
          }}
          onCancel={() => {
            setShowInlineEditor(false);
            setEditingDeck(null);
          }}
        />
      )}

      {/* Decks Grid */}
      {processedDecks.length === 0 && !showInlineEditor ? (
        <div className="text-center py-16 bg-theme-card rounded-2xl border-2 border-dashed border-theme-lighter">
          <div className="w-20 h-20 mx-auto mb-4 text-theme-textDim">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {filterBy === 'all' ? 'No decks yet' : `No decks match "${filterBy}" filter`}
          </h3>
          <p className="text-theme-textDim mb-6">
            {filterBy === 'all' 
              ? 'Create your first deck to start learning!'
              : 'Try adjusting your filters or create a new deck.'
            }
          </p>
          <Button variant="primary" size="lg" onClick={() => setShowInlineEditor(true)}>
            + Create Your First Deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedDecks.map((deck) => {
            return (
              <div
                key={deck.id}
                className="relative bg-theme-card rounded-2xl border border-theme-lighter p-6 shadow-lg hover:shadow-xl hover:border-accent-primary/30 transition-all hover:scale-[1.02] cursor-pointer group"
                onClick={() => onSelectDeck(deck.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center border border-accent-primary/30">
                      <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-accent-primary transition-colors">
                        {deck.name}
                      </h3>
                      <p className="text-sm text-theme-textDim">
                        {deck.cards.length} cards
                      </p>
                    </div>
                  </div>
                  {deck.dueCount > 0 && (
                    <div className="px-3 py-1.5 bg-error/20 border border-error/50 rounded-full">
                      <span className="text-error font-bold text-sm">{deck.dueCount}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-theme-textDim font-medium">Mastery</span>
                      <span className="font-bold text-theme-text">{deck.progress}%</span>
                    </div>
                    <div className="relative h-2 bg-theme-lighter rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-accent-primary rounded-full transition-all duration-500"
                        style={{ width: `${deck.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Studied */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-theme-textDim">Last studied:</span>
                    <span className="font-medium">
                      {deck.lastStudied === 0 ? 'Just now' : `${deck.lastStudied}h ago`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant={deck.dueCount > 0 ? "success" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDeck(deck.id);
                    }}
                    disabled={deck.dueCount === 0}
                    className="flex-1 shadow-md hover:scale-105 transition-all"
                  >
                    {deck.dueCount > 0 ? `Study ${deck.dueCount} card${deck.dueCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDeck(deck.id);
                    }}
                    className="shadow-md hover:scale-105 transition-all"
                  >
                    Manage
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDeck(deck);
                      setShowInlineEditor(true);
                    }}
                    className="shadow-md hover:scale-105 transition-all"
                    title="Edit deck"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Add New Deck Card */}
          <div
            onClick={() => !showInlineEditor && setShowInlineEditor(true)}
            className={`relative bg-theme-card rounded-2xl border-2 border-dashed border-theme-lighter p-6 transition-all flex items-center justify-center min-h-[280px] ${
              showInlineEditor 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:border-accent-primary/50 hover:scale-[1.02] cursor-pointer group'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-theme-lighter flex items-center justify-center transition-all ${
                !showInlineEditor && 'group-hover:bg-accent-primary/10'
              }`}>
                <svg className={`w-8 h-8 transition-colors ${
                  showInlineEditor 
                    ? 'text-theme-textDim/50' 
                    : 'text-theme-textDim group-hover:text-accent-primary'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                showInlineEditor 
                  ? 'text-theme-textDim/50' 
                  : 'text-theme-textDim group-hover:text-accent-primary'
              }`}>
                Create New Deck
              </h3>
              <p className="text-sm text-theme-textDim">
                {showInlineEditor ? 'Finish editing first' : 'Start a new collection of flashcards'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
