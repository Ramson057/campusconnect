import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-text-primary mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-surface-white px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-usc-red focus:border-usc-red focus:ring-usc-red/20'
            : 'border-surface-border focus:border-usc-green focus:ring-usc-green/20'
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-usc-red">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
