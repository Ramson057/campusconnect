import { Link } from 'react-router-dom';
import { USC_THEME } from '../config/theme';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-gray text-text-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-usc-green text-usc-gold font-serif font-bold text-xs">
                USC
              </span>
              <span className="text-lg font-bold text-usc-green-dark font-serif">
                {USC_THEME.platformName}
              </span>
            </div>
            <p className="mt-3 text-sm text-text-secondary max-w-md leading-relaxed">
              The centralized campus event discovery, student registration, and live attendance
              management platform for the {USC_THEME.universityName} community across Talamban,
              Downtown Main, North, and South Campuses.
            </p>
            <p className="mt-4 text-xs font-serif italic tracking-wider text-usc-green-dark">
              {USC_THEME.motto}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-primary font-serif mb-3">
              Student Portal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-usc-green transition-colors">
                  Browse All Events
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-usc-green transition-colors">
                  Academic Event Calendar
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-usc-green transition-colors">
                  My Registrations
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-usc-green transition-colors">
                  Campus Announcements
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-primary font-serif mb-3">
              Organizer Console
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/admin" className="hover:text-usc-green transition-colors">
                  Organizer Analytics
                </Link>
              </li>
              <li>
                <Link to="/admin/events" className="hover:text-usc-green transition-colors">
                  Create & Manage Events
                </Link>
              </li>
              <li>
                <Link to="/admin/attendance" className="hover:text-usc-green transition-colors">
                  Attendee Check-In Desk
                </Link>
              </li>
              <li>
                <Link to="/admin/reports" className="hover:text-usc-green transition-colors">
                  Export Event Reports
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>
            © {new Date().getFullYear()} {USC_THEME.universityName} · {USC_THEME.platformName}. All
            rights reserved.
          </p>
          <p className="font-serif text-usc-green-dark/80 font-medium">
            {USC_THEME.motto}
          </p>
        </div>
      </div>
    </footer>
  );
}
