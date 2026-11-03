import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.variant === 'error';
        const isInfo = toast.variant === 'info';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${
              isError
                ? 'border-usc-red bg-usc-red-light text-usc-red-dark'
                : isInfo
                ? 'border-usc-blue bg-usc-blue-light text-usc-blue-dark'
                : 'border-usc-green bg-usc-green-light text-usc-green-dark'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-usc-red" />
            ) : isInfo ? (
              <Info className="w-5 h-5 shrink-0 mt-0.5 text-usc-blue" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-usc-green" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 hover:bg-surface-white/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
