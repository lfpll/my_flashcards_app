/**
 * DeckCard Component
 * Displays individual deck information in a card format
 */

import { getDueCardsCount } from '../../utils/storage.jsx';
import { useFlashcards } from '../../context/FlashcardContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../hooks/useConfirm';

export default function DeckCard({ deck, onClick }) {
  const { removeDeck } = useFlashcards();
  const { showToast } = useToast();
  const { confirm, ConfirmationDialog } = useConfirm();
  const totalCards = deck.cards.length;
  const dueCards = getDueCardsCount(deck);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    confirm(
      'Delete Deck?',
      `Are you sure you want to delete "${deck.name}"? This will delete ${totalCards} card${totalCards !== 1 ? 's' : ''}. This cannot be undone.`,
      () => {
        removeDeck(deck.id);
        showToast('Deck deleted successfully', 'success');
      }
    );
  };

  return (
    <>
      <div
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${deck.name} deck. ${totalCards} cards total${dueCards > 0 ? `, ${dueCards} due for review` : ', all cards reviewed'}`}
        className="relative bg-theme-card p-6 rounded-xl cursor-pointer transition-all duration-200 hover:bg-theme-lighter border-2 border-theme-lighter hover:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-theme-bg group"
      >
        {/* Delete Button - appears on hover on desktop, always visible on mobile */}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-2 rounded-lg bg-theme-bg/80 hover:bg-error text-theme-textDim hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
          title="Delete deck"
          aria-label={`Delete ${deck.name} deck`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Deck Name */}
        <h3 className="text-xl font-semibold mb-2 truncate pr-8">{deck.name}</h3>
        
        {/* Description */}
        {deck.description && (
          <p className="text-theme-textDim text-sm mb-4 line-clamp-2">
            {deck.description}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-theme-textDim">
            <span className="font-medium">{totalCards}</span> cards
          </div>
          
          {dueCards > 0 && (
            <div className="badge badge-due">
              {dueCards} due
            </div>
          )}
          
          {dueCards === 0 && totalCards > 0 && (
            <div className="text-success font-medium">
              ✓ All done!
            </div>
          )}
        </div>
        
        {/* Last studied */}
        {deck.updatedAt && (
          <div className="text-xs text-theme-textDim mt-2">
            Updated {new Date(deck.updatedAt).toLocaleDateString()}
          </div>
        )}
      </div>
      
      <ConfirmationDialog />
    </>
  );
}
