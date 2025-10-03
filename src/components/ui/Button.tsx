/**
 * Reusable Button Component
 * Supports different variants and sizes for consistent styling
 */

import { ButtonProps } from '../../types/components';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  title
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-accent-primary hover:bg-accent-hover text-white',
    secondary: 'bg-theme-lighter hover:bg-theme-card text-theme-text border border-theme-lighter',
    danger: 'bg-error hover:bg-error-hover text-white',
    ghost: 'bg-transparent hover:bg-theme-lighter text-theme-text',
    success: 'bg-success hover:bg-success-hover text-white',
    warning: 'bg-warning hover:bg-warning-hover text-white',
    info: 'bg-info hover:bg-info-hover text-white',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg min-h-[44px]',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

