/**
 * AppHeader Component
 * Shared header for consistent navigation across all screens
 */

export default function AppHeader({ 
  title, 
  backButton = null, 
  actions = null, 
  subtitle = null,
  sticky = true 
}) {
  return (
    <div className={`bg-theme-card/95 backdrop-blur-sm border-b border-theme-lighter px-4 py-3 mb-6 ${sticky ? 'sticky top-0 z-10' : ''}`} style={{ transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
      <div className="max-w-7xl mx-auto">
        {/* Back button area / Breadcrumbs - optimized height */}
        <div className="mb-2 min-h-[24px] flex items-center">
          {backButton}
        </div>

        {/* Title row - reduced spacing */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{title}</h1>
          {/* Actions - more compact on mobile */}
          <div className="flex items-center gap-2 md:gap-3">
            {actions}
          </div>
        </div>

        {/* Subtitle/info row - optimized spacing */}
        {subtitle && (
          <div className="text-sm text-theme-textDim mt-1.5 flex items-center">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
