import { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    className = '',
    id,
    placeholder = 'Select an option',
    ...props
  },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="font-label-md text-label-md text-on-surface">
          {label}
          {props.required && <span className="text-secondary ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full bg-surface-container-low rounded-lg pl-4 pr-10 py-2.5 font-body-md text-body-md text-on-surface
            appearance-none
            focus:outline-none focus:bg-surface focus:shadow-[0_0_0_2px_#8d4b00] transition-all
            ${error ? 'border-2 border-error' : 'border border-transparent'}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="font-body-sm text-body-sm text-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="font-body-sm text-body-sm text-on-surface-variant">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';