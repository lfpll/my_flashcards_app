/**
 * EmptyState Component
 * Reusable component for showing helpful empty states with CTAs
 */

import { H2, Body } from './Typography';
import Button from './Button';

export default function EmptyState({
  icon = '📝',
  headline,
  body,
  primaryAction = null,
  secondaryAction = null,
  preview = null,
  className = ''
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {/* Icon/Illustration */}
      <div className="text-6xl md:text-7xl mb-6 animate-fadeIn">
        {icon}
      </div>

      {/* Headline */}
      <H2 className="mb-3">{headline}</H2>

      {/* Body Text */}
      <Body className="text-theme-textDim mb-6 max-w-md mx-auto">
        {body}
      </Body>

      {/* Preview (optional) */}
      {preview && (
        <div className="mb-6 animate-fadeIn">
          {preview}
        </div>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || 'primary'}
              size="lg"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'secondary'}
              size="lg"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

