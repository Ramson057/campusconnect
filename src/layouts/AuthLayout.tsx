import { Link, Outlet } from 'react-router-dom';
import { USC_THEME } from '../config/theme';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-gray text-text-primary">
      <header className="border-b border-surface-border bg-surface-white py-4 px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-usc-green text-usc-gold font-serif font-bold text-sm">
              USC
            </span>
            <span className="text-lg font-bold text-usc-green-dark font-serif">
              {USC_THEME.platformName}
            </span>
          </Link>
          <Link
            to="/events"
            className="text-xs font-semibold text-usc-green hover:text-usc-green-dark"
          >
            Browse Events →
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-text-muted border-t border-surface-border bg-surface-white">
        <span className="font-serif italic text-usc-green-dark">{USC_THEME.motto}</span> ·{' '}
        {USC_THEME.universityName}
      </footer>
    </div>
  );
}
