/**
 * FormTextarea Component
 * Reusable textarea with label, validation, and consistent styling
 */

export default function FormTextarea({ 
  label, 
  required = false,
  error = '',
  rows = 3,
  className = '',
  ...props 
}) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id} className="form-label">
          {label} {required && <span className="label-required">*</span>}
        </label>
      )}
      <textarea
        className={error ? 'input-error' : `textarea-base ${className}`}
        rows={rows}
        {...props}
      />
      {error && (
        <p className="text-error text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

