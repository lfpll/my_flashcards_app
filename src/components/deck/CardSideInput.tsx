/**
 * CardSideInput Component
 * Reusable textarea with image upload button for card front/back
 */

import { CardSideInputProps } from '../../types/components';

export default function CardSideInput({
  label,
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  imageUrl,
  onImageClick,
  onAIImageClick,
  textareaRef,
  side
}: CardSideInputProps) {
  return (
    <div className="flex-1 w-full md:w-auto">
      <label className="block text-xs text-theme-textDim mb-1 uppercase font-medium">
        {label}
      </label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          className={`textarea-base min-h-[80px] md:min-h-[120px] ${side === 'back' && onAIImageClick ? 'pr-24' : 'pr-12'}`}
          rows={2}
        />
        {/* Icon buttons container - side by side in top-right */}
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Image Icon Button */}
          <button
            type="button"
            onClick={onImageClick}
            className={`p-2 rounded transition-colors image-icon-btn min-w-[44px] min-h-[44px] flex items-center justify-center ${
              imageUrl ? 'active' : ''
            }`}
            title={`Add ${side} image`}
            aria-label={imageUrl ? `Change ${side} image` : `Add ${side} image`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          {/* Generate AI Image Button - Only for back side */}
          {side === 'back' && onAIImageClick && (
            <button
              type="button"
              onClick={onAIImageClick}
              className="p-2 rounded transition-colors image-icon-btn min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Generate AI image"
              aria-label="Generate AI image for back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
