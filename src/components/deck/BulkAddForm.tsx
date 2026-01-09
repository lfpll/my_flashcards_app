/**
 * BulkAddForm Component
 * Form for adding multiple cards via CSV input
 */

import { useState } from 'react';
import { useFlashcards } from '../../context/FlashcardContext';
import { useToast } from '../../context/ToastContext';
import { parseCSV } from '../../utils/csvParser';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormTextarea from '../forms/FormTextarea';

export default function BulkAddForm({ isOpen, onClose, deckId }) {
  const { addCard } = useFlashcards();
  const { showToast } = useToast();
  const [csvText, setCsvText] = useState('');
  const [parseErrors, setParseErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!csvText.trim()) {
      setParseErrors([{ line: 0, message: 'Please enter some cards' }]);
      return;
    }

    const { cards, errors } = parseCSV(csvText);
    
    if (errors.length > 0) {
      setParseErrors(errors);
      return;
    }

    if (cards.length === 0) {
      setParseErrors([{ line: 0, message: 'No valid cards found' }]);
      return;
    }

    // Add all cards
    cards.forEach(cardData => {
      addCard(deckId, cardData);
    });

    showToast(`Successfully added ${cards.length} cards!`, 'success');
    handleClose();
  };

  const handleClose = () => {
    setCsvText('');
    setParseErrors([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Add Cards"
    >
      <form onSubmit={handleSubmit}>
        {/* Instructions */}
        <div className="mb-4 text-sm text-theme-textDim">
          <p className="mb-2">Enter one card per line in CSV format:</p>
          <code className="block bg-theme-bg p-3 rounded text-accent-light">
            front,back,frontImageURL,backImageURL
          </code>
          <p className="mt-2">Image URLs are optional. Examples:</p>
          <code className="block bg-theme-bg p-3 rounded text-xs mt-1">
            Hello,Hola,https://example.com/hello-front.jpg,https://example.com/hello-back.jpg<br />
            Goodbye,Adiós,,https://example.com/adios.jpg<br />
            Thank you,Gracias
          </code>
        </div>

        <FormTextarea
          id="csv-input"
          label="CSV Input"
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            setParseErrors([]);
          }}
          rows={10}
          className="font-mono text-sm"
          placeholder="Hello,Hola,https://example.com/hello-front.jpg,https://example.com/hello-back.jpg&#10;Goodbye,Adiós&#10;Thank you,Gracias"
          autoFocus
        />

        {/* Parse Errors */}
        {parseErrors.length > 0 && (
          <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg">
            <p className="text-error font-medium mb-2">Errors found:</p>
            <ul className="text-error/80 text-sm space-y-1">
              {parseErrors.map((error, index) => (
                <li key={index}>
                  {error.line > 0 && `Line ${error.line}: `}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-buttons">
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
            Import Cards
          </Button>
        </div>
      </form>
    </Modal>
  );
}
