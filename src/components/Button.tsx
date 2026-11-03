import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-usc-green text-surface-white hover:bg-usc-green-dark focus-visible:ring-usc-green shadow-xs',
  secondary:
    'bg-usc-blue text-surface-white hover:bg-usc-blue-dark focus-visible:ring-usc-blue shadow-xs',
  danger:
    'bg-usc-red text-surface-white hover:bg-usc-red-dark focus-visible:ring-usc-red shadow-xs',
  gold:
    'bg-usc-gold text-usc-green-dark hover:bg-usc-gold-dark hover:text-surface-white focus-visible:ring-usc-gold font-semibold',
  outline:
    'border border-surface-border bg-surface-white text-text-primary hover:bg-surface-gray hover:border-usc-green focus-visible:ring-usc-green',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-gray hover:text-text-primary focus-visible:ring-usc-green',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
