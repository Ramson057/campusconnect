import React from 'react';
import { EventStatus } from '../types/models';

export type BadgeVariant = 'open' | 'full' | 'ended' | 'featured' | 'upcoming' | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/**
 * Status badges using USC theme tokens.
 * Note: Featured gold badge uses dark green text (text-usc-green-dark) for WCAG AA contrast.
 */
const variantStyles: Record<BadgeVariant, string> = {
  open: 'bg-usc-green-light text-usc-green-dark border-usc-green/25',
  full: 'bg-usc-red-light text-usc-red-dark border-usc-red/25',
  ended: 'bg-surface-muted text-text-secondary border-surface-border',
  featured: 'bg-usc-gold text-usc-green-dark border-usc-gold-dark/30 font-semibold',
  upcoming: 'bg-usc-blue-light text-usc-blue-dark border-usc-blue/25',
  neutral: 'bg-surface-gray text-text-secondary border-surface-border',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function getStatusBadgeProps(status: EventStatus): {
  variant: BadgeVariant;
  label: string;
} {
  switch (status) {
    case 'open':
      return { variant: 'open', label: 'Open' };
    case 'full':
      return { variant: 'full', label: 'Event Full' };
    case 'ended':
      return { variant: 'ended', label: 'Ended' };
    case 'upcoming':
      return { variant: 'upcoming', label: 'Upcoming' };
  }
}
