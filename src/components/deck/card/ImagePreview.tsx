/**
 * ImagePreview Component
 * Displays uploaded image with preview and remove buttons
 */

import { useState } from 'react';
import { ImagePreviewProps } from '../../../types/components';

export default function ImagePreview({ imageUrl, onRemove, alt }: ImagePreviewProps) {
  const [showFullImage, setShowFullImage] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      <div className="relative group">
        <img 
          src={imageUrl} 
          alt={alt} 
          className="w-full h-24 object-cover rounded border border-theme-lighter"
        />
        
        {/* Preview Button - Top Left */}
        <button
          type="button"
          onClick={() => setShowFullImage(true)}
          className="absolute top-1 left-1 bg-theme-card hover:bg-theme-lighter text-theme-text rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Preview full image"
          aria-label="Preview full image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        {/* Remove Button - Top Right */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-error hover:bg-error-hover text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove image"
          aria-label="Remove image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={imageUrl} 
              alt={alt} 
              className="max-w-full max-h-[90vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 bg-error hover:bg-error-hover text-white rounded-full p-2"
              title="Close preview"
              aria-label="Close preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
