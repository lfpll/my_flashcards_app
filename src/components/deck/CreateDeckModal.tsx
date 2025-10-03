/**
 * CreateDeckModal Component
 * Modal for creating or editing a deck
 */

import { useState } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';

export default function CreateDeckModal({ isOpen, onClose, deck = null }) {
  const { addDeck, modifyDeck } = useFlashcards();
  const { showToast } = useToast();
  const [name, setName] = useState(deck?.name || '');
  const [description, setDescription] = useState(deck?.description || '');
  const [error, setError] = useState('');

  const isEditing = !!deck;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Deck name is required');
      return;
    }

    if (isEditing) {
      modifyDeck(deck.id, { name: name.trim(), description: description.trim() });
      showToast('Deck updated successfully!', 'success');
    } else {
      addDeck(name.trim(), description.trim());
      showToast('Deck created successfully!', 'success');
    }

    // Reset and close
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName(deck?.name || '');
    setDescription(deck?.description || '');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Deck' : 'Create New Deck'}
    >
      <form onSubmit={handleSubmit}>
        <FormInput
          id="deck-name"
          label="Deck Name"
          required
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          placeholder="e.g., Spanish Basics"
          autoFocus
        />

        <FormTextarea
          id="deck-description"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="e.g., Common phrases for beginners"
        />

        <div className="action-buttons mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="action-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="action-button"
          >
            {isEditing ? 'Save Changes' : 'Create Deck'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
