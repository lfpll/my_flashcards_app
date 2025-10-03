/**
 * Typography Component Library
 * Provides consistent heading and text components with proper hierarchy
 */

export function H2({ children, className = '' }) {
  return (
    <h2 className={`text-2xl md:text-3xl font-semibold leading-tight ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = '' }) {
  return (
    <h3 className={`text-xl md:text-2xl font-semibold leading-snug ${className}`}>
      {children}
    </h3>
  );
}

export function Body({ children, className = '' }) {
  return (
    <p className={`text-base leading-normal ${className}`}>
      {children}
    </p>
  );
}

// Constrained text for optimal reading (max 65 characters)
export function ReadableText({ children, className = '' }) {
  return (
    <div className={`max-w-[65ch] ${className}`}>
      {children}
    </div>
  );
}

