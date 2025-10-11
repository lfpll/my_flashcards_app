/**
 * DeckDetail Component
 * Shows deck information and card list with management options
 */

import { useState, useMemo, useEffect } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../hooks/useConfirm';
import { getDueCardsCount, getDeckSize } from '../../utils/storage.jsx';
import Button from '../ui/Button';
import InlineDeckEditor from './InlineDeckEditor';
import InlineCardEditor from './card/InlineCardEditor.tsx';
import BulkAddForm from '../deck/BulkAddForm';
import CardListItem from './card/CardListItem.tsx';

export default function DeckDetail({ deckId, onBack, onStudy, backLabel = 'Back' }) {
  const { decks, removeDeck, removeCard } = useFlashcards();
  const { showToast } = useToast();
  const { confirm, ConfirmationDialog } = useConfirm();
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [newCardEditors, setNewCardEditors] = useState([]); // Array of new card editor IDs
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null); // ID of card being edited
  const [showAllBacks, setShowAllBacks] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default' or 'easeFactor'

  const deck = useMemo(() =>
    decks.find(d => d.id === deckId),
    [decks, deckId]
  );

  // Sort cards based on selected sort option
  const sortedCards = useMemo(() => {
    if (!deck) return [];

    const cards = [...deck.cards];

    if (sortBy === 'easeFactor') {
      return cards.sort((a, b) => {
        // Cards without reviews go to the end
        const aHasReviews = a.reviews && a.reviews.length > 0;
        const bHasReviews = b.reviews && b.reviews.length > 0;

        if (!aHasReviews && !bHasReviews) return 0;
        if (!aHasReviews) return 1;
        if (!bHasReviews) return -1;

        // Sort by ease factor (lowest first - hardest cards first)
        return a.easeFactor - b.easeFactor;
      });
    }

    return cards; // default order
  }, [deck, sortBy]);

  if (!deck) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-16">
          <p className="text-theme-textDim">Deck not found</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const dueCards = getDueCardsCount(deck);
  const canStudy = dueCards > 0;
  const canPractice = !canStudy && deck.cards.length > 0;
  const deckSize = getDeckSize(deck);

  const handleDeleteDeck = () => {
    confirm(
      'Delete Deck?',
      `Are you sure you want to delete "${deck.name}"? This will delete ${deck.cards.length} cards. This cannot be undone.`,
      () => {
        removeDeck(deck.id);
        showToast('Deck deleted successfully', 'success');
        setTimeout(() => onBack(), 500);
      }
    );
  };

  const handleDeleteCard = (cardId) => {
    removeCard(deck.id, cardId);
    showToast('Card deleted successfully', 'success');
    // Close editor if this card was being edited
    if (editingCardId === cardId) {
      setEditingCardId(null);
    }
  };

  const handleEditCard = (cardId) => {
    // Toggle: if already editing this card, close it; otherwise open it
    if (editingCardId === cardId) {
      setEditingCardId(null);
    } else {
      setEditingCardId(cardId);
    }
  };

  const addNewCard = () => {
    // Add a new card editor with unique ID
    const newEditorId = `new-${Date.now()}`;
    setNewCardEditors(prev => [...prev, newEditorId]);
  };

  const removeNewCardEditor = (editorId) => {
    setNewCardEditors(prev => prev.filter(id => id !== editorId));
  };

  // Keyboard shortcut to add new card (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Ctrl+Shift+A is pressed (works anywhere, including textareas)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        addNewCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="max-w-7xl mx-auto px-0 md:px-4 pt-1 pb-2 md:pt-6 md:pb-6">
        
        {/* Inline Deck Editor */}
        {isEditingDeck && (
          <div className="mb-4 px-4 md:px-0 md:mb-6">
            <InlineDeckEditor
              deck={deck}
              autoFocus
              onSave={() => {
                setIsEditingDeck(false);
                showToast('Deck updated successfully!', 'success');
              }}
              onCancel={() => setIsEditingDeck(false)}
            />
          </div>
        )}

        {/* Single Responsive Header */}
        <div className="bg-theme-card rounded-none md:rounded-2xl p-4 md:p-6 border-0 md:border md:border-theme-lighter shadow-none md:shadow-lg mb-4 md:mb-6 mx-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-3xl font-bold mb-1 md:mb-2 truncate">{deck.name}</h1>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap text-xs md:text-sm text-theme-textDim">
                <span className="whitespace-nowrap">
                  {deck.cards.length} cards
                </span>
                {dueCards > 0 && (
                  <span className="text-error font-medium whitespace-nowrap">
                    • {dueCards} due
                  </span>
                )}
                <span className="hidden md:inline">• Created {new Date(deck.createdAt).toLocaleDateString()}</span>
                <span className="hidden sm:inline">• 💾 {deckSize.formatted}</span>
              </div>
            </div>

            {/* Study/Practice Button */}
            {(canStudy || canPractice) && (
              <Button
                variant={"success"}
                onClick={() => onStudy(deck.id)}
                className="shadow-lg hover:shadow-xl transition-all hover:scale-105 px-8 md:px-6 py-4 md:py-3 text-sm md:text-lg"
              >
                <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">
                  {canStudy ? `Study ${dueCards} card${dueCards > 1 ? 's' : ''}` : 'Practice'}
                </span>
                <span className="hidden">
                  {canStudy ? 'Study' : 'Practice'}
                </span>
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-theme-lighter flex-wrap">
            {/* Add Card */}
            <Button
              variant="primary"
              onClick={addNewCard}
              title="Add new card (Ctrl+Shift+A)"
              className="px-3 md:px-4 py-2"
            >
              <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Card</span>
              <kbd className="hidden lg:inline ml-2 px-1.5 py-0.5 text-xs bg-theme-bg rounded border border-theme-lighter opacity-60">Ctrl+Shift+A</kbd>
            </Button>
              {/* Import CSV - Desktop only */}
              <Button
              variant="primary"
              onClick={() => setIsBulkAddOpen(true)}
              title="Import cards from CSV"
              className="px-3 md:px-4 py-2"
            >
                <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">Import CSV</span>
                <span className="sm:hidden">Import</span>
              </Button>

            {/* Show/Hide Answers */}
            <Button
              variant="secondary"
              onClick={() => setShowAllBacks(!showAllBacks)}
              className={`px-3 py-2 ${showAllBacks ? 'ring-1 ring-accent-primary' : ''}`}
              title={showAllBacks ? 'Hide Answers' : 'Show Answers'}
            >
              <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAllBacks ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
              </svg>
              <span className="hidden sm:inline">
                {showAllBacks ? 'Hide Answers' : 'Show Answers'}
              </span>
            </Button>

            {/* Sort */}
            <Button
              variant="secondary"
              onClick={() => setSortBy(sortBy === 'default' ? 'easeFactor' : 'default')}
              className={`px-3 py-2 ${sortBy === 'easeFactor' ? 'ring-1 ring-accent-primary' : ''}`}
              title={sortBy === 'easeFactor' ? 'Sort by Default' : 'Sort by Difficulty'}
            >
              <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span className="hidden sm:inline">
                {sortBy === 'easeFactor' ? 'Sort by Difficulty' : 'Sort by Default'}
              </span>
            </Button>

            {/* Right side buttons */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditingDeck(true)}
                className="px-3 py-2"
              >
                <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden md:inline">Edit</span>
              </Button>
              
              <Button
                variant="danger"
                onClick={handleDeleteDeck}
                className="px-3 py-2"
              >
                <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden md:inline">Delete</span>
              </Button>

              {/* Mobile overflow menu */}
              {showMobileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-lg shadow-xl py-2 border border-theme-lighter z-20">
                  <button
                    onClick={() => {
                      setIsBulkAddOpen(true);
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-lighter md:hidden"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Import CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Width Card List */}
        {/*
          CARD LIST CONTAINER OPTIONS - Choose your preferred style:

          1. FULL WIDTH MOBILE (current) - No padding/border on mobile, styled on desktop:
             "md:border md:border-theme-lighter/30 md:rounded-2xl overflow-hidden p-0 md:p-4"

          2. ALWAYS STYLED - Border and padding on all screens:
             "border border-theme-lighter/30 rounded-2xl overflow-hidden p-4"

          3. NO CONTAINER - Just cards, no wrapper styling:
             "p-0"
        */}
        <div className="overflow-hidden p-0">
          {/* Empty State */}
          {deck.cards.length === 0 && newCardEditors.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No Cards Yet</h3>
              <p className="text-theme-textDim mb-6">Add flashcards to start learning</p>
              <Button
                variant="primary"
                onClick={addNewCard}
              >
                + Add Your First Card
              </Button>
            </div>
          )}

          {/* Content Area - Editors and Cards */}
          {(newCardEditors.length > 0 || deck.cards.length > 0) && (
            <div>
              {/* New Card Editors at top - one for each editor */}
              {newCardEditors.map((editorId, index) => (
                <div key={editorId} className="mb-0 px-0 md:px-0 border-b border-theme-lighter/30">
                  <InlineCardEditor
                    deckId={deck.id}
                    card={null}
                    autoFocus={index === newCardEditors.length - 1} // Auto-focus only the last added
                    onSave={() => {
                      removeNewCardEditor(editorId);
                      showToast('Card added!', 'success');
                    }}
                    onCancel={() => removeNewCardEditor(editorId)}
                  />
                </div>
              ))}

              {/* Card List with inline editing */}
              {sortedCards.map((card) => (
                <div key={card.id}>
                  {editingCardId === card.id ? (
                    // Show editor in place of card
                    <div className="border-b border-theme-lighter/30">
                      <InlineCardEditor
                        deckId={deck.id}
                        card={card}
                        autoFocus={true}
                        onSave={() => {
                          setEditingCardId(null);
                          showToast('Card updated!', 'success');
                        }}
                        onCancel={() => setEditingCardId(null)}
                      />
                    </div>
                  ) : (
                    // Show card normally
                    <CardListItem
                      card={card}
                      showBack={showAllBacks}
                      onEdit={() => handleEditCard(card.id)}
                      onDelete={() => handleDeleteCard(card.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BulkAddForm
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        deckId={deck.id}
      />

      <ConfirmationDialog />
    </>
  );
}
