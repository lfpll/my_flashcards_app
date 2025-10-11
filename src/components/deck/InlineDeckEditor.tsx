/**
 * InlineDeckEditor Component
 * Simplified inline editor for creating/editing decks
 */

import { useState, useRef, useEffect } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useToast } from '../../context/ToastContext';
import { InlineDeckEditorProps } from '../../types/components';
import Button from '../ui/Button';

export default function InlineDeckEditor({
  deck = null,
  autoFocus = false,
  onSave,
  onCancel
}: InlineDeckEditorProps) {
  const { addDeck, modifyDeck } = useFlashcards();
  const { showToast } = useToast();
  const [name, setName] = useState(deck?.name || '');
  const [description, setDescription] = useState(deck?.description || '');
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

    try {
      if (isEditing) {
        await modifyDeck(deck.id, {
          name: name.trim(),
          description: description.trim()
        });
        showToast('Deck updated!', 'success');
      } else {
        await addDeck(name.trim(), description.trim());
        showToast('Deck created!', 'success');
      }

      onSave?.();
    } catch (error) {
      showToast('Failed to save deck', 'error');
      console.error('Error saving deck:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-theme-card rounded-lg border-2 border-accent-primary/30 p-4 space-y-3 shadow-md"
    >
      {/* Header */}
      <h3 className="font-semibold text-theme-text">
        {isEditing ? 'Edit Deck' : 'Create New Deck'}
      </h3>

      {/* Deck Name */}
      <div>
        <label className="block text-sm font-medium text-theme-textDim mb-1.5">
          Deck Name *
        </label>
        <input
          ref={nameInputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., German Vocabulary, Biology Chapter 1"
          className="input-base"
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-theme-textDim mb-1.5">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Brief description of what this deck covers"
          rows={2}
          className="textarea-base"
          maxLength={200}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          variant="primary"
          disabled={!name.trim()}
          onClick={() => {}}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel || (() => {})}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
