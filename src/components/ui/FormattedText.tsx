/**
 * FormattedText Component
 * Renders text with markdown-style formatting support
 * Supports: **bold** and __underline__
 * 
 * @example
 * <FormattedText text="This is **bold** and this is __underlined__" />
 */

import { ReactNode } from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with bold (**text**) and underline (__text__) formatting
 * @param text - The text to format
 * @returns Array of React nodes with formatting applied
 */
function renderTextWithFormatting(text: string): ReactNode[] | null {
  if (!text) return null;

  // Split by both **bold** and __underline__ patterns
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and render bold
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {boldText}
        </strong>
      );
    } else if (part.startsWith('__') && part.endsWith('__')) {
      // Remove the __ markers and render underline
      const underlineText = part.slice(2, -2);
      return (
        <u key={index} className="underline">
          {underlineText}
        </u>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  return <span className={className}>{renderTextWithFormatting(text)}</span>;
}

// Export the utility function for advanced use cases
export { renderTextWithFormatting };
