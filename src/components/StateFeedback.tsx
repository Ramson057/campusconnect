import React from 'react';
import { AlertTriangle, CalendarSearch, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ message = 'Loading campus records...' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full rounded-xl border border-surface-border bg-surface-white p-8"
    >
      <div className="flex flex-col items-center justify-center text-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-usc-green border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-text-secondary">{message}</p>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-32 rounded-lg bg-surface-gray animate-pulse border border-surface-border"
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="w-full rounded-xl border border-usc-red/30 bg-usc-red-light p-6 text-center"
    >
      <AlertTriangle className="w-8 h-8 text-usc-red mx-auto mb-2" />
      <h3 className="text-base font-bold text-usc-red-dark font-serif">
        Unable to Load Data
      </h3>
      <p className="mt-1 text-sm text-text-secondary max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-xl border border-surface-border bg-surface-gray p-10 text-center">
      <CalendarSearch className="w-10 h-10 text-usc-green mx-auto mb-3 opacity-80" />
      <h3 className="text-lg font-bold text-text-primary font-serif">{title}</h3>
      <p className="mt-1.5 text-sm text-text-secondary max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
