import { forwardRef } from 'react';

export const QuantityStepper = forwardRef(function QuantityStepper(
  {
    value = 1,
    min = 1,
    max = 50,
    onChange,
    className = '',
    'aria-label': ariaLabel = 'Quantity',
  },
  ref
) {
  const handleDecrease = () => {
    if (value > min) {
      onChange?.(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange?.(value + 1);
    }
  };

  return (
    <div
      ref={ref}
      className={`inline-flex items-center bg-surface-container rounded-lg p-1 text-on-surface ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors text-on-surface-variant font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center font-label-md text-label-md font-bold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors text-on-surface-variant font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
});

QuantityStepper.displayName = 'QuantityStepper';