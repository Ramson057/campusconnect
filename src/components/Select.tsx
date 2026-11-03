import React, { useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  id,
  className = '',
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-text-primary mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border bg-surface-white px-3.5 py-2 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-usc-red focus:border-usc-red focus:ring-usc-red/20'
            : 'border-surface-border focus:border-usc-green focus:ring-usc-green/20'
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-usc-red">
          {error}
        </p>
      )}
    </div>
  );
}
