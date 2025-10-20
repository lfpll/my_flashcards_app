/**
 * InlineCardEditor Component
 * Quizlet-style inline card editor that appears at the top of the card list
 */

import { useState, useRef, useEffect } from 'react';
import { useFlashcards } from '../../../context/FlashcardContext';
import { useToast } from '../../../context/ToastContext';
import { convertImageToBase64, getImageFromClipboard } from '../../../utils/imageUpload';
import CardSideInput from '../CardSideInput';
import ImagePreview from './ImagePreview';
import { InlineCardEditorProps } from '../../../types/components';

export default function InlineCardEditor({ deckId, onSave, onCancel, card = null, autoFocus = false }: InlineCardEditorProps) {
  const { addCard, modifyCard } = useFlashcards();
  const { showToast } = useToast();
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [frontImageUrl, setFrontImageUrl] = useState(card?.frontImageUrl || '');
  const [backImageUrl, setBackImageUrl] = useState(card?.backImageUrl || '');
  
  const frontTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!card;

  // Auto-focus when autoFocus prop is true
  useEffect(() => {
    if (autoFocus && frontTextareaRef.current) {
      frontTextareaRef.current.focus();
    }
  }, [autoFocus]);

  const hasContent = (text: string, imageUrl: string) => text.trim() || imageUrl.trim();

  const handleSave = () => {
    // At least front content (text or image) and back content (text or image) required
    if (!hasContent(front, frontImageUrl) || !hasContent(back, backImageUrl)) {
      showToast('Both front and back need at least text or an image', 'error');
      return;
    }

    const cardData = {
      front: front.trim(),
      back: back.trim(),
      frontImageUrl: frontImageUrl.trim() || null,
      backImageUrl: backImageUrl.trim() || null,
    };

    if (isEditing) {
      modifyCard(deckId, card.id, cardData);
    } else {
      addCard(deckId, cardData);
    }

    onSave?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, side: 'front' | 'back') => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel?.();
    } else if ((e.key === 'b' || e.key === 'B') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      handleBoldText(e.target as HTMLTextAreaElement, side);
    } else if ((e.key === 'x' || e.key === 'X') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      handleUnderlineText(e.target as HTMLTextAreaElement, side);
    }
  };

  const handleTextFormat = (
    textarea: HTMLTextAreaElement,
    side: 'front' | 'back',
    delimiter: string
  ) => {
    //  Converts selected text to bold or underline
    //  e.g. "Hello world" -> "Hello **world**"
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.substring(selectionStart, selectionEnd);
    
    if (!selected) return;
  
    const newValue = value.substring(0, selectionStart) + delimiter + selected + delimiter + value.substring(selectionEnd);
    
    (side === 'front' ? setFront : setBack)(newValue);
  };

  const handleBoldText = (textarea: HTMLTextAreaElement, side: 'front' | 'back') =>
    handleTextFormat(textarea, side, '**');

  const handleUnderlineText = (textarea: HTMLTextAreaElement, side: 'front' | 'back') =>
    handleTextFormat(textarea, side, '__');

  const setImageForSide = (side: 'front' | 'back', imageUrl: string) => {
    side === 'front' ? setFrontImageUrl(imageUrl) : setBackImageUrl(imageUrl);
  };

  const handleFileUpload = async (file: File, side: 'front' | 'back') => {
    if (!file) return;

    try {
      const base64 = await convertImageToBase64(file);
      setImageForSide(side, base64);
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      showToast(message, 'error');
    }
  };

  const handleClearImage = (side: 'front' | 'back') => {
    setImageForSide(side, '');
    const ref = side === 'front' ? frontFileInputRef : backFileInputRef;
    if (ref.current) ref.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>, side: 'front' | 'back') => {
    const imageFile = getImageFromClipboard(e);

    if (imageFile) {
      e.preventDefault();

      try {
        const base64 = await convertImageToBase64(imageFile);
        setImageForSide(side, base64);
        showToast('Image pasted successfully!', 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to paste image';
        showToast(message, 'error');
      }
    }
    // If no image in clipboard, allow default paste behavior for text
  };

  const handleGenerateAIImage = () => {
    // TODO: Implement AI image generation
    showToast('AI image generation coming soon!', 'info');
  };

  return (
    <div className="bg-theme-lighter p-4 md:p-4 rounded-lg border-2 border-accent-primary mb-4 animate-fadeIn">
      {/* Grid Layout: Mobile = 1 column, Desktop = 3 columns (front, back, actions) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
        {/* Row 1: Textareas + Action Buttons */}
        <CardSideInput
          label="Front (optional if image added)"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'front')}
          onPaste={(e) => handlePaste(e, 'front')}
          placeholder="Enter question or term (optional)"
          imageUrl={frontImageUrl}
          onImageClick={() => frontFileInputRef.current?.click()}
          textareaRef={frontTextareaRef as React.RefObject<HTMLTextAreaElement>}
          side="front"
        />

        <CardSideInput
          label="Back (optional if image added)"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'back')}
          onPaste={(e) => handlePaste(e, 'back')}
          placeholder="Enter answer or definition (optional)"
          imageUrl={backImageUrl}
          onImageClick={() => backFileInputRef.current?.click()}
          onAIImageClick={handleGenerateAIImage}
          side="back"
        />

        {/* Actions - Right side on desktop, below on mobile */}
        <div className="flex md:flex-col gap-2 md:pt-6 justify-end md:justify-start order-last md:order-none">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="p-2 rounded bg-success hover:bg-success-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Save card (Ctrl+Enter)"
            aria-label={isEditing ? "Save card changes" : "Save new card"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="p-2 rounded hover:bg-theme-card text-theme-textDim hover:text-theme-text transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Cancel (Esc)"
            aria-label="Cancel editing"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Row 2: Image Previews - Always maintain column positions */}
        <div>
          {frontImageUrl && (
            <ImagePreview 
              imageUrl={frontImageUrl} 
              onRemove={() => handleClearImage('front')} 
              alt="Front preview" 
            />
          )}
        </div>
        
        <div>
          {backImageUrl && (
            <ImagePreview 
              imageUrl={backImageUrl} 
              onRemove={() => handleClearImage('back')} 
              alt="Back preview" 
            />
          )}
        </div>
        l
        {/* Empty cell to maintain grid alignment */}
        <div></div>
      </div>

      {/* Hidden File Inputs - always rendered */}
      <input
        ref={frontFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
        className="hidden"
        id="front-image-upload"
      />
      <input
        ref={backFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
        className="hidden"
        id="back-image-upload"
      />

      
      <div className="mt-2 text-xs text-theme-textDim hidden md:block">
        <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+Enter</kbd> save • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Esc</kbd> cancel • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+V</kbd> paste image • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+B</kbd> bold • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+Shift+X</kbd> underline
      </div>
    </div>
  );
}
