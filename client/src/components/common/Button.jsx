import { forwardRef } from 'react';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    className = '',
    ...props
  },
  ref
) {
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-container text-on-primary shadow-sm',
    secondary: 'bg-secondary hover:bg-secondary-container text-on-secondary shadow-sm',
    tertiary: 'bg-tertiary hover:bg-tertiary-container text-on-tertiary shadow-sm',
    outline: 'bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant',
    ghost: 'bg-transparent hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface',
    destructive: 'bg-error hover:bg-error-container text-on-error shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-space-md py-1.5 text-label-sm font-label-sm',
    md: 'px-space-lg py-space-sm text-label-md font-label-md',
    lg: 'px-space-xl py-space-md text-label-lg font-label-lg',
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-space-xs
    font-bold rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';