/**
 * Breadcrumbs Component
 * Provides navigation trail with clean, modern design
 */

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = item.onClick && !isLast;

          return (
            <li key={index} className="flex items-center gap-2">
              {isClickable ? (
                <button
                  onClick={item.onClick}
                  className="group flex items-center gap-2 text-theme-textDim hover:text-accent-primary transition-colors"
                  aria-label={`Navigate to ${item.label}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">{item.label}</span>
                </button>
              ) : (
                <span
                  className={`flex items-center gap-2 ${
                    isLast ? 'text-theme-text' : 'text-theme-textDim'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className={isLast ? 'font-semibold' : 'font-medium'}>{item.label}</span>
                </span>
              )}

              {!isLast && (
                <svg className="w-4 h-4 text-theme-textDim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
