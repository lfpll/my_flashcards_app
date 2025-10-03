/**
 * FormInput Component
 * Reusable form input with label, validation, and consistent styling
 */

export default function FormInput({ 
  label, 
  required = false,
  error = '',
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
      <input
        className={error ? 'input-error' : `input-base ${className}`}
        {...props}
      />
      {error && (
        <p className="text-error text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

