import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="font-label-md text-label-md text-on-surface">
          {label}
          {props.required && <span className="text-secondary ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full bg-surface-container-low rounded-lg pl-4 pr-4 py-2.5 font-body-md text-body-md text-on-surface
          placeholder:text-outline
          focus:outline-none focus:bg-surface focus:shadow-[0_0_0_2px_#8d4b00] transition-all
          ${error ? 'border-2 border-error' : 'border border-transparent'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="font-body-sm text-body-sm text-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="font-body-sm text-body-sm text-on-surface-variant">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';