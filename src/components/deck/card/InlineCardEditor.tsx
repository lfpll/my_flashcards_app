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
  
  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!card;

  // Auto-focus when autoFocus prop is true
  useEffect(() => {
    if (autoFocus && frontTextareaRef.current) {
      frontTextareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSave = () => {
    // At least front content (text or image) and back content (text or image) required
    const hasFrontContent = front.trim() || frontImageUrl.trim();
    const hasBackContent = back.trim() || backImageUrl.trim();
    
    if (!hasFrontContent || !hasBackContent) {
      showToast('Both front and back need at least text or an image', 'error');
      return;
    }

    const cardData = {
      front: front.trim() || '',
      back: back.trim() || '',
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

  const handleBoldText = (textarea: HTMLTextAreaElement, side: 'front' | 'back') => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text in ** for bold
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);
      const newText = `${beforeText}**${selectedText}**${afterText}`;
      
      if (side === 'front') {
        setFront(newText);
        // Set cursor position after the bold text
        setTimeout(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = end + 2;
          textarea.focus();
        }, 0);
      } else {
        setBack(newText);
        setTimeout(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = end + 2;
          textarea.focus();
        }, 0);
      }
    }
  };

  const handleUnderlineText = (textarea: HTMLTextAreaElement, side: 'front' | 'back') => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      // Wrap selected text in __ for underline
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);
      const newText = `${beforeText}__${selectedText}__${afterText}`;
      
      if (side === 'front') {
        setFront(newText);
        // Set cursor position after the underlined text
        setTimeout(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = end + 2;
          textarea.focus();
        }, 0);
      } else {
        setBack(newText);
        setTimeout(() => {
          textarea.selectionStart = start + 2;
          textarea.selectionEnd = end + 2;
          textarea.focus();
        }, 0);
      }
    }
  };

  const handleFileUpload = async (file: File, side: 'front' | 'back') => {
    if (!file) return;

    try {
      const base64 = await convertImageToBase64(file);
      
      if (side === 'front') {
        setFrontImageUrl(base64 as string);
      } else {
        setBackImageUrl(base64 as string);
      }
      
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      showToast(message, 'error');
    }
  };

  const handleClearImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImageUrl('');
      if (frontFileInputRef.current) frontFileInputRef.current.value = '';
    } else {
      setBackImageUrl('');
      if (backFileInputRef.current) backFileInputRef.current.value = '';
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>, side: 'front' | 'back') => {
    const imageFile = getImageFromClipboard(e);
    
    if (imageFile) {
      // Prevent default paste behavior when image is found
      e.preventDefault();
      
      try {
        const base64 = await convertImageToBase64(imageFile);
        
        if (side === 'front') {
          setFrontImageUrl(base64 as string);
        } else {
          setBackImageUrl(base64 as string);
        }
        
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
          textareaRef={frontTextareaRef as any}
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

      {/* Hint - Hidden on mobile */}
      <div className="mt-2 text-xs text-theme-textDim hidden md:block">
        <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+Enter</kbd> save • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Esc</kbd> cancel • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+V</kbd> paste image • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+B</kbd> bold • <kbd className="px-1 py-0.5 bg-theme-bg rounded">Ctrl+Shift+X</kbd> underline
      </div>
    </div>
  );
}
