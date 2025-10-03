/**
 * InlineDeckEditor Component
 * Inline editor for creating/editing decks directly in the list
 */

import { useState, useRef, useEffect } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';

export default function InlineDeckEditor({ 
  deck = null, // null for new deck, deck object for editing
  autoFocus = false,
  onSave,
  onCancel
}) {
  const { addDeck, modifyDeck } = useFlashcards();
  const { showToast } = useToast();
  const [name, setName] = useState(deck?.name || '');
  const [description, setDescription] = useState(deck?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  const isEditing = !!deck;

  useEffect(() => {
    if (autoFocus && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showToast('Deck name is required', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Edit existing deck
        await modifyDeck(deck.id, {
          name: name.trim(),
          description: description.trim()
        });
      } else {
        // Create new deck
        await addDeck(name.trim(), description.trim());
      }
      
      onSave?.();
    } catch (error) {
      showToast('Failed to save deck', 'error');
      console.error('Error saving deck:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel?.();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-gradient-to-r from-accent-primary/10 to-accent-light/5 rounded-2xl border-2 border-accent-primary/50 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 rounded-xl flex items-center justify-center border border-accent-primary/30">
          <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-bold">
          {isEditing ? 'Edit Deck' : 'Create New Deck'}
        </h3>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Deck Name */}
        <div>
          <label className="block text-sm font-medium text-theme-textDim mb-2">
            Deck Name *
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., German Vocabulary, Biology Chapter 1..."
            className="w-full px-4 py-3 bg-theme-lighter border border-theme-lighter rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
            disabled={isSubmitting}
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-theme-textDim">
              {name.length}/100 characters
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-theme-textDim mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Brief description of what this deck covers..."
            rows={2}
            className="w-full px-4 py-3 bg-theme-lighter border border-theme-lighter rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all resize-none"
            disabled={isSubmitting}
            maxLength={200}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-theme-textDim">
              {description.length}/200 characters
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="success"
            disabled={!name.trim() || isSubmitting}
            className="flex-1 shadow-md hover:scale-105 transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
                {isEditing ? 'Update Deck' : 'Create Deck'}
              </div>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="shadow-md hover:scale-105 transition-all"
          >
            Cancel
          </Button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-theme-textDim pt-2 border-t border-theme-lighter/50">
          <span className="font-medium">Shortcuts:</span> Ctrl+Enter to save • Escape to cancel
        </div>
      </form>
    </div>
  );
}
